"use client";

import LoginButton from "@/components/LoginButton";
// call

export default function HomePage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
            <div className="space-y-6">
                <h1 className="text-5xl font-bold text-purple-800 font-headline tracking-tight sm:text-6xl md:text-7xl">
                    WelCome Connect Now Taaky Tv
                    <div>&nbsp;</div>
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground mx-auto text-blue-600 sm:text-xl">
                    Experience spontaneous connections. Jump into video calls with people from all over the globe.
                    <div>&nbsp;</div>
                </p>
                <div className="flex flex-col items-center justify-center gap-4">




                    <button className="mb-4 px-6 py-3 bg-blue-500 text-white rounded" >
                        <LoginButton />
                    </button>

                </div>
            </div>
            <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy
            </footer>
        </main>
    );
}
