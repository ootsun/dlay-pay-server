export interface CreatePaymentCommand {
    paymentId: string;
    merchantId: string;
    bumpedAmount: number;
}
