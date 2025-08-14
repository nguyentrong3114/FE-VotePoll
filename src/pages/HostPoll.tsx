import React, { useEffect, useMemo, useRef, useState } from "react";
import { pollService } from "../services/pollService";
import { SignalRService, type PollData } from "../services/signalrService";

export default function HostPoll() {
  // ---- Config ----
  const baseUrl = import.meta.env.VITE_BACKEND || "http://localhost:5236";
  const [question, setQuestion] = useState("");
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState<string[]>(["A", "B", "C"]);
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [poll, setPoll] = useState<PollData | null>(null);
  const signalRServiceRef = useRef<SignalRService | null>(null);

  // Initialize SignalR service
  const signalRService = useMemo(() => {
    if (!signalRServiceRef.current) {
      signalRServiceRef.current = new SignalRService(baseUrl);
    }
    return signalRServiceRef.current;
  }, [baseUrl]);

  async function ensureConnection() {
    try {
      await signalRService.connect();
      signalRService.onPollUpdated((p) => {
        setPoll({ question: p.question, options: p.options });
      });
    } catch (error) {
      console.error("Connection failed:", error);
    }
  }

  async function createPoll() {
    if (!question.trim() || options.length === 0) return;
    try {
      setCreating(true);
      await ensureConnection();
      
      const pollData = {
        question: question.trim(),
        options,
        ...(usePassword && password.trim() && { password: password.trim() })
      };
      
      const result = await pollService.createPoll(pollData);
      setRoomId(result.roomId);
      setJoined(true);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    return () => {
      signalRService.disconnect();
    };
  }, [signalRService]);

  function addOption() {
    const v = optionInput.trim();
    if (!v) return;
    if (options.includes(v)) return;
    setOptions((prev) => [...prev, v]);
    setOptionInput("");
  }

  function removeOption(opt: string) {
    setOptions((prev) => prev.filter((x) => x !== opt));
  }

  const totalVotes = useMemo(() => {
    if (!poll) return 0;
    return Object.values(poll.options).reduce((a, b) => a + b, 0);
  }, [poll]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-semibold mb-4">Người tổ chức (Host)</h1>
        <section className="bg-white rounded-2xl shadow p-4 md:p-6 grid gap-4">
          <h2 className="text-lg font-semibold">Tạo phòng bình chọn</h2>
          <input
            className="rounded-xl border p-3 outline-none focus:ring focus:ring-indigo-200"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Câu hỏi bình chọn"
          />
          
          {/* Password Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="usePassword"
                checked={usePassword}
                onChange={(e) => setUsePassword(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="usePassword" className="text-sm font-medium text-slate-700">
                Bảo vệ phòng bằng mật khẩu (tùy chọn)
              </label>
            </div>
            {usePassword && (
              <input
                type="password"
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu phòng"
              />
            )}
            <p className="text-xs text-slate-500 mt-2">
              {usePassword ? "Người tham gia sẽ cần nhập mật khẩu để vào phòng" : "Phòng công khai, ai cũng có thể tham gia"}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border p-3 outline-none focus:ring focus:ring-indigo-200"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  placeholder="Thêm lựa chọn"
                  onKeyDown={(e) => e.key === "Enter" && addOption()}
                />
                <button
                  onClick={addOption}
                  className="px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >Thêm</button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Nhấn Enter để thêm.</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border">
              <p className="text-sm font-medium mb-2">Các lựa chọn</p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <span key={opt} className="inline-flex items-center gap-2 bg-slate-200 rounded-full px-3 py-1 text-sm">
                    {opt}
                    <button
                      onClick={() => removeOption(opt)}
                      className="text-slate-600 hover:text-red-600"
                      title="Xóa"
                    >×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={createPoll}
              disabled={creating || !question.trim() || options.length === 0}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >{creating ? "Đang tạo…" : "Tạo phòng & làm Host"}</button>
          </div>
        </section>
        {joined && (
          <section className="bg-white rounded-2xl shadow p-4 md:p-6 grid gap-4 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Kết quả bình chọn trực tiếp</h2>
              <div className="flex gap-3">
                <div className="bg-indigo-100 px-4 py-2 rounded-lg">
                  <span className="text-indigo-800 font-medium">Mã phòng: {roomId}</span>
                </div>
                {usePassword && (
                  <div className="bg-amber-100 px-4 py-2 rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-amber-800 font-medium">Có mật khẩu</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xl font-medium">{poll?.question}</div>
            <div className="grid gap-3">
              {poll && Object.entries(poll.options).map(([opt, count]) => {
                const pct = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                return (
                  <div key={opt} className="grid gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{opt}</span>
                      <span className="tabular-nums">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
