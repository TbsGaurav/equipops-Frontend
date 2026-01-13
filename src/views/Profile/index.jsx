import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { MdOutlinePhotoCamera } from 'react-icons/md';
import InputField from '@/utils/components/ui/InputField';
import { useEffect, useRef, useState } from 'react';
import { OrganizationProfileByIdApi, UpdateProfileApi } from '@/api/OrganizationApi';
import { RotatingLines } from 'react-loader-spinner';
import { useQuery, useMutation } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/userSlice';
import Toast from '@/utils/toast';

/* -------------------- Validation -------------------- */
const schema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    phone: yup.string().required('Phone is required'),
    jobTitle: yup.string().required('Job title is required'),
    location: yup.string().required('Location is required')
});

/* -------------------- Component -------------------- */
export default function Index() {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const imageRef = useRef(null);
    const [photo_url, setAvatar] = useState('');

    const ProfileId = user?.userId;
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            firstName: '',
            fullName: '',
            lastName: '',
            email: '',
            phone: '',
            jobTitle: '',
            location: '',
            role: ''
        }
    });
    /* -------------------- GET PROFILE -------------------- */
    const { data, isFetching } = useQuery({
        queryKey: ['organization-profile', ProfileId],
        queryFn: () => OrganizationProfileByIdApi({ id: ProfileId }),
        enabled: Boolean(ProfileId)
    });

    /* -------------------- SET FORM DATA -------------------- */
    useEffect(() => {
        if (!data) return;
        const profileData = data.data || {};
        reset({
            firstName: profileData.first_name ?? '',
            fullName: profileData.full_name ?? '',
            lastName: profileData.last_name ?? '',
            email: profileData.email ?? '',
            phone: profileData.phone_no ?? '',
            jobTitle: profileData.job_title ?? '',
            location: profileData.location ?? '',
            role: profileData.role ?? ''
        });

        setAvatar(profileData.photo_url ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop');
    }, [data, reset]);

    /* -------------------- UPDATE PROFILE -------------------- */
    const mutation = useMutation({
        mutationFn: UpdateProfileApi,
        onSuccess: (res) => {
            const updatedUser = res.data;
            dispatch(
                setUser({
                    ...user,
                    fullName: updatedUser.full_name,
                    email: updatedUser.email,
                    photoUrl: updatedUser.photo_url,
                    nameInit: updatedUser.first_name[0] + updatedUser.last_name[0]
                })
            );
            Toast.success(res.message);
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save Profile';

            Toast.error(errorMessage);
        }
    });

    const onSubmit = (formData) => {
        const payload = new FormData();

        payload.append('id', ProfileId);
        payload.append('first_name', formData.firstName);
        payload.append('last_name', formData.lastName);
        payload.append('email', formData.email);
        payload.append('phone_no', formData.phone);
        payload.append('job_title', formData.jobTitle);
        payload.append('location', formData.location);
        payload.append('role', formData.role);

        if (formData.photo instanceof File) {
            payload.append('photo', formData.photo);
        }

        mutation.mutate(payload);
    };

    /* -------------------- AVATAR -------------------- */
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatar(URL.createObjectURL(file)); // preview
        setValue('photo', file); // ✅ VERY IMPORTANT
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-10">
                <RotatingLines
                    visible={true}
                    height="1.2em"
                    width="1.2em"
                    color="currentColor"
                    strokeWidth="5"
                    animationDuration="0.75"
                    ariaLabel="rotating-lines-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                />
                <span className="ml-3 text-gray-600 text-sm">Loading organization data...</span>
            </div>
        );
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm px-5 sm:px-7 lg:px-9 py-6 sm:py-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="relative">
                            {/* soft ring behind avatar */}
                            <div className="absolute inset-0 blur-xl bg-indigo-200/40 rounded-full scale-110" />
                            <img
                                src={photo_url}
                                alt="Profile"
                                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <input type="file" accept="image/*" ref={imageRef} hidden onChange={handleImageChange} />
                            <button
                                type="button"
                                className="absolute bottom-1 right-1 bg-indigo-500 text-white p-1.5 rounded-full hover:bg-indigo-600 transition shadow-sm"
                                onClick={() => imageRef.current?.click()}
                            >
                                <MdOutlinePhotoCamera size={14} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 leading-tight">{data?.data?.full_name ?? ''}</h1>
                            <p className="text-xs sm:text-sm text-gray-500">{data?.data?.email ?? ''}</p>
                            <span className="mt-1 inline-flex w-max items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700 border border-indigo-100">
                                {data?.data?.role ?? ''}
                            </span>
                        </div>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-500">
                        <p className="font-medium text-gray-700">Profile Settings</p>
                        <p className="mt-1">Update your personal details so candidates and team members see the correct info.</p>
                    </div>
                </header>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Section title */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-800">Personal information</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            This information is visible inside your workspace and on candidate communication.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <InputField type="text" {...register('firstName')} error={errors.firstName} placeholder="Enter first name" />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                Last Name
                                <span className="text-red-500">*</span>
                            </label>
                            <InputField type="text" {...register('lastName')} error={errors.lastName} placeholder="Enter last name" />
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">Email Address</label>
                            <InputField type="email" {...register('email')} error={errors.email} placeholder="Enter email" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">Phone Number</label>
                            <InputField type="tel" {...register('phone')} error={errors.phone} placeholder="Enter phone number" />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">Job Title</label>
                            <InputField type="text" {...register('jobTitle')} error={errors.jobTitle} placeholder="Enter job title" />
                            {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">Location</label>
                            <InputField type="text" {...register('location')} error={errors.location} placeholder="Enter location" />
                            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-4">
                        <p className="text-[11px] sm:text-xs text-gray-500">
                            Changes will be reflected across all interviews and communications.
                        </p>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="fl-button fl-button-primary px-10 py-2.5 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
