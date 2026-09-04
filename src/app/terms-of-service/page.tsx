import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/public/StaticPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service - Tuition Serve",
  description: "The terms governing use of Tuition Serve.",
};

const EFFECTIVE_DATE = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Drafted to reflect this app's actual behavior (admin-mediated
// matching; no payments processed; verification, suspension, and
// withdrawal mechanics as implemented). Written in standard terms-of-
// service structure and language, but this is an AI-assisted first
// draft, not a substitute for review by qualified counsel before the
// client relies on it.
export default function TermsOfServicePage() {
  return (
    <StaticPageLayout title="Terms of Service" subtitle={`Effective date: ${EFFECTIVE_DATE}`}>
      <p>
        These Terms of Service (&ldquo;<strong>Terms</strong>&rdquo;) constitute a binding
        agreement between you and Tuition Serve (&ldquo;<strong>Tuition Serve</strong>,&rdquo;
        &ldquo;<strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo; or &ldquo;
        <strong>our</strong>&rdquo;) governing your access to and use of the Tuition Serve
        website and platform (the &ldquo;<strong>Service</strong>&rdquo;). By accessing or using
        the Service, you agree to be bound by these Terms. If you do not agree, you must not use
        the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        Tuition Serve is an admin-mediated home tuition matching service. Parents and guardians
        (&ldquo;<strong>Parents</strong>&rdquo;) submit tuition requirements through our website;
        our administrative team (&ldquo;<strong>Administrators</strong>&rdquo;) reviews and
        confirms those requirements; verified tutors (&ldquo;<strong>Tutors</strong>&rdquo;)
        apply to confirmed opportunities; and an Administrator selects and assigns a Tutor. The
        Service is not a self-service marketplace: Parents do not directly browse, contact, or
        select Tutors, and no match is finalized without Administrator review.
      </p>

      <h2>2. Eligibility and Accounts</h2>
      <p>2.1 Parents are not required to create an account to submit a tuition request.</p>
      <p>2.2 Tutors must register an account, be at least 18 years of age, and provide accurate,
        current, and complete information, including a valid CV. You are responsible for
        maintaining the confidentiality of your login credentials and for all activity that
        occurs under your account.</p>
      <p>2.3 Administrator accounts (Branch Admin and Super Admin) are provisioned directly by
        Tuition Serve and are not available through public registration.</p>

      <h2>3. Tutor Verification, Suspension, and Reinstatement</h2>
      <p>3.1 A Tutor profile becomes eligible to apply to tuition opportunities only after
        Administrator review and approval. We may decline a profile and provide a reason; a
        declined Tutor may revise and resubmit their profile for further review.</p>
      <p>3.2 We may suspend a Tutor account, with or without prior notice, where we reasonably
        believe suspension is necessary to protect the safety, integrity, or proper functioning
        of the Service, including for suspected misrepresentation, misconduct, or breach of these
        Terms. A suspended account cannot apply to, continue, or be assigned to any tuition until
        reinstated by an Administrator.</p>
      <p>3.3 Suspension or removal from the Service does not, by itself, entitle a Tutor to any
        compensation from Tuition Serve, as Tuition Serve does not process tutoring fees (see
        Section 6).</p>

      <h2>4. Parent Submissions</h2>
      <p>
        By submitting a tuition request, you represent that the information you provide is
        accurate and that you are the parent or legal guardian of the student (or otherwise
        authorized to act on the student&rsquo;s behalf). Submission of a request does not
        guarantee that it will be confirmed or that a suitable Tutor will be found; timing and
        availability may vary based on location, subject, and Tutor availability.
      </p>

      <h2>5. Assignment, Withdrawal, and Reopening</h2>
      <p>
        An Administrator&rsquo;s assignment of a Tutor to a confirmed tuition request is the
        operative act that creates a tutoring arrangement; the Service itself facilitates the
        introduction and does not supervise the tutoring sessions that follow. Either a Tutor or
        an Administrator may initiate a withdrawal from an active assignment, subject to
        Administrator review; upon withdrawal, an Administrator may reopen the tuition for new
        applications.
      </p>

      <h2>6. No Payment Processing; Independent Arrangement</h2>
      <p>
        Tuition Serve does not process, hold, escrow, or guarantee any payment, and does not set,
        collect, or enforce tutoring fees. Any fee for tutoring services is a matter agreed
        directly between the Parent and the Tutor, entirely outside the Service. Tuition Serve is
        not a party to, and bears no responsibility or liability for, any payment dispute,
        non-payment, refund request, or other financial matter arising between a Parent and a
        Tutor.
      </p>

      <h2>7. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Provide false, misleading, or fraudulent information in a profile, tuition request, or communication on the Service;</li>
        <li>Use the Service&rsquo;s messaging feature for any purpose unrelated to an actual or prospective tuition arrangement, including unsolicited advertising;</li>
        <li>Attempt to access data, accounts, or records belonging to another user or branch that you are not authorized to access;</li>
        <li>Interfere with, disrupt, or attempt to circumvent the security or normal operation of the Service;</li>
        <li>Use the Service in any manner that could endanger a minor.</li>
      </ul>
      <p>We may remove content, decline a submission, or suspend or terminate an account for any
        violation of this Section.</p>

      <h2>8. Intellectual Property</h2>
      <p>
        The Service, including its design, text, graphics, and underlying software, is owned by
        or licensed to Tuition Serve and is protected by applicable intellectual property laws.
        Except as expressly permitted to use the Service for its intended purpose, you may not
        copy, modify, distribute, or create derivative works from any part of the Service without
        our prior written consent.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis,
        without warranties of any kind, whether express or implied, including implied warranties
        of merchantability, fitness for a particular purpose, and non-infringement. While we
        review Tutor-submitted qualifications and CVs as part of our verification process, we do
        not guarantee, and make no representation regarding, the accuracy of information a Tutor
        or Parent provides, the conduct of any Tutor or Parent, or the quality, safety, or outcome
        of any tutoring arrangement made through or following use of the Service.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by applicable law, Tuition Serve and its administrators
        shall not be liable for any indirect, incidental, special, consequential, or punitive
        damages, or any loss of profits, data, or goodwill, arising out of or in connection with
        your access to or use of, or inability to access or use, the Service, or any tutoring
        arrangement facilitated through it, even if we have been advised of the possibility of
        such damages. To the fullest extent permitted by applicable law, our aggregate liability
        for any claim arising out of or relating to the Service shall not exceed the equivalent of
        NPR 5,000, as we do not charge users a platform fee.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Tuition Serve and its administrators from any
        claim, demand, loss, or liability, including reasonable legal fees, arising out of your
        use of the Service, your violation of these Terms, or your violation of any right of a
        third party.
      </p>

      <h2>12. Termination</h2>
      <p>
        We may suspend or terminate your access to the Service at any time, with or without
        cause or notice, including for conduct that we believe violates these Terms or is
        harmful to other users, Tuition Serve, or third parties. You may stop using the Service
        at any time. Sections of these Terms that by their nature should survive termination
        (including Sections 6, 9, 10, 11, and 14) will survive.
      </p>

      <h2>13. Changes to the Service and These Terms</h2>
      <p>
        We may modify or discontinue any part of the Service at any time. We may revise these
        Terms from time to time; the &ldquo;Effective date&rdquo; above reflects the date of the
        latest revision. Your continued use of the Service after a revision becomes effective
        constitutes your acceptance of the revised Terms.
      </p>

      <h2>14. Governing Law and Dispute Resolution</h2>
      <p>
        These Terms are governed by the laws of Nepal, without regard to its conflict-of-law
        principles. Any dispute arising out of or relating to these Terms or the Service shall be
        subject to the exclusive jurisdiction of the competent courts of Nepal.
      </p>

      <h2>15. General</h2>
      <p>
        If any provision of these Terms is found unenforceable, the remaining provisions will
        continue in full force and effect. Our failure to enforce any provision is not a waiver
        of that provision. You may not assign or transfer these Terms without our prior written
        consent; we may assign these Terms without restriction. These Terms, together with our{" "}
        <a href="/privacy-policy" className="text-primary-container font-medium">Privacy Policy</a>,
        constitute the entire agreement between you and Tuition Serve regarding the Service.
      </p>

      <h2>16. Contact</h2>
      <p>
        Questions about these Terms may be directed to us via our{" "}
        <a href="/contact" className="text-primary-container font-medium">Contact page</a>.
      </p>
    </StaticPageLayout>
  );
}
