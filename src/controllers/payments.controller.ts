import {CreatePaymentCommand} from '../models/commands/create-payment.command';
import {Payment, PaymentEntity} from '../models/entities/payment.entity';
import {Service} from 'typedi';
import {PaymentDto} from '../models/dtos/payment.dto';

@Service()
export class PaymentsController {

    async createPayment(command: CreatePaymentCommand): Promise<string> {
        const payment = new PaymentEntity({
            paymentId: command.paymentId,
            merchantId: command.merchantId,
            bumpedAmount: command.bumpedAmount
        });
        await payment.save();
        return this.generateRedirectUrl(payment);
    }

    async getPayment(id: string): Promise<PaymentDto> {
        const payment = await PaymentEntity.findById(id);
        if(!payment) {
            throw new Error('Payment not found');
        }
        return new PaymentDto(
            payment._id.toString(),
            payment.merchantId,
            payment.bumpedAmount
        );
    }

    private generateRedirectUrl(payment: Payment): string {
        const REDIRECT_BASE_URL = process.env.REDIRECT_BASE_URL;
        if(!REDIRECT_BASE_URL) {
            throw new Error('set REDIRECT_BASE_URL env variable');
        }
        return REDIRECT_BASE_URL.replace('${ID}', payment._id.toString());
    }
}
