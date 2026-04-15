"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useEffect, useState } from "react";
import { ethers } from "ethers";

const ARC_CHAIN_ID_HEX = "0x4cef52";
const RPC = "https://rpc.testnet.arc.network";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [txs, setTxs] = useState<string[]>([]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1400);

    const stored = localStorage.getItem("txs");
    if (stored) setTxs(JSON.parse(stored));
  }, []);

  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask");

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_CHAIN_ID_HEX }],
    }).catch(async () => {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: ARC_CHAIN_ID_HEX,
          chainName: "Arc Testnet",
          rpcUrls: [RPC],
          nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
        }],
      });
    });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const acc = await provider.send("eth_requestAccounts", []);
    setAccount(acc[0]);
  }

  function fakeSend() {
    if (!to || !amount) return alert("Fill all fields");

    const hash = "0x" + Math.random().toString(16).slice(2, 10);

    const newTxs = [hash, ...txs];
    setTxs(newTxs);
    localStorage.setItem("txs", JSON.stringify(newTxs));

    setTo("");
    setAmount("");
  }

  function generateLink() {
    const link = `${window.location.origin}?to=${account}&amount=1`;
    navigator.clipboard.writeText(link);
    alert("Payment link copied 🚀");
  }

  async function paste() {
    const text = await navigator.clipboard.readText();
    setTo(text);
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h1 className="text-6xl arc-text">ARC ⚡</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      {!account && (
        <div className="glass-card p-8 rounded-2xl text-center w-full max-w-sm">
          <h1 className="text-2xl mb-2 font-semibold">ArcPay</h1>
          <p className="muted mb-6">Fast USDC payments on Arc</p>

          <button
            onClick={connectWallet}
            className="primary-btn w-full py-3 rounded-xl"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {account && (
        <div className="glass-card p-6 rounded-2xl w-full max-w-sm">

          {/* Header */}
          <div className="mb-4">
            <p className="text-xs muted">Connected</p>
            <p className="text-sm">
              {account.slice(0,6)}...{account.slice(-4)}
            </p>

            <button
              onClick={() => navigator.clipboard.writeText(account)}
              className="text-xs mt-1 muted"
            >
              Copy address
            </button>
          </div>

          {/* Inputs */}
          <input
            className="dark-input mb-2"
            placeholder="Receiver address"
            value={to}
            onChange={(e)=>setTo(e.target.value)}
          />

          <div className="flex gap-2 mb-2">
            <button onClick={paste} className="text-xs muted">
              Paste
            </button>
          </div>

          <input
            className="dark-input mb-2"
            placeholder="Amount (USDC)"
            value={amount}
            onChange={(e)=>setAmount(e.target.value)}
          />

          <button
            onClick={()=>setAmount("10")}
            className="text-xs muted mb-2"
          >
            Max
          </button>

          <p className="text-xs muted mb-3">
            Fee ≈ 0.01 USDC
          </p>

          {/* Buttons */}
          <button
            onClick={fakeSend}
            className="primary-btn w-full py-2 rounded-xl mb-2"
          >
            Send
          </button>

          <button
            onClick={generateLink}
            className="secondary-btn w-full py-2 rounded-xl"
          >
            Payment Link
          </button>

          {/* History */}
          <div className="mt-5">
            <p className="text-sm mb-2">History</p>

            {txs.length === 0 && (
              <p className="text-xs muted">No transactions yet</p>
            )}

            {txs.map((t)=>(
              <div
                key={t}
                className="text-xs bg-white/5 px-2 py-1 rounded mb-1"
              >
                {t}
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}