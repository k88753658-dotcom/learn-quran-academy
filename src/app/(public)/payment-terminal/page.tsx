"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

function TerminalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get("studentId");

  const [txId, setTxId] = useState("");
  const [method, setMethod] = useState("NayaPay");
  const [submitting, setSubmitting] = useState(false);

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return alert("Session timeout error. Please register again.");
    if (txId.trim().length < 6) return alert("Please provide a valid Transaction ID.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/verify-manual-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, transactionId: txId, methodUsed: method })
      });
      const data = await res.json();
      if (data.success) {
        alert("Alhamdulillah! Your payment details are being reviewed. Your portal will activate shortly.");
        router.push(`/student-portal?id=${studentId}`);
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      alert("Database link timeout.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-6 text-[#5C4033]">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg border border-[#D2B48C]/30">
        <h2 className="text-2xl font-black text-center mb-2">Secure Payment Terminal</h2>
        <p className="text-xs text-center text-gray-500 mb-6">Complete your deposit below to initialize your workspace access flag.</p>

        {/* Local Wallet Credentials Block */}
        <div className="bg-[#FDFCF0] p-5 rounded-2xl border border-dashed border-[#D2B48C]/40 mb-6 space-y-3 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="font-bold">✨ Option 1: NayaPay ID</span>
            <code className="bg-white px-2 py-1 rounded border font-bold text-amber-700">03xx-xxxxxxx</code>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="font-bold">📱 Option 2: EasyPaisa / JazzCash</span>
            <code className="bg-white px-2 py-1 rounded border font-bold text-emerald-700">03xx-xxxxxxx</code>
          </div>
          <p className="text-[11px] text-gray-400 italic text-center pt-1">Account Title: Learn Quran Academy / Pak Secure Network</p>
        </div>

        <form onSubmit={handleProofSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Payment Method Used</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-3.5 bg-[#FDFCF0] border border-[#D2B48C]/30 rounded-xl font-medium text-sm text-[#5C4033]"
            >
              <option value="NayaPay">NayaPay Wallet</option>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Bank Transfer">Meezan / HBL Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Transaction ID / Reference ID</label>
            <input
              type="text"
              required
              placeholder="e.g. 10293847561"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              className="w-full p-3.5 bg-[#FDFCF0] border border-[#D2B48C]/30 rounded-xl focus:outline-none focus:border-[#50C878] text-sm font-bold uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#5C4033] text-white p-4 rounded-xl font-bold hover:bg-[#4A3329] transition-all text-sm uppercase tracking-wider flex justify-center items-center gap-2"
          >
            {submitting ? "Verifying Record..." : "Submit Verification Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PaymentTerminal() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center">Loading Secure Workspace Link...</div>}>
      <TerminalContent />
    </Suspense>
  );
}