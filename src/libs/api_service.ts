import { RpcOptions } from './api_gateway';

export interface ServiceResponse<T> {
    code: number;
    data: T;
    message: string;
    traceid: string;
}

export interface Offer {
    id: string;
    title: string;
    description: string;
    type: "one-time" | "subscription" | string;
    balance: number;
    amount: number;
    currency: string;
    payment_methods: string[];
}

export interface BuyResponse {
    version: string;
    payment_request_url: string;
    payment_context_token: string;
    offer: Offer[];
    terms_url: string;
}

export interface PaymentRequest {
    lightning_invoice: string;
    address: string;
    asset: string;
    chain: string;
    check_url: string;
}

export interface PaymentRequestResponse {
    version: string;
    expires_at: string;
    payment_request: PaymentRequest;
}

export interface AssetSummary {
    user_id: string;
    amount: number;
}


// --- API Configuration ---
const SERVICE_API_CONFIG = {
  BASE_URL: 'https://gateway.payl402.com/api',
  //BASE_URL: 'http://127.0.0.1:5000/api',
  ENDPOINTS: {
    BUY: '/buy/l402',
    PAY_REQUEST: '/payment-request', 
    QUERY_ASSET: '/query-asset'
  }
};

async function requestRpc<T>(
    endpoint: string,
    body: object | null = null,
    options: RpcOptions = {}
): Promise<T> {
    const isFullUrl = endpoint.startsWith('http');

    const fetchUrl = isFullUrl ? endpoint : `${SERVICE_API_CONFIG.BASE_URL}${endpoint}`;
    
    const opts: RpcOptions = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...(options.headers || {})
        },
        ...options,
    };

    if (opts.method !== 'GET' && body) {
        opts.body = JSON.stringify(body);
    } else {
        delete opts.body;
    }

    const response = await fetch(fetchUrl, opts);

    if (response.status === 402) {
        console.warn(`Payment required (${response.status}).`);
        throw new Error("Payment required to access this resource.");
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

export async function Buy(ticker: string, amount: number): Promise<ServiceResponse<BuyResponse>> {
    return requestRpc<ServiceResponse<BuyResponse>>(
        SERVICE_API_CONFIG.ENDPOINTS.BUY,
        { ticker, amount },
        { method: 'POST' }
    );
}

export async function PaymentRequest(offer_id: string, payment_method: string, payment_context_token: string, chain: string, asset: string): Promise<ServiceResponse<PaymentRequestResponse>> {
    return requestRpc<ServiceResponse<PaymentRequestResponse>>(
        SERVICE_API_CONFIG.ENDPOINTS.PAY_REQUEST,
        { offer_id,payment_method,payment_context_token,chain,asset },
        { method: 'POST' }
    );
}

export async function QueryAsset(user_id: string): Promise<ServiceResponse<AssetSummary>> {
    return requestRpc<ServiceResponse<AssetSummary>>(
        SERVICE_API_CONFIG.ENDPOINTS.QUERY_ASSET,
        {user_id},
        { method: 'POST' }
    );
}
