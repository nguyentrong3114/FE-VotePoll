import { Button, Input, Card } from '../ui';

interface PollCreatorProps {
  question: string;
  onQuestionChange: (value: string) => void;
  options: string[];
  onOptionsChange: (options: string[]) => void;
  password?: string;
  onPasswordChange?: (value: string) => void;
  usePassword: boolean;
  onUsePasswordChange: (value: boolean) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function PollCreator({
  question,
  onQuestionChange,
  options,
  onOptionsChange,
  password = '',
  onPasswordChange,
  usePassword,
  onUsePasswordChange,
  onSubmit,
  loading = false
}: PollCreatorProps) {
  const addOption = () => {
    const newOption = String.fromCharCode(65 + options.length); // A, B, C, D...
    onOptionsChange([...options, newOption]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      onOptionsChange(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onOptionsChange(newOptions);
  };

  const handleSubmit = () => {
    if (question.trim() && options.length >= 2) {
      onSubmit();
    }
  };

  return (
    <Card title="Tạo cuộc bình chọn mới">
      <div className="space-y-6">
        {/* Question Input */}
        <Input
          label="Câu hỏi bình chọn"
          placeholder="Nhập câu hỏi của bạn..."
          value={question}
          onChange={onQuestionChange}
          required
        />

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Lựa chọn <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                  {String.fromCharCode(65 + index)}
                </div>
                <Input
                  placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(value) => updateOption(index, value)}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="flex-shrink-0 w-8 h-8 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                    title="Xóa lựa chọn"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {options.length < 8 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={addOption}
              className="mt-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm lựa chọn
            </Button>
          )}
        </div>

        {/* Password Option */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="usePassword"
              checked={usePassword}
              onChange={(e) => onUsePasswordChange(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="usePassword" className="text-sm font-medium text-slate-700 cursor-pointer">
              Bảo vệ phòng bằng mật khẩu
            </label>
          </div>
          
          {usePassword && onPasswordChange && (
            <Input
              type="password"
              placeholder="Nhập mật khẩu phòng"
              value={password}
              onChange={onPasswordChange}
              description="Người tham gia sẽ cần mật khẩu để vào phòng"
            />
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!question.trim() || options.length < 2 || loading}
          loading={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Đang tạo phòng...' : 'Tạo phòng bình chọn'}
        </Button>
      </div>
    </Card>
  );
}
