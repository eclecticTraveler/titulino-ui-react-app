import React from "react";

const TermsConditionsCancelSubscription = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Terms & Conditions – Titulino Languages</h2>

      <div className="overflow-y-auto max-h-80 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h3>
        <p className="mb-4">
          By using Titulino Languages, you agree to these Terms and Conditions. Please read them carefully.
        </p>

        <h3 className="text-xl font-semibold mb-2">2. Data Ownership & Privacy</h3>
        <p>
          The data you provide during your use of our platform is owned by <strong>Titulino Languages</strong>.
          We collect this data to better serve our students and improve our offerings.
        </p>
        <ul className="list-disc pl-6 my-2">
          <li><strong>Data Sharing:</strong> We do <span className="font-bold">not</span> share your data with third parties unless required by law.</li>
          <li><strong>Privacy Commitment:</strong> We continuously improve security, but do not assume responsibility for any data loss.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">3. Account & Data Removal</h3>
        <p>
          If you wish to <strong>delete your account or remove your data</strong>, please email us at:
          <a href="mailto:titulinoenglish@gmail.com" className="text-blue-600 underline"> titulinoenglish@gmail.com</a>
          {" "}with the subject <strong>"Remove My Data"</strong>. Your request will be processed within 7 business days.
        </p>
      </div>
    </div>
  );
};

export default TermsConditionsCancelSubscription;
