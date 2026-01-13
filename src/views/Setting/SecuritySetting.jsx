import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { FiShield } from 'react-icons/fi';
import ToggleButton from '@/utils/components/ToggleButton';
import Dropdown from '@/utils/components/ui/Dropdown';

const ValidationSchema = yup.object().shape({});

const SecuritySetting = () => {
    const { register, handleSubmit } = useForm({
        defaultValues: { name: '', website: '', email: '', number: '', title: '' },
        resolver: yupResolver(ValidationSchema)
    });

    const SubmitHandler = () => {
        // PageAction('next', data);
    };

    return (
        <form onSubmit={handleSubmit(SubmitHandler)} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <FiShield className="size-5" />
                <h2 className="text-lg font-semibold text-gray-800">Security Settings</h2>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-800">Two-Factor Authentication</label>
                        <label className="text-sm text-gray-500">Add an extra layer of security to your account</label>
                    </div>

                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" {...register('mobile_notification')} />
                        <ToggleButton />
                    </label>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-800">Session Timeout</label>
                    <Dropdown
                        options={[
                            { title: '10 Minutes', value: 1 },
                            { title: '30 Minutes', value: 2 },
                            { title: '60 Minutes', value: 3 }
                        ]}
                    />
                </div>
            </div>

            <div className="flex justify-center">
                <button className="bg-indigo-500 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm">
                    Save Changes
                </button>
            </div>
        </form>
    );
};

export default SecuritySetting;
