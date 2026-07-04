import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function InputField({
  label, type = 'text', value, onChange, placeholder, error, icon: Icon, autoComplete,
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{
          fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)',
          letterSpacing: '0.01em',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: error ? 'var(--error)' : 'var(--text-subtle)', pointerEvents: 'none',
            display: 'flex', alignItems: 'center',
          }}>
            <Icon size={16} />
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            padding: Icon ? '12px 44px 12px 42px' : '12px 44px 12px 14px',
            paddingRight: isPassword ? '44px' : '14px',
            border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            color: 'var(--text)',
            background: 'var(--surface)',
            outline: 'none',
            transition: 'border-color 0.18s, box-shadow 0.18s',
            boxShadow: error ? '0 0 0 3px var(--error-light)' : 'none',
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--purple)'
              e.target.style.boxShadow = '0 0 0 3px rgba(113,75,103,0.12)'
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-subtle)', display: 'flex', alignItems: 'center',
              padding: '4px',
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {error}
        </span>
      )}
    </div>
  )
}
