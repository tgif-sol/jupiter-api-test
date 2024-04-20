import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import { DCA, Network } from "@jup-ag/dca-sdk";
import bs58 from "bs58";
import "dotenv/config";

async function main() {
  // Solana 네트워크와의 연결 설정
  const connection = new Connection("https://api.mainnet-beta.solana.com/");
  // 지갑 생성
  const wallet = new Wallet(
    Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || ""))
  );

  // DCA 관리 객체 생성
  const dca = new DCA(connection, Network.MAINNET);

  // 토큰 민트 주소 설정
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const SOL_MINT = "So11111111111111111111111111111111111111112";

  // DCA 생성 파라미터 설정
  const inAmount = BigInt(50000); // 총 투입 금액: 0.05 USDC
  const inAmountPerCycle = BigInt(10000); // 주기당 투입 금액: 0.01 USDC
  const cycleSecondsApart = BigInt(86400); // 주기 시간: 1일

  // DCA 계약 생성
  const { tx: dcaTx, dcaPubKey } = await dca.createDcaV2({
    payer: wallet.publicKey,
    user: wallet.publicKey,
    inAmount,
    inAmountPerCycle,
    cycleSecondsApart,
    inputMint: new PublicKey(USDC_MINT),
    outputMint: new PublicKey(SOL_MINT),
    minOutAmountPerCycle: null,
    maxOutAmountPerCycle: null,
    startAt: null,
  });

  // 생성된 DCA 트랜잭션을 네트워크에 전송
  await connection.sendTransaction(dcaTx, [wallet.payer], {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  console.log("DCA created with public key:", dcaPubKey.toBase58());

  //   // DCA에서 USDC 인출
  //   const withdrawParams = {
  //     user: wallet.publicKey,
  //     dca: dcaPubKey,
  //     inputMint: new PublicKey(USDC_MINT),
  //     withdrawInAmount: BigInt(10000), // 예: 0.01 USDC 인출
  //   };

  //   // 인출 트랜잭션 실행
  //   const { tx: withdrawTx } = await dca.withdraw(withdrawParams);
  //   const withdrawTxid = await sendAndConfirmTransaction(connection, withdrawTx, [
  //     wallet.payer,
  //   ]);
  //   console.log("Withdraw successful, transaction ID:", withdrawTxid);
}

main().catch(console.error);
