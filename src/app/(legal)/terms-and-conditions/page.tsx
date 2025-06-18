import { Info } from "lucide-react";

export default function TermsAndConditions() {
	return (
		<div className="max-w-3xl mx-auto px-4 py-10 text-zinc-800">
			<h1 className="text-4xl font-bold mb-6 text-center text-brown-800">
				Terms and Conditions
			</h1>

			<p className="mb-4">
				Welcome to <strong>Cocoa Comaa</strong>! By placing an order through our
				website, you agree to the following terms and conditions. Please read
				them carefully before proceeding with your order.
			</p>

			<blockquote className="flex items-start gap-2 border-l-4 border-primary bg-secondary p-4 mb-6 rounded-md">
				<Info className="text-primary w-5 h-5 mt-1" />
				<p className="text-sm text-primary">
					For custom cakes, it is strongly recommended to opt for{" "}
					<strong>self-pickup</strong> as delivery partners are often unreliable
					for delicate or time-sensitive items.
				</p>
			</blockquote>

			<section className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">1. Order Placement</h2>
				<ul className="list-disc list-inside space-y-1">
					<li>
						All custom cake orders placed through our website are confirmed upon
						successful payment.
					</li>
					<li>
						Once an order is placed, it{" "}
						<strong>cannot be cancelled or refunded</strong> under any
						circumstances.
					</li>
				</ul>
			</section>

			<section className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">2. Shipping & Delivery</h2>
				<ul className="list-disc list-inside space-y-1">
					<li>
						Orders will be shipped{" "}
						<strong>on the date selected by the customer</strong> during
						checkout.
					</li>
					<li>
						Delivery is typically fulfilled within{" "}
						<strong>2 to 4 working days</strong> depending on the delivery
						location and logistics partner.
					</li>
					<li>
						Delivery timelines are indicative and subject to external factors
						such as weather, public holidays, or logistics delays.
					</li>
				</ul>
			</section>

			<section className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">3. No Refund Policy</h2>
				<p>
					All sales are final. Due to the customized and perishable nature of
					our products, we do not offer any refunds or exchanges after an order
					is confirmed.
				</p>
			</section>

			<section className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">4. Responsibility</h2>
				<ul className="list-disc list-inside space-y-1">
					<li>
						Cocoa Comaa is not responsible for delays caused by incorrect
						delivery information, customer unavailability, or courier service
						issues.
					</li>
					<li>
						It is the customer’s responsibility to ensure someone is available
						to receive the order on the delivery day.
					</li>
				</ul>
			</section>

			<section className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">5. Modifications</h2>
				<ul className="list-disc list-inside space-y-1">
					<li>
						Modifications to your order may be possible if the item has{" "}
						<strong>not yet entered the baking or preparation process</strong>.
					</li>
					<li>To request a change, please contact us as soon as possible.</li>
					<li>Once baking has started, no modifications can be made.</li>
				</ul>
			</section>

			<section>
				<h2 className="text-2xl font-semibold mb-2">
					6. Allergens & Ingredients
				</h2>
				<p>
					Our cakes may contain allergens such as nuts, dairy, gluten, and soy.
					Please reach out before placing an order if you have any allergies or
					dietary restrictions.
				</p>
			</section>
		</div>
	);
}
