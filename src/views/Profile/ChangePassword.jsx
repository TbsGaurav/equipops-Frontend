import { useState, useMemo } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LuLock, LuEye, LuEyeOff, LuCheck } from 'react-icons/lu';
import InputField from '@/utils/components/ui/InputField';
import useAuth from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { ChangePasswordApi } from '@/api/AuthApi';
import Button from '@/utils/components/ui/Button';
import Alert from '@/utils/components/ui/Alert';

// Validation schema
const schema = yup.object().shape({
    current_password: yup.string().required('Current password is required'),
    new_password: yup
        .string()
        .required('New Password is required')
        .min(6, 'Password must be at least 6 characters long')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/\d/, 'Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    confirm_password: yup
        .string()
        .required('Confirm New Password is required')
        .oneOf([yup.ref('new_password')], 'Passwords must match with New Password')
});

export default function ChangePassword() {
    const { user } = useAuth();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            email: user.email || '',
            current_password: '',
            new_password: '',
            confirm_password: ''
        }
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const newPasswordValue = watch('new_password');

    const mutation = useMutation({ mutationFn: ChangePasswordApi, onSuccess: () => reset() });

    const onSubmit = (data) => {
        const dataObj = {
            email: data.email,
            oldPassword: data.current_password,
            newPassword: data.new_password
        };
        mutation.mutateAsync(dataObj);
    };

    // Simple password strength meter
    const strength = useMemo(() => {
        if (!newPasswordValue) {
            return {
                label: 'Set a strong password',
                color: 'text-gray-400',
                bar: 'w-0 bg-transparent'
            };
        }

        let score = 0;
        if (newPasswordValue.length >= 6) score++;
        if (/[A-Z]/.test(newPasswordValue)) score++;
        if (/[a-z]/.test(newPasswordValue)) score++;
        if (/\d/.test(newPasswordValue)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(newPasswordValue)) score++;

        if (score <= 2) {
            return {
                label: 'Weak',
                color: 'text-red-500',
                bar: 'w-1/3 bg-red-400'
            };
        }

        if (score === 3 || score === 4) {
            return {
                label: 'Medium',
                color: 'text-amber-500',
                bar: 'w-2/3 bg-amber-400'
            };
        }

        return {
            label: 'Strong',
            color: 'text-emerald-500',
            bar: 'w-full bg-emerald-400'
        };
    }, [newPasswordValue]);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm px-5 sm:px-7 lg:px-9 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.4fr] gap-8">
                    {/* LEFT: Info / helper text */}
                    <section className="flex flex-col gap-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 w-max text-[11px] font-medium text-indigo-700">
                            <LuLock className="text-sm" />
                            Account Security
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Change your password</h1>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Keep your account secure by using a strong, unique password. Avoid reusing passwords from other sites and
                                update it regularly if you notice any unusual activity.
                            </p>
                        </div>

                        <div className="mt-2 space-y-2 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                                <LuCheck className="mt-0.5 text-emerald-500" />
                                <span>At least 8 characters with upper &amp; lowercase letters</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <LuCheck className="mt-0.5 text-emerald-500" />
                                <span>Include at least one number and one special character</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <LuCheck className="mt-0.5 text-emerald-500" />
                                <span>Never share your password with anyone</span>
                            </div>
                        </div>
                    </section>
                    {mutation.isError && (
                        <Alert.Error>{mutation.error?.response?.data?.message || 'Failed to change password.'}</Alert.Error>
                    )}
                    {mutation.isSuccess && (
                        <Alert.Success>{mutation.data?.data?.message || 'Password changed successfully.'}</Alert.Success>
                    )}
                    {/* RIGHT: Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <div className="space-y-4">
                            {/* Current password */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-800">Current Password</label>
                                <div className="relative">
                                    <InputField
                                        type={showCurrent ? 'text' : 'password'}
                                        {...register('current_password')}
                                        error={errors.current_password}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent((v) => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 text-sm"
                                        tabIndex={-1}
                                    >
                                        {showCurrent ? <LuEyeOff /> : <LuEye />}
                                    </button>
                                </div>
                                {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password.message}</p>}
                            </div>

                            {/* New password */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-800">New Password</label>
                                <div className="relative">
                                    <InputField
                                        type={showNew ? 'text' : 'password'}
                                        {...register('new_password')}
                                        error={errors.new_password}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew((v) => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 text-sm"
                                        tabIndex={-1}
                                    >
                                        {showNew ? <LuEyeOff /> : <LuEye />}
                                    </button>
                                </div>
                                {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>}

                                {/* Strength meter */}
                                <div className="mt-2 space-y-1">
                                    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                                        <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.bar}`} />
                                    </div>
                                    <p className={`text-[11px] font-medium ${strength.color}`}>{strength.label}</p>
                                </div>
                            </div>

                            {/* Confirm new password */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-800">Confirm New Password</label>
                                <div className="relative">
                                    <InputField
                                        type={showConfirm ? 'text' : 'password'}
                                        {...register('confirm_password')}
                                        error={errors.confirm_password}
                                        placeholder="Re-enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 text-sm"
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <LuEyeOff /> : <LuEye />}
                                    </button>
                                </div>
                                {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-2">
                            <Button type="submit" loading={mutation.isPending} disabled={mutation.isPending}>
                                {mutation.isPending ? 'Saving...' : 'Save changes'}
                            </Button>
                            <p className="text-[11px] sm:text-xs text-gray-500">
                                You may be logged out on other devices after changing your password.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
