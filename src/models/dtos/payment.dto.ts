export class PaymentDto {
    constructor(public _id: string,
                public merchantId: string,
                public bumpedAmount: number) {
    }
}
