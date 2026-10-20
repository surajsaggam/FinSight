import { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable password input with show/hide visibility toggle and accessible labeling.
 */
export default function PasswordInput({
  label = 'Password',
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  autoComplete = 'current-password',
  error = '',
  disabled = false,
  id: externalId,
  name = 'password',
  className = '',
}) {
  const generatedId = useId();
  const inputId = externalId || generatedId;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full rounded-xl bg-slate-900/60 border ${
            error ? 'border-rose-500/80 focus:border-rose-400' : 'border-slate-700/80 focus:border-emerald-500'
          } px-4 py-2.5 pr-11 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:ring-2 ${
            error ? 'focus:ring-rose-500/20' : 'focus:ring-emerald-500/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={0}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 focus:text-emerald-400 focus:outline-none transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-rose-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
