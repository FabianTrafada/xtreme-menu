declare module "midtrans-client" {
    interface MidtransConfig {
        isProduction?: boolean;
        serverKey?: string;
        clientKey?: string;
    }

    interface TransactionResponse {
        token: string;
        redirect_url: string;
    }

    interface ApiConfig {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
        set: (config: Partial<MidtransConfig>) => void;
    }

    class Snap {
        constructor(config?: MidtransConfig);
        apiConfig: ApiConfig;
        httpClient: {
            http_client: {
                defaults: {
                    timeout: number;
                    headers: {
                        common: Record<string, string>;
                    };
                };
                interceptors: {
                    request: {
                        use: (onFulfilled: (config: unknown) => unknown, onRejected?: (error: unknown) => unknown) => void;
                    };
                };
            };
        };
        createTransaction(parameter: Record<string, unknown>): Promise<TransactionResponse>;
        createTransactionToken(parameter: Record<string, unknown>): Promise<string>;
        createTransactionRedirectUrl(parameter: Record<string, unknown>): Promise<string>;
        transaction: TransactionActions;
    }

    class CoreApi {
        constructor(config?: MidtransConfig);
        apiConfig: ApiConfig;
        charge(parameter: Record<string, unknown>): Promise<Record<string, unknown>>;
        capture(parameter: Record<string, unknown>): Promise<Record<string, unknown>>;
        cardRegister(parameter: Record<string, unknown>): Promise<Record<string, unknown>>;
        cardToken(parameter: Record<string, unknown>): Promise<Record<string, unknown>>;
        cardPointInquiry(tokenId: string): Promise<Record<string, unknown>>;
        transaction: TransactionActions;
    }

    interface TransactionActions {
        status(transactionId: string): Promise<Record<string, unknown>>;
        statusb2b(transactionId: string): Promise<Record<string, unknown>>;
        approve(transactionId: string): Promise<Record<string, unknown>>;
        deny(transactionId: string): Promise<Record<string, unknown>>;
        cancel(transactionId: string): Promise<Record<string, unknown>>;
        expire(transactionId: string): Promise<Record<string, unknown>>;
        refund(transactionId: string, parameter?: Record<string, unknown>): Promise<Record<string, unknown>>;
        refundDirect(transactionId: string, parameter?: Record<string, unknown>): Promise<Record<string, unknown>>;
        notification(notificationJson: Record<string, unknown>): Promise<Record<string, unknown>>;
    }

    const midtransClient: {
        Snap: typeof Snap;
        CoreApi: typeof CoreApi;
    };

    export default midtransClient;
}
