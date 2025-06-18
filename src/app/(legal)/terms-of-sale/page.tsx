export default function TermsOfSale() {
	return (
		<div className="max-w-3xl mx-auto px-4 py-10 text-zinc-800 min-h-[calc(100svh-11rem)]">
			<h1 className="text-4xl font-bold mb-6 text-center text-brown-800">
				Terms of Sale
			</h1>

			<p className="mb-4">
				These Terms of Sale apply to all purchases made on the Cocoa Comaa
				website. By placing an order, you agree to the terms outlined below.
			</p>

			<section className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">1. Product Availability</h2>
				<p>
					All products are subject to availability. We reserve the right to
					limit quantities or discontinue products without prior notice.
				</p>
			</section>

			<section className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">2. Order Confirmation</h2>
				<ul className="list-disc list-inside space-y-1">
					<li>All orders are confirmed upon receipt of full payment.</li>
					<li>
						Order details and delivery date are confirmed via email or SMS.
					</li>
				</ul>
			</section>

			<section className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">3. Pricing & Payment</h2>
				<ul className="list-disc list-inside space-y-1">
					<li>
						All prices listed are in INR and inclusive of applicable taxes.
					</li>
					<li>
						Payments are accepted through approved online payment gateways only.
					</li>
					<li>
						Cocoa Comaa reserves the right to change prices at any time without
						notice.
					</li>
				</ul>
			</section>

			<section className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">4. Delivery & Pickup</h2>
				<ul className="list-disc list-inside space-y-1">
					<li>Orders are delivered on the date selected during checkout.</li>
					<li>
						Delivery may take 2-4 working days depending on location and
						logistics partner.
					</li>
					<li>
						Customers opting for pickup must arrive within the selected time
						slot.
					</li>
				</ul>
			</section>

			<section className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">5. No Refund Policy</h2>
				<p>
					All sales are final. Due to the perishable and customized nature of
					our products, we do not offer refunds once an order has been placed
					and confirmed.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-semibold mb-2">6. Contact Us</h2>
				<p>
					If you have any questions regarding these Terms of Sale, contact us at{" "}
					<strong>contact@cocoacomaa.com</strong>.
				</p>
			</section>
		</div>
	);
}
