import { Navbar } from "@/components/Navbar";
import { DessertCard } from "@/components/DessertCard";
import { CartProvider } from "@/providers/CartProvider";

const desserts = [
	{
		id: 1,
		name: "Chocolate Cake",
		price: 5.99,
		image: "/placeholder.svg?height=200&width=200",
	},
	{
		id: 2,
		name: "Strawberry Cheesecake",
		price: 6.99,
		image: "/placeholder.svg?height=200&width=200",
	},
	{
		id: 3,
		name: "Vanilla Ice Cream",
		price: 3.99,
		image: "/placeholder.svg?height=200&width=200",
	},
	{
		id: 4,
		name: "Apple Pie",
		price: 4.99,
		image: "/placeholder.svg?height=200&width=200",
	},
];

export default function Home() {
	return (
		<CartProvider>
			<div className="min-h-screen bg-gray-100">
				<Navbar />
				<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
					<div className="px-4 py-6 sm:px-0">
						<h1 className="text-3xl font-bold text-gray-900 mb-6">
							Our Desserts
						</h1>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{desserts.map((dessert) => (
								<DessertCard key={dessert.id} {...dessert} />
							))}
						</div>
					</div>
				</main>
			</div>
		</CartProvider>
	);
}
