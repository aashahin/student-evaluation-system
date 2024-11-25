'use server';

import {pb} from "@/lib/api";
import {ClientResponseError} from "pocketbase";
import {cookies} from "next/headers";

export type RegisterState = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    error: string;
    isLoading: boolean;
    isRegistered: boolean;
};

async function registerAction(currentState: RegisterState, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const role = formData.get("role") as string;
    const client = pb();

    // Validation
    if (password !== confirmPassword) {
        return {
            ...currentState,
            error: "كلمات المرور غير متطابقة",
            isLoading: false,
        };
    }

    try {
        const userData = {
            name,
            email,
            password,
            passwordConfirm: confirmPassword,
            role: role === "admin" ? "student" : role,
        };

        const record = await client.collection("users").create(userData);
        await client.collection("users").authWithPassword(email, password);

        if (record && client.authStore.isValid) {
            const token = client.authStore.exportToCookie({
                httpOnly: false,
                secure: process.env.NODE_ENV === "production"
            });
            const cookieStore = await cookies();
            cookieStore.set('pb_auth', token);
            return { ...currentState, error: "", isLoading: false, isRegistered: true };
        } else {
            return {
                ...currentState,
                error: "فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.",
                isLoading: false,
            };
        }
    } catch (error) {
        if (error instanceof ClientResponseError) {
            let errorMessage: string;
            switch (error.status) {
                case 400:
                    errorMessage = "البيانات المدخلة غير صحيحة";
                    break;
                case 409:
                    errorMessage = "البريد الإلكتروني مستخدم بالفعل";
                    break;
                default:
                    errorMessage = "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.";
            }
            return { ...currentState, error: errorMessage, isLoading: false };
        } else {
            console.error("Unexpected error:", error);
            return {
                ...currentState,
                error: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.",
                isLoading: false,
            };
        }
    }
}

export default registerAction;