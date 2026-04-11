import express from "express";
import cors from "cors";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({ origin: "https://globalpay-fx-frontend.vercel.app" }));
app.use(express.json());

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

app.get("/api/balance/:walletId", async (req, res) => {
  try {
    const balances = (await client.getWalletTokenBalance({ id: req.params.walletId })).data?.tokenBalances;
    res.json({ success: true, balances });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/wallets", async (req, res) => {
  try {
    const wallets = (await client.listWallets({})).data?.wallets;
    res.json({ success: true, wallets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/send", async (req, res) => {
  try {
    const { fromWalletId, toAddress, amount } = req.body;
    const tx = await client.createTransaction({
      walletId: fromWalletId,
      blockchain: "ARC-TESTNET",
      destinationAddress: toAddress,
      amounts: [amount],
      tokenAddress: "0x3600000000000000000000000000000000000000",
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    res.json({ success: true, transaction: tx.data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/transaction/:txId", async (req, res) => {
  try {
    const tx = (await client.getTransaction({ id: req.params.txId })).data?.transaction;
    res.json({ success: true, transaction: tx });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 GlobalPay FX Backend running on port ${PORT}`);
});
