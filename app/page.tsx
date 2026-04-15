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
    setTimeout(() => setLoading(false), 1500);

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

  function validate() {
    if (!to.startsWith("0x") || to.length !== 42) {
      alert("Invalid address");
      return false;
    }
    if (Number(amount) <= 0) {
      alert("Invalid amount");
      return false;
    }
    return true;
  }

  function fakeSend() {
    if (!validate()) return;

    const hash = "0x" + Math.random().toString(16).slice(2, 10);

    const newTxs = [hash, ...txs];
    setTxs(newTxs);
    localStorage.setItem("txs", JSON.stringify(newTxs));

    alert("Transaction simulated 🚀");
  }

  function generateLink() {
    const link = `${window.location.origin}?to=${account}&amount=1`;
    navigator.clipboard.writeText(link);
    alert("Link copied 🚀");
  }

  async function paste() {
    const text = await navigator.clipboard.readText();
    setTo(text);
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <h1 className="text-5xl text-white">ARC ⚡</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">

      {!account && (
        <button
          onClick={connectWallet}
          className="bg-white text-black px-6 py-3 rounded-xl"
        >
          Connect Wallet
        </button>
      )}

      {account && (
        <div className="bg-white/5 p-6 rounded-xl w-80 border border-white/10">

          <p className="text-xs mb-2">
            {account.slice(0,6)}...{account.slice(-4)}
          </p>

          <button
            onClick={() => navigator.clipboard.writeText(account)}
            className="text-xs mb-2"
          >
            Copy Address
          </button>

          <input
            className="w-full p-2 mt-4 bg-black border rounded"
            placeholder="Receiver"
            value={to}
            onChange={(e)=>setTo(e.target.value)}
          />

          <button onClick={paste} className="text-xs mt-1">
            Paste
          </button>

          <input
            className="w-full p-2 mt-2 bg-black border rounded"
            placeholder="Amount"
            value={amount}
            onChange={(e)=>setAmount(e.target.value)}
          />

          <button onClick={()=>setAmount("10")} className="text-xs mt-1">
            Max
          </button>

          <p className="text-xs mt-2 text-zinc-400">
            Fee: ~0.01 USDC
          </p>

          <button
            onClick={fakeSend}
            className="w-full bg-blue-500 py-2 mt-3 rounded"
          >
            Send
          </button>

          <button
            onClick={generateLink}
            className="w-full bg-purple-500 py-2 mt-2 rounded"
          >
            Payment Link
          </button>

          <div className="mt-4">
            <p className="text-sm">History</p>
            {txs.map((t)=>(
              <p key={t} className="text-xs">{t}</p>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}