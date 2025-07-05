import type { SVGProps } from "react";

export default function NonVegIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 128 128"
			fill="none"
			{...props}
		>
			<title>Non-Veg Icon</title>
			<path stroke="#980000" strokeWidth="6" d="M3 3h122v122H3z" />
			<path fill="#980000" d="m64 17 43.301 75H20.6987L64 17Z" />
		</svg>
	);
}
