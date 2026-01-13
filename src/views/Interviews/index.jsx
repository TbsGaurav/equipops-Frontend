// import { IoCopyOutline } from 'react-icons/io5';
import { MdArrowOutward, MdEdit } from 'react-icons/md';
import { FiPlusCircle } from 'react-icons/fi';
import Model from '@/utils/components/Model';
import { useState } from 'react';
import { useNavigate } from 'react-router'; // ✅ more standard than 'react-router'
import CreateInterview from './CreateInterview/Index';
import { cn } from '@/utils/Utils';
import { useQuery } from '@tanstack/react-query';
import { InterviewListApi } from '@/api/InterviewApi';
import { useTranslate } from '@/hooks/useTranslate';
import InviteCandidateForm from './InviteCandidateForm';
import { RotatingLines } from 'react-loader-spinner';
// import { PaymentVerifyApi, SubscriptionOrderApi } from '@/api/PaymentApi';
// import { loadRazorpay } from '@/utils/RazorpayService';
import { useSelector } from 'react-redux';
import { SubscriptionTypesApi } from '@/api/SettingApi';
import SubscriptionTypes from '@/utils/components/SubscriptionTypes';

const CardBgColors = ['bg-blue-300/40', 'bg-green-700/25', 'bg-amber-800/25', 'bg-fuchsia-700/25', 'bg-orange-200/70', 'bg-indigo-500/25'];

const Interviews = () => {
    const [popup, setPopup] = useState(false);
    const [mailPopup, setMailPopup] = useState(null);
    const navigate = useNavigate();
    const [subscriptionPopup, setSubscriptionPopup] = useState(false);

    const DetailHandler = (item) => {
        navigate(`/job/detail/${item.id}`);
    };

    const { data, isFetching } = useQuery({
        queryKey: ['interview-list'],
        queryFn: () => InterviewListApi({ page: 1, length: 10, orderColumn: 'name', orderDirection: 'Asc' })
    });

    const { data: subscriptionTypes } = useQuery({
        queryKey: ['subscription-types'],
        queryFn: () => SubscriptionTypesApi()
    });

    const plans = subscriptionTypes?.data?.subscriptionTypeData || [];

    const interviewData = data?.data?.interviewData || [];

    const { t } = useTranslate();

    const subscription = useSelector((state) => state.user.subscription);

    return (
        <>
            {isFetching ? (
                <div className="flex items-center justify-center py-20">
                    <RotatingLines
                        visible={true}
                        height="1.5em"
                        width="1.5em"
                        color="currentColor"
                        strokeWidth="5"
                        animationDuration="0.75"
                        ariaLabel="loading-interviewers"
                    />
                    <span className="ml-3 text-gray-600 text-sm">Loading Jobs...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {/* Create Interview Card */}

                    <div
                        onClick={(e) => {
                            if (!subscription || subscription.length === 0) {
                                e.preventDefault();
                                setSubscriptionPopup(true);
                                return;
                            }
                            // if (subscription.isExpired) {
                            //     e.preventDefault();
                            //     setSubscriptionPopup(true);
                            //     return;
                            // }
                            navigate('/job/create');
                        }}
                        className={cn(
                            'flex flex-col rounded-2xl group cursor-pointer',
                            'border border-dashed border-indigo-300/70 bg-indigo-50/60',
                            'shadow-sm hover:shadow-xl hover:border-indigo-400 hover:bg-indigo-50',
                            'transition-all duration-300'
                        )}
                    >
                        <div className="flex-1 flex items-center justify-center relative rounded-t-2xl">
                            {/* subtle gradient background */}
                            <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-br from-indigo-100 via-indigo-50 to-white opacity-80" />

                            <div className="relative flex flex-col items-center gap-3 py-10">
                                <div className="flex items-center justify-center rounded-full bg-white shadow-md w-16 h-16 group-hover:shadow-lg group-hover:scale-105 transition-all">
                                    <FiPlusCircle className="w-8 h-8 text-indigo-600" />
                                </div>
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-500">{t('create_job_btn')}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center rounded-b-2xl bg-white/80 px-4 py-4">
                            <span className="text-sm font-semibold text-indigo-700 group-hover:text-indigo-900">{t('create_job')}</span>
                        </div>
                    </div>

                    {/* <TestRazorpayLoad /> */}

                    {/* Interview Cards */}
                    {interviewData.map((item, index) => (
                        <div
                            key={item.id}
                            className={cn(
                                'flex flex-col rounded-2xl group cursor-pointer',
                                'shadow-sm hover:shadow-2xl hover:scale-[1.02]',
                                'transition-all duration-300 border border-gray-100 overflow-hidden',
                                CardBgColors[index % CardBgColors.length]
                            )}
                            onClick={() => DetailHandler(item)}
                        >
                            <div className="relative flex-1 flex items-center justify-center rounded-t-2xl overflow-hidden">
                                {/* Image */}
                                <img
                                    src={`./interview${(index % 6) + 1}.png`}
                                    alt={item.name}
                                    className="w-full h-40 md:h-44 lg:h-48 object-contain object-center p-3 transition-all duration-300 group-hover:scale-105 group-hover:opacity-90"
                                />

                                {/* Overlay gradient */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Top right actions */}
                                <div className="absolute top-3 right-3 flex gap-2 z-10">
                                    <button
                                        className="p-2 rounded-full bg-white/90 text-indigo-600 opacity-0 group-hover:opacity-100 hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/job/edit/${item.id}`);
                                        }}
                                        aria-label={t('edit_interview_title')}
                                    >
                                        <MdEdit className="w-4 h-4" />
                                    </button>

                                    <button
                                        className="p-2 rounded-full bg-white/90 text-indigo-600 opacity-0 group-hover:opacity-100 hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMailPopup(item.id);
                                        }}
                                        aria-label={t('share_interview_link')}
                                    >
                                        <MdArrowOutward className="w-4 h-4" />
                                    </button>

                                    {/* <button
                                className="p-2 rounded-full bg-white/90 text-indigo-600 opacity-0 group-hover:opacity-100 hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/call/${item.id}`);
                                }}
                                aria-label={t('start_call')}
                            >
                                <FiPhoneCall className="w-4 h-4" />
                            </button> */}
                                </div>
                            </div>

                            {/* Bottom content */}
                            <div className="flex items-center justify-between gap-3 rounded-b-2xl bg-white/90 px-4 py-3">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</span>
                                    <span className="text-[11px] text-gray-500 mt-0.5">{t('click_to_view_interview_details')}</span>
                                </div>

                                <span className="flex items-center justify-center bg-indigo-500 text-white rounded-full w-8 aspect-square text-xs font-semibold shrink-0 shadow-sm">
                                    {item.candidate_Count}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Create Interview Modal */}
                    {popup && (
                        <Model title={t('create_interview_title')} onClose={() => setPopup(false)}>
                            <CreateInterview />
                        </Model>
                    )}

                    {/* Email Modal */}
                    {mailPopup && (
                        <Model title={t('interview_invitation')} onClose={() => setMailPopup(null)}>
                            <InviteCandidateForm interviewId={mailPopup} onClose={() => setMailPopup(null)} />
                        </Model>
                    )}

                    {/* Subscription Types Model */}
                    {subscriptionPopup && (
                        <Model title="Subscriptions" onClose={() => setSubscriptionPopup(false)}>
                            <SubscriptionTypes plans={plans} onClose={() => setSubscriptionPopup(false)} />
                        </Model>
                    )}
                </div>
            )}
        </>
    );
};

export default Interviews;

// const TestRazorpayLoad = () => {
//     const handlePayment = async () => {
//         const isLoaded = await loadRazorpay();

//         if (!isLoaded) {
//             alert('Razorpay SDK failed to load');
//             return;
//         }

//         // 1️⃣ Create Order
//         const orderRes = await SubscriptionOrderApi({});

//         const { id: orderId, key, amount, currency } = orderRes.data;

//         // 2️⃣ Open Razorpay
//         const options = {
//             key,
//             amount: amount,
//             currency,
//             name: 'My App',
//             description: 'Test Payment',
//             order_id: orderId,
//             remember_customer: true,
//             handler: async function (response) {
//                 console.log('payment Response', response);
//                 await PaymentVerifyApi({
//                     orderId: response.razorpay_order_id,
//                     paymentId: response.razorpay_payment_id,
//                     signature: response.razorpay_signature
//                 });

//                 alert('Payment Successful');
//             },
//             theme: {
//                 color: '#3399cc'
//             }
//         };

//         const rzp = new window.Razorpay(options);
//         rzp.open();
//     };
//     return <button onClick={handlePayment}>Pay $500</button>;
// };
