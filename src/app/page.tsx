export default function Home() {
	return (
		<main
			className="max-w-7xl min-h-screen mx-auto"
			style={{
				position: "relative",
			}}
		>
			<div
				style={{
					position: "absolute",
					zIndex: -20,
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage:
						"url(https://img1.wsimg.com/isteam/stock/NrG2BY8/:/rs=w:1534,m)",
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			/>
			<div className="absolute inset-0 -z-10 bg-black opacity-30" />

			<div className="flex justify-center items-center py-8">
				<h1 className="text-2xl md:text-xl tracking-[0.2rem] font-medium uppercase text-white mb-4 ">
					Cocoa Comaa
				</h1>
			</div>
			<p className="text-xl text-white mb-6 font-serif">
				Indulge in the finest desserts crafted with love and passion.
			</p>

			<div className="bg-white p-4 font-sans rounded-2xl shadow-lg">
				<span className="text-lg font-semibold text-gray-700">
					Coming Soon...
				</span>
			</div>
		</main>
	);
}
