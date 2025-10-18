import React from 'react';
import { useNavigate } from 'react-router-dom';

function TermsAndConditions() {
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
            <h1 className="text-xl font-bold text-gray-900">Terms and Conditions</h1>
            <div></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms and Conditions</h2>

            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h3>
              <p className="text-gray-700 mb-4">
                By accessing and using the ITSO ID Tracker system ("the Service") provided by National University - Dasmariñas,
                you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Use License</h3>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily use the Service for personal, non-commercial transitory viewing only.
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 mb-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to decompile or reverse engineer any software contained in the Service</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h3>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times.
                You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p className="text-gray-700 mb-4">
                You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware
                of any breach of security or unauthorized use of your account.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Service Availability</h3>
              <p className="text-gray-700 mb-4">
                We strive to keep the Service available at all times, but we do not guarantee that the Service will always be available,
                accessible, uninterrupted, or error-free. We reserve the right to discontinue or modify the Service at any time.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Data Privacy</h3>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service,
                to understand our practices regarding the collection and use of your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Prohibited Uses</h3>
              <p className="text-gray-700 mb-4">
                You may not use our Service:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 mb-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>To interfere with or circumvent the security features of the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Termination</h3>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability,
                under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-gray-700 mb-4">
                If you wish to terminate your account, you may simply discontinue using the Service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h3>
              <p className="text-gray-700 mb-4">
                In no event shall National University - Dasmariñas, nor its directors, employees, partners, agents, suppliers, or affiliates,
                be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Governing Law</h3>
              <p className="text-gray-700 mb-4">
                These Terms shall be interpreted and governed by the laws of the Republic of the Philippines, without regard to its conflict
                of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h3>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material,
                we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be
                determined at our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>ITSO Office</strong></p>
                <p className="text-gray-700">National University - Dasmariñas</p>
                <p className="text-gray-700">Address: City of Dasmariñas, Cavite, Philippines</p>
                <p className="text-gray-700">Email: itso@nu-dasma.edu.ph</p>
                <p className="text-gray-700">Phone: (046) 416-4043</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TermsAndConditions;