"use client";

import React from "react";
import {useActionState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Icons} from "@/components/ui/icons";
import {motion, AnimatePresence} from "framer-motion";
import {useRouter} from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import registerAction, {RegisterState} from "@/actions/auth/register";

const initialState: RegisterState = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    error: "",
    isLoading: false,
    isRegistered: false,
};

export default function RegisterForm() {
    const [state, formAction, isPending] = useActionState(
        registerAction,
        initialState
    );
    const router = useRouter();

    React.useEffect(() => {
        if (state.isRegistered) {
            router.push("/");
        }
    }, [state.isRegistered, router]);

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
                </AnimatePresence>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                            الاسم
                        </Label>
                        <div className="relative group">
                            <Icons.user
                                className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors duration-200"/>
                            <Input
                                id="name"
                                name="name"
                                placeholder="الاسم الكامل"
                                type="text"
                                disabled={isPending}
                                required
                                className="pe-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                            />
                        </div>
                    </div>

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

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 font-medium">
                            كلمة المرور
                        </Label>
                        <div className="relative group">
                            <Icons.lock
                                className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors duration-200"/>
                            <Input
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                type="password"
                                autoCapitalize="none"
                                disabled={isPending}
                                required
                                className="pe-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                            تأكيد كلمة المرور
                        </Label>
                        <div className="relative group">
                            <Icons.lock
                                className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors duration-200"/>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="••••••••"
                                type="password"
                                autoCapitalize="none"
                                disabled={isPending}
                                required
                                className="pe-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-700 font-medium">
                            نوع الحساب
                        </Label>
                        <Select name="role" required>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر نوع الحساب"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">طالب</SelectItem>
                                <SelectItem value="teacher">معلم</SelectItem>
                                <SelectItem value="parent">ولي أمر</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 transform active:scale-95"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Icons.spinner className="ms-2 h-4 w-4 animate-spin"/>
                            <span>جاري إنشاء الحساب...</span>
                        </>
                    ) : (
                        "إنشاء حساب"
                    )}
                </Button>
            </form>
        </motion.div>
    );
}
