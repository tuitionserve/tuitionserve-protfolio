import { requireRole } from "@/server/auth/guards";
import { BackButton } from "@/components/shared/BackButton";
import { BlogEditorForm } from "@/components/admin/blogs/BlogEditorForm";

export default async function AdminNewBlogPage() {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  return (
    <div className="max-w-3xl flex flex-col gap-lg">
      <BackButton />
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Write Blog Post</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Save a draft to refine later, or publish straight to the public Blog section with an SEO slug.
        </p>
      </div>
      <BlogEditorForm />
    </div>
  );
}
