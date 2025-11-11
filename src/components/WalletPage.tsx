import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './Header';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { GetBalance, GetIncomingInvoices, GetOutgoingInvoices, IncomingInvoice, OutgoingInvoice } from '../libs/api_gateway';
import { QueryAsset } from '../libs/api_service';

interface WalletPageProps {
  userEmail: string;
  onLogout: () => void;
  onLogoClick: () => void;
  onReceiveClick?: () => void;
  onSendClick?: () => void;
}

interface Transaction {
    id: string;
    type: 'received' | 'sent';
    amount: number; // Sats
    date: string;
    time: string;
    timestamp: number; // Used for sorting
}

/**
 * Converts an ISO date string or Unix timestamp to {date, time, timestamp} format.
 * @param datetime - ISO 8601 string or Unix timestamp (seconds)
 * @param isUnix - If true, treats datetime as Unix seconds
 */
const formatTransactionDate = (datetime: string | number, isUnix: boolean) => {
    let dateObj: Date;

    if (isUnix) {
        // Unix timestamp in seconds needs conversion to milliseconds
        dateObj = new Date(datetime as number * 1000);
    } else {
        dateObj = new Date(datetime as string);
    }

    // Check if date is valid, return placeholders if not
    if (isNaN(dateObj.getTime())) {
        return {
            date: 'N/A',
            time: 'N/A',
            timestamp: 0,
        };
    }

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const year = dateObj.getFullYear().toString().slice(2);
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    return {
        date: `${day} ${month} ${year}`,
        time: timeStr,
        timestamp: dateObj.getTime(), // Milliseconds for sorting
    };
};

// Normalize incoming invoice (received transaction)
const normalizeIncomingInvoice = (invoice: IncomingInvoice): Transaction => {
    const { date, time, timestamp } = formatTransactionDate(invoice.settled_at, false);

    return {
        id: invoice.payment_hash,
        type: 'received',
        amount: invoice.amount,
        date: date,
        time: time,
        timestamp: timestamp,
    };
};

// Normalize outgoing invoice (sent transaction)
const normalizeOutgoingInvoice = (invoice: OutgoingInvoice): Transaction => {
    const { date, time, timestamp } = formatTransactionDate(invoice.timestamp, true);

    // Use payment_preimage as the unique ID
    return {
        id: invoice.payment_preimage,
        type: 'sent',
        amount: invoice.value,
        date: date,
        time: time,
        timestamp: timestamp,
    };
};

export default function WalletPage({ userEmail, onLogout, onLogoClick, onReceiveClick, onSendClick }: WalletPageProps) {
    // Balance states
    const [satsBalance, setSatsBalance] = useState<number | 'loading'>(0);
    const [l402Balance, setL402Balance] = useState<number | 'loading'>(0);
    const [error, setError] = useState<string | null>(null);

    // Transaction states
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
    const [transactionError, setTransactionError] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchBalances = async () => {
            setSatsBalance('loading');
            setL402Balance('loading');
            setError(null);

            try {
                // Use locally defined mock/placeholder APIs
                const satsPromise = GetBalance();
                const l402Promise = QueryAsset(userEmail); 

                const [satsResponse, l402Response] = await Promise.all([satsPromise, l402Promise]);

                if (satsResponse.unit === 'sat') {
                    setSatsBalance(satsResponse.balance);
                } else {
                    // If API response is not sats, log a warning but still attempt to set the value
                    console.warn('GetBalance returned an unexpected unit:', satsResponse.unit);
                    setSatsBalance(satsResponse.balance);
                }

                setL402Balance(l402Response.data.amount);

            } catch (err) {
                console.error('Error fetching one or more balances:', err);
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Failed to load balances: ${errorMessage}`); 
                
                if (satsBalance === 'loading') setSatsBalance(0);
                if (l402Balance === 'loading') setL402Balance(0);
            }
        };

        fetchBalances();
    }, [userEmail]);

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoadingTransactions(true);
            setTransactionError(null);
            
            try {
                // Use locally defined mock/placeholder APIs
                const [incomingRes, outgoingRes] = await Promise.all([
                    GetIncomingInvoices(),
                    GetOutgoingInvoices()
                ]);

                // Normalize incoming invoices (received)
                // Note: Assuming the API returns the data field as an array
                const incomingTxs = (incomingRes || []).map(normalizeIncomingInvoice);

                // Normalize outgoing invoices (sent)
                const outgoingTxs = (outgoingRes || []).map(normalizeOutgoingInvoice);

                // Merge all transactions
                const mergedTxs = [...incomingTxs, ...outgoingTxs];

                // Sort by timestamp in descending order (newest first)
                const sortedTxs = mergedTxs.sort((a, b) => b.timestamp - a.timestamp);

                setAllTransactions(sortedTxs);
                
            } catch (err) {
                console.error('Error fetching transactions:', err);
                setTransactionError('Failed to load transaction history. Please try again.');
                setAllTransactions([]); // Clear transactions on error
            } finally {
                setIsLoadingTransactions(false);
            }
        };

        fetchTransactions();
    }, []); // Empty dependency array means fetch once on mount

    const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
    
    // Ensure the current page does not exceed total pages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (currentPage === 0 && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const currentTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allTransactions.slice(startIndex, endIndex);
    }, [allTransactions, currentPage, itemsPerPage]);


    const displaySatsBalance = useCallback(() => {
        if (satsBalance === 'loading') {
            return <div className="animate-pulse bg-slate-200 rounded h-8 w-24"></div>;
        }
        return satsBalance;
    }, [satsBalance]);

    const displayL402Balance = useCallback(() => {
        if (l402Balance === 'loading') {
            return <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />;
        }
        return (l402Balance as number);
    }, [l402Balance]);

    const handleMint = () => {
        onLogoClick();
    };
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-slate-100 font-inter">
            <Header 
                userEmail={userEmail}
                isLoggedIn={true}
                onLoginClick={() => {}}
                onSignUpClick={() => {}}
                onLogoClick={onLogoClick}
                onLogout={onLogout}
                onWalletClick={() => {}}
            />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}
                <div className="mb-8">
                    {/* Balance Section */}
                    <Card className="p-6 bg-white rounded-xl shadow-lg border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-900 mb-6">Balances</h2>
                        <div className="flex flex-wrap gap-6 md:gap-12 justify-start">
                            {/* Sats Balance Card */}
                            <div className="flex-1 min-w-[200px] sm:min-w-[250px]">
                                <div className="mb-4">
                                    <div className="text-3xl font-extrabold text-slate-900 mb-1 leading-none">
                                        {displaySatsBalance()}
                                    </div>
                                    <div className="text-sm text-slate-500">Sats (Bitcoin Lightning)</div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={onReceiveClick}
                                        className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 transition duration-150 rounded-lg"
                                    >
                                        <ArrowDownLeft className="w-4 h-4 mr-1" />
                                        Deposit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 transition duration-150 rounded-lg"
                                        onClick={onSendClick}
                                    >
                                        <ArrowUpRight className="w-4 h-4 mr-1" />
                                        Withdraw
                                    </Button>
                                </div>
                            </div>

                            {/* L402 Balance Card */}
                            <div className="flex-1 min-w-[200px] sm:min-w-[250px]">
                                <div className="mb-4">
                                    <div className="text-3xl font-extrabold text-slate-900 mb-1 leading-none">
                                        {displayL402Balance()}
                                    </div>
                                    <div className="text-sm text-slate-500">L402 Tokens</div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleMint}
                                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 transition duration-150 rounded-lg"
                                >
                                    Mint
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Transactions Section */}
                <Card className="p-6 bg-white rounded-xl shadow-lg border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Transaction History</h2>
                    
                    {/* Loading State */}
                    {isLoadingTransactions && (
                        <div className="text-center py-10 flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-slate-500 animate-spin mb-3" />
                            <p className="text-slate-500">Loading transactions...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {transactionError && !isLoadingTransactions && (
                        <div className="text-center py-10 text-red-600">
                            {transactionError}
                        </div>
                    )}

                    {/* No Transactions State */}
                    {!isLoadingTransactions && currentTransactions.length === 0 && !transactionError && (
                        <div className="text-center text-slate-400 py-10">
                            No transactions found.
                        </div>
                    )}

                    {/* Transaction List */}
                    {!isLoadingTransactions && currentTransactions.length > 0 && (
                        <div className="space-y-4">
                            {currentTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            tx.type === 'received' ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                            {tx.type === 'received' ? (
                                                <ArrowDownLeft className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <ArrowUpRight className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-slate-900 font-medium capitalize">
                                                {tx.type === 'received' ? 'Received' : 'Sent'}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {tx.date} at {tx.time}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-semibold ${
                                            tx.type === 'received' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {tx.type === 'received' ? '+' : ''} {tx.amount.toLocaleString()} <span className="text-sm font-normal">sats</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Pagination */}
                {totalPages > 1 && !isLoadingTransactions && (
                    <div className="mt-8 flex justify-center items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        
                        {/* Simplified Page Number Display */}
                        <div className="text-slate-700 px-4 py-1">
                            Page {currentPage} of {totalPages}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
