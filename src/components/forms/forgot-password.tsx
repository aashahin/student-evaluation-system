"use client";

import React from "react";
import {useActionState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Icons} from "@/components/ui/icons";
import {motion, AnimatePresence} from "framer-motion";
import forgotPasswordAction, {ForgotPasswordState} from "@/actions/auth/forgot-password";
import Link from "next/link";

const initialState: ForgotPasswordState = {
    email: "",
    error: "",
    success: "",
    isLoading: false,
};

export default function ForgotPasswordForm() {
    const [state, formAction, isPending] = useActionState(
        forgotPasswordAction,
        initialState
    );

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
        >
            <form action={formAction} className="space-y-6">
                <AnimatePresence>
                    {state.error && (
                        <motion.div
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -10}}
                            className="p-3 rounded-lg bg-red-50 text-red-600 text-sm"
                        >
                            <p>{state.error}</p>
                        </motion.div>
                    )}

                    {state.success && (
                        <motion.div
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -10}}
                            className="p-3 rounded-lg bg-green-50 text-green-600 text-sm"
                        >
                            <p>{state.success}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">
                            البريد الإلكتروني
                        </Label>
                        <div className="relative group">
                            <Icons.mail
                                className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors duration-200"/>
                            <Input
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isPending}
                                required
                                className="pe-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Button
                        className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 transform active:scale-95"
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Icons.spinner className="ms-2 h-4 w-4 animate-spin"/>
                                <span>جاري إرسال رابط إعادة التعيين...</span>
                            </>
                        ) : (
                            "إرسال رابط إعادة التعيين"
                        )}
                    </Button>

                    <div className="text-sm text-center">
                        <Link
                            href="/auth/login"
                            className="font-medium text-gray-600 hover:text-primary transition-colors duration-200 underline decoration-dotted underline-offset-4"
                        >
                            العودة إلى تسجيل الدخول
                        </Link>
                    </div>
                </div>
            </form>
        </motion.div>
    );
}
