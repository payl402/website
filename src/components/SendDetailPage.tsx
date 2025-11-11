import { useState } from 'react';
import Header from './Header';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ChevronLeft, Menu } from 'lucide-react';

interface SendDetailPageProps {
  userEmail: string;
  recipient: string;
  satsBalance: number;
  onBack: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
  onWalletClick: () => void;
}

export default function SendDetailPage({ 
  userEmail, 
  recipient, 
  satsBalance,
  onBack, 
  onCancel,
  onConfirm,
  onLogout, 
  onLogoClick, 
  onWalletClick 
}: SendDetailPageProps) {
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [amountError, setAmountError] = useState('');

  const quickAmounts = [
    { value: 1000, display: '1k' },
    { value: 5000, display: '5k' },
    { value: 10000, display: '10k' },
    { value: 25000, display: '25k' }
  ];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setAmountError('');
  };

  const handleConfirm = () => {
    const amountNum = parseFloat(amount);
    
    // Validate amount
    if (!amount || amountNum <= 1) {
      setAmountError('Must > 1 sats');
      return;
    }
    
    if (amountNum > satsBalance) {
      setAmountError('Exceed Balance');
      return;
    }
    
    // Clear error and proceed
    setAmountError('');
    console.log('Sending:', { recipient, amount, comment });
    onConfirm();
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
          <h1 className="text-slate-900"></h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Card className="p-8 bg-white shadow-sm space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label className="text-slate-900">Description</Label>
            <div className="text-slate-700">Sats for {recipient}</div>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <Label className="text-slate-900">Balance</Label>
            <div className="text-slate-700">{satsBalance} sats</div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-slate-900">
              Amount
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError('');
                }}
                placeholder="0"
                className="w-full pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                sats
              </span>
            </div>
            {amountError && (
              <p className="text-red-600 text-sm mt-1">{amountError}</p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {quickAmounts.map((item) => (
              <Button
                key={item.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(item.value)}
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
              >
                <Menu className="w-4 h-4" />
                {item.display}
              </Button>
            ))}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-slate-900">
              Comment
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Option"
              className="w-full min-h-[100px] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 shadow-sm"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Confirm
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
