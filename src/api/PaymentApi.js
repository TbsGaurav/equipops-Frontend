import ApiService from '@/utils/services/ApiService';

export const SubscriptionOrderApi = async (data) => {
    // return await ApiService.post('/org/Payment/create-order', { Amount: 5 }, { authorization: true });
    return await ApiService.post('/org/Payment/create-order', data, { authorization: true });
};

export const PaymentVerifyApi = async (data) => {
    return await ApiService.post('/org/Payment/verify-payment', data, { authorization: true });
};
