import { AuthOptions } from "next-auth";
// import { AuthOptions } from "../app/auth/signin";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
 
   callbacks: {
        async signIn({ user, account, profile }) {
          // Optional: Perform actions after successful sign-in
          return true; // Allow sign-in
        },
        async redirect({ url, baseUrl }) {
          // Redirect logic after sign-in
          // Example: Redirect to a dashboard page after successful login
          return baseUrl + "/"; 
        },
      },
 
};
