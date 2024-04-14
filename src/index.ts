import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import fetch from "cross-fetch";
import { Wallet } from "@project-serum/anchor";
import bs58 from "bs58";

import "dotenv/config";

async function main() {
  // RPC 설정
  const connection = new Connection("https://api.mainnet-beta.solana.com/");

  // 프라이빗 키로 지갑
  const wallet = new Wallet(
    Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || ""))
  );

  // SOL 0.1로 USDC로 변경, 0.5% 슬리피지
  const quoteResponse = await (
    await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=10000000&slippageBps=50`
    )
  ).json();

  // get serialized transactions for the swap
  const { swapTransaction } = await (
    await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: wallet.publicKey.toString(),
        wrapAndUnwrapSol: true,
        // Todo: feeAccount의 퍼블릭키는 여기에 넣는 듯
        // feeAccount: "fee_account_public_key"
      }),
    })
  ).json();

  const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
  var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  // 트랜잭션 사인
  transaction.sign([wallet.payer]);

  // Raw 트랜잭션 생성
  const rawTransaction = transaction.serialize();

  // 트랜잭션 실행
  const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  console.log("done:", `https://solscan.io/tx/${txid}`);
}

// 메인 함수 호출
main().catch(console.error);
