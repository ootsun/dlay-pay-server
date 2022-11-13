import {CreatePaymentCommand} from '../models/commands/create-payment.command';
import {Payment, PaymentEntity} from '../models/entities/payment.entity';
import {Container, Service} from 'typedi';
import {PaymentDto} from '../models/dtos/payment.dto';
import {ProcessPaymentCommand} from '../models/commands/process-payment.command';
import axios from 'axios';
import {NotifyConsumerCommand} from '../models/commands/notify-consumer.command';
import {PaymentStatus} from '../models/payment-status.enum';
import {Logger} from '../services/logger';
import {Provider} from 'zksync-web3';
import {ZkSyncProvider} from '../services/ethereum/zksync-provider';
import {BigNumber} from 'ethers';
import {WalletHelper} from '../services/ethereum/wallet-helper';

@Service()
export class PaymentsController {

    private readonly logger: Logger;
    private readonly provider: Provider;
    private readonly walletHelper: WalletHelper;

    private readonly REDIRECT_URL: string;
    private readonly DLAY_PAY_FEE_IN_PERCENTAGE: number;

    constructor() {
        if(!process.env.REDIRECT_URL) {
            throw new Error('set REDIRECT_URL env variable');
        }
        this.REDIRECT_URL = process.env.REDIRECT_URL;
        if(!process.env.DLAY_PAY_FEE_IN_PERCENTAGE) {
            throw new Error('set DLAY_PAY_FEE_IN_PERCENTAGE env variable');
        }
        this.DLAY_PAY_FEE_IN_PERCENTAGE = Number.parseFloat(process.env.DLAY_PAY_FEE_IN_PERCENTAGE);

        this.logger = Container.get(Logger);
        this.provider = Container.get(ZkSyncProvider).getProvider();
        this.walletHelper = Container.get(WalletHelper);
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

        let zkSyncTransactionHash = null;
        if(payment.serializedSignedTx) {
            zkSyncTransactionHash = await this.payConsumer(payment);
        } else {
            // Simulation mode
        }

        payment.serializedSignedTx = command.serializedSignedTx;
        await payment.save();
        this.logger.debug('Payment saved');

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
        return this.REDIRECT_URL.replace('${ID}', payment._id.toString());
    }

    private async payConsumer(payment: Payment): Promise<string> {
        const dueAmount = BigNumber.from(payment.amountInWei).mul(100 - this.DLAY_PAY_FEE_IN_PERCENTAGE);
        const txHash = await this.walletHelper.pay(payment.addressToCredit, dueAmount);
        payment.consumerPaymentDate = new Date();
        return txHash;
    }
}
