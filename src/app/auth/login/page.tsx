import LoginForm from '@/components/forms/login'
import {Metadata} from 'next'
import Link from "next/link";

export const metadata: Metadata = {
    title: 'تسجيل الدخول',
    description: 'صفحة تسجيل الدخول',
}

export default function LoginPage() {
    return (
        <>
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary bg-clip-text">
                    مرحباً بك
                </h1>
                <h2 className="text-xl font-medium text-gray-600">
                    تسجيل الدخول إلى حسابك
                </h2>
                <p className="text-sm text-gray-500">
                    ليس لديك حساب؟{' '}
                    <Link href="/auth/register"
                          className="font-medium text-primary hover:text-primary/90 transition-colors duration-200 underline decoration-2 decoration-primary/30 hover:decoration-primary">
                        سجل الآن
                    </Link>
                </p>
            </div>
            <LoginForm/>
        </>
    )
}
