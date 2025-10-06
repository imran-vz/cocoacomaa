export default function SpecialsLoading() {
	return (
		<div className="container mx-auto p-4 sm:p-6">
			<div className="max-w-6xl mx-auto">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }, (_, i) => (
							<div
								key={`loading-special-${Math.random()}-${i}`}
								className="h-96 bg-gray-200 rounded-lg"
							></div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
