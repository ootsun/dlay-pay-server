import {AbstractRouteConfig} from './abstract.route.config';
import {Application, Request, Response} from 'express';
import Container from 'typedi';
import {PaymentsController} from '../controllers/payments.controller';
import {CreatePaymentCommand} from '../models/commands/create-payment.command';
import {Logger} from '../services/logger';
import {PaymentDto} from '../models/dtos/payment.dto';
import {ProcessPaymentCommand} from '../models/commands/process-payment.command';

export class PaymentsRouteConfig extends AbstractRouteConfig {

    private logger: Logger;
    constructor(app: Application) {
        super(app, 'PaymentsRoutes');
        this.logger = Container.get(Logger);
    }

    configureRoutes() {
        const paymentsController = Container.get(PaymentsController);
        this.app.route(`/payments/:id`)
            .get(async (req: Request, res: Response) => {
                const payment: PaymentDto = await paymentsController.getPayment(req.params.id);
                res.status(200).json(payment);
            })
            .put(async (req: Request, res: Response) => {
                const command: ProcessPaymentCommand = req.body;
                const redirectUrl = await paymentsController.processPayment(req.params.id, command);
                res.status(200).send(redirectUrl);
            });

        this.app.route(`/payments`)
            .post(async (req: Request, res: Response) => {
                const command: CreatePaymentCommand = req.body;
                const redirectUrl = await paymentsController.createPayment(command);
                res.status(200).send(redirectUrl);
            });
        return this.app;
    }
}
