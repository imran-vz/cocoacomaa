import WhatsAppIcon from "@/components/icon/whatsapp";
import InstagramIcon from "@/components/icon/instagram";

export default function ContactUs() {
	return (
		<div className="max-w-2xl min-h-[calc(100svh-11rem)] mx-auto px-4 py-10 text-zinc-800">
			<h1 className="text-4xl font-bold mb-6 text-center text-brown-800">
				Contact Us
			</h1>

			<p className="mb-6 text-lg">
				We'd love to hear from you! Whether you have a question about your
				order, need assistance with a custom cake request, or just want to say
				hello - feel free to reach out.
			</p>

			<div className="space-y-4">
				<div>
					<h2 className="text-xl font-semibold">Email</h2>
					<p className="text-brown-700">maria@cocoacomaa.com</p>
				</div>

				<div>
					<h2 className="text-xl font-semibold">Phone / WhatsApp</h2>
					<p className="text-brown-700">+91 84318 73579</p>
					<div className="flex items-center gap-2">
						<WhatsAppIcon className="w-5 h-5" />
						<a
							href="https://wa.me/918431873579"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block mt-1 text-green-600 underline hover:text-green-800"
						>
							Chat with us on WhatsApp
						</a>
					</div>
				</div>

				<div>
					<h2 className="text-xl font-semibold">Instagram</h2>
					<div className="flex items-center gap-2">
						<InstagramIcon className="w-5 h-5 text-pink-600" />
						<a
							href="https://www.instagram.com/cocoa_comaa/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block mt-1 text-pink-600 underline hover:text-pink-800"
						>
							@cocoa_comaa
						</a>
					</div>
				</div>

				<div>
					<h2 className="text-xl font-semibold">Business Hours</h2>
					<p className="text-brown-700">Wednesday to Sunday, 9 AM - 6 PM IST</p>
				</div>
			</div>
		</div>
	);
}
