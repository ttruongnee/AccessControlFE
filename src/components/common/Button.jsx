import './Button.css';

export default function Button({
    children,
    variant = 'primary',
    size = 'medium',
    icon,
    disabled = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${className}`}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {icon && <span className="btn-icon">{icon}</span>}
            {children}
        </button>
    );
}