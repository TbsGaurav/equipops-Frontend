import { SubscriptionOrderApi, PaymentVerifyApi } from '@/api/PaymentApi';
import { loadRazorpay } from './RazorpayService';
import { setUser } from '@/store/userSlice';
import toast from 'react-hot-toast';
import { RefreshTokenApi } from '@/api/AuthApi';

export const handleRazorpayPayment = async (plan, dispatch, navigate) => {
    // 1️⃣ Load Razorpay SDK
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
        alert('Razorpay SDK failed to load');
        return;
    }

    // 2️⃣ Create Order (send plan info)
    const orderRes = await SubscriptionOrderApi({
        planId: plan.id,
        currency: 'INR'
    });

    const { id: orderId, key, amount, currency } = orderRes.data;

    // 3️⃣ Razorpay Options
    const options = {
        key,
        amount,
        currency,
        name: 'My App',
        description: `${plan.type} Subscription`,
        order_id: orderId,
        handler: async function (response) {
            // 4️⃣ Verify Payment
            await PaymentVerifyApi({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
            });

            const refreshRes = await RefreshTokenApi();
            dispatch(setUser(refreshRes.data));

            toast.success('Subscription Activated Successfully');
            navigate(-1);
        },
        theme: {
            color: '#4f46e5'
        }
    };

    // 5️⃣ Open Razorpay
    const rzp = new window.Razorpay(options);
    rzp.open();
};
