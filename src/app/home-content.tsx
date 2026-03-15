"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

const reviews = [
	{
		name: "VIKRAM D S MANI",
		rating: 5,
		text: `Cocoa Comaa has truly impressed us with the quality of their brownies. The brownies are rich, fresh, and clearly made with great care.
We placed a bulk order for Children’s Day, and it was reassuring to see how thoughtfully the brownies were prepared, keeping them both healthy and kid friendly without compromising on taste. We also ordered assorted boxes for Christmas, and the quality was consistently excellent across all orders.

Everything was delivered on time, and the same high standards were maintained throughout. A special shout out to Maria for taking every request seriously. Her attention to detail and responsiveness are genuinely commendable 👏👏`,
		date: "24-02-2026",
		url: "https://maps.app.goo.gl/95pnrd2LEQcDxUvz9",
	},
	{
		name: "Kalpana Siddappa",
		rating: 5,
		text: `Had such a good experience at Coco Comaa! If you’re a dessert lover, this place is honestly a treat. Everything I tried was rich, fresh, and full of flavour — you can tell they don’t compromise on quality.
    Loved my experience at Coco Comaa! Everything tasted fresh, rich, and perfectly sweet. The Choco Fudge Brownie and Rocky Road Brownie were super chocolatey and gooey, the Vanilla Blondie was soft and buttery, and the Classic Cheesecake was smooth and creamy. The highlight was definitely the Nutella centre-filled cookie — warm, soft, and filled with melted Nutella.

    Perfect place for dessert cravings. Will definitely be back!`,
		date: "15-02-2026",
		url: "https://maps.app.goo.gl/sCmvE7QKrANbokDC9",
	},
	{
		name: "Vaishnavi Burangey",
		rating: 5,
		text: `The best place to have a brownies and various other yummy desserts and savoury items. The menu is made with so much thought and love. Always a great time with cocoa comaa.`,
		date: "08-03-2026",
		url: "https://maps.app.goo.gl/vgVaWtkXpVqHYMfo8",
	},
	{
		name: "Conway Alweyn",
		rating: 5,
		text: `If you are a Brownie Fan, this is the place to be at. Totally enjoyed every bite of the brownies...
		Fresh and baked with love...
		Maria was also very welcoming....
		If you are ever in Koramangala, do give Cocoa Comaa a try...`,
		date: "02-02-2026",
		url: "https://maps.app.goo.gl/V7rNiG1XxnaQfe9w9",
	},
	{
		name: "Aswin Rajagopal",
		rating: 5,
		text: `This is truly one of the best places for desserts in Bangalore. Everything is delicious and surprisingly affordable. Their hot chocolate and Nutella brownie are absolute must-tries! The owner, Krithu, is incredibly sweet and friendly.`,
		date: "01-01-2026",
		url: "https://maps.app.goo.gl/SkHHwzB8AorFG4vG9",
	},
	{
		name: "Sundar Yatra",
		rating: 5,
		text: `On of the best brownies I’ve ever had in Koramangala…. Highly recommend this place ❤️❤️`,
		date: "01-11-2025",
		url: "https://maps.app.goo.gl/kz9r62QEpndxz1xd8",
	},
];

const GOOGLE_REVIEWS_URL =
	"https://www.google.com/maps/place/Cocoa+comaa/@12.9357272,77.6164521,17z/data=!4m8!3m7!1s0x3bae150073584a87:0xfff8b6b7b6892dfc!8m2!3d12.9357272!4d77.619027!9m1!1b1!16s%2Fg%2F11y4hcllcz";

export function HomeContent() {
	const { data: session, isPending } = authClient.useSession();
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({ target: containerRef });
	const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.92]);
	const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

	useEffect(() => {
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
		<div ref={containerRef} className="relative bg-background text-foreground">
			{/* Hero */}
			<motion.section
				style={{ scale: heroScale, opacity: heroOpacity }}
				className="min-h-screen flex flex-col justify-end relative overflow-hidden"
			>
				<div className="absolute top-0 left-0 w-full h-full">
					<div
						className="absolute inset-0"
						style={{
							background:
								"radial-gradient(ellipse at 70% 30%, rgba(200, 85, 61, 0.08) 0%, transparent 60%)",
						}}
					/>
				</div>

				{/* Hero Image */}
				<div className="absolute inset-0 w-full md:left-[45%] md:w-[55%] overflow-hidden">
					<Image
						src="/bg.jpg"
						alt="Cocoa Comaa brownies and truffles"
						fill
						priority
						className="object-cover object-center"
						style={{
							filter: "grayscale(30%) contrast(1.1) brightness(0.3)",
							mixBlendMode: "luminosity",
						}}
					/>
					{/* Gradient fades: left, top, and bottom for seamless blending */}
					<div
						className="absolute inset-0"
						style={{
							background:
								"linear-gradient(to right, var(--background) 0%, transparent 45%), linear-gradient(to bottom, var(--background) 0%, transparent 25%), linear-gradient(to top, var(--background) 0%, transparent 30%)",
						}}
					/>
					{/* Mobile: extra dark overlay for text readability */}
					<div className="absolute inset-0 md:hidden bg-background/60" />
				</div>

				{/* Top bar */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 1 }}
					className="absolute top-0 left-0 right-0 flex flex-col md:flex-row md:justify-between items-start md:items-center px-6 md:px-12 py-6 gap-1 md:gap-0"
				>
					<span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
						Studio &mdash; Ejipura
					</span>
					<span className="text-xs tracking-[0.3em] uppercase text-foreground/50">
						Storefront &mdash; 5th Block, Koramangala
					</span>
				</motion.div>

				<div className="px-6 md:px-12 pb-12 md:pb-24 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 60 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const }}
					>
						<h1 className="font-serif text-[clamp(4rem,15vw,14rem)] leading-[0.85] tracking-[-0.03em] mb-6 text-foreground">
							COCOA
							<br />
							<span className="text-primary">COMAA</span>
						</h1>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6, duration: 1 }}
						className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mt-8"
					>
						<p className="text-sm md:text-base max-w-md leading-relaxed tracking-wide text-muted-foreground">
							Fudgy brownies. Custom cakes. Baking workshops.
							<br />
							Born in a home kitchen. Now ruining store-bought dessert forever.
						</p>
						<div className="flex gap-6 shrink-0">
							<Link
								href="/order"
								className="text-xs tracking-[0.25em] uppercase whitespace-nowrap py-3 px-6 border border-border text-foreground transition-all duration-300 hover:bg-primary hover:border-primary hover:text-white"
							>
								Order Now
							</Link>
							<Link
								href="/workshops"
								className="text-xs tracking-[0.25em] uppercase whitespace-nowrap py-3 px-6 text-muted-foreground transition-all duration-300 hover:text-primary"
							>
								Workshops
							</Link>
						</div>
					</motion.div>
				</div>
			</motion.section>

			{/* Scrolling Marquee */}
			<div className="py-4 overflow-hidden border-t border-b border-border">
				<div className="marquee-track">
					{["a", "b", "c", "d", "e", "f", "g", "h"].map((id) => (
						<span
							key={`marquee-${id}`}
							className="text-xs tracking-[0.4em] uppercase whitespace-nowrap mx-12 text-muted-foreground"
						>
							Brownies &bull; Cakes &bull; Workshops &bull; Postal Delivery
							&bull; Specials &bull;{" "}
						</span>
					))}
				</div>
			</div>

			{/* What We Do - Editorial Grid */}
			<section className="px-6 md:px-12 py-20 md:py-32">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-12">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 0.8 }}
						className="md:col-span-5"
					>
						<span className="text-xs tracking-[0.3em] uppercase block mb-6 text-muted-foreground">
							01 / What We Do
						</span>
						<h2 className="font-serif text-5xl md:text-7xl leading-[0.9] tracking-tight">
							Desserts that
							<br />
							<em className="font-serif text-primary">refuse</em>
							<br />
							to be ordinary.
						</h2>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="md:col-span-7 md:pt-24"
					>
						<div className="space-y-12">
							{[
								{
									title: "Signature Brownies",
									desc: "Dense, fudgy, unapologetically rich. Our brownies don't compromise.",
									link: "/order",
								},
								{
									title: "Custom Cakes",
									desc: "Birthday, celebration, or just because. Designed and baked for you.",
									link: "/order",
								},
								{
									title: "Postal Brownies",
									desc: "Our brownies, shipped across India. Because distance shouldn't matter.",
									link: "/postal-brownies",
								},
								{
									title: "Baking Workshops",
									desc: "Learn the craft. Get messy. Take home something you made with your hands.",
									link: "/workshops",
								},
								{
									title: "Specials",
									desc: "Limited-run flavours and seasonal drops. Here today, gone tomorrow.",
									link: "/specials",
								},
							].map((item, i) => (
								<Link key={item.title} href={item.link} className="group block">
									<div className="flex items-start justify-between py-6 transition-all duration-300 border-b border-border">
										<div>
											<span className="text-xs block mb-2 text-muted-foreground">
												0{i + 1}
											</span>
											<h3 className="font-serif text-2xl md:text-3xl group-hover:text-primary transition-colors duration-300">
												{item.title}
											</h3>
											<p className="text-sm mt-2 max-w-sm text-muted-foreground">
												{item.desc}
											</p>
										</div>
										<span className="text-2xl transform group-hover:translate-x-2 transition-transform duration-300 text-muted-foreground">
											&rarr;
										</span>
									</div>
								</Link>
							))}
						</div>
					</motion.div>
				</div>
			</section>

			{/* Big Statement */}
			<section className="py-24 md:py-40 px-6 md:px-12 text-center border-t border-border">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 1 }}
				>
					<span className="text-xs tracking-[0.3em] uppercase block mb-10 text-muted-foreground">
						02 / Philosophy
					</span>
					<h2 className="font-serif text-4xl md:text-6xl lg:text-8xl leading-[0.95] max-w-5xl mx-auto">
						Started in a tiny home kitchen.
						<br />
						<em className="font-serif text-primary">Now melting hearts</em>{" "}
						across India.
					</h2>
				</motion.div>
			</section>

			{/* Reviews Section */}
			<section className="px-6 md:px-12 py-20 md:py-32 border-t border-border">
				<div className="flex flex-col md:flex-row md:items-start justify-between mb-16">
					<div>
						<span className="text-xs tracking-[0.3em] uppercase block mb-6 text-muted-foreground">
							03 / Voices
						</span>
						<h2 className="font-serif text-4xl md:text-6xl">
							What they
							<br />
							<em className="font-serif text-primary">say.</em>
						</h2>
					</div>
					<a
						href={GOOGLE_REVIEWS_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="mt-6 md:mt-0 text-xs tracking-[0.25em] uppercase py-3 px-6 border border-border text-foreground transition-all duration-300 hover:bg-primary hover:border-primary hover:text-white inline-block"
					>
						See All Google Reviews &rarr;
					</a>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
					{reviews.map((review, i) => (
						<motion.a
							key={review.name}
							href={review.url}
							target="_blank"
							rel="noopener noreferrer"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: i * 0.1 }}
							className="p-8 md:p-10 block group bg-background hover:bg-card transition-colors duration-500"
						>
							<div className="star-rating text-sm mb-4">
								{"*".repeat(review.rating)}
							</div>
							<p className="text-sm leading-relaxed mb-6 line-clamp-4 text-foreground">
								&ldquo;{review.text}&rdquo;
							</p>
							<div className="flex items-center justify-between">
								<span className="text-xs tracking-wide text-foreground">
									{review.name}
								</span>
								<span className="text-xs text-muted-foreground">
									{review.date}
								</span>
							</div>
						</motion.a>
					))}
				</div>

				<div className="mt-12 text-center">
					<a
						href={GOOGLE_REVIEWS_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs tracking-[0.2em] uppercase text-muted-foreground transition-colors duration-300 hover:text-primary"
					>
						4.5 rating on Google &bull; 127 reviews &bull; View on Google Maps
					</a>
				</div>
			</section>

			{/* CTA */}
			<section className="py-24 md:py-40 px-6 md:px-12 text-center border-t border-border bg-card">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
				>
					<h2 className="font-serif text-5xl md:text-7xl lg:text-9xl mb-8">
						<em className="font-serif text-primary">Order</em> Today.
					</h2>
					<p className="text-sm max-w-md mx-auto mb-10 text-muted-foreground">
						Same-day pickup in Koramangala and nearby areas. Postal brownies
						shipped pan-India.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="/order"
							className="text-xs tracking-[0.25em] uppercase py-4 px-10 transition-all duration-300 text-white bg-primary"
						>
							Browse Desserts
						</Link>
						<Link
							href="/postal-brownies"
							className="text-xs tracking-[0.25em] uppercase py-4 px-10 border border-border text-foreground transition-all duration-300 hover:bg-primary hover:border-primary hover:text-white"
						>
							Postal Brownies
						</Link>
						<Link
							href="/specials"
							className="text-xs tracking-[0.25em] uppercase py-4 px-10 text-muted-foreground transition-all duration-300 hover:text-primary"
						>
							View Specials
						</Link>
					</div>
				</motion.div>
			</section>
		</div>
	);
}
