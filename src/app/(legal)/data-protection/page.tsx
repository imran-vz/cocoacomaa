export default function DataProtectionPolicy() {
	return (
		<div className="max-w-3xl mx-auto px-4 py-10 text-zinc-800 space-y-5 min-h-[calc(100svh-11rem)]">
			<h1 className="text-4xl font-bold mb-6 text-center text-brown-800">
				Data Protection Policy
			</h1>

			<p>
				At <strong>Cocoa Comaa</strong>, we are committed to protecting your
				privacy and ensuring the security of your personal information. This
				Data Protection Policy outlines how we collect, use, and safeguard the
				information you provide to us.
			</p>

			<section>
				<h2 className="text-2xl font-semibold mb-2">
					1. Information We Collect
				</h2>
				<ul className="list-disc list-inside space-y-1">
					<li>
						Name and contact information (email, phone number, delivery
						address).
					</li>
					<li>Order history and preferences.</li>
				</ul>
			</section>

			<section>
				<h2 className="text-2xl font-semibold mb-2">
					2. How We Use Your Information
				</h2>
				<ul className="list-disc list-inside space-y-1">
					<li>To process and fulfill your orders.</li>
					<li>
						To communicate with you regarding your orders or customer support.
					</li>
				</ul>
			</section>

			<section>
				<h2 className="text-2xl font-semibold mb-2">3. Data Sharing</h2>
				<ul className="list-disc list-inside space-y-1">
					<li>
						We do <strong>not sell or rent</strong> your personal information to
						third parties.
					</li>
					<li>
						We may share data with trusted delivery and payment partners solely
						for the purpose of completing your order.
					</li>
				</ul>
			</section>

			<section>
				<h2 className="text-2xl font-semibold mb-2">4. Data Retention</h2>
				<p>
					We retain your information only as long as necessary to fulfill the
					purpose for which it was collected or to comply with legal
					obligations.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-semibold mb-2">5. Your Rights</h2>
				<p>
					You can request to access, correct, or delete your personal
					information.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-semibold mb-2">6. Contact Us</h2>
				<p>
					If you have any questions about this policy or your personal data,
					please contact us at <strong>maria@cocoacomaa.com</strong>.
				</p>
			</section>
		</div>
	);
}
