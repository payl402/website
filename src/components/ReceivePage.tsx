import { useState } from 'react';
import Header from './Header';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ReceivePageProps {
  userEmail: string;
  onBack: () => void;
  onCreateInvoiceClick: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
  onWalletClick: () => void;
}

export default function ReceivePage({ userEmail, onBack, onCreateInvoiceClick, onLogout, onLogoClick, onWalletClick }: ReceivePageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(userEmail);
    setCopied(true);
    toast.success('Address copied to clipboard');
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
          </Button>
          <h1 className="text-slate-900">Receive</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Card className="p-8 bg-white shadow-sm">
          {/* QR Code Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-64 h-64 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center mb-6">
              <div className="w-56 h-56 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                <svg
                  width="224"
                  height="224"
                  viewBox="0 0 224 224"
                  className="w-full h-full p-2"
                >
                  {/* QR Code Pattern - Simplified representation */}
                  <rect width="224" height="224" fill="white" />
                  
                  {/* Top-left corner */}
                  <rect x="8" y="8" width="56" height="56" fill="none" stroke="black" strokeWidth="8" />
                  <rect x="24" y="24" width="24" height="24" fill="black" />
                  
                  {/* Top-right corner */}
                  <rect x="160" y="8" width="56" height="56" fill="none" stroke="black" strokeWidth="8" />
                  <rect x="176" y="24" width="24" height="24" fill="black" />
                  
                  {/* Bottom-left corner */}
                  <rect x="8" y="160" width="56" height="56" fill="none" stroke="black" strokeWidth="8" />
                  <rect x="24" y="176" width="24" height="24" fill="black" />
                  
                  {/* Pattern dots */}
                  <rect x="80" y="16" width="8" height="8" fill="black" />
                  <rect x="96" y="16" width="8" height="8" fill="black" />
                  <rect x="112" y="16" width="8" height="8" fill="black" />
                  <rect x="128" y="16" width="8" height="8" fill="black" />
                  
                  <rect x="16" y="80" width="8" height="8" fill="black" />
                  <rect x="16" y="96" width="8" height="8" fill="black" />
                  <rect x="16" y="112" width="8" height="8" fill="black" />
                  <rect x="16" y="128" width="8" height="8" fill="black" />
                  
                  <rect x="80" y="80" width="8" height="8" fill="black" />
                  <rect x="96" y="88" width="8" height="8" fill="black" />
                  <rect x="88" y="96" width="8" height="8" fill="black" />
                  <rect x="104" y="104" width="8" height="8" fill="black" />
                  
                  <rect x="120" y="80" width="8" height="8" fill="black" />
                  <rect x="136" y="88" width="8" height="8" fill="black" />
                  <rect x="128" y="96" width="8" height="8" fill="black" />
                  <rect x="144" y="104" width="8" height="8" fill="black" />
                  
                  <rect x="80" y="120" width="8" height="8" fill="black" />
                  <rect x="96" y="128" width="8" height="8" fill="black" />
                  <rect x="88" y="136" width="8" height="8" fill="black" />
                  <rect x="104" y="144" width="8" height="8" fill="black" />
                  
                  <rect x="160" y="80" width="8" height="8" fill="black" />
                  <rect x="176" y="88" width="8" height="8" fill="black" />
                  <rect x="168" y="96" width="8" height="8" fill="black" />
                  <rect x="184" y="104" width="8" height="8" fill="black" />
                  
                  <rect x="80" y="160" width="8" height="8" fill="black" />
                  <rect x="96" y="168" width="8" height="8" fill="black" />
                  <rect x="88" y="176" width="8" height="8" fill="black" />
                  <rect x="104" y="184" width="8" height="8" fill="black" />
                  
                  <rect x="120" y="160" width="8" height="8" fill="black" />
                  <rect x="136" y="168" width="8" height="8" fill="black" />
                  <rect x="128" y="176" width="8" height="8" fill="black" />
                  <rect x="144" y="184" width="8" height="8" fill="black" />
                  
                  <rect x="160" y="120" width="8" height="8" fill="black" />
                  <rect x="176" y="128" width="8" height="8" fill="black" />
                  <rect x="168" y="136" width="8" height="8" fill="black" />
                  <rect x="184" y="144" width="8" height="8" fill="black" />
                  
                  <rect x="160" y="160" width="8" height="8" fill="black" />
                  <rect x="176" y="168" width="8" height="8" fill="black" />
                  <rect x="168" y="176" width="8" height="8" fill="black" />
                  <rect x="184" y="184" width="8" height="8" fill="black" />
                </svg>
              </div>
            </div>
            
            {/* Email Address with Copy Button */}
            <div className="w-full max-w-md">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="flex-1 text-slate-700 truncate">{userEmail}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0 h-8 w-8 p-0 hover:bg-slate-200"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Lightning Invoice Section */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-slate-900 mb-4">Or use Lightning Invoice</h2>
            <Button
              variant="outline"
              onClick={onCreateInvoiceClick}
              className="w-full border-blue-400 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              Generate Lightning Invoice
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
