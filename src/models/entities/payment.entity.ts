import {model, Schema} from 'mongoose';

export interface Payment {
    _id: Schema.Types.ObjectId;
    paymentId: string;
    merchantId: string;
    bumpedAmount: number;
}

const paymentSchema = new Schema<Payment>({
    paymentId: {type: String, required: true},
    merchantId: {type: String, required: true},
    bumpedAmount: {type: Number, required: true},
});

export const PaymentEntity = model<Payment>('Payment', paymentSchema);
