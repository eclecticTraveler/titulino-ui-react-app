import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Privacy Policy – Titulino Languages</h2>

      <div className="overflow-y-auto max-h-80 p-4 border rounded-lg bg-gray-50">
        <p className="mb-4 text-sm text-gray-600">Last updated: July 8, 2025</p>

        <h3 className="text-xl font-semibold mb-2">1. Introduction</h3>
        <p className="mb-4">
          At <strong>Titulino Languages</strong>, we are committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights as a user of our platform.
        </p>

        <h3 className="text-xl font-semibold mb-2">2. Information We Collect</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Full name</li>
          <li>Email address</li>
          <li>Gender</li>
          <li>Birthdate (used to tailor learning content)</li>
          <li>Geographic location (to support local communities)</li>
          <li>Language proficiency level</li>
        </ul>

        <h3 className="text-xl font-semibold mb-2">3. How We Use Your Information</h3>
        <p className="mb-4">
          Your information is used to personalize your language learning experience, match you with appropriate content, and understand how to better serve diverse communities.
        </p>

        <h3 className="text-xl font-semibold mb-2">4. Data Sharing</h3>
        <p className="mb-4">
          We do <strong>not</strong> sell, rent, or share your personal information with third parties. We may only disclose your data if legally required (e.g., a court order).
        </p>

        <h3 className="text-xl font-semibold mb-2">5. Data Security</h3>
        <p className="mb-4">
          We take reasonable technical and administrative measures to protect your data. However, no system is 100% secure, and we cannot guarantee the absolute security of your information.
        </p>

        <h3 className="text-xl font-semibold mb-2">6. Your Rights & Data Deletion</h3>
        <p className="mb-4">
          You have the right to request access to or deletion of your personal data. To do so, please email us at:
          <a href="mailto:titulinoenglish@gmail.com" className="text-blue-600 underline ml-1">titulinoenglish@gmail.com</a> with the subject line <strong>"Remove My Data"</strong>. We will process your request within 7 business days.
        </p>

        <h3 className="text-xl font-semibold mb-2">7. Contact</h3>
        <p>
          For questions or concerns regarding this policy, please contact us at:
          <a href="mailto:titulinoenglish@gmail.com" className="text-blue-600 underline ml-1">titulinoenglish@gmail.com</a>.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
