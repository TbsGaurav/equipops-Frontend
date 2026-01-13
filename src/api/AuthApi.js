import ApiService from '@/utils/services/ApiService';

export const TestApi = async () => {
    return await ApiService.get('/products/test1', null, { authorization: false });
};

export const LoginApi = async (data) => {
    return await ApiService.post('/Auth/login', data, { authorization: false });
};

export const LogoutApi = async (data) => {
    return await ApiService.post('/Auth/logout', data, { authorization: true });
};
export const ChangePasswordApi = async (data) => {
    return await ApiService.post('/Auth/change-password', data, { authorization: true });
};

export const ForgotPasswordApi = async (data) => {
    return await ApiService.post('/Auth/forgot-password', data, { authorization: false });
};

export const ResetPasswordApi = async (data) => {
    return await ApiService.post('/Auth/reset-password', data, { authorization: false });
};

export const VerifyEmailApi = async (data) => {
    return await ApiService.post('/org/Organization/verify-email', data, { authorization: false });
};

export const RefreshTokenApi = async (data) => {
    return await ApiService.post('/Auth/refresh-token', data, { authorization: true });
};
