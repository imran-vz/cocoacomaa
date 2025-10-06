import { CheckCircle, Clock, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderConfirmationLoading() {
	return (
		<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
			<div className="max-w-2xl mx-auto">
				{/* Success Header */}
				<div className="text-center mb-6 sm:mb-8">
					<CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
					<h1 className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
						Order Confirmed!
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base px-2">
						Thank you for your order. We've received your request and will begin
						preparing your delicious desserts.
					</p>
				</div>

				{/* Order Details Card */}
				<Card className="mb-4 sm:mb-6">
					<CardHeader className="pb-4 sm:pb-6">
						<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
							<Clock className="w-4 h-4 sm:w-5 sm:h-5" />
							What happens next?
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="space-y-4 sm:space-y-6">
							<div className="flex items-start gap-3">
								<div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary shrink-0 text-primary-foreground rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm">
									1
								</div>
								<div className="min-w-0 flex-1">
									<h4 className="font-medium text-sm sm:text-base">
										Order Processing
									</h4>
									<p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
										We're preparing your order and will contact you within 2-4
										hours to confirm details and delivery time.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary shrink-0 text-primary-foreground rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm">
									2
								</div>
								<div className="min-w-0 flex-1">
									<h4 className="font-medium text-sm sm:text-base">
										Preparation
									</h4>
									<p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
										Maria and team will begin crafting your desserts with the
										finest ingredients and utmost care.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary shrink-0 text-primary-foreground rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm">
									3
								</div>
								<div className="min-w-0 flex-1">
									<h4 className="font-medium text-sm sm:text-base">
										Ready for Pickup
									</h4>
									<p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
										Your Order will be ready for pickup on your selected date.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Contact Information */}
				<Card className="mb-4 sm:mb-6">
					<CardHeader className="pb-4 sm:pb-6">
						<CardTitle className="text-lg sm:text-xl">Need Help?</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
							<div className="flex items-center gap-3">
								<Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
								<div className="min-w-0">
									<p className="font-medium text-sm sm:text-base">Call Us</p>
									<p className="text-xs sm:text-sm text-muted-foreground">
										{process.env.NEXT_PUBLIC_BUSINESS_PHONE}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
								<div className="min-w-0">
									<p className="font-medium text-sm sm:text-base">Email Us</p>
									<p className="text-xs sm:text-sm text-muted-foreground break-all">
										contact@cocoacomaa.com
									</p>
								</div>
							</div>
						</div>
						<p className="text-xs sm:text-sm text-muted-foreground mt-4">
							Maria and team is available from 9 AM to 6 PM, Wednesday to
							Sunday.
						</p>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center mb-6 sm:mb-8">
					<Button className="w-full sm:w-auto" size="lg">
						Order More Desserts
					</Button>
					<Button variant="outline" className="w-full sm:w-auto" size="lg">
						Back to Home
					</Button>
				</div>

				{/* Additional Info */}
				<div className="text-center p-4 sm:p-6 bg-muted/50 rounded-lg">
					<h3 className="font-semibold mb-2 text-sm sm:text-base">
						Follow us for updates and special offers!
					</h3>
					<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
						Stay connected with Cocoa Comaa on{" "}
						<a
							href="https://www.instagram.com/cocoa_comaa/"
							target="_blank"
							rel="noreferrer"
							className="text-primary underline"
						>
							Instagram
						</a>{" "}
						for the latest desserts and workshops.
					</p>
				</div>
			</div>
		</div>
	);
}
