import { useState } from 'react';
import { Button, Input, Card } from '../ui';

interface RoomJoinerProps {
  onJoinRoom: (roomId: string, password?: string) => void;
  loading?: boolean;
  initialRoomId?: string;
  className?: string;
}

export default function RoomJoiner({
  onJoinRoom,
  loading = false,
  initialRoomId = '',
  className = ''
}: RoomJoinerProps) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const handleJoin = () => {
    if (!roomId.trim()) return;
    
    if (showPasswordInput && password.trim()) {
      onJoinRoom(roomId.trim(), password.trim());
    } else {
      onJoinRoom(roomId.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <Card title="Tham gia phòng bình chọn" className={className}>
      <div className="space-y-4">
        <Input
          label="Mã phòng"
          placeholder="Nhập mã phòng (VD: ABC123)"
          value={roomId}
          onChange={(value) => setRoomId(value.toUpperCase())}
          onKeyDown={handleKeyDown}
          maxLength={10}
          required
        />

        {/* Checkbox để hiển thị mật khẩu */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hasPassword"
            checked={showPasswordInput}
            onChange={(e) => {
              setShowPasswordInput(e.target.checked);
              if (!e.target.checked) {
                setPassword('');
              }
            }}
            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="hasPassword" className="text-sm text-slate-600 cursor-pointer">
            Phòng này có mật khẩu
          </label>
        </div>

        {/* Trường mật khẩu */}
        {showPasswordInput && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-slate-700 font-medium">Mật khẩu phòng</span>
            </div>
            <Input
              type="password"
              placeholder="Nhập mật khẩu phòng"
              value={password}
              onChange={setPassword}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}

        <Button
          onClick={handleJoin}
          disabled={!roomId.trim() || loading}
          loading={loading}
          className="w-full"
          size="lg"
        >
          {loading 
            ? 'Đang kết nối...' 
            : showPasswordInput && password.trim() 
              ? 'Tham gia với mật khẩu' 
              : 'Tham gia bình chọn'
          }
        </Button>
      </div>
    </Card>
  );
}
