import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 text-gray-800">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-2">
          Effective Date: <span className="font-medium">29th August 2025</span>
        </p>
        <p className="mb-4">
          App Name: <span className="font-medium">HomeinTown</span>
        </p>
        <p className="mb-6">
          Developer Contact:{" "}
          <span className="font-medium">
            info@codixlysolutions.in / +91 8630172681
          </span>
        </p>
        <hr className="border-t my-6" />

        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p className="mb-4">
          This Privacy Policy explains how <b>HomeinTown</b> collects, uses, and
          protects your personal and non-personal information when you use our
          mobile application, including the customer-facing portal (B2C) and the
          agent/property owner panel (B2B). By using the app, you agree to this
          Privacy Policy.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          2. Information We Collect
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            <b>Personal Information:</b> Name, email, phone number, property
            details (for agents), and location (if permission is granted).
          </li>
          <li>
            <b>Location Data:</b> Collected only with your explicit consent to
            show nearby properties and map-based listings.
          </li>
          <li>
            <b>Device Information:</b> Device type, operating system, crash logs,
            and usage analytics.
          </li>
          <li>
            <b>Media Uploads:</b> Photos, videos, and floor plans uploaded by
            agents/property owners.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">
          3. How We Use Your Information
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>To display and filter properties relevant to you</li>
          <li>To connect customers with property owners or agents</li>
          <li>
            To provide map-based features, virtual tours, and chat support
          </li>
          <li>To improve app functionality and fix technical issues</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">
          4. Data Sharing &amp; Third-Party Services
        </h2>
        <p className="mb-2">We do not sell or rent your personal data.</p>
        <p className="mb-1">We may share data only with:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Google Maps (location services &amp; directions)</li>
          <li>WhatsApp API (chat and communication)</li>
          <li>Analytics providers such as Google Analytics, Meta Pixel</li>
          <li>AI services (e.g., OpenAI, Eleven Labs for chatbot guidance)</li>
          <li>Law enforcement if required by applicable law</li>
        </ul>
        <p className="mb-4">
          These third-party services have their own privacy policies. We
          encourage you to review them.
        </p>

        <h2 className="text-xl font-semibold mb-2">5. Data Retention</h2>
        <p className="mb-4">
          We retain user data only as long as necessary to provide our services,
          comply with legal obligations, or until the user deletes their account
          or requests data removal.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          6. User Rights &amp; Controls
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            You may withdraw location permissions anytime via device settings.
          </li>
          <li>
            You may request account deletion and data removal by contacting us.
          </li>
          <li>You may opt out of marketing communications at any time.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">
          7. Children&apos;s Privacy
        </h2>
        <p className="mb-4">
          Our services are not directed at children under 13. We do not knowingly
          collect data from minors. If we learn we have collected such data, we
          will delete it immediately.
        </p>

        <h2 className="text-xl font-semibold mb-2">8. Security</h2>
        <p className="mb-4">
          We implement industry-standard security measures, including encryption
          and secure servers, to safeguard your information. However, no method
          of electronic storage is 100% secure.
        </p>

        <h2 className="text-xl font-semibold mb-2">9. Policy Updates</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. If changes are
          significant, we will notify you via email or app notification.
        </p>

        <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
        <p className="mb-1">If you have any questions, contact us at:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Email: info@codixlysolutions.in</li>
          <li>Phone: +91 8630172681</li>
          <li>Address: Meerut, Uttar Pradesh, India</li>
        </ul>
      </div>
    </div>
  );
}
