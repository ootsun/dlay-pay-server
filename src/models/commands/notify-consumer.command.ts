export class NotifyConsumerCommand {
    constructor(public status: number,
                public zkSyncTransactionHash: string | null) {
    }
}
