import {pb} from "@/lib/api";
import {ClientResponseError} from "pocketbase";

export type ForgotPasswordState = {
    email: string;
    error: string;
    success: string;
    isLoading: boolean;
};

async function forgotPasswordAction(
    currentState: ForgotPasswordState,
    formData: FormData
) {
    const email = formData.get("email") as string;
    const client = pb();

    try {
        await client.collection("users").requestPasswordReset(email);
        return {
            ...currentState,
            error: "",
            success: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
            isLoading: false,
        };
    } catch (error) {
        if (error instanceof ClientResponseError) {
            let errorMessage: string;
            switch (error.status) {
                case 400:
                    errorMessage = "البريد الإلكتروني غير صحيح";
                    break;
                case 404:
                    errorMessage = "لم يتم العثور على حساب بهذا البريد الإلكتروني";
                    break;
                default:
                    errorMessage =
                        "حدث خطأ أثناء إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.";
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

export default forgotPasswordAction;