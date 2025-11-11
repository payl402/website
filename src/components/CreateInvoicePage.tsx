import { useState,useCallback } from 'react';
import Header from './Header';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ChevronLeft } from 'lucide-react';
import { CreateInvoice } from '../libs/api_gateway';
import { Sha256Hash } from '../libs/tools';


interface CreateInvoicePageProps {
  userEmail: string;
  onBack: () => void;
  onCreateInvoice: (generatedInvoice:string) => void;
  onLogout: () => void;
  onLogoClick: () => void;
  onWalletClick: () => void;
}

export default function CreateInvoicePage({ 
  userEmail, 
  onBack, 
  onCreateInvoice,
  onLogout, 
  onLogoClick, 
  onWalletClick 
}: CreateInvoicePageProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const numericAmount = amount ? parseInt(amount, 10) : 0;
  // Form is valid only when the amount is greater than 0
  const isFormValid = numericAmount > 0;

  const handleCreateInvoice = useCallback(async () => {
    if (!isFormValid) {
        setApiError('Please enter a valid amount greater than 0.');
        return;
    }
    
    setLoading(true);
    setApiError(null);

    try {
        let finalDescHash = '';
        if (description) {
            // Calculate SHA-256 hash of the description for descHash
            finalDescHash = await Sha256Hash(description);
        }
        
        // Call CreateInvoice function, passing the calculated descHash (or empty string if no description)
        const response = await CreateInvoice(description, finalDescHash, numericAmount);
        
        // Pass the generated payment request to the parent component
        onCreateInvoice(response.payment_request);

    } catch (error: any) {
        console.error('Invoice creation failed:', error);
        // Display a user-friendly error message
        setApiError(error.message || 'Failed to create invoice. Please try again.');
    } finally {
        setLoading(false);
    }
  }, [description, numericAmount, isFormValid, onCreateInvoice]);

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
            Back
          </Button>
          <h1 className="text-xl font-semibold text-slate-900">Deposit</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Card className="p-8 bg-white shadow-xl space-y-6">
            
          {/* Error Message Display */}
          {apiError && (
              <div className="p-3 text-sm bg-red-100 border border-red-300 text-red-700 rounded-lg" role="alert">
                  {apiError}
              </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (sats)
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                    // Only allow integer input
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setAmount(val);
                }}
                placeholder="e.g. 1000"
                className="w-full pr-16 text-lg font-mono"
                min="1"
                disabled={loading}
                aria-invalid={!isFormValid && amount.length > 0}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                sats
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this payment for?"
              className="w-full min-h-[100px]"
              disabled={loading}
            />
          </div>

          {/* Create Invoice Button */}
          <div className="pt-4">
            <Button
              onClick={handleCreateInvoice}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 shadow-md transition-all"
              disabled={!isFormValid || loading}
            >
              {loading ? 'Generating Invoice...' : 'Create Invoice'}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
