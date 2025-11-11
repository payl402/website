
interface TokenResponse {
  refresh_token: string;
  access_token: string;
}

export interface RpcOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
}

export class ReLoginError extends Error {
    constructor(message: string = "Authorization required. Please log in again.") {
        super(message);
        this.name = "ReLoginError";
    }
}

interface BalanceResponse {
    balance: number;
    currency: string;
    unit: string;
}

interface CreateInvoiceResponse {
    payment_hash: string;
    payment_request: string;
    expires_at: string;
    created_at: string;
}

interface PayInvoiceResponse {
    payment_request: string;
    amount: number;
    fee: number;
    destination: string;
    payment_preimage: string;
    payment_hash: string;
}

export interface IncomingInvoice {
    payment_hash: string;
    payment_request: string;
    description: string;
    destination: string;
    amount: number; // in millisats or sats, depending on API spec (assuming sats for simplicity here)
    fee: number;
    status: 'settled' | 'unsettled' | 'expired';
    type: string;
    settled_at: string; // ISO 8601 date string
    expires_at: string; // ISO 8601 date string
    is_paid: boolean;
    keysend: boolean;
}

export interface OutgoingInvoice {
    r_hash: { type: string; data: number[] };
    payment_hash: { type: string; data: number[] };
    payment_preimage: string;
    value: number;
    type: string;
    fee: number;
    timestamp: number; // Unix timestamp
    memo: string;
    keysend: boolean;
    custom_records: null;
}

// --- API Configuration ---

const GATEWAY_API_CONFIG = {
  BASE_URL: 'https://gateway.payl402.com',
  //BASE_URL: 'http://127.0.0.1:4000',
  ENDPOINTS: {
    SIGN_UP: '/create',
    AUTH: '/auth',
    BALANCE: '/v2/balance',
    CREATE_INVOICE: '/v2/invoices',
    PAY_INVOICE: '/v2/payments/bolt11',
    INCOMMING_INVOICE: '/v2/invoices/incoming',
    OUTGOING_INVOICE: '/gettxs'
  }
};

// --- Local Storage Keys ---
const ACCESS_TOKEN_KEY = 'payl402_access_token';
const REFRESH_TOKEN_KEY = 'payl402_refresh_token';

const setTokensInCache = (tokens: TokenResponse): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
};

const getAccessTokenFromCache = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const clearTokens = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    console.log("Tokens cleared from localStorage.");
};

async function getAuthToken(login: string, password: string): Promise<TokenResponse> {
    console.log(`[AUTH] Calling ${GATEWAY_API_CONFIG.ENDPOINTS.AUTH} for initial tokens...`);
    
    const response = await fetch(`${GATEWAY_API_CONFIG.BASE_URL}${GATEWAY_API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ login, password }),
    });

    if (!response.ok) {
        throw new Error(`Incorrect username or password.`);
    }

    return (await response.json()) as TokenResponse;
}

async function requestRpc<T>(
    endpoint: string,
    body: object | null = null,
    options: RpcOptions = {}
): Promise<T> {
    const isFullUrl = endpoint.startsWith('http');
    const requiresAuth = endpoint !== GATEWAY_API_CONFIG.ENDPOINTS.AUTH && 
                         endpoint !== GATEWAY_API_CONFIG.ENDPOINTS.SIGN_UP;
    let accessToken = getAccessTokenFromCache();
    
    if (requiresAuth && !accessToken) {
        throw new ReLoginError("Missing access token. Please log in.");
    }

    const fetchUrl = isFullUrl ? endpoint : `${GATEWAY_API_CONFIG.BASE_URL}${endpoint}`;
    
    const opts: RpcOptions = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...(options.headers || {})
        },
        ...options,
    };

    if (requiresAuth && accessToken) {
        opts.headers = { 
            ...opts.headers,
            'Authorization': `Bearer ${accessToken}`
        } as Record<string, string>; 
    }

    if (opts.method !== 'GET' && body) {
        opts.body = JSON.stringify(body);
    } else {
        delete opts.body;
    }

    const response = await fetch(fetchUrl, opts);

    if (response.status === 401 && requiresAuth) {
        console.warn(`Access Token expired or invalid (${response.status}). Clearing cache and requiring re-login.`);
        clearTokens();
        throw new ReLoginError("Access token expired or invalid. Please log in again.");
    }

    if (response.ok) {
        return (await response.json()) as T;
    }

    let errorMessage = `API call to ${fetchUrl} failed with status ${response.status}.`;
    try {
        const errorData = await response.json();
        errorMessage += ` Message: ${errorData.message || JSON.stringify(errorData)}`;
    } catch (e) {
        
    }
    throw new Error(errorMessage);
}


// --- Specific API Wrappers ---

export async function SignUp(login: string, password: string): Promise<{id: number}> {
    return requestRpc<{id: number}>(
        GATEWAY_API_CONFIG.ENDPOINTS.SIGN_UP,
        { login, password },
        { method: 'POST' }
    );
}

export async function Login(login: string, password: string): Promise<TokenResponse> {
    const tokens = await getAuthToken(login, password);
    setTokensInCache(tokens);
    return tokens;
}

export async function GetBalance(): Promise<BalanceResponse> {
    return requestRpc<BalanceResponse>(
        GATEWAY_API_CONFIG.ENDPOINTS.BALANCE,
        null,
        { method: 'GET' }
    );
}

export async function CreateInvoice(desc:string, desc_hash:string, amount:number): Promise<CreateInvoiceResponse> {
    return requestRpc<CreateInvoiceResponse>(
        GATEWAY_API_CONFIG.ENDPOINTS.CREATE_INVOICE,
        { desc, desc_hash, amount },
        { method: 'POST' }
    );
}

export async function PayInvoice(invoice: string): Promise<PayInvoiceResponse> {
    const requestPayload = { invoice };

    return requestRpc<PayInvoiceResponse>(
        GATEWAY_API_CONFIG.ENDPOINTS.PAY_INVOICE,
        requestPayload,
        { method: 'POST' }
    );
}

export async function GetIncomingInvoices(): Promise<IncomingInvoice[]> {
    const invoices = await requestRpc<IncomingInvoice[]>(
        GATEWAY_API_CONFIG.ENDPOINTS.INCOMMING_INVOICE,
        null,
        { method: 'GET' }
    );
    const settledInvoices = invoices.filter(invoice => invoice.status === 'settled');
    
    return settledInvoices;
}

export async function GetOutgoingInvoices(): Promise<OutgoingInvoice[]> {
    return requestRpc<OutgoingInvoice[]>(
        GATEWAY_API_CONFIG.ENDPOINTS.OUTGOING_INVOICE,
        null,
        { method: 'GET' }
    );
}
