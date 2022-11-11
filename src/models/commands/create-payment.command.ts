export interface CreatePaymentCommand {
    paymentId: string;
    merchantId: string;
    amountInWei: string;
    callbackUrl: string;
    addressToCredit: string;
}
