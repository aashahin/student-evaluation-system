import RegisterForm from '@/components/forms/register'
import {Metadata} from 'next'
import Link from "next/link";

export const metadata: Metadata = {
    title: 'إنشاء حساب جديد',
    description: 'صفحة إنشاء حساب جديد',
}

export default function RegisterPage() {
    return (
        <>
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary bg-clip-text">
                    إنشاء حساب جديد
                </h1>
                <h2 className="text-xl font-medium text-gray-600">
                    أنشئ حسابك للوصول إلى جميع الخدمات
                </h2>
                <p className="text-sm text-gray-500">
                    لديك حساب بالفعل؟{' '}
                    <Link
                        href="/auth/login"
                        className="font-medium text-primary hover:text-primary/90 transition-colors duration-200 underline decoration-2 decoration-primary/30 hover:decoration-primary"
                    >
                        تسجيل الدخول
                    </Link>
                </p>
            </div>
            <RegisterForm/>
        </>
    )
}