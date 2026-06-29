import Link from "next/link";

export default function PrivacyPage() {
  return (
    <section className="container py-16 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <div>
          <p className="mb-4">
            <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
          </p>
          <p>
            Welcome to Campus Opportunity Hub. We are committed to protecting your personal information and your right to privacy. This Privacy Policy is compliant with the Information Technology Act, 2000 (IT Act) and the Digital Personal Data Protection Act, 2023 (DPDP Act) of India.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the platform. The personal information that we collect depends on the context of your interactions with us and the platform, the choices you make, and the products and features you use. The personal information we collect may include the following:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Information Provided by You:</strong> We collect names, email addresses, passwords, educational details, and other similar information.</li>
            <li><strong>Automated Data:</strong> We automatically collect certain information when you visit, use, or navigate the platform (e.g., IP address, browser type).</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>
            We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. Specifically, we use your data to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Facilitate account creation and authentication (securely managed via Supabase).</li>
            <li>Send administrative information to you (e.g., password reset OTPs).</li>
            <li>Respond to your inquiries and offer support.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">3. Data Protection and Security</h2>
          <p>
            We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process, in compliance with reasonable security practices under Section 43A of the IT Act, 2000. Authentication data is handled securely through industry-standard encryption.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">4. Your Data Rights</h2>
          <p>
            Under the Digital Personal Data Protection Act, 2023, you have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data stored with us.</li>
            <li>Request correction of inaccurate or misleading data.</li>
            <li>Request erasure of your personal data.</li>
            <li>Withdraw your consent at any time.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">5. Contact Us (Grievance Officer)</h2>
          <p>
            In accordance with the Information Technology Act, 2000 and the DPDP Act, 2023, if you have any questions or complaints regarding this Privacy Policy or your data, you can contact our Grievance Officer:
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
