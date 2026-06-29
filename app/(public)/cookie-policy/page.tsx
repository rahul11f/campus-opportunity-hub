export default function CookiePolicyPage() {
  return (
    <section className="container py-16 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Cookie Policy</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <div>
          <p className="mb-4">
            <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
          </p>
          <p>
            This Cookie Policy explains how Campus Opportunity Hub uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">1. What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">2. Why do we use cookies?</h2>
          <p>
            We use first-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as &quot;essential&quot; or &quot;strictly necessary&quot; cookies. 
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Authentication & Security:</strong> We use cookies to manage user sessions, keep you logged in, and protect your account from unauthorized access. (Managed via Supabase).</li>
            <li><strong>Preferences:</strong> We use cookies to remember your theme preferences (e.g., light or dark mode).</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">3. What about third-party cookies?</h2>
          <p>
            We may allow third parties to serve cookies on your computer or mobile device through our website for advertising and analytics purposes. For example, we use Google AdSense to display advertisements, which may use cookies to serve ads based on your prior visits to our website or other websites.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">4. How can I control cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your web browser controls. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website (like logging in) may be restricted.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">5. Contact Us</h2>
          <p>
            If you have any questions about our use of cookies or other technologies, please email us at:
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
