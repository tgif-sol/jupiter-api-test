import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

function generateNewAccount() {
  const newAccount = Keypair.generate();
  const publicKey = newAccount.publicKey.toString();
  const secretKey = newAccount.secretKey;
  const secretKeyBase58 = bs58.encode(secretKey);

  console.log("New Account Generated");
  console.log("Public Key:", publicKey);
  console.log("Private Key:", secretKeyBase58);
}

generateNewAccount();
