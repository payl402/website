import { useState,useMemo,useEffect } from 'react';
import Header from './Header';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { cn } from './ui/utils';
import { SignUp, Login, ReLoginError } from '../libs/api_gateway';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// --- Password Validation Logic ---
const MIN_PASSWORD_LENGTH = 8; 

interface PasswordStrengthResult {
  isValid: boolean;
  messages: { text: string; passed: boolean }[];
}

/**
 * Checks password against strict rules: min 8 chars, must contain U/L/N/S.
 */
const checkPasswordStrength = (password: string): PasswordStrengthResult => {
  if (!password) {
    return {
        isValid: false,
        messages: [
            { text: `At least ${MIN_PASSWORD_LENGTH} characters long`, passed: false },
            { text: 'Contains at least one lowercase letter (a-z)', passed: false },
            { text: 'Contains at least one uppercase letter (A-Z)', passed: false },
            { text: 'Contains at least one number (0-9)', passed: false },
            { text: 'Contains at least one special character (!@#$%, etc.)', passed: false },
        ]
    };
  }

  const messages: { text: string; passed: boolean }[] = [];
  
  const isLengthValid = password.length >= MIN_PASSWORD_LENGTH;
  messages.push({ 
    text: `At least ${MIN_PASSWORD_LENGTH} characters long (${password.length}/${MIN_PASSWORD_LENGTH})`, 
    passed: isLengthValid 
  });

  const hasLower = /[a-z]/.test(password);
  messages.push({ 
    text: 'Contains at least one lowercase letter (a-z)', 
    passed: hasLower 
  });

  const hasUpper = /[A-Z]/.test(password);
  messages.push({ 
    text: 'Contains at least one uppercase letter (A-Z)', 
    passed: hasUpper 
  });

  const hasNumber = /[0-9]/.test(password);
  messages.push({ 
    text: 'Contains at least one number (0-9)', 
    passed: hasNumber 
  });

  const hasSymbol = /[^a-zA-Z0-9\s]/.test(password);
  messages.push({ 
    text: 'Contains at least one special character (!@#$%, etc.)', 
    passed: hasSymbol 
  });
  
  const isValid = isLengthValid && hasLower && hasUpper && hasNumber && hasSymbol;

  return { 
    isValid: isValid, 
    messages: messages 
  };
};

// ==========================================================
// SignupPage Component
// ==========================================================

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
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // New state for focus
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Calculate password strength result based on the strict rules
  const strengthResult = useMemo(() => checkPasswordStrength(password), [password]);
  const passwordValid = strengthResult.isValid;
  const passwordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);

  // Handle confirmation password validation and clean up submission messages
  useEffect(() => {
    if (confirmPassword.length > 0 && !passwordsMatch) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }

    // Clean up generic submit messages if conditions are now met
    const isPasswordError = submitMessage.includes('Password') || submitMessage.includes('Passwords');
    if (passwordValid && passwordsMatch && isPasswordError) {
        setSubmitMessage('');
    }
    
    // Clear confirm password error if the field is empty
    if (confirmPassword.length === 0) {
        setConfirmPasswordError('');
    }

  }, [password, confirmPassword, passwordValid, passwordsMatch, submitMessage]);  

  // Check overall button disabled state
  const isButtonDisabled = useMemo(() => {
    // The button is disabled if any required field is missing OR if the password/match is invalid.
    return !email || !password || !confirmPassword || !isHuman || !passwordValid || !passwordsMatch;
  }, [email, password, confirmPassword, isHuman, passwordValid, passwordsMatch]);

  /**
   * Final validation check before API submission.
   */
  const validateAndSetErrors = () => {
    if (!passwordValid) {
      setSubmitMessage('Password does not meet all security requirements. Please check the list above.');
      return false;
    }
    if (!passwordsMatch) {
      setSubmitMessage('Passwords do not match.');
      return false;
    }
    setSubmitMessage('');
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

    if (!validateAndSetErrors()) {
      return;
    }

    setIsLoading(true);

    try {
      await SignUp(email, password);
      
      // Auto-Login after successful sign up
      await Login(email, password);

      setSubmitMessage('Success: Sign up successful! Redirecting to home page...');

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

  const showPasswordRequirements = isPasswordFocused || (password.length > 0 && !passwordValid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 font-inter">
      <Header onLoginClick={onLoginClick} onSignUpClick={onBack} onLogoClick={onBack} />
      
      <main className="max-w-lg mx-auto px-6 py-16">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign Up</h2>
        <p className="text-slate-600 mb-8">Create your new account with L402 Gateway.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <Label htmlFor="email" className="text-slate-900 mb-2 block font-medium">
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
            <Label htmlFor="password" className="text-slate-900 mb-2 block font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              className={cn("w-full rounded-lg", password.length > 0 && !passwordValid ? "border-red-500" : "border-slate-300")}
              placeholder="Set a strong password"
            />
            
            {/* Password Rules Feedback - Visible on focus or if invalid */}
            {showPasswordRequirements && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <p className="text-slate-700 font-semibold mb-2">Password requirements:</p>
                <ul className="space-y-1">
                  {strengthResult.messages.map((item, index) => (
                    <li key={index} className={cn("flex items-center text-xs transition-colors duration-150", item.passed ? "text-green-600" : "text-red-500")}>
                      {item.passed ? <CheckCircle className="h-3 w-3 mr-2 shrink-0" /> : <XCircle className="h-3 w-3 mr-2 shrink-0" />}
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Display error if password is not valid on form submit attempt (only if requirements are hidden) */}
            {password.length > 0 && !passwordValid && !showPasswordRequirements && (
              <p className="mt-1 text-sm text-red-600 font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-1"/> Your password is not strong enough.
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <Label htmlFor="confirm-password" className="text-slate-900 mb-2 block font-medium">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={validateAndSetErrors}
              className={cn("w-full rounded-lg", confirmPasswordError ? "border-red-500" : "border-slate-300")}
              placeholder="Re-enter your password"
            />
            {confirmPasswordError && (
              <p className="mt-1 text-sm text-red-600 font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-1"/>{confirmPasswordError}
              </p>
            )}
          </div>

          {/* hCaptcha (Mock) */}
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
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg font-bold shadow-lg transition transform hover:scale-[1.01]"
          >
            Sign up
          </Button>
          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account? <a 
            href="#"
            onClick={(e) => { e.preventDefault(); onLoginClick(); }}
            className="text-blue-600 hover:underline font-medium"
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