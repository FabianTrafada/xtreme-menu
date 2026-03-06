interface SnapPayResult {
    order_id: string;
    transaction_status: string;
    fraud_status?: string;
    status_code: string;
    gross_amount: string;
    payment_type: string;
    [key: string]: unknown;
}

interface SnapPayOptions {
    onSuccess?: (result: SnapPayResult) => void;
    onPending?: (result: SnapPayResult) => void;
    onError?: (result: SnapPayResult) => void;
    onClose?: () => void;
}

interface SnapInstance {
    pay: (token: string, options?: SnapPayOptions) => void;
    embed: (token: string, options: { embedId: string } & SnapPayOptions) => void;
    hide: () => void;
}

interface Window {
    snap: SnapInstance;
}
