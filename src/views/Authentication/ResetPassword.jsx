import { ResetPasswordApi } from '@/api/AuthApi';
import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate, useParams } from 'react-router';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Toast from '@/utils/toast';

/**
 * ResetPassword validation schema
 */
const ValidationSchema = yup.object({
    newPassword: yup.string().required('New password is required'),
    // .min(6, 'Password must be at least 6 characters')
    // .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    // .matches(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: yup
        .string()
        .required('Confirm password is required')
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
});

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(ValidationSchema)
    });

    const mutation = useMutation({
        mutationFn: ResetPasswordApi,
        onSuccess: (res) => {
            Toast.success(res?.message || 'Password reset successful');
            navigate('/login');
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reset password';
            Toast.error(errorMessage);
        }
    });

    const submitFC = (data) => {
        mutation.mutate({ token, ...data });
    };

    return (
        <div className="border border-gray-200 shadow-md p-5 rounded-lg flex flex-col gap-3 items-center">
            {/* Logo */}
            <img src="/company-logo.png" className="w-48 mx-auto my-4" alt="company logo" />
            <p className="font-semibold text-lg">Reset Password</p>
            {/* {mutation.isError && <Alert.Error>{mutation.error?.response?.data?.message || 'Failed to send reset link'}</Alert.Error>} */}
            <form className="w-96 flex flex-col gap-4" onSubmit={handleSubmit(submitFC)}>
                <div className="text-sm">
                    <label className="font-medium">New Password</label>
                    <InputField
                        {...register('newPassword')}
                        size="small"
                        type="password"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        placeholder="New Password"
                        error={!!errors.newPassword}
                    />
                    {errors.newPassword && <p className="text-error font-medium pl-1">{errors.newPassword.message}</p>}
                </div>

                <div className="text-sm">
                    <label className="font-medium">Confirm Password</label>
                    <InputField
                        {...register('confirmPassword')}
                        size="small"
                        type="password"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        placeholder="Confirm Password"
                        error={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && <p className="text-error font-medium pl-1">{errors.confirmPassword.message}</p>}
                </div>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="w-full"
                    disabled={mutation.isPending}
                    loading={mutation.isPending}
                >
                    Submit
                </Button>
            </form>
            <p className="text-sm pb-3.5 text-center">
                {`Remember your password? `}
                <NavLink to="/login" className="text-sm text-primary-dark font-medium">
                    Log In
                </NavLink>
            </p>
        </div>
    );
};

export default ResetPassword;
// ...existing code...
