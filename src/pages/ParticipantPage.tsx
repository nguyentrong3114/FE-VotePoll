import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { Card, Button, Input } from "../components";
import { SignalRService, type PollData } from "../services/signalrService";
import { toast } from 'react-toastify';

export default function ParticipantPage() {
  const baseUrl = import.meta.env.VITE_BACKEND || "http://localhost:5236";
  const location = useLocation();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [presetPassword, setPresetPassword] = useState(false);
  const [joined, setJoined] = useState(false);
  const [poll, setPoll] = useState<PollData | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const signalRServiceRef = useRef<SignalRService | null>(null);
  
  // Initialize SignalR service
  const signalRService = useMemo(() => {
    if (!signalRServiceRef.current) {
      signalRServiceRef.current = new SignalRService(baseUrl);
    }
    return signalRServiceRef.current;
  }, [baseUrl]);

  // Check if roomId was passed from navigation
  useEffect(() => {
    const state = location.state as { roomId?: string } | null;
    if (state?.roomId) {
      setRoomId(state.roomId);
      // Auto-join if roomId is provided
      setTimeout(() => {
        if (state.roomId) {
          joinRoom(state.roomId);
        }
      }, 500);
    }
  }, [location.state]);

  async function ensureConnection() {
    try {
      await signalRService.ensureConnection();
      signalRService.onPollUpdated((p) => {
        setPoll({ question: p.question, options: p.options });
      });
    } catch (error) {
      console.error("Connection failed:", error);
      throw error;
    }
  }

  async function joinRoom(targetRoomId: string) {
    if (!targetRoomId) return;
    try {
      setConnecting(true);
      await ensureConnection();
      
      const result = await signalRService.joinRoom(targetRoomId);
      
      if (result.success) {
        setRoomId(targetRoomId);
        setJoined(true);
        setHasVoted(false);
        setConnecting(false);
        setShowPasswordInput(false);
        setPresetPassword(false);
        setPassword("");
        toast.success("Đã tham gia phòng thành công!");
      } else {
        setConnecting(false);
        if (result.requiresPassword) {
          setShowPasswordInput(true);
          toast.warning(result.message || "Phòng này yêu cầu mật khẩu. Vui lòng nhập mật khẩu bên dưới!");
        } else {
          toast.error(result.message || "Không thể tham gia phòng!");
        }
      }
    } catch (error: any) {
      setConnecting(false);
      toast.error("Lỗi kết nối. Vui lòng thử lại!");
    }
  }

  async function joinRoomWithPassword(targetRoomId: string, roomPassword: string) {
    if (!targetRoomId || !roomPassword.trim()) return;
    try {
      setConnecting(true);
      await ensureConnection();
      
      const result = await signalRService.joinRoom(targetRoomId, roomPassword.trim());
      
      if (result.success) {
        setRoomId(targetRoomId);
        setJoined(true);
        setHasVoted(false);
        setConnecting(false);
        setShowPasswordInput(false);
        setPresetPassword(false);
        setPassword("");
        toast.success("Đã tham gia phòng thành công!");
      } else {
        setConnecting(false);
        toast.error(result.message || "Mật khẩu không đúng hoặc không thể tham gia phòng!");
      }
    } catch (error: any) {
      setConnecting(false);
      toast.error("Lỗi kết nối. Vui lòng thử lại!");
    }
  }

  async function sendVote(opt: string) {
    if (!joined || !roomId || hasVoted) return;
    try {
      await ensureConnection();
      const success = await signalRService.vote(roomId, opt);
      
      if (success) {
        setHasVoted(true);
        toast.success("Đã gửi phiếu bầu thành công!");
      } else {
        toast.error("Không thể gửi phiếu bầu. Vui lòng thử lại!");
      }
    } catch (error) {
      toast.error("Lỗi khi gửi phiếu bầu. Vui lòng thử lại!");
    }
  }

  useEffect(() => {
    return () => {
      signalRService.disconnect();
    };
  }, [signalRService]);

  const totalVotes = useMemo(() => {
    if (!poll) return 0;
    return Object.values(poll.options).reduce((a, b) => a + b, 0);
  }, [poll]);

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Tham gia bình chọn</h1>
            <p className="text-lg text-slate-600">Nhập mã phòng để tham gia và bình chọn cho lựa chọn yêu thích</p>
          </div>
          
          <div className="space-y-8">
            {/* Join Room */}
            {!joined && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Tham gia phòng bình chọn</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mã phòng</label>
                    <Input
                      value={roomId}
                      onChange={(value) => setRoomId(value.toUpperCase())}
                      placeholder="Nhập mã phòng (VD: ABC123)"
                      className="uppercase"
                      maxLength={10}
                    />
                  </div>

                  {/* Checkbox để hiển thị trường mật khẩu */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasPassword"
                      checked={presetPassword}
                      onChange={(e) => {
                        setPresetPassword(e.target.checked);
                        if (!e.target.checked) {
                          setPassword("");
                        }
                      }}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="hasPassword" className="text-sm text-slate-600 cursor-pointer">
                      Phòng này có mật khẩu
                    </label>
                  </div>

                  {/* Trường mật khẩu tự chọn */}
                  {presetPassword && (
                    <Card className="bg-slate-50 border border-slate-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-slate-700 font-medium">Mật khẩu phòng</span>
                      </div>
                      <Input
                        type="password"
                        value={password}
                        onChange={(value) => setPassword(value)}
                        placeholder="Nhập mật khẩu phòng"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (password.trim()) {
                              joinRoomWithPassword(roomId, password);
                            } else {
                              joinRoom(roomId);
                            }
                          }
                        }}
                      />
                    </Card>
                  )}
                  
                  {showPasswordInput && (
                    <Card className="bg-amber-50 border border-amber-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-amber-800 font-medium">Phòng này có mật khẩu</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-amber-800 mb-2">Mật khẩu phòng</label>
                          <Input
                            type="password"
                            value={password}
                            onChange={(value) => setPassword(value)}
                            placeholder="Nhập mật khẩu phòng"
                            onKeyDown={(e) => e.key === "Enter" && joinRoomWithPassword(roomId, password)}
                            className="border-amber-300 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>
                        <Button
                          onClick={() => joinRoomWithPassword(roomId, password)}
                          disabled={!password.trim() || connecting}
                          className="w-full bg-amber-600 hover:bg-amber-700"
                        >
                          {connecting ? "Đang tham gia..." : "Tham gia với mật khẩu"}
                        </Button>
                      </div>
                    </Card>
                  )}
                  
                  <Button
                    onClick={() => {
                      if (presetPassword && password.trim()) {
                        joinRoomWithPassword(roomId, password);
                      } else {
                        joinRoom(roomId);
                      }
                    }}
                    disabled={!roomId || connecting || showPasswordInput}
                    variant="success"
                    className="w-full"
                  >
                    {connecting ? "Đang kết nối..." : presetPassword && password.trim() ? "Tham gia với mật khẩu" : "Tham gia bình chọn"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Room Info */}
            {joined && (
              <Card className="bg-emerald-50 border border-emerald-200 p-6">
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
              </Card>
            )}

            {/* Poll Results */}
            {joined && (
              <Card className="p-6">
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
                          <Card key={opt} className="bg-slate-50 p-4">
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
                              <Button
                                onClick={() => sendVote(opt)}
                                variant="success"
                                className="w-full"
                              >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Bình chọn cho {opt}
                              </Button>
                            ) : (
                              <div className="w-full px-4 py-3 rounded-xl bg-slate-300 text-slate-600 text-center font-medium flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Bạn đã bình chọn
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                    
                    {hasVoted && (
                      <Card className="mt-6 p-4 bg-green-50 border border-green-200">
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
                      </Card>
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
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
