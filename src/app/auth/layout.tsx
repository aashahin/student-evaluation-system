import React from "react";

export default function AuthLayout({children}: { children: React.ReactNode }) {
    return (
        <div
            className="min-h-screen bg-gradient-to-bl from-primary/5 via-white to-secondary/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
            <div
                className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-md transition-all duration-500 hover:shadow-xl border border-gray-100">
                {children}
            </div>
        </div>
    )
}