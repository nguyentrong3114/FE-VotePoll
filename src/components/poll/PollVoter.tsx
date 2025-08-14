import { Card } from '../ui';

interface PollVoterProps {
  question: string;
  options: Record<string, number>;
  onVote: (option: string) => void;
  hasVoted: boolean;
  votedOption?: string;
  disabled?: boolean;
  className?: string;
}

export default function PollVoter({
  question,
  options,
  onVote,
  hasVoted,
  votedOption,
  disabled = false,
  className = ''
}: PollVoterProps) {
  return (
    <Card title="Bình chọn" className={className}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4">{question}</h3>
        </div>

        <div className="space-y-3">
          {Object.keys(options).map((option) => {
            const isSelected = votedOption === option;
            const buttonClass = hasVoted
              ? isSelected
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-400'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400';

            return (
              <button
                key={option}
                onClick={() => !hasVoted && !disabled && onVote(option)}
                disabled={hasVoted || disabled}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all text-left relative
                  ${buttonClass}
                  ${!hasVoted && !disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {option}
                  </div>
                  <span className="font-medium">{option}</span>
                  {isSelected && hasVoted && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {hasVoted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-800 font-medium">
                Bạn đã bình chọn cho: {votedOption}
              </span>
            </div>
          </div>
        )}

        {!hasVoted && (
          <div className="text-center text-slate-500 text-sm">
            Chọn một lựa chọn để bình chọn
          </div>
        )}
      </div>
    </Card>
  );
}
