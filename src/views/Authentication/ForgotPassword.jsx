import { ForgotPasswordApi } from '@/api/AuthApi';
import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router';
import Toast from '@/utils/toast';

/**
 * ForgotPassword validation schema
 */
const ValidationSchema = yup.object({
    email: yup.string().required('Email is required').email('Enter a valid email')
});

const ForgotPassword = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(ValidationSchema)
    });

    const mutation = useMutation({
        mutationFn: ForgotPasswordApi,
        onSuccess: (res) => {
            Toast.success(res?.message || 'Password reset link sent to your email');
            navigate('/login');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Something went wrong';
            Toast.error(errorMessage);
        }
    });

    const submitFC = (data) => {
        mutation.mutate(data);
    };

    return (
        <div className="border border-gray-200 shadow-md p-5 rounded-lg flex flex-col gap-3 items-center">
            {/* Logo */}
            <img src="/company-logo.png" className="w-48 mx-auto my-4" alt="company logo" />
            <p className="font-semibold text-lg">Forgot Password</p>
            <p className="text-sm text-gray-600 text-center mb-2">Enter your email to receive a password reset link</p>

            {/* {mutation.isError && <Alert.Error>{mutation.error?.response?.data?.message || 'Failed to send reset link'}</Alert.Error>} */}

            <form className="w-96 flex flex-col gap-4" onSubmit={handleSubmit(submitFC)}>
                <div className="text-sm">
                    <label className="font-medium">Email</label>
                    <InputField
                        {...register('email')}
                        size="small"
                        type="email"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        placeholder="Enter your email"
                        error={!!errors.email}
                    />
                    {errors.email && <span className="text-error text-xs mt-1 block">{errors.email.message}</span>}
                </div>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="w-full"
                    disabled={mutation.isPending}
                    loading={mutation.isPending}
                >
                    {mutation.isPending ? 'Sending...' : 'Send Reset Link'}
                </Button>
            </form>

            <p className="text-sm pb-3.5 text-center">
                {`Remember your password? `}
                <NavLink to="/login" className="text-sm text-primary-dark font-medium hover:underline">
                    Log In
                </NavLink>
            </p>
        </div>
    );
};

export default ForgotPassword;
// ...existing code...
