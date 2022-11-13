import {model, Schema} from 'mongoose';

export interface Payment {
    _id: Schema.Types.ObjectId;
    paymentId: string;
    merchantId: string;
    amountInWei: string;
    callbackUrl: string;
    addressToCredit: string;
    serializedSignedTx: string;
    customerPaymentDate: Date;
    consumerPaymentDate: Date;
}

const paymentSchema = new Schema<Payment>({
    paymentId: {type: String, required: true},
    merchantId: {type: String, required: true},
    amountInWei: {type: String, required: true},
    callbackUrl: {type: String, required: true},
    addressToCredit: {type: String, required: true},
    serializedSignedTx: {type: String},
    customerPaymentDate: {type: Date},
    consumerPaymentDate: {type: Date},
});

export const PaymentEntity = model<Payment>('Payment', paymentSchema);
