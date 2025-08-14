interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Card({
  children,
  title,
  className = '',
  padding = 'md',
  shadow = 'lg'
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const cardClasses = `
    bg-white rounded-2xl border border-slate-200 
    ${paddingClasses[padding]} 
    ${shadowClasses[shadow]} 
    ${className}
  `.trim();

  return (
    <div className={cardClasses}>
      {title && (
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
