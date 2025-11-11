import { useState } from 'react';
import Header from './Header';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { QRCodeSVG } from 'qrcode.react';

interface InvoiceDisplayPageProps {
  userEmail: string;
  invoice: string;
  onBack: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
  onWalletClick: () => void;
}

export default function InvoiceDisplayPage({ 
  userEmail, 
  invoice,
  onBack, 
  onLogout, 
  onLogoClick, 
  onWalletClick 
}: InvoiceDisplayPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(invoice);
    setCopied(true);
    toast.success('Invoice copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50">
      <Header 
        onLoginClick={() => {}}
        onSignUpClick={() => {}}
        onLogoClick={onLogoClick}
        isLoggedIn={true}
        userEmail={userEmail}
        onLogout={onLogout}
        onWalletClick={onWalletClick}
      />

      {/* Page Title with Back Button */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-4 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>
          <h1 className="text-xl font-semibold text-slate-900"></h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Card className="p-8 bg-white shadow-xl space-y-8">
          
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Lightning Invoice</h2>
            
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Deposit either by the QR code or the invoice string below.
            </p>

            {/* Note: The expiry status display has been removed as requested. */}
          </div>

          {/* QR Code Display */}
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-64 h-64 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center p-2 shadow-inner">
              <QRCodeSVG 
                value={invoice} 
                size={240}
                level="M"
              />
            </div>
          </div>
            
          {/* Invoice String with Copy Button */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Invoice String</h3>
            <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200 transition-shadow hover:shadow-md">
              <div className="flex-1 break-all text-slate-700 font-mono text-xs sm:text-sm max-h-32 overflow-hidden">
                {invoice}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="shrink-0 h-8 w-8 p-0 hover:bg-slate-200"
                title="Copy Invoice"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-600" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
