import { useState,useMemo } from 'react';
import Header from './Header';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { cn } from './ui/utils';
import { SignUp, Login, ReLoginError } from '../libs/api_gateway';


interface SignupPageProps {
  onBack: () => void;
  onLoginClick: () => void;
}

export default function SignupPage({ onBack, onLoginClick }: SignupPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isHuman, setIsHuman] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [currentView, setCurrentView] = useState<'signup' | 'home'>('signup');
  const [loggedInUserEmail, setLoggedInUserEmail] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // --- Validation Logic ---

  const passwordValid = useMemo(() => password.length >= 8, [password]);
  const passwordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);

  const isButtonDisabled = useMemo(() => {
    return !email || !password || !confirmPassword || !isHuman || !passwordValid || !passwordsMatch;
  }, [email, password, confirmPassword, isHuman, passwordValid, passwordsMatch]);

  const validatePasswords = () => {
    if (!passwordValid) {
      setSubmitMessage('Password must be at least 8 characters long.');
      return false;
    }
    if (!passwordsMatch) {
      setSubmitMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  /**
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitMessage('');

    if (isButtonDisabled) {
      setSubmitMessage('Please fill out all fields and verify you are human.');
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);

    try {
      await SignUp(email, password);
      
      // Auto-Login after successful sign up
      const tokenResponse = await Login(email, password);

      setSubmitMessage('Sign up successful! Redirecting to home page...');
      setLoggedInUserEmail(email);

      setTimeout(() => {
        onBack();
      }, 1000);

    } catch (error) {
      if (error instanceof ReLoginError) {
        setSubmitMessage(`Auth Error: ${error.message}`);
      } else {
        setSubmitMessage(`Sign Up/Login failed: ${(error as Error).message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50">
      <Header onLoginClick={onLoginClick} onSignUpClick={onBack} onLogoClick={onBack} />
      
      <main className="max-w-lg mx-auto px-6 py-16">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign Up</h2>
        <p className="text-slate-600 mb-8">Create your new account with L402 Gateway.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <Label htmlFor="email" className="text-slate-900 mb-2 block">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-slate-300 rounded-lg"
              placeholder="name@example.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <Label htmlFor="password" className="text-slate-900 mb-2 block">
              Password (Min 8 characters)
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={validatePasswords}
              className={cn("w-full rounded-lg", passwordError && "border-red-500")}
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600 font-medium">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <Label htmlFor="confirm-password" className="text-slate-900 mb-2 block">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={validatePasswords}
              className={cn("w-full rounded-lg", confirmPasswordError && "border-red-500")}
              placeholder="••••••••"
            />
            {confirmPasswordError && (
              <p className="mt-1 text-sm text-red-600 font-medium">{confirmPasswordError}</p>
            )}
          </div>

          {/* hCaptcha */}
          <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
            <div className="flex items-center gap-3">
              <Checkbox 
                id="captcha" 
                checked={isHuman}
                onCheckedChange={setIsHuman}
              />
              <Label htmlFor="captcha" className="text-slate-700 cursor-pointer">
                I am human
              </Label>
              <div className="ml-auto">
                <div className="flex items-center gap-1">
                  {/* Mock hCaptcha icon */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect width="16" height="16" rx="2" fill="#00D9FF"/>
                    <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="2"/>
                  </svg>
                  <span className="text-xs text-slate-600">hCaptcha</span>
                </div>
                <div className="text-[10px] text-slate-500 text-right">
                  <a href="#" className="hover:underline">Privacy</a>
                  {' · '}
                  <a href="#" className="hover:underline">Terms</a>
                </div>
              </div>
            </div>
          </div>

          {/* Message Box for Feedback */}
          {submitMessage && (
            <div className={cn("p-3 rounded-lg text-center font-medium", 
                submitMessage.startsWith('Success') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {submitMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit"
            isLoading={isLoading}
            disabled={isButtonDisabled}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg font-bold shadow-lg"
          >
            Sign up
          </Button>
          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account? <a 
            href="#"
            onClick={(e) => { e.preventDefault(); onLoginClick(); }}
            className="text-blue-600 hover:underline"
            >
              Sign in
            </a>
          </p>          
        </form>
        </div>
      </main>
    </div>
  );
}
