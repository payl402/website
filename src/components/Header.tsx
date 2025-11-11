import { Zap, ChevronDown, Wallet, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogoClick?: () => void;
  isLoggedIn?: boolean;
  userEmail?: string;
  onLogout?: () => void;
  onWalletClick?: () => void;
}

export default function Header({ onLoginClick, onSignUpClick, onLogoClick, isLoggedIn = false, userEmail, onLogout, onWalletClick }: HeaderProps) {
  return (
    <header className="border-b border-blue-200/50 bg-gradient-to-r from-blue-500 to-cyan-400 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onLogoClick}
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="h-8 flex items-center">
              <span className="text-white text-sm text-[20px] font-bold">L402 Labs</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn && userEmail ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-white/30 hover:bg-white/20 text-white hover:text-white bg-white/10 flex items-center gap-2"
                >
                  {userEmail}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <DropdownMenuItem 
                  onClick={onWalletClick}
                  className="cursor-pointer"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  My Wallet
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
            <Button 
              variant="outline" 
              onClick={onLoginClick}
              className="border-white/30 hover:bg-white/20 text-white hover:text-white bg-white/10"
            >
              Sign In
            </Button>
              <Button 
                onClick={onSignUpClick}
                // Custom classes: Outline style with border
                className="bg-transparent text-white border border-white/50 hover:bg-white/20 font-semibold shadow-md transition-colors duration-200"
              >
                Sign up
              </Button>       
            </>     
          )}
          
          {/* X (Twitter) Icon */}
          <a 
            href="https://twitter.com/PayL402" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          {/* GitHub Icon */}
          <a 
            href="https://github.com/PayL402" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
