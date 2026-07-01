import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface UPIPaymentQRProps {
  vpa: string;
  name: string;
  amount: number;
  transactionNote: string;
  currency?: string;
  className?: string;
  size?: number;
}

export const UPIPaymentQR: React.FC<UPIPaymentQRProps> = ({
  vpa,
  name,
  amount,
  transactionNote,
  currency = 'INR',
  className = '',
  size = 200
}) => {
  const upiLink = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}`;

  return (
    <div className={`flex flex-col items-center gap-6 p-8 bg-white rounded-3xl border border-gray-100 shadow-xl ${className}`}>
      <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-50">
        <QRCodeSVG 
          value={upiLink} 
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Amount to Pay</p>
        <p className="text-4xl font-black text-gray-900">₹{amount.toLocaleString()}</p>
      </div>

      <div className="w-full space-y-4">
        {/* Mobile Deep Link Button */}
        <a 
          href={upiLink}
          className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 lg:hidden"
        >
          Pay with Any UPI App
        </a>
        
        <p className="text-[10px] text-gray-400 font-medium text-center leading-relaxed">
          Scan this QR code with GPay, PhonePe, or BHIM.<br />
          The amount and note are pre-filled for your security.
        </p>
      </div>
    </div>
  );
};
