import {CreatePaymentCommand} from '../models/commands/create-payment.command';
import {Payment, PaymentEntity} from '../models/entities/payment.entity';
import {Container, Service} from 'typedi';
import {PaymentDto} from '../models/dtos/payment.dto';
import {ProcessPaymentCommand} from '../models/commands/process-payment.command';
import axios from 'axios';
import {NotifyConsumerCommand} from '../models/commands/notify-consumer.command';
import {PaymentStatus} from '../models/payment-status.enum';
import {Logger} from '../services/logger';

@Service()
export class PaymentsController {

    private readonly logger: Logger;

    constructor() {
        this.logger = Container.get(Logger);
    }

    async createPayment(command: CreatePaymentCommand): Promise<string> {
        const payment = new PaymentEntity({
            paymentId: command.paymentId,
            merchantId: command.merchantId,
            amountInWei: command.amountInWei,
            callbackUrl: command.callbackUrl,
            addressToCredit: command.addressToCredit
        });
        await payment.save();
        return this.generateRedirectUrl(payment);
    }

    async processPayment(paymentId: string, command: ProcessPaymentCommand): Promise<string> {
        const payment = await PaymentEntity.findById(paymentId);
        if(!payment) {
            throw new Error('Payment not found');
        }
        this.logger.debug('Payment found');

        payment.serializedSignedTx = command.serializedSignedTx;
        await payment.save();
        this.logger.debug('Payment saved');

        const zkSyncTransactionHash = await this.payConsumer(payment);

        const notifyConsumerCommand = new NotifyConsumerCommand(
            PaymentStatus.PAID,
            zkSyncTransactionHash
        )
        const res = await axios.put(payment.callbackUrl, notifyConsumerCommand);

        return res.data;
    }

    async getPayment(id: string): Promise<PaymentDto> {
        const payment = await PaymentEntity.findById(id);
        if(!payment) {
            throw new Error('Payment not found');
        }
        return new PaymentDto(
            payment._id.toString(),
            payment.merchantId,
            payment.amountInWei
        );
    }

    private generateRedirectUrl(payment: Payment): string {
        const REDIRECT_URL = process.env.REDIRECT_URL;
        if(!REDIRECT_URL) {
            throw new Error('set REDIRECT_URL env variable');
        }
        return REDIRECT_URL.replace('${ID}', payment._id.toString());
    }

    private payConsumer(payment: Payment): Promise<string> {
        //TODO
        return Promise.resolve('');
    }
}
