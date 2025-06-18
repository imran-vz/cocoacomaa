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
					backgroundImage: "url(/bg.jpg)",
					backgroundSize: "cover",
					backgroundPosition: "center",
					filter: "blur(3px)",
					height: "100%",
				}}
			/>
			<div className="absolute inset-0 -z-10 bg-black/40" />

			<main className="">
				<div className="min-h-[calc(100svh-5rem)] flex justify-center flex-col items-center">
					<h2 className="text-4xl text-center leading-12 font-normal tracking-widest text-white mb-4 font-serif">
						Fudgy. Messy. Unforgettable.
					</h2>
					<p className="max-w-sm mx-auto text-xl text-center font-normal tracking-widest text-white mb-4 font-serif">
						Started in a tiny home kitchen—now here to melt hearts (and maybe
						ruin store-bought dessert forever).
					</p>
					<div className="mt-6">
						<Button
							asChild
							size="3xl"
							variant="outline"
							className="text-primary"
						>
							<Link href="/order">Order Now</Link>
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}
