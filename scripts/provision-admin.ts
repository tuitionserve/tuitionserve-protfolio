/**
 * Provisions a Super Admin or Branch Admin account out of band. Admin
 * accounts must never be created through public signup (PRD AUTH-003) —
 * this script is the only supported way to create one.
 *
 * Usage:
 *   pnpm provision-admin --role=SUPER_ADMIN --email=admin@example.com --password=... --name="Ops Admin"
 *   pnpm provision-admin --role=BRANCH_ADMIN --email=jp@example.com --password=... --name="Janakpur Admin" \
 *     --branch-name="Janakpur" --branch-city="Janakpur"
 *   pnpm provision-admin --role=BRANCH_ADMIN --email=jp@example.com --password=... --branch-id=<existingBranchDocId>
 */
import { parseArgs } from "node:util";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth } from "../src/lib/firebase/admin";
import { branchesCollection, userAccountsCollection } from "../src/server/domain/collections";
import { generateSequentialUid } from "../src/server/domain/ids";

async function main() {
  const { values } = parseArgs({
    options: {
      role: { type: "string" },
      email: { type: "string" },
      password: { type: "string" },
      name: { type: "string" },
      "branch-id": { type: "string" },
      "branch-name": { type: "string" },
      "branch-city": { type: "string" },
    },
  });

  const role = values.role;
  const email = values.email;
  const password = values.password;

  if (role !== "SUPER_ADMIN" && role !== "BRANCH_ADMIN") {
    throw new Error('--role must be "SUPER_ADMIN" or "BRANCH_ADMIN"');
  }
  if (!email || !password) {
    throw new Error("--email and --password are required");
  }

  let branchId: string | null = null;
  if (role === "BRANCH_ADMIN") {
    if (values["branch-id"]) {
      const snap = await branchesCollection().doc(values["branch-id"]).get();
      if (!snap.exists) throw new Error(`Branch ${values["branch-id"]} does not exist`);
      branchId = snap.id;
    } else if (values["branch-name"] && values["branch-city"]) {
      const ref = branchesCollection().doc();
      const branchUid = await generateSequentialUid("branch");
      await ref.set({
        id: ref.id,
        branchUid,
        name: values["branch-name"],
        city: values["branch-city"],
        status: "ACTIVE",
        createdAt: FieldValue.serverTimestamp() as never,
        updatedAt: FieldValue.serverTimestamp() as never,
      });
      branchId = ref.id;
      console.log(`Created branch ${branchUid} (${values["branch-name"]}) -> ${ref.id}`);
    } else {
      throw new Error(
        "BRANCH_ADMIN requires either --branch-id=<existing> or --branch-name and --branch-city",
      );
    }
  }

  const existing = await adminAuth.getUserByEmail(email).catch(() => null);
  const authUser =
    existing ??
    (await adminAuth.createUser({ email, password, displayName: values.name, emailVerified: true }));

  const accountRef = userAccountsCollection().doc(authUser.uid);
  // Reuse the existing adminUid on a re-run (e.g. re-provisioning after an
  // emulator reset) rather than burning a new sequence number each time.
  const existingAccountSnap = await accountRef.get();
  const adminUid = existingAccountSnap.data()?.adminUid ?? (await generateSequentialUid("admin"));

  await accountRef.set(
    {
      id: authUser.uid,
      authProviderUid: authUser.uid,
      email,
      role,
      branchId,
      accountStatus: "ACTIVE",
      fullName: values.name ?? null,
      adminUid,
      createdAt: FieldValue.serverTimestamp() as never,
      updatedAt: FieldValue.serverTimestamp() as never,
    },
    { merge: true },
  );

  console.log(`Provisioned ${role} account for ${email} (uid=${authUser.uid}, adminUid=${adminUid})`);
  if (branchId) console.log(`  branchId=${branchId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
