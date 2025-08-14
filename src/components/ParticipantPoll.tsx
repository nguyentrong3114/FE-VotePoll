import React, { useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

export default function ParticipantPoll() {
  // ---- Config ----
  const [baseUrl, setBaseUrl] = useState<string>("http://localhost:5080");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [poll, setPoll] = useState<{ question: string; options: Record<string, number> } | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  
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
    
    conn.onclose(() => {
      setConnecting(false);
    });
    
    await conn.start();
    connectionRef.current = conn;
    setConnecting(false);
  }

  async function joinRoom(targetRoomId: string) {
    if (!targetRoomId) return;
    try {
      await ensureConnection();
      await connectionRef.current!.invoke("JoinRoom", targetRoomId);
      setRoomId(targetRoomId);
      setJoined(true);
      setHasVoted(false);
    } catch (error) {
      alert("Không thể tham gia phòng. Vui lòng kiểm tra mã phòng!");
    }
  }

  async function sendVote(opt: string) {
    if (!joined || !roomId || hasVoted) return;
    try {
      await ensureConnection();
      await connectionRef.current!.invoke("Vote", roomId, opt);
      setHasVoted(true);
    } catch (error) {
      alert("Không thể gửi phiếu bầu. Vui lòng thử lại!");
    }
  }

  useEffect(() => {
    return () => {
      connectionRef.current?.stop();
    };
  }, []);

  const totalVotes = useMemo(() => {
    if (!poll) return 0;
    return Object.values(poll.options).reduce((a, b) => a + b, 0);
  }, [poll]);

  return (
    <div className="space-y-8">
      {/* Connection Settings */}
      {!joined && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Cài đặt kết nối</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">URL Backend</label>
              <input
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:5080"
              />
            </div>
            <button
              className="w-full px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              disabled={connecting}
              onClick={() => ensureConnection()}
            >
              {connecting ? "Đang kết nối..." : "Kết nối"}
            </button>
            {connectionRef.current?.state === signalR.HubConnectionState.Connected && (
              <div className="text-sm text-emerald-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Đã kết nối thành công
              </div>
            )}
          </div>
        </div>
      )}

      {/* Join Room */}
      {!joined && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Tham gia phòng bình chọn</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mã phòng</label>
              <input
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors uppercase"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Nhập mã phòng (VD: ABC123)"
                maxLength={10}
              />
            </div>
            <button
              onClick={() => joinRoom(roomId)}
              className="w-full px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors font-medium"
              disabled={!roomId || connectionRef.current?.state !== signalR.HubConnectionState.Connected}
            >
              Tham gia bình chọn
            </button>
          </div>
        </div>
      )}

      {/* Room Info */}
      {joined && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900">Đã tham gia phòng thành công!</h3>
              <p className="text-emerald-700">Mã phòng: <span className="font-mono font-bold">{roomId}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Poll Results */}
      {joined && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Cuộc bình chọn</h2>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Tổng: {totalVotes} phiếu bầu
            </div>
          </div>

          {poll ? (
            <>
              <div className="text-2xl font-bold text-slate-900 mb-6 text-center bg-slate-50 p-4 rounded-xl">
                {poll.question}
              </div>
              
              <div className="space-y-4">
                {Object.entries(poll.options).map(([opt, count]) => {
                  const pct = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                  return (
                    <div key={opt} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-slate-900 text-lg">{opt}</span>
                        <span className="text-slate-600 tabular-nums font-medium">{count} phiếu ({pct}%)</span>
                      </div>
                      
                      <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden mb-4">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      
                      {!hasVoted ? (
                        <button
                          onClick={() => sendVote(opt)}
                          className="w-full px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Bình chọn cho {opt}
                        </button>
                      ) : (
                        <div className="w-full px-4 py-3 rounded-xl bg-slate-300 text-slate-600 text-center font-medium flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Bạn đã bình chọn
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {hasVoted && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">Cảm ơn bạn đã tham gia bình chọn!</p>
                      <p className="text-green-700 text-sm">Kết quả sẽ được cập nhật tự động khi có thêm phiếu bầu mới.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500">Đang chờ cuộc bình chọn...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
