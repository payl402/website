import { useState } from 'react';
import HomePage from './components/HomePage';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import WalletPage from './components/WalletPage';
import ReceivePage from './components/ReceivePage';
import SendPage from './components/SendPage';
import SendDetailPage from './components/SendDetailPage';
import CreateInvoicePage from './components/CreateInvoicePage';
import InvoiceDisplayPage from './components/InvoiceDisplayPage';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'signup' | 'wallet' | 'receive' | 'send' | 'sendDetail' | 'createInvoice' | 'invoiceDisplay'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');
  const [satsBalance] = useState(1000);
  const [generatedInvoice, setGeneratedInvoice] = useState('');
  const [loginSource, setLoginSource] = useState<'buy' | 'header'>('header');
  const [buyCount, setBuyCount] = useState(0);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    
    if (loginSource === 'buy') {
      setCurrentPage('home');
    } else {
      setCurrentPage('wallet');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setBuyCount(0);
    setCurrentPage('home');
  };

  const handleBuyL402 = () => {
    if (buyCount < 10) {
      setBuyCount(prev => prev + 1);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster />
      {currentPage === 'home' && (
        <HomePage 
          onLoginClick={(source: 'buy' | 'header') => {
            setLoginSource(source);
            setCurrentPage('login');
          }} 
          onSignUpClick={() => setCurrentPage('signup')}
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          onLogout={handleLogout}
          onWalletClick={() => setCurrentPage('wallet')}
          buyCount={buyCount}
          onBuyL402={handleBuyL402}
        />
      )}
      {currentPage === 'login' && (
        <SignInPage 
          onBack={() => setCurrentPage('home')} 
          onSignUpClick={() => setCurrentPage('signup')}
          onVerifySuccess={(email) => {
            handleLogin(email);
          }}
        />
      )}
      {currentPage === 'signup' && (
        <SignUpPage 
          onBack={() => setCurrentPage('home')} 
          onLoginClick={() => setCurrentPage('login')}
        />
      )}
      {currentPage === 'wallet' && isLoggedIn && (
        <WalletPage 
          userEmail={userEmail}
          onLogout={handleLogout}
          onLogoClick={() => setCurrentPage('home')}
          onReceiveClick={() => setCurrentPage('createInvoice')}
          onSendClick={() => setCurrentPage('send')}
        />
      )}
      {currentPage === 'receive' && isLoggedIn && (
        <ReceivePage 
          userEmail={userEmail}
          onBack={() => setCurrentPage('wallet')}
          onCreateInvoiceClick={() => setCurrentPage('createInvoice')}
          onLogout={handleLogout}
          onLogoClick={() => setCurrentPage('home')}
          onWalletClick={() => setCurrentPage('wallet')}
        />
      )}
      {currentPage === 'send' && isLoggedIn && (
        <SendPage 
          userEmail={userEmail}
          onBack={() => setCurrentPage('wallet')}
          onContinue={(recipient) => {
            setSendRecipient(recipient);
            setCurrentPage('sendDetail');
          }}
          onLogout={handleLogout}
          onLogoClick={() => setCurrentPage('home')}
          onWalletClick={() => setCurrentPage('wallet')}
        />
      )}
      {currentPage === 'sendDetail' && isLoggedIn && (
        <SendDetailPage 
          userEmail={userEmail}
          recipient={sendRecipient}
          satsBalance={satsBalance}
          onBack={() => setCurrentPage('wallet')}
          onCancel={() => setCurrentPage('wallet')}
          onConfirm={() => setCurrentPage('wallet')}
          onLogout={handleLogout}
          onLogoClick={() => setCurrentPage('home')}
          onWalletClick={() => setCurrentPage('wallet')}
        />
      )}
      {currentPage === 'createInvoice' && isLoggedIn && (
        <CreateInvoicePage 
          userEmail={userEmail}
          onBack={() => setCurrentPage('wallet')}
          onCreateInvoice={(generatedInvoice) => {
            setGeneratedInvoice(generatedInvoice);
            setCurrentPage('invoiceDisplay');
          }}
          onLogout={handleLogout}
          onLogoClick={() => setCurrentPage('home')}
          onWalletClick={() => setCurrentPage('wallet')}
        />
      )}
      {currentPage === 'invoiceDisplay' && isLoggedIn && (
        <InvoiceDisplayPage 
          userEmail={userEmail}
          invoice={generatedInvoice}
          onBack={() => setCurrentPage('wallet')}
          onLogout={handleLogout}
          onLogoClick={() => setCurrentPage('home')}
          onWalletClick={() => setCurrentPage('wallet')}
        />
      )}
    </div>
  );
}
