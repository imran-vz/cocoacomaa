import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen mx-auto relative">
			<div
				style={{
					position: "absolute",
					zIndex: -20,
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: "url(/bg.jpeg)",
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			/>
			<div className="absolute inset-0 -z-10 bg-black opacity-30" />

			<main>
				<div className="min-h-[calc(100svh-5rem)] flex justify-center flex-col items-center">
					<p className="max-w-sm mx-auto text-4xl text-center leading-12 font-normal tracking-widest text-white mb-6 font-serif">
						Indulge in the finest desserts crafted with love and passion.
					</p>
					<div className="mt-8">
						<Button
							asChild
							size="lg"
							className="bg-white text-black hover:bg-gray-100"
						>
							<Link href="/order">Order Now</Link>
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}
