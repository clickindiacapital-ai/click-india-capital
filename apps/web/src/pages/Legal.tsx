import { useEffect } from 'react';
import { ShieldAlert, FileText, CheckSquare, Info, Shield, Trash2 } from 'lucide-react';

type LegalType = 'privacy' | 'terms' | 'disclaimer' | 'consent' | 'grievance' | 'data-deletion';

interface LegalPageProps {
  type: LegalType;
}

export default function Legal({ type }: LegalPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  const contentMap: Record<LegalType, { title: string, icon: any, content: React.ReactNode }> = {
    'privacy': {
      title: 'Privacy Policy',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p><strong>Last Updated:</strong> October 2026</p>
          <p>Click India Capital respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
          <h3 className="text-xl font-bold mt-6 mb-2">1. Important Information and Who We Are</h3>
          <p>Click India Capital is a loan facilitation and advisory platform. We collect personal information solely for the purpose of assessing loan eligibility, providing financial guidance, and facilitating loan applications with our trusted lending partners.</p>
          <h3 className="text-xl font-bold mt-6 mb-2">2. The Data We Collect About You</h3>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows: Identity Data, Contact Data, Financial Data, and Profile Data.</p>
          <p className="italic text-slate-500 mt-8">[Note: This is placeholder text. Please consult with a legal professional to ensure full compliance with the Digital Personal Data Protection Act (DPDP Act) of India.]</p>
        </div>
      )
    },
    'terms': {
      title: 'Terms & Conditions',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p><strong>Last Updated:</strong> October 2026</p>
          <p>These terms and conditions outline the rules and regulations for the use of Click India Capital's Website.</p>
          <h3 className="text-xl font-bold mt-6 mb-2">1. Advisory Role</h3>
          <p>Click India Capital acts as an independent financial advisor and loan facilitator. We do not lend our own money, nor do we guarantee the approval of any loan application. All loan approvals are subject to the sole discretion of our partner banks and NBFCs.</p>
          <h3 className="text-xl font-bold mt-6 mb-2">2. Accuracy of Information</h3>
          <p>Users must provide accurate and truthful information during their consultation or application process. Any discrepancy may result in immediate rejection by lending institutions.</p>
          <p className="italic text-slate-500 mt-8">[Note: This is placeholder text. Please consult with a legal professional to ensure full compliance.]</p>
        </div>
      )
    },
    'disclaimer': {
      title: 'Disclaimer',
      icon: ShieldAlert,
      content: (
        <div className="space-y-4">
          <p><strong>Last Updated:</strong> October 2026</p>
          <p>The information contained on the Click India Capital website is for general information purposes only. Click India Capital assumes no responsibility for errors or omissions in the contents of the Service.</p>
          <h3 className="text-xl font-bold mt-6 mb-2">Not a Lender</h3>
          <p>Click India Capital is a loan facilitation and comparison platform and does not directly provide loans, accept deposits, or make credit decisions. Loan approvals, interest rates, processing fees, loan amounts, and other terms are determined solely by the respective lending institutions and are subject to their policies and eligibility criteria.</p>
          <h3 className="text-xl font-bold mt-6 mb-2">No Guarantee of Results</h3>
          <p>Submission of an application or utilizing our advisory services does not guarantee loan approval. We provide guidance to improve credit profiles, but we do not provide legal debt settlement services or guarantee any specific reduction in debt.</p>
          <p className="italic text-slate-500 mt-8">[Note: This is placeholder text. Please consult with a legal professional to ensure full compliance.]</p>
        </div>
      )
    },
    'consent': {
      title: 'Consent & Authorization',
      icon: CheckSquare,
      content: (
        <div className="space-y-4">
          <p><strong>Last Updated:</strong> October 2026</p>
          <p>By using the services of Click India Capital, you provide the following explicit consents:</p>
          <h3 className="text-xl font-bold mt-6 mb-2">1. Communication Consent</h3>
          <p>I hereby authorize Click India Capital and its lending partners to contact me via phone, SMS, WhatsApp, email, or other communication channels regarding loan products, advisory services, and related offerings.</p>
          <h3 className="text-xl font-bold mt-6 mb-2">2. Data Sharing Consent</h3>
          <p>I voluntarily authorize Click India Capital to review and analyze my uploaded credit report, bank statements, and financial documents solely for eligibility assessment, lender matching, and loan facilitation purposes. I understand that my data will be securely shared with partner institutions only to process my application.</p>
          <p className="italic text-slate-500 mt-8">[Note: This is placeholder text. Please consult with a legal professional to ensure full compliance.]</p>
        </div>
      )
    },
    'grievance': {
      title: 'Grievance Redressal',
      icon: Info,
      content: (
        <div className="space-y-4">
          <p><strong>Last Updated:</strong> October 2026</p>
          <p>At Click India Capital, we strive to provide the best possible service. However, if you have any complaints or grievances regarding our services, please contact our Grievance Redressal Officer.</p>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6">
            <h4 className="font-bold mb-2">Grievance Redressal Officer:</h4>
            <p>Name: Sameer Krishnan</p>
            <p>Email: grievances@clickindiacapital.in</p>
            <p>Phone: +91 9995959055</p>
            <p>Address: Kerala, India</p>
          </div>
          <p className="mt-4">We aim to resolve all grievances within 7-14 working days of receipt.</p>
          <p className="italic text-slate-500 mt-8">[Note: This is placeholder text. Please consult with a legal professional to ensure full compliance.]</p>
        </div>
      )
    },
    'data-deletion': {
      title: 'Data Deletion Request',
      icon: Trash2,
      content: (
        <div className="space-y-4">
          <p><strong>Last Updated:</strong> October 2026</p>
          <p>Under applicable data protection laws, you have the right to request the deletion of your personal data held by Click India Capital.</p>
          <h3 className="text-xl font-bold mt-6 mb-2">How to Request Deletion</h3>
          <p>To request the permanent deletion of your data, please send an email from your registered email address to <strong>privacy@clickindiacapital.in</strong> with the subject line "Data Deletion Request".</p>
          <p>Please note that we may need to retain certain information for legal, regulatory, or compliance purposes (such as maintaining records of active loans facilitated through our platform) as mandated by the RBI or other authorities.</p>
          <p className="italic text-slate-500 mt-8">[Note: This is placeholder text. Please consult with a legal professional to ensure full compliance.]</p>
        </div>
      )
    }
  };

  const { title, icon: Icon, content } = contentMap[type];

  return (
    <div className="bg-slate-50 min-h-screen py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-16">
          <div className="flex items-center gap-4 mb-10 pb-10 border-b border-slate-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Icon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{title}</h1>
          </div>
          
          <div className="prose prose-slate prose-lg max-w-none text-slate-600">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
