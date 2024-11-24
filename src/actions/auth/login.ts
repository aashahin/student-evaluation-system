'use server'

import {pb} from "@/lib/api";
import {ClientResponseError} from "pocketbase";

export type LoginState = {
    email: string;
    password: string;
    error: string;
    isLoading: boolean;
    isAuthenticated: boolean;
}

async function loginAction(currentState: LoginState, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const client = pb();

    try {
        const authData = await client
            .collection("users")
            .authWithPassword(email, password);

        if (authData && client.authStore.isValid) {
            return {...currentState, error: "", isLoading: false, isAuthenticated: true};
        } else {
            return {
                ...currentState,
                error: "فشل في تسجيل الدخول. يرجى التحقق من بياناتك.",
                isLoading: false,
            };
        }
    } catch (error) {
        if (error instanceof ClientResponseError) {
            let errorMessage: string;
            switch (error.status) {
                case 400:
                    errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
                    break;
                case 404:
                    errorMessage = "لم يتم العثور على المستخدم";
                    break;
                default:
                    errorMessage = "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.";
            }
            return {...currentState, error: errorMessage, isLoading: false};
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

export default loginAction;