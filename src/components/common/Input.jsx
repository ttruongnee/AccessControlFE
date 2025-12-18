import './Input.css';

export default function Input({
    label,
    error,
    type = 'text',
    placeholder,
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <input
                type={type}
                className={`input ${error ? 'input-error' : ''}`}
                placeholder={placeholder}
                disabled={disabled}
                {...props}
            />
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
}