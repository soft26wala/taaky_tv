// /app/auth/signin/page.tsx
"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Login to your account</h1>
      <button
        onClick={() => signIn("google")}
        className="mb-4 px-6 py-3 bg-red-500 text-white rounded"
      >
        Sign in with Google
      </button>
      <button
        onClick={() => signIn("facebook")}
        className="px-6 py-3 bg-blue-600 text-white rounded"
      >
        Sign in with Facebook
      </button>
    </div>
  );
} 
