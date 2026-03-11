import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";
// biome-ignore lint/correctness/noUnusedImports: React is used for email components
import * as React from "react";

interface PasswordResetProps {
	userName: string;
	resetUrl: string;
}

export default function PasswordResetEmail({
	userName,
	resetUrl,
}: PasswordResetProps) {
	return (
		<Html>
			<Head />
			<Preview>Reset your Cocoa Comaa password</Preview>
			<Tailwind>
				<Body className="bg-gray-50 font-sans">
					<Container className="mx-auto py-8 px-4 max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 my-8">
						{/* Header */}
						<Section className="text-center mb-8">
							<Heading className="text-4xl font-bold text-[#4B2E1E] mb-2 font-serif">
								Cocoa Comaa
							</Heading>
							<Text className="text-gray-500 mb-0 tracking-wide uppercase text-sm">
								Desserts & Delights
							</Text>
						</Section>

						{/* Reset Banner */}
						<Section className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center mb-8">
							<Heading className="text-2xl font-bold text-amber-900 mb-2">
								Reset Your Password
							</Heading>
							<Text className="text-amber-800 text-lg mb-0">
								Hi {userName}!
							</Text>
						</Section>

						{/* Content */}
						<Section className="mb-8 px-4">
							<Text className="text-gray-700 text-base leading-relaxed mb-4">
								We received a request to reset your password for your Cocoa
								Comaa account.
							</Text>
							<Text className="text-gray-700 text-base leading-relaxed mb-6">
								Click the button below to choose a new password:
							</Text>

							<div className="text-center my-8">
								<Button
									href={resetUrl}
									className="bg-[#4B2E1E] text-white font-semibold px-8 py-4 rounded-lg no-underline inline-block text-base"
								>
									Reset Password
								</Button>
							</div>

							<Text className="text-gray-500 text-sm mb-2">
								If the button doesn't work, copy and paste this link into your
								browser:
							</Text>
							<Text className="text-amber-700 text-sm mb-0 break-all">
								<Link href={resetUrl} className="text-amber-700 underline">
									{resetUrl}
								</Link>
							</Text>
						</Section>

						{/* Security Notice */}
						<Section className="mb-8 px-4">
							<div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
								<Text className="text-gray-800 text-sm font-semibold mb-3">
									🔒 Security Notice:
								</Text>
								<Text className="text-gray-600 text-sm mb-2">
									• This link will expire in 1 hour
								</Text>
								<Text className="text-gray-600 text-sm mb-2">
									• If you didn't request a password reset, please ignore this
									email or contact us if you have concerns
								</Text>
								<Text className="text-gray-600 text-sm mb-0">
									• Never share this link with anyone
								</Text>
							</div>
						</Section>

						{/* Contact Information */}
						<Section className="mb-8 px-4">
							<Heading className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
								Need Help?
							</Heading>
							<div className="bg-gray-50 p-5 rounded-xl text-sm">
								<Text className="text-gray-600 mb-2">
									📞 Call us: {process.env.NEXT_PUBLIC_BUSINESS_PHONE}
								</Text>
								<Text className="text-gray-600 mb-2">
									📧 Email us:{" "}
									<Link
										href="mailto:contact@cocoacomaa.com"
										className="text-amber-700 hover:underline"
									>
										contact@cocoacomaa.com
									</Link>
								</Text>
								<Text className="text-gray-600 mb-2">
									💬 WhatsApp:{" "}
									<Link
										href="https://wa.me/918431873579"
										className="text-amber-700 hover:underline"
									>
										Chat with us
									</Link>
								</Text>
								<Text className="text-gray-600 mb-0">
									⏰ Available: Wednesday to Sunday, 9 AM - 6 PM IST
								</Text>
							</div>
						</Section>

						{/* Footer */}
						<Section className="text-center pt-8 border-t border-gray-100">
							<Text className="text-[#4B2E1E] text-lg font-serif italic mb-2">
								Thank you for choosing Cocoa Comaa!
							</Text>
							<Text className="text-gray-500 text-sm mb-4">
								Follow us on{" "}
								<Link
									href="https://www.instagram.com/cocoa_comaa/"
									className="text-amber-700 hover:underline"
								>
									Instagram @cocoa_comaa
								</Link>
							</Text>
						</Section>

						<Hr className="border-gray-100 my-6 mx-4" />
						<Text className="text-center text-gray-400 text-xs mb-4">
							© {new Date().getFullYear()} Cocoa Comaa. All rights reserved.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}
