import "better-auth/types";

declare module "better-auth/types" {
	interface User {
		role: "customer" | "admin" | "manager";
		phone?: string;
		phoneVerified: boolean;
	}
}
