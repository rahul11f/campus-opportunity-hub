import Link from "next/link";

export default function TermsPage() {
  return (
    <section className="container py-16 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <div>
          <p className="mb-4">
            <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
          </p>
          <p>
            These Terms of Service constitute a legally binding agreement made between you and Campus Opportunity Hub, concerning your access to and use of our platform. By accessing the platform, you agree that you have read, understood, and agree to be bound by all of these Terms of Service.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">1. Informational Purposes Only</h2>
          <p>
            Campus Opportunity Hub acts as an aggregator of opportunities (placements, internships, scholarships, hackathons) intended for students. 
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We do not guarantee the accuracy, completeness, or reliability of any listings.</li>
            <li>Users must independently verify deadlines, eligibility, compensation, and application procedures from the respective official sources.</li>
            <li>We are not affiliated, associated, or endorsed by the organizations listed unless explicitly stated.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">2. User Accounts</h2>
          <p>
            If you create an account on the platform, you are responsible for maintaining the security of your account, and you are fully responsible for all activities that occur under the account. You must notify us immediately of any unauthorized uses of your account.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">3. User Conduct</h2>
          <p>
            As a user of the platform, you agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the platform for any illegal or unauthorized purpose in violation of Indian laws, including the Information Technology Act, 2000.</li>
            <li>Submit false, misleading, or deceptive information.</li>
            <li>Attempt to bypass any measures of the platform designed to prevent or restrict access.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">4. Limitation of Liability</h2>
          <p>
            In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the platform, including lost profit, lost data, or missed opportunities.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">5. Contact Information</h2>
          <p>
            To resolve a complaint regarding the platform or to receive further information regarding use of the platform, please contact us at:
          </p>
          <div className="mt-4 p-6 bg-card border border-border rounded-xl">
            <p className="mb-2"><strong>Email:</strong> <a href="mailto:campusopportunityhub@gmail.com" className="text-primary hover:underline">campusopportunityhub@gmail.com</a></p>
            <p><strong>Phone:</strong> +91 8434856473</p>
          </div>
        </div>

      </div>
    </section>
  );
}
