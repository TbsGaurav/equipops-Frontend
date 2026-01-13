import { LoginApi } from '@/api/AuthApi';
import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router';
import cookie from 'react-cookies';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/userSlice';
import Alert from '@/utils/components/ui/Alert';
import Toast from '@/utils/toast';

const ValidationSchema = yup.object({
    email: yup.string().required('Email is required').email('Enter a valid email'),
    password: yup.string().required('Password is required')
    // .min(6, 'Password must be at least 6 characters')
});

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({ resolver: yupResolver(ValidationSchema) });

    const mutation = useMutation({ mutationFn: LoginApi });

    function SubmitFC(data) {
        mutation.mutateAsync(data).then((res) => {
            const { data } = res;
            const firstName = data.fullName?.trim().split(/\s+/)[0] || 'User';

            cookie.save('accessKey', data.token, {
                secure: false,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 365 * 30
            });
            delete data.token;

            dispatch(setUser(data));
            Toast.success(`Welcome back, ${firstName}!`);

            navigate('/dashboard');
        });
    }

    return (
        <div className="border border-gray-200 shadow-md p-5 rounded-lg flex flex-col gap-3 items-center">
            {/* Logo */}
            <img src="/company-logo.png" className="w-48 mx-auto my-4" />
            <p className="font-semibold text-lg">Login to your account</p>
            {mutation.isError && <Alert.Error>{mutation.error?.response?.data?.message || 'Failed to send reset link'}</Alert.Error>}
            <form className="w-96 flex flex-col gap-4" onSubmit={handleSubmit(SubmitFC)}>
                <div className="text-sm">
                    <label className="font-medium">Email</label>
                    <InputField
                        {...register('email')}
                        size="small"
                        type="email"
                        className="w-full mt-1 p-2"
                        placeholder="Email"
                        error={Boolean(errors.email)}
                    />
                    {Boolean(errors.email) && <p className="text-error font-medium pl-1">{errors.email.message}</p>}
                </div>
                <div className="text-sm">
                    <label className="font-medium">Password</label>
                    <InputField
                        {...register('password')}
                        size="small"
                        type="password"
                        className="w-full mt-1 p-2"
                        placeholder="Password"
                        error={Boolean(errors.password)}
                    />
                    {Boolean(errors.password) && <p className="text-error font-medium pl-1">{errors.password.message}</p>}
                    <p className="text-end text-sm py-1 text-primary-dark font-medium">
                        <NavLink to="/forgot-password">Forgot Password?</NavLink>
                    </p>
                </div>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="w-full"
                    disabled={mutation.isPending}
                    loading={mutation.isPending}
                >
                    Login
                </Button>
            </form>
            <p className="text-sm pb-3.5 text-center">
                {`Don't have an account? `}
                <NavLink to="/registration" className="text-sm text-primary-dark font-medium">
                    Register
                </NavLink>
            </p>
        </div>
    );
};

export default Login;
