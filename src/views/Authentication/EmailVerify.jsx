import { useParams, NavLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import Alert from '@/utils/components/ui/Alert';
import Button from '@/utils/components/ui/Button';
import { VerifyEmailApi } from '@/api/AuthApi';
import { FaEnvelope, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

const EmailVerify = () => {
    const { token } = useParams();

    const { isLoading, isSuccess, isError, error } = useQuery({
        queryKey: ['verify-email', token],
        queryFn: () => VerifyEmailApi({ token }),
        retry: false
    });

    return (
        <div className="border border-gray-200 shadow-lg p-8 rounded-xl flex flex-col items-center text-center gap-5 w-[420px]">
            {/* Logo */}
            <img src="/company-logo.png" className="w-44 mx-auto" />

            {/* ===== VERIFYING ===== */}
            {isLoading && (
                <>
                    {/* Animated Orb */}
                    <div className="relative mt-4">
                        <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" />
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaEnvelope className="w-10 h-10 text-primary animate-bounce" />
                        </div>
                    </div>

                    <p className="text-lg font-semibold">Verifying your email</p>

                    <p className="text-sm text-gray-600 max-w-sm">
                        We’re securely validating your email address. This will only take a moment…
                    </p>

                    <div className="flex gap-2 text-xs text-gray-400 mt-1">
                        <span>🔒 Secure</span>
                        <span>•</span>
                        <span>⚡ Fast</span>
                        <span>•</span>
                        <span>✅ One-time check</span>
                    </div>
                </>
            )}

            {/* ===== SUCCESS ===== */}
            {isSuccess && (
                <>
                    <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
                        <FaCheckCircle className="w-12 h-12 text-success" />
                    </div>

                    <p className="text-lg font-semibold text-success">Email verified successfully</p>

                    <p className="text-sm text-gray-600 max-w-sm">Your email is now verified. You can safely access your account.</p>

                    <NavLink to="/login" className="w-full">
                        <Button variant="contained" color="primary" className="w-full mt-3">
                            Continue to Login
                        </Button>
                    </NavLink>
                </>
            )}

            {/* ===== ERROR ===== */}
            {isError && (
                <>
                    <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center">
                        <FaShieldAlt className="w-12 h-12 text-error" />
                    </div>

                    <Alert.Error className="w-full">
                        {error?.response?.data?.message || 'This verification link is invalid or has expired.'}
                    </Alert.Error>

                    <p className="text-sm text-gray-600">Please request a new verification email.</p>

                    <p className="text-sm pb-3.5 text-center">
                        {`Back to `}
                        <NavLink to="/login" className="text-sm text-primary-dark font-medium">
                            Login
                        </NavLink>
                    </p>
                </>
            )}
        </div>
    );
};

export default EmailVerify;
