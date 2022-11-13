import {Service} from 'typedi';
import * as zksync from 'zksync-web3';
import * as ethers from 'ethers';
import {BigNumber} from 'ethers';

@Service()
export class WalletHelper {

    private syncWallet: zksync.Wallet;

    constructor() {
        const DLAY_PAY_PRIVATE_KEY = process.env.DLAY_PAY_PRIVATE_KEY;
        if (!DLAY_PAY_PRIVATE_KEY) {
            throw new Error('set DLAY_PAY_PRIVATE_KEY env variable');
        }
        const syncProvider = new zksync.Provider('https://zksync2-testnet.zksync.dev');
        const ethProvider = ethers.getDefaultProvider('goerli');
        this.syncWallet = new zksync.Wallet(DLAY_PAY_PRIVATE_KEY, syncProvider, ethProvider);
    }

    getDLayPayPublicAddress(): string {
        return this.syncWallet.address;
    }

    async pay(addressToCredit: string, dueAmount: BigNumber) {
        const transferReceipt = await this.syncWallet.transfer({
                to: addressToCredit,
                amount: dueAmount
            }
        );
        //TODO Check validity and wait confirmation on L1
        return transferReceipt.hash;
    }
}
