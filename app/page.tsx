"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState } from "react";
import { ethers } from "ethers";

const ARC_CHAIN_ID_HEX = "0x4cef52";
const RPC = "https://rpc.testnet.arc.network";
const EXPLORER = "https://testnet.arcscan.app";
const USDC = "0x3600000000000000000000000000000000000000";

const ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
];

export default function Home() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState<any>(null);
  const [balance, setBalance] = useState("0");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [tx, setTx] = useState("");

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
          blockExplorerUrls: [EXPLORER],
        }],
      });
    });

    const prov = new ethers.BrowserProvider(window.ethereum);
    const acc = await prov.send("eth_requestAccounts", []);
    setAccount(acc[0]);
    setProvider(prov);

    getBalance(prov, acc[0]);
  }

  async function getBalance(prov:any, addr:string) {
    const contract = new ethers.Contract(USDC, ABI, prov);
    const bal = await contract.balanceOf(addr);
    setBalance(ethers.formatUnits(bal, 6));
  }

  async function sendUSDC() {
    if (!provider) return alert("Connect wallet");

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(USDC, ABI, signer);

    const txRes = await contract.transfer(
      to,
      ethers.parseUnits(amount, 6)
    );

    setStatus("Sending...");
    setTx(txRes.hash);

    await txRes.wait();

    setStatus("Success ✅");
    getBalance(provider, account);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow">
        
        <h1 className="text-2xl font-bold mb-2">ArcPay Lite</h1>
        <p className="text-gray-500 mb-4">Send USDC easily</p>

        <button
          onClick={connectWallet}
          className="w-full bg-black text-white py-2 rounded-lg mb-4"
        >
          {account ? "Connected" : "Connect Wallet"}
        </button>

        <div className="bg-gray-50 p-3 rounded mb-4">
          <p className="text-xs break-all">{account || "Not connected"}</p>
          <p className="font-semibold mt-2">{balance} USDC</p>
        </div>

        <input
          placeholder="Receiver address"
          className="w-full p-2 border rounded mb-2"
          onChange={(e)=>setTo(e.target.value)}
        />

        <input
          placeholder="Amount"
          className="w-full p-2 border rounded mb-3"
          onChange={(e)=>setAmount(e.target.value)}
        />

        <button
          onClick={sendUSDC}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Send
        </button>

        {status && (
          <p className="mt-3 text-sm">{status}</p>
        )}

        {tx && (
          <a
            href={`${EXPLORER}/tx/${tx}`}
            target="_blank"
            className="text-blue-500 text-xs block mt-2"
          >
            View Transaction
          </a>
        )}
      </div>
    </div>
  );
}