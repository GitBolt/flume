import { Buffer } from "buffer";
import { Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";

export default class CustomWallet implements Wallet {
  constructor(readonly payer: Keypair) { }

  static with_private_key(private_key: Uint8Array): CustomWallet | never {

    const payer = Keypair.fromSecretKey(
      new Uint8Array(Buffer.from(
        private_key
      ))
    );
    return new CustomWallet(payer);
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (tx instanceof Transaction) {
      tx.partialSign(this.payer);
    } else if (tx instanceof VersionedTransaction) {
      tx.sign([this.payer]);
    }
    return tx;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    return txs.map((t) => {
      if (t instanceof Transaction) {
        t.partialSign(this.payer);
      } else if (t instanceof VersionedTransaction) {
        t.sign([this.payer]);
      }
      return t;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}
