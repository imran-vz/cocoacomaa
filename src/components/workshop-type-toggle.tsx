import type { Workshop } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export default function WorkshopTypeToggle({
	value,
	onChange,
}: {
	value: Workshop["type"];
	onChange: (type: Workshop["type"]) => void;
}) {
	return (
		<div className="flex justify-center mb-6">
			<div className="relative inline-flex rounded-full border border-gray-300 p-1 w-fit">
				<button
					type="button"
					onClick={() => {
						onChange("online");
					}}
					className={cn(
						"py-2 px-6 text-center rounded-full font-medium transition-all z-10 text-sm",
						value === "online" ? "text-white" : "text-primary",
					)}
				>
					ONLINE
				</button>
				<button
					type="button"
					onClick={() => {
						onChange("offline");
					}}
					className={cn(
						"py-2 px-6 text-center rounded-full font-medium transition-all z-10 text-sm",
						value === "offline" ? "text-white" : "text-primary",
					)}
				>
					OFFLINE
				</button>
				<div
					className={cn(
						"absolute top-1 bottom-1 rounded-full bg-primary transition-all duration-200 ease-in-out",
						value === "online" ? "left-1 right-[50%]" : "left-[50%] right-1",
					)}
				/>
			</div>
		</div>
	);
}
