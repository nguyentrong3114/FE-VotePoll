interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  type?: 'text' | 'password' | 'email' | 'number';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  maxLength?: number;
  className?: string;
  description?: string;
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  onKeyDown,
  type = 'text',
  required = false,
  disabled = false,
  error,
  maxLength,
  className = '',
  description
}: InputProps) {
  const inputClasses = `
    w-full rounded-xl border p-3 outline-none transition-colors
    ${error 
      ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
      : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
    }
    ${disabled ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}
    ${type === 'text' && placeholder?.includes('mã phòng') ? 'uppercase' : ''}
    ${className}
  `.trim();

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={inputClasses}
      />
      
      {description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
