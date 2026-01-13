import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import { NavLink } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { FiCheck, FiChevronDown, FiEye, FiEyeOff } from 'react-icons/fi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { OrganizationUpsertApi } from '@/api/OrganizationApi';
import { cn } from '@/utils/Utils';
import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';
import { useNavigate } from 'react-router';
import * as Select from '@radix-ui/react-select';
import { MasterDropdownListApi } from '@/api/MasterDropdownApi';
import { CityByStateListApi, CountryListApi, StateByCountryListApi } from '@/api/OrganizationLocationApi';
import toast from 'react-hot-toast';

const ValidationSchema = yup.object({
    id: yup.mixed().nullable(),
    name: yup.string().trim().required('Organization name is required'),
    first_name: yup.string().trim().required('First name is required'),
    last_name: yup.string().trim().required('Last name is required'),
    email: yup.string().trim().required('Email is required').email('Enter a valid email address'),
    industry_Type_Id: yup.string().required('Industry Type is required'),
    locations: yup
        .array()
        .of(
            yup.object({
                country_Id: yup
                    .string()
                    .nullable()
                    .test('country-required', 'Country is required', function (value) {
                        const { state_Id, city_Id, address, zip_Code } = this.parent;
                        if (state_Id || city_Id || address || zip_Code) {
                            return !!value;
                        }
                        return true;
                    }),
                state_Id: yup
                    .string()
                    .nullable()
                    .test('state-required', 'State is required', function (value) {
                        const { country_Id, city_Id, address, zip_Code } = this.parent;
                        if (country_Id || city_Id || address || zip_Code) {
                            return !!value;
                        }
                        return true;
                    }),
                city_Id: yup
                    .string()
                    .nullable()
                    .test('city-required', 'City is required', function (value) {
                        const { country_Id, state_Id, address, zip_Code } = this.parent;
                        if (country_Id || state_Id || address || zip_Code) {
                            return !!value;
                        }
                        return true;
                    }),
                address: yup
                    .string()
                    .nullable()
                    .test('address-required', 'Address is required', function (value) {
                        const { country_Id, state_Id, city_Id, zip_Code } = this.parent;
                        if (country_Id || state_Id || city_Id || zip_Code) {
                            return !!value;
                        }
                        return true;
                    }),
                zip_Code: yup
                    .string()
                    .nullable()
                    .test('zip-required', 'Zip code is required', function (value) {
                        const { country_Id, state_Id, city_Id, address } = this.parent;
                        if (country_Id || state_Id || city_Id || address) {
                            return !!value;
                        }
                        return true;
                    }),
                is_Primary: yup.boolean()
            })
        )
        .test('at-least-one-location', 'At least one location is required', (locations) =>
            locations?.some((l) => l.country_Id || l.state_Id || l.city_Id || l.address)
        ),
    password: yup.string().when('id', {
        is: (id) => !id, // when id is falsy (create mode)
        then: (schema) => schema.required('Password is required').min(6, 'Password must be at least 6 characters'),
        otherwise: (schema) => schema.notRequired().nullable()
    }),
    phone_no: yup.string().trim().nullable(),
    website_url: yup
        .string()
        .trim()
        .nullable()
        .test('is-url-or-empty', 'Enter a valid URL', (value) => {
            if (!value) return true;
            try {
                new URL(value.startsWith('http') ? value : `http://${value}`);
                return true;
            } catch {
                return false;
            }
        })
});

const Registration = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [openIndustryType, setOpenIndustryType] = useState(false);

    const [openCountry, setOpenCountry] = useState(false);
    const [openState, setOpenState] = useState(false);
    const [openCity, setOpenCity] = useState(false);

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: (data) => OrganizationUpsertApi(data),
        onSuccess: (res) => {
            toast.success(res?.message || 'Organization created successfully');
        },

        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Organization creation faild');
        }
    });

    const defaultLocations = useMemo(
        () => [
            {
                id: null,
                country_Id: null,
                state_Id: null,
                city_Id: null,
                zip_Code: '',
                address: '',
                is_Primary: true
            }
        ],
        []
    );

    const resolver = yupResolver(ValidationSchema);

    const {
        control,
        formState: { errors },
        setValue,
        watch,
        handleSubmit
    } = useForm({
        defaultValues: {
            id: null,
            name: '',
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            phone_no: '',
            website_url: '',
            number_Of_Employees: '',
            industry_Type_Id: '',
            industry_Type_Department: [],
            departments: [],
            locations: defaultLocations
        },
        resolver
    });

    const hasLocationRootError = !!errors.locations?.root?.message;

    const { data: dropdownRes, isFetching: isDropdownLoading } = useQuery({
        queryKey: ['master-dropdowns'],
        queryFn: MasterDropdownListApi,
        select: (res) => res.data
    });

    const industryTypes = useMemo(() => dropdownRes?.industry_Types ?? [], [dropdownRes]);

    const { data: countries = [] } = useQuery({
        queryKey: ['country-list'],
        queryFn: CountryListApi,
        select: (res) => res.data.countries ?? []
    });

    const fetchStates = async (countryId) => {
        if (!countryId) return;
        const res = await StateByCountryListApi({ countryId });
        setStates(res?.data?.states ?? []);
    };

    const fetchCities = async (stateId) => {
        if (!stateId) return;
        const res = await CityByStateListApi({ stateId });
        setCities(res?.data?.cities ?? []);
    };

    const submitHandler = async (formData) => {
        const payload = {
            id: null,
            name: formData.name,
            description: '',
            website_url: formData.website_url || null,
            email: formData.email,
            password: formData.password,
            phone_no: formData.phone_no || null,
            first_name: formData.first_name,
            last_name: formData.last_name,
            industry_Type_Id: formData.industry_Type_Id,
            number_Of_Employees: formData.number_Of_Employees?.toString() || null,
            locations: formData.locations
                .filter((loc) => loc.country_Id || loc.state_Id || loc.city_Id || loc.address)
                .map((loc) => ({
                    id: loc.id ?? null,
                    country_Id: loc.country_Id || null,
                    state_Id: loc.state_Id || null,
                    city_Id: loc.city_Id || null,
                    zip_Code: loc.zip_Code || null,
                    address: loc.address || null,
                    is_Primary: loc.is_Primary
                })),
            departments: formData.industry_Type_Department?.length
                ? formData.industry_Type_Department.map((dept) => ({ name: dept, industry_Type_Id: formData.industry_Type_Id }))
                : []
        };

        await mutation.mutateAsync(payload);
        navigate('/login');
    };

    return (
        <div className="border border-gray-200 shadow-md p-5 rounded-lg flex flex-col gap-3 items-center w-full md:w-3/5 2xl:w-2/5 3xl:w-1/5">
            {/* Logo */}
            <img src="/company-logo.png" className="w-48 mx-auto my-4" />
            <p className="font-semibold text-lg">Let’s set up your account</p>
            <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-4 w-full">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1">
                                Organization Name <span className="text-red-500">*</span>
                            </label>

                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <InputField {...field} placeholder="e.g. Sunrise Multispeciality Hospital" error={!!errors.name} />
                                )}
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="number_of_employees" className="block text-xs font-semibold text-gray-600 mb-1">
                                Number of Employees
                            </label>
                            <Controller
                                name="number_Of_Employees"
                                control={control}
                                render={({ field }) => (
                                    <InputField
                                        {...field}
                                        type="number"
                                        placeholder="e.g. 50"
                                        min={1}
                                        step={1}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === '' ? null : Number(value));
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="first_name" className="block text-xs font-semibold text-gray-600 mb-1">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="first_name"
                                control={control}
                                render={({ field }) => <InputField {...field} placeholder="e.g. John" error={!!errors.first_name} />}
                            />
                            {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="last_name" className="block text-xs font-semibold text-gray-600 mb-1">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="last_name"
                                control={control}
                                render={({ field }) => <InputField {...field} placeholder="e.g. Doe" error={!!errors.last_name} />}
                            />
                            {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    {/* Email + Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <InputField {...field} type="email" placeholder="contact@organization.com" error={!!errors.email} />
                                )}
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Password with show/hide (only show on create) */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <InputField
                                            {...field}
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Set password"
                                            error={!!errors.password}
                                            className="pr-10"
                                        />
                                    )}
                                />

                                {/* Toggle Icon */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>

                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone No.</label>
                            <Controller
                                name="phone_no"
                                control={control}
                                render={({ field }) => <InputField {...field} placeholder="+91 98765 43210" />}
                            />
                        </div>

                        {/* Website */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Website</label>
                            <Controller
                                name="website_url"
                                control={control}
                                render={({ field }) => <InputField {...field} placeholder="https://www.organization.com" />}
                            />
                            {errors.website_url && <p className="text-xs text-red-500 mt-1">{errors.website_url.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Industry Type <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="industry_Type_Id"
                                control={control}
                                rules={{ required: 'Industry Type is required' }}
                                render={({ field }) => (
                                    <Select.Root
                                        key={field.value || `industry_Type_Id`}
                                        value={field.value ?? ''}
                                        open={openIndustryType}
                                        onOpenChange={setOpenIndustryType}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setOpenIndustryType(false);
                                        }}
                                    >
                                        <Select.Trigger
                                            className={cn(
                                                'w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50/60 flex justify-between items-center outline-none focus:ring-2',
                                                errors.industry_Type_Id
                                                    ? 'border-red-500 focus:ring-red-400'
                                                    : 'border-slate-300 focus:ring-indigo-400'
                                            )}
                                        >
                                            <Select.Value placeholder={isDropdownLoading ? 'Loading...' : 'Select an industry type'} />
                                            <Select.Icon>
                                                <FiChevronDown />
                                            </Select.Icon>
                                        </Select.Trigger>

                                        <Select.Portal>
                                            <Select.Content
                                                side="bottom"
                                                position="popper"
                                                className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[var(--radix-select-trigger-width)] z-50"
                                            >
                                                <Select.Viewport className="p-1 max-h-64 overflow-y-auto">
                                                    {industryTypes.map((industryType) => (
                                                        <Select.Item
                                                            key={industryType.id}
                                                            value={industryType.id}
                                                            className="px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 flex justify-between"
                                                        >
                                                            <Select.ItemText>{industryType.type}</Select.ItemText>
                                                            <Select.ItemIndicator>
                                                                <FiCheck />
                                                            </Select.ItemIndicator>
                                                        </Select.Item>
                                                    ))}
                                                </Select.Viewport>
                                            </Select.Content>
                                        </Select.Portal>
                                    </Select.Root>
                                )}
                            />
                            {errors.industry_Type_Id && <p className="text-xs text-red-500">{errors.industry_Type_Id.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {errors.locations?.root?.message && <p className="text-xs text-red-500 mb-2">{errors.locations.root.message}</p>}
                        {[0].map((index) => (
                            <div
                                key={index}
                                className={cn(
                                    'p-4 rounded-lg mb-4 space-y-2 border',
                                    hasLocationRootError ? 'border-red-500' : 'border-gray-200'
                                )}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            Country <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            name={`locations.${index}.country_Id`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select.Root
                                                    key={field.value || `country-${index}`}
                                                    value={field.value ?? ''}
                                                    open={openCountry}
                                                    onOpenChange={setOpenCountry}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setValue(`locations.${index}.state_Id`, null);
                                                        setValue(`locations.${index}.city_Id`, null);
                                                        fetchStates(value);
                                                    }}
                                                >
                                                    <Select.Trigger
                                                        className={cn(
                                                            'w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50/60 flex justify-between items-center outline-none focus:ring-2',
                                                            errors.locations?.[index]?.country_Id
                                                                ? 'border-red-500 focus:ring-red-400'
                                                                : 'border-slate-300 focus:ring-indigo-400'
                                                        )}
                                                    >
                                                        <Select.Value placeholder={isDropdownLoading ? 'Loading...' : 'Select a country'} />
                                                        <Select.Icon>
                                                            <FiChevronDown />
                                                        </Select.Icon>
                                                    </Select.Trigger>

                                                    <Select.Portal>
                                                        <Select.Content
                                                            side="bottom"
                                                            position="popper"
                                                            className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[var(--radix-select-trigger-width)] z-50"
                                                        >
                                                            <Select.Viewport className="p-1 max-h-64 overflow-y-auto">
                                                                {countries.map((country) => (
                                                                    <Select.Item
                                                                        key={country.id}
                                                                        value={country.id}
                                                                        className="px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 flex justify-between"
                                                                    >
                                                                        <Select.ItemText>{country.name}</Select.ItemText>
                                                                        <Select.ItemIndicator>
                                                                            <FiCheck />
                                                                        </Select.ItemIndicator>
                                                                    </Select.Item>
                                                                ))}
                                                            </Select.Viewport>
                                                        </Select.Content>
                                                    </Select.Portal>
                                                </Select.Root>
                                            )}
                                        />
                                        {errors.locations?.[index]?.country_Id && (
                                            <p className="text-xs text-red-500 mt-1">{errors.locations[index].country_Id.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            name={`locations.${index}.state_Id`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select.Root
                                                    key={field.value || `state-${index}`}
                                                    disabled={!watch(`locations.${index}.country_Id`)}
                                                    value={field.value ?? ''}
                                                    open={openState}
                                                    onOpenChange={setOpenState}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setValue(`locations.${index}.city_Id`, null);
                                                        fetchCities(value);
                                                    }}
                                                >
                                                    <Select.Trigger
                                                        className={cn(
                                                            'w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50/60 flex justify-between items-center outline-none focus:ring-2',
                                                            errors.locations?.[index]?.state_Id
                                                                ? 'border-red-500 focus:ring-red-400'
                                                                : 'border-slate-300 focus:ring-indigo-400',
                                                            !watch(`locations.${index}.country_Id`) && 'cursor-not-allowed opacity-60'
                                                        )}
                                                    >
                                                        <Select.Value placeholder={isDropdownLoading ? 'Loading...' : 'Select a state'} />
                                                        <Select.Icon>
                                                            <FiChevronDown />
                                                        </Select.Icon>
                                                    </Select.Trigger>

                                                    <Select.Portal>
                                                        <Select.Content
                                                            side="bottom"
                                                            position="popper"
                                                            className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[var(--radix-select-trigger-width)] z-50"
                                                        >
                                                            <Select.Viewport className="p-1 max-h-64 overflow-y-auto">
                                                                {states.map((state) => (
                                                                    <Select.Item
                                                                        key={state.id}
                                                                        value={state.id}
                                                                        className="px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 flex justify-between"
                                                                    >
                                                                        <Select.ItemText>{state.name}</Select.ItemText>
                                                                        <Select.ItemIndicator>
                                                                            <FiCheck />
                                                                        </Select.ItemIndicator>
                                                                    </Select.Item>
                                                                ))}
                                                            </Select.Viewport>
                                                        </Select.Content>
                                                    </Select.Portal>
                                                </Select.Root>
                                            )}
                                        />
                                        {errors.locations?.[index]?.state_Id && (
                                            <p className="text-xs text-red-500 mt-1">{errors.locations[index].state_Id.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            name={`locations.${index}.city_Id`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select.Root
                                                    key={field.value || `city-${index}`}
                                                    disabled={!watch(`locations.${index}.state_Id`)}
                                                    value={field.value ?? ''}
                                                    open={openCity}
                                                    onOpenChange={setOpenCity}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                    }}
                                                >
                                                    <Select.Trigger
                                                        className={cn(
                                                            'w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50/60 flex justify-between items-center outline-none focus:ring-2',
                                                            errors.locations?.[index]?.city_Id
                                                                ? 'border-red-500 focus:ring-red-400'
                                                                : 'border-slate-300 focus:ring-indigo-400',
                                                            !watch(`locations.${index}.state_Id`) && 'cursor-not-allowed opacity-60'
                                                        )}
                                                    >
                                                        <Select.Value placeholder={isDropdownLoading ? 'Loading...' : 'Select a city'} />
                                                        <Select.Icon>
                                                            <FiChevronDown />
                                                        </Select.Icon>
                                                    </Select.Trigger>

                                                    <Select.Portal>
                                                        <Select.Content
                                                            side="bottom"
                                                            position="popper"
                                                            className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[var(--radix-select-trigger-width)] z-50"
                                                        >
                                                            <Select.Viewport className="p-1 max-h-64 overflow-y-auto">
                                                                {cities.map((city) => (
                                                                    <Select.Item
                                                                        key={city.id}
                                                                        value={city.id}
                                                                        className="px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 flex justify-between"
                                                                    >
                                                                        <Select.ItemText>{city.name}</Select.ItemText>
                                                                        <Select.ItemIndicator>
                                                                            <FiCheck />
                                                                        </Select.ItemIndicator>
                                                                    </Select.Item>
                                                                ))}
                                                            </Select.Viewport>
                                                        </Select.Content>
                                                    </Select.Portal>
                                                </Select.Root>
                                            )}
                                        />
                                        {errors.locations?.[index]?.city_Id && (
                                            <p className="text-xs text-red-500 mt-1">{errors.locations[index].city_Id.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Zip Code</label>
                                        <Controller
                                            name={`locations.${index}.zip_Code`}
                                            control={control}
                                            render={({ field }) => (
                                                <InputField {...field} placeholder="325288" error={!!errors.locations?.[index]?.zip_Code} />
                                            )}
                                        />
                                        {errors.locations?.[index]?.zip_Code && (
                                            <p className="text-xs text-red-500 mt-1">{errors.locations[index].zip_Code.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address textarea */}
                                <div>
                                    <label>Address</label>
                                    <Controller
                                        name={`locations.${index}.address`}
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                rows={2}
                                                className={cn(
                                                    'w-full rounded-md p-2 outline-none focus:ring-2',
                                                    errors.locations?.[index]?.address
                                                        ? 'border border-red-500 focus:ring-red-400'
                                                        : 'border border-gray-200 focus:ring-indigo-400'
                                                )}
                                            />
                                        )}
                                    />
                                    {errors.locations?.[index]?.address && (
                                        <p className="text-xs text-red-500 mt-1">{errors.locations[index].address.message}</p>
                                    )}
                                </div>
                                {errors.locations?.[index]?.message && (
                                    <p className="text-xs text-red-500 mt-1">{errors.locations[index].message}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Buttons */}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="w-full"
                    disabled={mutation.isPending}
                    loading={mutation.isPending}
                >
                    {mutation.isPending ? 'Submitting...' : 'Submit'}
                </Button>
            </form>
            <p className="text-sm pb-3.5 text-center">
                {`Already have an account? `}
                <NavLink to="/login" className="text-sm text-primary-dark font-medium">
                    Login
                </NavLink>
            </p>
        </div>
    );
};

export default Registration;
