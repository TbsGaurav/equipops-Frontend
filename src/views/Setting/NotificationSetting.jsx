import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BsBell } from 'react-icons/bs';
import { useForm } from 'react-hook-form';
import InputField from '@/utils/components/ui/InputField';
import InputGroup from '@/utils/components/InputGroup';
import { LuEye, LuEyeClosed } from 'react-icons/lu';
import { useRef, useState } from 'react';
import ToggleButton from '@/utils/components/ToggleButton';

const ValidationSchema = yup.object().shape({});

const NotificationSetting = () => {
    const FileRef = useRef();
    const [showPass, setShowPass] = useState(true);
    const {
        watch,
        setValue,
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: { mail_notification: false, mailer: '', host: '', email: '', password: '', from: '', project_id: '' },
        resolver: yupResolver(ValidationSchema)
    });

    const SubmitHandler = () => {
        // PageAction('next', data);
    };

    return (
        <form onSubmit={handleSubmit(SubmitHandler)} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <BsBell size={18} />
                <h2 className="text-lg font-bold text-gray-800">Notification Preferences</h2>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <label className="font-semibold">Email Notifications</label>
                    <label className="text-sm text-gray-500">Receive email updates about interviews and candidates</label>
                </div>

                <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" {...register('mail_notification')} />
                    <ToggleButton />
                </label>
            </div>

            {watch('mail_notification') && (
                <div className="grid grid-cols-1 md:grid-cols-2 grid-row-3 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">Mailer</label>
                        <InputField type="text" placeholder="SMTP" className="w-full p-2" error={errors.mailer} {...register('mailer')} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">Host</label>
                        <InputField type="url" placeholder="Enter Host" className="w-full p-2" error={errors.host} {...register('host')} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <InputField
                            type="email"
                            placeholder="Enter Email"
                            className="w-full p-2"
                            error={errors.email}
                            {...register('email')}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">Password</label>
                        <InputGroup className="relative">
                            <InputField
                                type={showPass ? 'text' : 'password'}
                                placeholder="Enter Password"
                                className="w-full p-2 relative"
                                error={errors.password}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 end-0 flex items-center pe-3"
                                onClick={() => setShowPass((pre) => !pre)}
                            >
                                {showPass ? <LuEye size={20} /> : <LuEyeClosed size={20} />}
                            </button>
                        </InputGroup>
                    </div>

                    <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-600">Send Form</label>
                        <InputField
                            type="text"
                            placeholder="Notification Send Form"
                            className="w-full p-2"
                            error={errors.from}
                            {...register('from')}
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <label className="font-semibold">Mobile Notifications</label>
                    <label className="text-sm text-gray-500">Receive mobile updates about interviews and candidates</label>
                </div>

                <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" {...register('mobile_notification')} />
                    <ToggleButton />
                </label>
            </div>

            {watch('mobile_notification') && (
                <div className="grid grid-cols-1 md:grid-cols-2 grid-row-3 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">Firebase Project Id</label>
                        <InputField
                            type="text"
                            placeholder="Enter Firebase Project Id"
                            className="w-full p-2"
                            error={errors.project_id}
                            {...register('project_id')}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">Firebase Service File</label>
                        <InputGroup className="relative">
                            <InputField
                                type="file"
                                ref={FileRef}
                                className="inset-0 w-full h-full opacity-0 cursor-pointer"
                                error={errors.file}
                                onChange={(e) => setValue('file', e.target.files[0])}
                            />
                            <button
                                type="button"
                                onClick={() => FileRef.current.click()}
                                className="absolute -end-[1px] flex items-center p-2.5 px-3 font-semibold text-sm rounded-r-md border-1 border-indigo-500 bg-indigo-500 text-white"
                            >
                                Upload Button
                            </button>
                        </InputGroup>
                    </div>
                </div>
            )}

            <div className="flex justify-center">
                <button className="bg-indigo-500 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm">
                    Save Changes
                </button>
            </div>
        </form>
    );
};

export default NotificationSetting;
