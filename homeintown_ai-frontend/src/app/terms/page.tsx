import Navbar from "@/components/Navbar";

export default function TermsPage() {
  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 text-gray-800">
        <h1 className="text-3xl font-bold mb-4">Terms &amp; Conditions</h1>
        <p className="mb-2">
          Effective Date: <span className="font-medium">29th August 2025</span>
        </p>
        <p className="mb-4">
          App Name: <span className="font-medium">HomeinTown</span>
        </p>
        <hr className="border-t my-6" />

        <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using the HomeinTown application, you agree to be bound
          by these Terms and Conditions. If you do not agree, please do not use
          the app.
        </p>

        <h2 className="text-xl font-semibold mb-2">2. Use of Service</h2>
        <p className="mb-4">
          HomeinTown provides a platform for property listing, searching, and
          connecting buyers with sellers/agents. You agree to use the service
          only for lawful purposes and in accordance with these terms.
        </p>

        <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
        <ul className="list-disc list-inside mb-4">
          <li>You must provide accurate and complete registration information.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You must notify us immediately of any unauthorized use of your account.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">4. Property Listings</h2>
        <ul className="list-disc list-inside mb-4">
          <li>All property information must be accurate and not misleading.</li>
          <li>Users must not post fraudulent or illegal property listings.</li>
          <li>HomeinTown reserves the right to remove any listing that violates these terms.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">5. Intellectual Property</h2>
        <p className="mb-4">
          All content, trademarks, and intellectual property on the platform belong
          to HomeinTown or its licensors. You may not reproduce, distribute, or
          create derivative works without prior written consent.
        </p>

        <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
        <p className="mb-4">
          HomeinTown is not liable for any direct, indirect, incidental, or
          consequential damages arising from the use of our service. We do not
          guarantee the accuracy of property listings provided by third parties.
        </p>

        <h2 className="text-xl font-semibold mb-2">7. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your account at any time for violations of
          these terms without prior notice.
        </p>

        <h2 className="text-xl font-semibold mb-2">8. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to modify these Terms at any time. Changes will be
          posted on this page with an updated effective date.
        </p>

        <h2 className="text-xl font-semibold mb-2">9. Contact</h2>
        <p className="mb-1">For questions regarding these terms:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Email: info@codixlysolutions.in</li>
          <li>Phone: +91 8630172681</li>
          <li>Address: Meerut, Uttar Pradesh, India</li>
        </ul>
      </div>
    </div>
  );
}
