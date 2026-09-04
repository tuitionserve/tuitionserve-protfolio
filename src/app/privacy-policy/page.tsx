import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/public/StaticPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy - Tuition Serve",
  description: "How Tuition Serve collects, uses, and protects your information.",
};

const EFFECTIVE_DATE = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Drafted to reflect this app's actual data flows (see docs/05 Domain
// Model and docs/06 TRD): what's collected, who can see the exact
// address, where data lives (Firebase/Google Cloud), and that no
// payments are processed. Written in standard policy structure and
// language, but this is an AI-assisted first draft, not a substitute
// for review by qualified counsel before the client relies on it.
export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout title="Privacy Policy" subtitle={`Effective date: ${EFFECTIVE_DATE}`}>
      <p>
        This Privacy Policy (&ldquo;<strong>Policy</strong>&rdquo;) describes how Tuition Serve
        (&ldquo;<strong>Tuition Serve</strong>,&rdquo; &ldquo;<strong>we</strong>,&rdquo;
        &ldquo;<strong>us</strong>,&rdquo; or &ldquo;<strong>our</strong>&rdquo;) collects, uses,
        discloses, and safeguards information in connection with the Tuition Serve website and
        platform (collectively, the &ldquo;<strong>Service</strong>&rdquo;). This Policy applies
        to parents and guardians who submit a tuition request (&ldquo;
        <strong>Parents</strong>&rdquo;), individuals who register as tutors (&ldquo;
        <strong>Tutors</strong>&rdquo;), and visitors to our public website (together, &ldquo;
        <strong>you</strong>&rdquo;). By using the Service, you agree to the collection and use
        of information in accordance with this Policy. If you do not agree, please do not use the
        Service.
      </p>

      <h2>1. Scope and Roles</h2>
      <p>
        Tuition Serve operates an admin-mediated matching service between Parents and Tutors. We
        act as the data controller for the personal information described in this Policy. We do
        not operate a self-service directory: Parents do not browse or select Tutors directly,
        and Tutors do not see a Parent&rsquo;s full details until an administrator assigns them
        to a specific tuition request.
      </p>

      <h2>2. Information We Collect</h2>
      <p>2.1 &mdash; <strong>Information Parents provide.</strong> When a Parent submits a tuition request, we collect:</p>
      <ul>
        <li>The Parent&rsquo;s full name, phone number, and, if provided, email address;</li>
        <li>The student&rsquo;s full name and grade level;</li>
        <li>The requested subject, availability, and any additional notes provided;</li>
        <li>A general locality (area/neighborhood) and the exact home address for the tuition;</li>
      </ul>
      <p>2.2 &mdash; <strong>Information Tutors provide.</strong> When a Tutor registers, we collect:</p>
      <ul>
        <li>Full name, phone number, date of birth, gender, and residential address;</li>
        <li>Educational qualifications, institution, and field of study;</li>
        <li>Subjects taught, grade levels, teaching experience, availability, and expected fee;</li>
        <li>A curriculum vitae (CV) and, optionally, a profile photograph;</li>
        <li>Authentication data associated with your account (e.g., email address used to sign in).</li>
      </ul>
      <p>2.3 &mdash; <strong>Information collected automatically.</strong> We use a single, strictly
        necessary session cookie to keep you signed in. We do not currently use advertising,
        analytics, or cross-site tracking cookies. If this changes, we will update this Policy.</p>

      <h2>3. How We Use Information</h2>
      <p>We use the information described above to:</p>
      <ul>
        <li>Review, confirm, or decline tuition requests submitted by Parents;</li>
        <li>Verify Tutor qualifications and maintain the integrity of the Tutor pool;</li>
        <li>Match a confirmed tuition request with an appropriate, verified Tutor;</li>
        <li>Enable communication between our administrative team, Tutors, and (where applicable) Parents regarding a specific tuition;</li>
        <li>Maintain an internal audit record of administrative decisions (approvals, rejections, assignments) for accountability purposes;</li>
        <li>Operate, secure, and improve the Service, and comply with applicable law.</li>
      </ul>
      <p>
        We do not use your personal information for automated decision-making that produces
        legal or similarly significant effects concerning you without human review; every
        verification, confirmation, and assignment decision described in this Policy is made by a
        member of our administrative team.
      </p>

      <h2>4. Disclosure of Information</h2>
      <p>4.1 &mdash; <strong>Exact address.</strong> A Parent&rsquo;s exact home address is
        visible only to our administrative team. Tutors browsing or applying to open tuitions see
        only a general locality, never the exact address, unless and until an administrator
        assigns that Tutor to the tuition, at which point the Tutor receives the details
        necessary to attend the tuition.</p>
      <p>4.2 &mdash; <strong>Tutor documents.</strong> A Tutor&rsquo;s CV and profile photograph
        are stored privately. They are accessible only to our administrative team and to the
        Parent whose confirmed request that Tutor has applied to or been assigned to &mdash; never
        published publicly and never accessible to unrelated Parents or Tutors.</p>
      <p>4.3 &mdash; <strong>Service providers.</strong> We use Google Firebase (Google Cloud
        Platform) as our infrastructure provider for authentication, database, and file storage.
        Google may process and store data on our behalf, including on servers located outside
        Nepal, solely to provide these infrastructure services to us, under Google&rsquo;s own
        data processing terms.</p>
      <p>4.4 &mdash; <strong>Legal disclosure.</strong> We may disclose information if required to
        do so by law, regulation, legal process, or governmental request, or where we believe
        disclosure is necessary to protect the rights, property, or safety of Tuition Serve, our
        users, or the public.</p>
      <p>4.5 &mdash; <strong>No sale of data.</strong> We do not sell, rent, or trade personal
        information to third parties, and we do not share it for third-party marketing purposes.</p>

      <h2>5. Payments</h2>
      <p>
        Tuition Serve does not process, hold, transmit, or guarantee any payment. Any fee for
        tutoring services is agreed upon and exchanged directly between the Parent and the Tutor,
        entirely outside the Service. We do not collect or store payment card, banking, or
        similar financial information.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain personal information for as long as reasonably necessary to fulfil the
        purposes described in this Policy, including to maintain accurate administrative and
        audit records, resolve disputes, and comply with our legal obligations. Where information
        is no longer needed for these purposes, we take reasonable steps to delete or anonymize
        it.
      </p>

      <h2>7. Security</h2>
      <p>
        We restrict direct access to our database and file storage to our own server-side
        systems; client applications (including our own website) cannot read or write data
        directly. Access by administrators is role- and branch-scoped, so that, for example, one
        regional administrator cannot access records belonging to another region. Session
        authentication uses secure, HTTP-only cookies. No method of transmission or storage is
        completely secure, and we cannot guarantee absolute security.
      </p>

      <h2>8. Children&rsquo;s Information</h2>
      <p>
        The Service is not directed at children, and children do not register accounts or
        interact with the Service directly. Information about a student is provided to us by
        their Parent or legal guardian as part of a tuition request, and the Parent is responsible
        for the accuracy of that information and for obtaining any consent required under
        applicable law to share it with us.
      </p>

      <h2>9. Your Rights and Choices</h2>
      <p>
        You may request access to, correction of, or deletion of the personal information we
        hold about you, subject to our legitimate need to retain certain records (for example,
        audit records of administrative decisions) as described in Section 6. To make a request,
        contact us using the details in Section 12. We will respond within a reasonable time.
      </p>

      <h2>10. International Data Transfers</h2>
      <p>
        Because we use Google Firebase / Google Cloud Platform, your information may be
        processed and stored on servers located outside your country of residence, including
        outside Nepal. By using the Service, you acknowledge and agree to this transfer.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may amend this Policy from time to time to reflect changes in our practices or for
        legal or operational reasons. We will update the &ldquo;Effective date&rdquo; above when
        we do. Your continued use of the Service after a change becomes effective constitutes
        your acceptance of the revised Policy.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        Questions, requests, or complaints regarding this Policy or our handling of your
        information may be directed to us via our{" "}
        <a href="/contact" className="text-primary-container font-medium">Contact page</a>.
      </p>
    </StaticPageLayout>
  );
}
