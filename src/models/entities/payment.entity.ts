import {model, Schema} from 'mongoose';

export interface Payment {
    _id: Schema.Types.ObjectId;
    paymentId: string;
    merchantId: string;
    amountInWei: string;
    callbackUrl: string;
    addressToCredit: string;
}

const paymentSchema = new Schema<Payment>({
    paymentId: {type: String, required: true},
    merchantId: {type: String, required: true},
    amountInWei: {type: String, required: true},
    callbackUrl: {type: String, required: true},
    addressToCredit: {type: String, required: true},
});

export const PaymentEntity = model<Payment>('Payment', paymentSchema);
