"use client";

import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/stagger-container";
import { Button } from "@/components/ui/button";

export function HomeContent() {
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

			<main>
				<div className="min-h-[calc(100svh-5rem)] flex justify-center text-white flex-col items-center">
					<StaggerContainer>
						<StaggerItem>
							<h2 className="text-4xl text-center leading-12 font-normal tracking-widest mb-4 font-serif">
								Fudgy. Messy. Unforgettable.
							</h2>
						</StaggerItem>
						<StaggerItem>
							<p className="max-w-sm mx-auto text-xl text-center font-normal tracking-widest mb-4 font-serif">
								Started in a tiny home kitchen—now here to melt hearts (and
								maybe ruin store-bought dessert forever).
							</p>
						</StaggerItem>
						<StaggerItem>
							<div className="mt-6 flex gap-4 flex-col justify-center items-center sm:flex-row">
								<Button
									asChild
									size="lg"
									variant="outline"
									className="min-w-xs bg-accent-foreground/10!"
								>
									<Link href="/order">Desserts</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="min-w-xs bg-accent-foreground/10!"
								>
									<Link href="/postal-brownies">Postal Brownies</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="min-w-xs bg-accent-foreground/10!"
								>
									<Link href="/workshops">Workshops</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="min-w-xs bg-accent-foreground/10!"
								>
									<Link href="/specials">Specials</Link>
								</Button>
							</div>
						</StaggerItem>
					</StaggerContainer>
				</div>
			</main>
		</div>
	);
}
