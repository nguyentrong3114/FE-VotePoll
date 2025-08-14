import { useState, useMemo, useRef } from "react";
import { toast } from 'react-toastify';
import { pollService } from "../services/pollService";
import { SignalRService, type PollData, type ActivityEvent, type UserInfo } from "../services/signalrService";
import { PollCreator, PollResults, ActivityPanel } from "../components";

export default function HostPage() {
  // ---- Config ----
  const baseUrl = import.meta.env.VITE_BACKEND || "http://localhost:5236";
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["A", "B", "C"]);
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [poll, setPoll] = useState<PollData | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
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
      await signalRService.ensureConnection();
      
      // Poll updates
      signalRService.onPollUpdated((p) => {
        setPoll({ question: p.question, options: p.options });
      });

      // Activity tracking
      signalRService.onActivityUpdate((activity) => {
        setActivities(prev => [...prev, activity]);
      });

      signalRService.onUserListUpdate((userList) => {
        setUsers(userList);
      });

      signalRService.onUserJoined((user) => {
        setUsers(prev => [...prev, user]);
        setActivities(prev => [...prev, {
          id: `join-${user.userId}-${Date.now()}`,
          type: 'join',
          userId: user.userId,
          userName: user.userName,
          message: `${user.userName || `Người dùng ${user.userId.slice(-4)}`} đã tham gia phòng`,
          timestamp: new Date(),
          data: user
        }]);
      });

      signalRService.onUserLeft((userId) => {
        setUsers(prev => prev.filter(u => u.userId !== userId));
        setActivities(prev => [...prev, {
          id: `leave-${userId}-${Date.now()}`,
          type: 'leave',
          userId: userId,
          message: `Người dùng đã rời khỏi phòng`,
          timestamp: new Date()
        }]);
      });

      signalRService.onUserVoted((data) => {
        setUsers(prev => prev.map(u => 
          u.userId === data.userId 
            ? { ...u, hasVoted: true, votedOption: data.option }
            : u
        ));
        setActivities(prev => [...prev, {
          id: `vote-${data.userId}-${Date.now()}`,
          type: 'vote',
          userId: data.userId,
          userName: data.userName,
          message: `${data.userName || `Người dùng ${data.userId.slice(-4)}`} đã bình chọn: ${data.option}`,
          timestamp: new Date(),
          data: { option: data.option }
        }]);
      });
    } catch (error) {
      console.error("Connection failed:", error);
      throw error;
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
      
      toast.success(`Đã tạo phòng thành công! Mã phòng: ${result.roomId}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 py-8">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {!joined ? (
          <PollCreator
            question={question}
            onQuestionChange={setQuestion}
            options={options}
            onOptionsChange={setOptions}
            password={password}
            onPasswordChange={setPassword}
            usePassword={usePassword}
            onUsePasswordChange={setUsePassword}
            onSubmit={createPoll}
            loading={creating}
          />
        ) : (
          poll && (
            <PollResults
              question={poll.question}
              options={poll.options}
              roomId={roomId}
              hasPassword={usePassword}
            />
          )
        )}

        {/* Activity Panel */}
        {joined && (
          <ActivityPanel
            activities={activities}
            users={users}
            isVisible={showActivityPanel}
            onToggle={() => setShowActivityPanel(!showActivityPanel)}
          />
        )}
      </div>
    </div>
  );
}
