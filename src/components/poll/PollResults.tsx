import { Card } from '../ui';

interface PollResultsProps {
  question: string;
  options: Record<string, number>;
  roomId: string;
  hasPassword?: boolean;
  className?: string;
}

export default function PollResults({
  question,
  options,
  roomId,
  hasPassword = false,
  className = ''
}: PollResultsProps) {
  const totalVotes = Object.values(options).reduce((sum, count) => sum + count, 0);

  return (
    <Card className={className}>
      {/* Room Info */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-100 px-4 py-2 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
            </svg>
            <span className="text-indigo-800 font-medium">Mã phòng: {roomId}</span>
          </div>
          {hasPassword && (
            <div className="bg-amber-100 px-4 py-2 rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-amber-800 font-medium">Có mật khẩu</span>
            </div>
          )}
        </div>
        <h2 className="text-xl font-medium text-slate-900">{question}</h2>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
          <span>Kết quả bình chọn</span>
          <span className="font-medium">{totalVotes} lượt bình chọn</span>
        </div>

        {Object.entries(options).map(([option, count]) => {
          const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
          
          return (
            <div key={option} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{option}</span>
                <span className="text-slate-600 tabular-nums">{count} ({percentage}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}

        {totalVotes === 0 && (
          <div className="text-center py-8 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>Chưa có ai bình chọn</p>
          </div>
        )}
      </div>
    </Card>
  );
}
