import { Gift } from "lucide-react";
import { useId } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type GiftToggleSectionProps = {
	// biome-ignore lint/suspicious/noExplicitAny: we need to use any here because the form is dynamically generated
	form: UseFormReturn<any>;
};

export function GiftToggleSection({ form }: GiftToggleSectionProps) {
	const giftMyselfId = useId();
	const giftFriendId = useId();

	return (
		<div className="border-t pt-3 sm:pt-4 lg:pt-6">
			<FormField
				control={form.control}
				name="isGift"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-sm sm:text-base lg:text-lg font-semibold flex items-center gap-2">
							<Gift className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0" />
							<span>Who is this order for?</span>
						</FormLabel>
						<FormControl>
							<RadioGroup
								onValueChange={(value) => field.onChange(value === "true")}
								value={field.value ? "true" : "false"}
								className="grid grid-cols-1 sm:grid-cols-2 gap-2"
							>
								<div className="flex items-center space-x-2 p-3 border rounded-lg">
									<RadioGroupItem value="false" id={giftMyselfId} />
									<Label
										htmlFor={giftMyselfId}
										className="text-sm cursor-pointer flex-1"
									>
										For myself
									</Label>
								</div>
								<div className="flex items-center space-x-2 p-3 border rounded-lg">
									<RadioGroupItem value="true" id={giftFriendId} />
									<Label
										htmlFor={giftFriendId}
										className="text-sm cursor-pointer flex-1"
									>
										For a friend (gift)
									</Label>
								</div>
							</RadioGroup>
						</FormControl>
						<FormMessage className="text-xs sm:text-sm" />
					</FormItem>
				)}
			/>
		</div>
	);
}
