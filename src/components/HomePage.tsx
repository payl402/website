import { useState } from 'react';
import Header from "./Header";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import architectureDiagram from 'asset/architecture.png';
import L402Logo from '@/assets/logo.png';
import { toast } from "sonner@2.0.3";
import { Zap, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Buy, PaymentRequest } from '../libs/api_service';
import { PayInvoice } from '../libs/api_gateway';


interface HomePageProps {
  onLoginClick: (source: "buy" | "header") => void;
  onSignUpClick: () => void;
  isLoggedIn?: boolean;
  userEmail?: string;
  onLogout?: () => void;
  onWalletClick?: () => void;
  buyCount?: number;
  onBuyL402?: () => boolean;
}

export default function HomePage({
  onLoginClick,
  onSignUpClick,
  isLoggedIn,
  userEmail,
  onLogout,
  onWalletClick,
  buyCount = 0,
  onBuyL402,
}: HomePageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyL402 = async () => {
    if (!isLoggedIn) {
        onLoginClick("buy");
        return;
    }
    
    setIsLoading(true);
    
    try {
        const buyResponse = await Buy("L402", 10); // Buying L402 for 10 sats

        if (buyResponse.code === 402) {
            toast.error("Payment required (402). Fetching payment details...");

            // Call PAY_REQUEST interface to get the payment invoice
            const payRequestResponse = await PaymentRequest("0", "lightning", buyResponse.data.payment_context_token, "bitcoin", "sats");

            // Check for success from PAY_REQUEST
            if (payRequestResponse.code === 0) {
                // Ready for automatic payment now
                const payResponse = await PayInvoice(payRequestResponse.data.payment_request.lightning_invoice);
                toast.success("Payment successful!");
                    if (onBuyL402) {
                        onBuyL402();
                    }
                    else {
                      toast.error("Payment failed. Please try again.");
                }
            } else {
                toast.error("Failed to generate payment invoice.");
            }
        } else {
            toast.error(`Place order failed with code: ${buyResponse.code}`);
        }
    } catch (error) {
        toast.error("An error occurred during the L402 flow. Please ensure there are sufficient funds in your wallet.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50">
      <Header
        onLoginClick={() => onLoginClick("header")}
        onSignUpClick={onSignUpClick}
        onLogoClick={() => {}}
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        onLogout={onLogout}
        onWalletClick={onWalletClick}
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-slate-900 mb-8">
            The Gateway for Lightning 402 Protocol
          </h1>
        </section>

        {/* Architecture Diagram and Comparison */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: Architecture Diagram */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative">
              <h3 className="text-slate-900 mb-6">
                How L402 works?
              </h3>
              <ImageWithFallback
                src={architectureDiagram}
                alt="L402 Protocol Architecture Diagram"
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute top-8 right-8">
                <a
                  href="https://www.l402.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Learn more &gt;
                </a>
              </div>
            </div>

            {/* Right: Comparison */}
            <div className="flex flex-col h-full">
              <h3 className="text-slate-900 mb-6">
                 Gateway vs. Facilitator
              </h3>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-4">
                <h3 className="text-slate-900 mb-3">
                  Gateway (L402)
                </h3>
                <p className="text-slate-600 mb-2">
                  • The counterpart to the Facilitator in x402, serving as core infrastructure for the payment flow
                </p>
                <p className="text-slate-600 mb-2">
                  • Zero gas fees and instant settlement, with support for RGB and Taproot Assets
                </p>
              </div>

              <div className="text-slate-400 text-center text-2xl mb-4">
                ↓
              </div>

              <div className="bg-slate-100 rounded-xl p-6 border border-slate-200 flex-1 flex flex-col justify-center">
                <h3 className="text-slate-500 mb-3">
                  Facilitator (x402)
                </h3>
                <p className="text-slate-500">
                  • Verify and pay the gas on behalf of
                  the client
                </p>
                <p className="text-slate-500">
                  • Confirm payment settled onchain and notify the service
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Test Experiment Section */}
        <section className="mb-12">
          <h1 className="text-slate-900 mb-6 text-[24px]">
            Try L402
          </h1>

          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 text-lg">
                  <span className="text-slate-600">
                    Service Name:
                  </span>
                  <span className="text-slate-900">L402 Launchpad</span>
                  <span 
                      className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-300 shadow-sm whitespace-nowrap"
                      title="This service is running on the Bitcoin Signet network."
                  >
                      Signet
                  </span>                  
                </div>               
                <p className="text-slate-600 text-sm mb-2">
                  This is a demo implementing a launchpad via L402 to experience the Lightning payment speed.
                </p>
                <p className="text-slate-600 text-xs italic">
                  <span className="font-medium text-amber-700 not-italic">Warning:</span> Clicking "Buy" will deduct 10 sats from your connected wallet without further confirmation.
                </p>
              </div>

              {/* Token Badge */}
              <div className="ml-6">
                <div className="w-20 h-20 rounded-xl border-2 border-orange-400 bg-orange-50 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-orange-500">
                      #L402
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert for max buys */}
            {isLoggedIn && buyCount >= 10 && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">
                  Up to 10 buys
                </AlertDescription>
              </Alert>
            )}

            {/* Buy Button */}
            <div className="flex flex-col items-center pt-4">
              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyL402}
                disabled={isLoading || !isLoggedIn}
                className={`
                  w-full max-w-md border-2 border-blue-400 text-blue-600 rounded-xl py-6
                  ${isLoading ? 'bg-blue-200 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-blue-700'}
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing L402 Flow...
                  </>
                ) : (
                  <>
                    <span className="text-lg">Buy L402</span>
                    <span className="ml-2 text-xs text-blue-400">
                      (with 10 sats)
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 mt-8 bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <img 
                src={L402Logo} 
                alt="Logo" 
                className="h-8 w-auto"
              />                
              <div>
                <div className="text-white mb-1">PayL402.com</div>
                <p className="text-slate-300 text-sm">
                  AI payment infra via Lightning
                </p>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              {/* X (Twitter) Icon */}
              <a
                href="https://twitter.com/PayL402"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-white"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* GitHub Icon */}
              <a
                href="https://github.com/PayL402"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-white"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}