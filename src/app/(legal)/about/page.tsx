export default function AboutPage() {
	return (
		<div className="container max-w-4xl py-8 px-4 min-h-[calc(100svh-11rem)] mx-auto">
			<h1 className="text-3xl font-semibold mb-8">About Cocoa Comaa</h1>

			<div className="space-y-8">
				<section>
					<h2 className="text-2xl font-semibold mb-4">Our Story</h2>
					<p className="text-muted-foreground leading-relaxed">
						Cocoa Comaa began in a tiny home kitchen, born from a passion for
						creating unforgettable dessert experiences. What started as a small
						venture has grown into a beloved local dessert destination, known
						for our fudgy, messy, and utterly delicious creations.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-4">Our Philosophy</h2>
					<p className="text-muted-foreground leading-relaxed">
						We believe that desserts should be more than just sweet treats-they
						should be moments of joy and connection. Every creation is made with
						care, using quality ingredients and a touch of creativity that makes
						each bite special.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
					<div className="space-y-4">
						<div>
							<h3 className="text-lg font-medium mb-2">Custom Desserts</h3>
							<p className="text-muted-foreground leading-relaxed">
								From birthday celebrations to special occasions, we create
								custom desserts that make your moments memorable. Each creation
								is tailored to your preferences and dietary needs.
							</p>
						</div>
						<div>
							<h3 className="text-lg font-medium mb-2">Workshops</h3>
							<p className="text-muted-foreground leading-relaxed">
								Join us for hands-on workshops where you can learn the art of
								dessert making. Our sessions are perfect for both beginners and
								enthusiasts looking to enhance their baking skills.
							</p>
						</div>
					</div>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
					<p className="text-muted-foreground leading-relaxed">
						We're committed to providing exceptional quality and service. Every
						dessert is made fresh to order, ensuring you receive the best
						possible experience. We take pride in our attention to detail and
						dedication to customer satisfaction.
					</p>
				</section>
			</div>
		</div>
	);
}
