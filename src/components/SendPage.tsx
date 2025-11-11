import { useState } from 'react';
import Header from './Header';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ChevronLeft } from 'lucide-react';

interface SendPageProps {
  userEmail: string;
  onBack: () => void;
  onContinue: (recipient: string) => void;
  onLogout: () => void;
  onLogoClick: () => void;
  onWalletClick: () => void;
}

export default function SendPage({ userEmail, onBack, onContinue, onLogout, onLogoClick, onWalletClick }: SendPageProps) {
  const [recipient, setRecipient] = useState('');

  const handleContinue = () => {
    if (recipient.trim()) {
      onContinue(recipient);
    }
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute left-6 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-slate-900">Withdraw</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Card className="p-8 bg-white shadow-sm">
          {/* Recipient Input */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="recipient" className="text-slate-900">
              Recipient
            </Label>
            <Input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder=""
              className="w-full"
            />
            <p className="text-slate-500 text-sm mt-1">Invoice string</p>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 shadow-sm"
            disabled={!recipient.trim()}
          >
            Continue
          </Button>
        </Card>
      </main>
    </div>
  );
}
