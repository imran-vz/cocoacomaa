"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StaggerContainer, StaggerItem } from "@/components/stagger-container";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function HomeContent() {
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		// Show Google One Tap when not authenticated
		if (!session?.user?.id && !isPending) {
			authClient.oneTap({
				fetchOptions: {
					onSuccess: () => {
						window.location.reload();
						return;
					},
				},
			});
		}
	}, [session?.user?.id, isPending]);

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
							<h1 className="text-4xl text-center leading-12 font-normal tracking-widest mb-4 font-serif">
								Fudgy. Messy. Unforgettable.
							</h1>
						</StaggerItem>
						<StaggerItem>
							<p className="max-w-sm mx-auto text-xl text-center font-normal tracking-widest mb-4 font-serif">
								Started in a tiny home kitchen—now here to melt hearts (and
								maybe ruin store-bought dessert forever).
							</p>
						</StaggerItem>
						<StaggerItem>
							<div className="mt-6 gap-4 grid grid-cols-1 sm:grid-cols-2 place-items-center">
								<Button
									asChild
									size="lg"
									variant="outline"
									className="w-xs bg-accent-foreground/10!"
								>
									<Link href="/order">Desserts</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="w-xs bg-accent-foreground/10!"
								>
									<Link href="/postal-brownies">Postal Brownies</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="w-xs bg-accent-foreground/10!"
								>
									<Link href="/workshops">Workshops</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="w-xs bg-accent-foreground/10!"
								>
									<Link href="/specials">Specials</Link>
								</Button>
							</div>
						</StaggerItem>
					</StaggerContainer>
				</div>

				<div className="bg-background text-foreground py-16 px-4">
					<div className="max-w-3xl mx-auto text-center space-y-6">
						<h2 className="text-3xl font-serif">
							The Best Brownies in Bangalore
						</h2>
						<p className="text-lg leading-relaxed text-muted-foreground">
							Craving the perfect fudgy brownie? Cocoa Comaa brings you the
							richest, messiest, and most unforgettable{" "}
							<strong>brownies in Bangalore</strong>. Baked fresh in our{" "}
							<strong>Koramangala</strong> kitchen, our desserts are crafted for
							true chocolate lovers. Whether you need a custom cake for a
							birthday or a box of our signature postal brownies shipped
							anywhere in India, we've got you covered.
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
