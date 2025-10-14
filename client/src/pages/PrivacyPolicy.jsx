import React from 'react';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
            <div></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>

            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h3>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, make an appointment,
                or contact us for support. This may include:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 mb-4">
                <li>Student ID and personal information</li>
                <li>Email address and contact information</li>
                <li>Appointment details and preferences</li>
                <li>Communication records with our support team</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h3>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process appointments and manage ID card requests</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing and Disclosure</h3>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
                except as described in this policy:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 mb-4">
                <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
                <li><strong>With Your Consent:</strong> We may share information with your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h3>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet
                or electronic storage is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Data Retention</h3>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes
                outlined in this privacy policy, unless a longer retention period is required by law.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h3>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 mb-4">
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict processing of your information</li>
                <li>Data portability</li>
                <li>Withdraw consent where applicable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h3>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our website. You can control
                cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Third-Party Links</h3>
              <p className="text-gray-700 mb-4">
                Our service may contain links to third-party websites. We are not responsible for the privacy practices or
                content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h3>
              <p className="text-gray-700 mb-4">
                Our service is intended for use by students of National University - Dasmariñas. We do not knowingly collect
                personal information from children under 13. If we become aware that we have collected personal information
                from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h3>
              <p className="text-gray-700 mb-4">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new
                privacy policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Data Protection Officer</strong></p>
                <p className="text-gray-700">ITSO Office, National University - Dasmariñas</p>
                <p className="text-gray-700">Address: City of Dasmariñas, Cavite, Philippines</p>
                <p className="text-gray-700">Email: privacy@nu-dasma.edu.ph</p>
                <p className="text-gray-700">Phone: (046) 416-4043</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPolicy;