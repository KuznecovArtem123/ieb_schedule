import type { ComponentPropsWithoutRef } from 'react';
import { Link } from 'react-router-dom';

interface BasicButtonProps extends ComponentPropsWithoutRef<typeof Link> {
  variant?: keyof typeof variantStyles;
}

const variantStyles = {
	primary: 'bg-primary text-white shadow-button hover:bg-primary-hover',
	accent: 'bg-primary text-white shadow-button-accent hover:bg-accent-hover',
	light: 'bg-surface text-link shadow-card hover:bg-chip-primary',
};

function BasicButton({ to, children, variant = 'primary', className = '', ...props }: BasicButtonProps) {
	return (
		<Link
			className={`block rounded-[17px] px-4 py-4 text-center text-lg font-bold no-underline transition ${variantStyles[variant]} ${className}`}
			to={to}
			{...props}
		>
			{children}
		</Link>
	);
}

export default BasicButton;
