import { Link } from 'react-router-dom';

const variantStyles = {
	primary: 'bg-[#2B60A5] text-white shadow-[0_10px_24px_rgba(31,126,238,0.2)] hover:bg-[#1474ed]',
	accent: 'bg-[#2B60A5] text-white shadow-[0_10px_24px_rgba(255,121,18,0.2)] hover:bg-[#e96b0b]',
	light: 'bg-white text-[#2188ee] shadow-[0_4px_10px_rgba(39,82,133,0.08)] hover:bg-[#e9f3fd]',
};

function BasicButton({ to, children, variant = 'primary', className = '', ...props }) {
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
