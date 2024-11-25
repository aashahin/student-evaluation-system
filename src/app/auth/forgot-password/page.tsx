import ForgotPasswordForm from '@/components/forms/forgot-password'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'نسيت كلمة المرور',
    description: 'صفحة استعادة كلمة المرور',
}

export default function ForgotPasswordPage() {
    return (
        <>
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary bg-clip-text">
                    نسيت كلمة المرور؟
                </h1>
                <h2 className="text-xl font-medium text-gray-600">
                    استعد كلمة المرور الخاصة بك
                </h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                    أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك
                </p>
            </div>
            <ForgotPasswordForm />
        </>
    )
}
