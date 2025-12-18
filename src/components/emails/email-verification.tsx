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

interface EmailVerificationProps {
	userName: string;
	verificationUrl: string;
}

export default function EmailVerificationEmail({
	userName,
	verificationUrl,
}: EmailVerificationProps) {
	return (
		<Html>
			<Head />
			<Preview>
				Verify your email to complete your Cocoa Comaa registration
			</Preview>
			<Tailwind>
				<Body className="bg-gray-50 font-sans">
					<Container className="mx-auto py-8 px-4 max-w-2xl bg-white">
						{/* Header */}
						<Section className="text-center mb-8">
							<Heading className="text-3xl font-bold text-amber-800 mb-2">
								Cocoa Comaa
							</Heading>
							<Text className="text-gray-600 text-lg mb-0">
								Desserts & Delights
							</Text>
						</Section>

						{/* Verification Banner */}
						<Section className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 text-center mb-8">
							<Heading className="text-2xl font-bold text-blue-700 mb-2">
								📧 Verify Your Email
							</Heading>
							<Text className="text-gray-700 text-lg mb-0">
								Welcome to Cocoa Comaa, {userName}!
							</Text>
						</Section>

						{/* Content */}
						<Section className="mb-8">
							<Text className="text-gray-700 mb-4">
								Thank you for signing up! We're excited to have you join our
								community of dessert lovers.
							</Text>
							<Text className="text-gray-700 mb-4">
								To complete your registration and start ordering delicious
								desserts, please verify your email address by clicking the
								button below:
							</Text>

							<div className="text-center my-8">
								<Button
									href={verificationUrl}
									className="bg-amber-800 text-white font-semibold px-8 py-4 rounded-lg no-underline inline-block"
								>
									Verify Email Address
								</Button>
							</div>

							<Text className="text-gray-600 text-sm mb-4">
								If the button doesn't work, copy and paste this link into your
								browser:
							</Text>
							<Text className="text-blue-600 text-sm mb-0 break-all">
								<Link href={verificationUrl} className="text-blue-600">
									{verificationUrl}
								</Link>
							</Text>
						</Section>

						{/* Security Notice */}
						<Section className="mb-8">
							<div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
								<Text className="text-gray-700 text-sm mb-2">
									🔒 <strong>Security Notice:</strong>
								</Text>
								<Text className="text-gray-700 text-sm mb-2">
									• This link will expire in 24 hours
								</Text>
								<Text className="text-gray-700 text-sm mb-2">
									• If you didn't create an account, please ignore this email
								</Text>
								<Text className="text-gray-700 text-sm mb-0">
									• Never share this link with anyone
								</Text>
							</div>
						</Section>

						{/* Contact Information */}
						<Section className="mb-8">
							<Heading className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-800">
								Need Help?
							</Heading>
							<div className="bg-gray-50 p-4 rounded-lg">
								<Text className="text-gray-700 mb-2">
									📞 Call us: {process.env.NEXT_PUBLIC_BUSINESS_PHONE}
								</Text>
								<Text className="text-gray-700 mb-2">
									📧 Email us:{" "}
									<Link
										href="mailto:contact@cocoacomaa.com"
										className="text-blue-600 no-underline"
									>
										contact@cocoacomaa.com
									</Link>
								</Text>
								<Text className="text-gray-700 mb-2">
									💬 WhatsApp:{" "}
									<Link
										href="https://wa.me/918431873579"
										className="text-green-600 no-underline"
									>
										Chat with us
									</Link>
								</Text>
								<Text className="text-gray-700 mb-0">
									⏰ Available: Wednesday to Sunday, 9 AM - 6 PM IST
								</Text>
							</div>
						</Section>

						{/* Footer */}
						<Section className="text-center pt-6 border-t border-gray-200">
							<Text className="text-amber-800 text-lg font-semibold mb-2">
								Thank you for choosing Cocoa Comaa! 🍰
							</Text>
							<Text className="text-gray-600 text-sm mb-4">
								Follow us on{" "}
								<Link
									href="https://www.instagram.com/cocoa_comaa/"
									className="text-pink-600 no-underline"
								>
									Instagram @cocoa_comaa
								</Link>
							</Text>
						</Section>

						<Hr className="border-gray-300 my-6" />
						<Text className="text-center text-gray-500 text-xs mb-0">
							© 2024 Cocoa Comaa. All rights reserved.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}
