import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const baseClass =
    'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-[#DB4437] text-white hover:bg-[#c53b2f] focus:ring-[#DB4437]',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-800',
    outline:
      'border border-gray-300 text-gray-800 hover:bg-gray-100 focus:ring-gray-300',
    link: 'text-[#DB4437] hover:underline focus:ring-transparent',
  };

  const sizes: Record<ButtonSize, string> = {
    small: 'text-sm px-3 py-1.5',
    medium: 'text-base px-4 py-2',
    large: 'text-lg px-5 py-3',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = isLoading || props.disabled ? 'opacity-60 cursor-not-allowed' : '';

  const spinner = (
    <svg
      className="animate-spin h-4 w-4 mr-2 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  );

  const buttonClass = [
    baseClass,
    variants[variant],
    sizes[size],
    widthClass,
    disabledClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={props.type || 'button'}
      className={buttonClass}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          {spinner}
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
