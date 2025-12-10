import React from 'react';
import { Mail, Shield, FileText, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  title: string;
  icon: React.ElementType;
  lastUpdated: string;
  children: React.ReactNode;
  onBack: () => void;
}

const LegalLayout: React.FC<LegalPageProps> = ({ title, icon: Icon, lastUpdated, children, onBack }) => (
  <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
    <button 
        onClick={onBack} 
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
    >
        <ArrowLeft className="w-4 h-4" /> Back to Home
    </button>
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-8">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-2">Last updated: {lastUpdated}</p>
      </div>
      <div className="p-8 prose prose-slate max-w-none">
        {children}
      </div>
    </div>
  </div>
);

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Privacy Policy" icon={Shield} lastUpdated={new Date().toLocaleDateString()} onBack={onBack}>
    <h3>1. Introduction</h3>
    <p>Welcome to Shive AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
    
    <h3>2. Data We Collect</h3>
    <p>Shive AI is designed with privacy in mind. Most of our tools (Image Resizer, PDF Editor) process files strictly <strong>on your device (Client-side)</strong>. We do not upload your files to our servers.</p>
    <p>For AI tools, text inputs are sent to the Gemini API for processing. These inputs are not stored by us after the session is generated.</p>

    <h3>3. Cookies</h3>
    <p>We use local storage to save your preferences (like tool settings). We may use third-party services which use cookies to serve ads based on a user's prior visits to your website.</p>

    <h3>4. Third-Party Links</h3>
    <p>This website may include links to third-party websites. Clicking on those links may allow third parties to collect or share data about you. We do not control these third-party websites.</p>

    <h3>5. Contact Us</h3>
    <p>If you have any questions about this privacy policy, please contact us via our Contact page.</p>
  </LegalLayout>
);

export const TermsOfService: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Terms of Service" icon={FileText} lastUpdated={new Date().toLocaleDateString()} onBack={onBack}>
    <h3>1. Agreement to Terms</h3>
    <p>By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations.</p>

    <h3>2. Use License</h3>
    <p>Permission is granted to use the tools on Shive AI for personal, non-commercial, or commercial transitory viewing only.</p>
    <ul>
        <li>You must not use the AI tools to generate academic dishonesty (plagiarism).</li>
        <li>You must not attempt to reverse engineer any software contained on Shive AI.</li>
    </ul>

    <h3>3. Disclaimer</h3>
    <p>The materials on Shive AI are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>

    <h3>4. Accuracy of Materials</h3>
    <p>The AI-generated content is for reference only. Shive AI does not warrant that any of the materials on its website are accurate, complete, or current.</p>
  </LegalLayout>
);

export const ContactPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Contact Us" icon={Mail} lastUpdated={new Date().toLocaleDateString()} onBack={onBack}>
    <p className="lead">Have questions, suggestions, or found a bug? We'd love to hear from you.</p>
    
    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 not-prose mb-8">
      <h3 className="text-indigo-900 font-bold text-lg mb-2">General Inquiries</h3>
      <p className="text-indigo-700 mb-4">For general support or feedback about our tools.</p>
      <a href="mailto:support@shiveai.example.com" className="inline-flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors">
        <Mail className="w-4 h-4" /> Email Support
      </a>
    </div>

    <h3>Report an Issue</h3>
    <p>If a tool isn't working as expected, please include:</p>
    <ul>
      <li>The name of the tool (e.g., PDF Merger)</li>
      <li>Browser and Device you are using</li>
      <li>A description of the error</li>
    </ul>
  </LegalLayout>
);