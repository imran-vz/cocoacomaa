import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const { auth, handlers, signIn, signOut } = NextAuth(authOptions);

export { auth, handlers, signIn, signOut };
