import Button from '@/utils/components/ui/Button';
import PropTypes from 'prop-types';
import { handleRazorpayPayment } from '../RazorpayPayment';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

const planStyles = {
    Platinum: {
        ring: 'ring-indigo-500',
        badge: 'Most Popular',
        gradient: 'from-indigo-500 to-purple-500'
    },
    Premium: {
        ring: 'ring-emerald-500',
        badge: null,
        gradient: 'from-emerald-500 to-teal-500'
    },
    Silver: {
        ring: 'ring-amber-500',
        badge: 'Best Value',
        gradient: 'from-amber-500 to-orange-500'
    }
};

const SubscriptionTypes = ({ plans = [] }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {plans.map((plan, index) => {
                    const style = planStyles[plan.type] || {};
                    return (
                        <div
                            key={plan.id}
                            style={{ animationDelay: `${index * 120}ms` }}
                            className={`
                        relative rounded-2xl p-[1px]
                        bg-gradient-to-br ${style.gradient}
                        animate-fadeUp
                    `}
                        >
                            <div
                                className={`
                            relative h-full rounded-2xl bg-white p-5
                            transition-all duration-300
                            hover:-translate-y-2 hover:shadow-2xl
                            hover:scale-[1.03]
                            ring-1 ${style.ring}
                        `}
                            >
                                {style.badge && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-semibold text-white shadow-md">
                                        {style.badge}
                                    </span>
                                )}

                                <h3 className="text-lg font-bold text-gray-900 capitalize">{plan.type}</h3>
                                <p className="mt-2 text-2xl font-extrabold text-gray-900">₹{plan.price}</p>

                                <ul className="mt-4 space-y-2 text-xs text-gray-600">
                                    <li>📄 Resume Matching: {plan.resume_matching}</li>
                                    <li>🧠 Interviews Create: {plan.interview_create}</li>
                                    <li>📅 Interviews Schedule: {plan.interview_schedule}</li>
                                </ul>

                                <Button
                                    className="w-full mt-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                                    onClick={() => handleRazorpayPayment(plan, dispatch, navigate)}
                                >
                                    Upgrade
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

SubscriptionTypes.propTypes = {
    plans: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            resume_matching: PropTypes.number,
            interview_create: PropTypes.number,
            interview_schedule: PropTypes.number,
            price: PropTypes.number
        })
    ),
    onClose: PropTypes.func.isRequired
};

export default SubscriptionTypes;
