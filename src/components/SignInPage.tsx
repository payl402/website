import { useState,useMemo } from 'react';
import Header from './Header';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle } from 'lucide-react';
import { Login } from '../libs/api_gateway';

interface SignInPageProps {
  onBack: () => void;
  onSignUpClick: () => void;
  onVerifySuccess: (email: string) => void;
}

export default function SignInPage({ onBack, onSignUpClick, onVerifySuccess }: SignInPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const isButtonDisabled = useMemo(() => {
    return !email || !password || isLoading;
  }, [email, password, isLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage('');

    if (isButtonDisabled) {
      setSubmitMessage('Please enter your complete email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await Login(email, password);
      
      setSubmitMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        onVerifySuccess(email); // Navigate on success
      }, 500);

    } catch (error) {
      const errorMessage = (error as Error).message;
      setSubmitMessage(errorMessage);
      console.error(error);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50">
      <Header onLoginClick={onBack} onLogoClick={onBack} onSignUpClick={onSignUpClick}/>
      
      <main className="max-w-lg mx-auto px-6 py-16">
        <div className="w-full bg-white p-8 rounded-xl shadow-2xl border border-slate-200">
         
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Sign In
          </h2>
          <p className="text-slate-600 mb-8">
            Welcome back, please enter your credentials.
          </p>

          {/* Message Box for Feedback */}
          {submitMessage && (
            <div 
              className={`p-3 mb-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
                submitMessage.includes('successful') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}
            >
              <AlertCircle className="size-4 shrink-0" />
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <Label htmlFor="email" className="text-slate-900 mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor="password" className="text-slate-900 mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              isLoading={isLoading}
              disabled={isButtonDisabled}
              // Adopted styles from Signup Button
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg font-bold shadow-lg h-12 py-3 text-lg" 
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Switch Link */}
            <p className="text-center text-sm text-slate-500 mt-4">
              Don't have an account? 
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); onSignUpClick(); }} 
                className="text-blue-600 hover:underline"
              >
                Sign Up
              </a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
