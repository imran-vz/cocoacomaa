import { EmailForm } from "./form";
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
					backgroundImage:
						"url(https://img1.wsimg.com/isteam/stock/NrG2BY8/:/rs=w:1534,m)",
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			/>
			<div className="absolute inset-0 -z-10 bg-black opacity-30" />

			<main className="">
				<div className="flex justify-center items-center py-8">
					<h1 className="text-2xl md:text-xl tracking-[0.2rem] font-medium uppercase text-white mb-4 ">
						COCOA COMAA
					</h1>
				</div>

				<div className="min-h-[calc(100vh-12rem)] flex justify-center flex-col items-center">
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
				<div className="flex justify-center items-center py-8 bg-zinc-800">
					<div className="relative h-full flex flex-col justify-between px-6 pt-8 space-y-8">
						<div className="text-center">
							<h1 className="text-4xl font-serif mb-8 text-white">Subscribe</h1>
							<p className="text-gray-400 text-sm ">
								Sign up to be the first to get updates.
							</p>

							<EmailForm />
						</div>

						<div className="flex items-end">
							<p className="text-sm text-gray-400 text-center">
								Copyright © 2025 Cocoa Comaa - All Rights Reserved.
							</p>
						</div>
					</div>{" "}
				</div>
			</main>
		</div>
	);
}
