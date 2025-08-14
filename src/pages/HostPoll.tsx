import React, { useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

export default function HostPoll() {
  // ---- Config ----
  const [baseUrl, setBaseUrl] = useState<string>("http://localhost:5080");
  const [question, setQuestion] = useState("");
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState<string[]>(["A", "B", "C"]);
  const [creating, setCreating] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [poll, setPoll] = useState<{ question: string; options: Record<string, number> } | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [connecting, setConnecting] = useState(false);
  const hubUrl = useMemo(() => `${baseUrl.replace(/\/$/, "")}/pollHub`, [baseUrl]);

  async function ensureConnection() {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) return;
    setConnecting(true);
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();
    conn.on("PollUpdated", (p) => {
      setPoll({ question: p.question, options: p.options });
    });
    await conn.start();
    connectionRef.current = conn;
    setConnecting(false);
  }

  async function createPoll() {
    if (!question.trim() || options.length === 0) return;
    try {
      setCreating(true);
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), options }),
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      const data = await res.json();
      const createdRoomId = data.roomId as string;
      setRoomId(createdRoomId);
      setJoined(true);
      await ensureConnection();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    return () => {
      connectionRef.current?.stop();
    };
  }, []);

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
            <h2 className="text-lg font-semibold">Kết quả bình chọn trực tiếp</h2>
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
