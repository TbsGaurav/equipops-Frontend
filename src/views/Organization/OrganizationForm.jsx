import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller, useWatch } from 'react-hook-form';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import { FiCheck, FiChevronDown, FiEye, FiEyeOff, FiPlus } from 'react-icons/fi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IndustryDepartmentsListApi, OrganizationByIdApi, OrganizationUpsertApi } from '@/api/OrganizationApi';
import { RotatingLines } from 'react-loader-spinner';
import { cn } from '@/utils/Utils';
import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router';
import * as Select from '@radix-ui/react-select';
import { MasterDropdownListApi } from '@/api/MasterDropdownApi';
import { CityByStateListApi, CountryListApi, StateByCountryListApi } from '@/api/OrganizationLocationApi';

const ValidationSchema = yup.object({
    id: yup.mixed().nullable(),
    name: yup.string().trim().required('Organization name is required'),
    first_name: yup.string().trim().required('First name is required'),
    last_name: yup.string().trim().required('Last name is required'),
    email: yup.string().trim().required('Email is required').email('Enter a valid email address'),
    industry_Type_Id: yup.string().required('Industry Type is required'),
    industry_Type_Department: yup.array().min(1, 'At least one department is required'),
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
                const url = new URL(value);
                return ['http:', 'https:'].includes(url.protocol);
            } catch {
                return false;
            }
        })
});

const OrganizationForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const queryClient = useQueryClient();

    const { organizationId: id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [openIndustryType, setOpenIndustryType] = useState(false);
    const [openDepartment, setOpenDepartment] = useState(false);

    const [openCountry, setOpenCountry] = useState([false, false, false]);
    const [openState, setOpenState] = useState([false, false, false]);
    const [openCity, setOpenCity] = useState([false, false, false]);

    const departmentRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (departmentRef.current && !departmentRef.current.contains(event.target)) {
                setOpenDepartment(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
            },
            {
                id: null,
                country_Id: null,
                state_Id: null,
                city_Id: null,
                zip_Code: '',
                address: '',
                is_Primary: false
            },
            {
                id: null,
                country_Id: null,
                state_Id: null,
                city_Id: null,
                zip_Code: '',
                address: '',
                is_Primary: false
            }
        ],
        []
    );

    const resolver = yupResolver(ValidationSchema);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm({
        defaultValues: {
            id: id || null,
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

    const locationsWatch = useWatch({
        control,
        name: 'locations'
    });

    const hasLocationRootError = !!errors.locations?.root?.message;

    const { data, isFetching } = useQuery({
        queryKey: ['organization-by-id', id],
        queryFn: () => OrganizationByIdApi({ id: id }),
        enabled: !!id,
        select: (res) => res.data.organization
    });

    useEffect(() => {
        if (data) {
            reset({
                id: data.id ?? null,
                name: data.name ?? '',
                first_name: data.first_Name ?? '',
                last_name: data.last_Name ?? '',
                email: data.email ?? '',
                password: '',
                phone_no: data.phone_No ?? '',
                website_url: data.website_Url ?? '',
                number_Of_Employees: data.number_Of_Employees ?? '',
                industry_Type_Id: data.industry_Type_Id ?? '',
                industry_Type_Department: data.departments?.map((d) => d.name) ?? [],
                locations: data.locations?.length ? data.locations : defaultLocations
            });
        }
    }, [data, reset, defaultLocations]);

    const mutation = useMutation({
        mutationFn: (data) => OrganizationUpsertApi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization-by-id', id] });
            queryClient.invalidateQueries({ queryKey: ['organizations'], exact: false });
        }
    });

    const { data: dropdownRes, isFetching: isDropdownLoading } = useQuery({
        queryKey: ['master-dropdowns'],
        queryFn: MasterDropdownListApi,
        select: (res) => res.data
    });

    const industryTypes = useMemo(() => dropdownRes?.industry_Types ?? [], [dropdownRes]);

    const industryTypeId = useWatch({
        control,
        name: 'industry_Type_Id'
    });

    const selectedIndustryName = useMemo(() => {
        return industryTypes.find((i) => i.id === industryTypeId)?.type ?? null;
    }, [industryTypeId, industryTypes]);

    const { data: departments = [], isFetching: isDepartmentLoading } = useQuery({
        queryKey: ['departments', selectedIndustryName],
        queryFn: () => IndustryDepartmentsListApi({ industry: selectedIndustryName }),
        enabled: !!selectedIndustryName,
        select: (res) => res.data.departments
    });

    const prevIndustryRef = useRef(null);

    useEffect(() => {
        if (!prevIndustryRef.current) {
            prevIndustryRef.current = industryTypeId;
            return;
        }

        if (prevIndustryRef.current !== industryTypeId) {
            setValue('industry_Type_Department', []);
        }
    }, [industryTypeId, isEdit, setValue]);

    useEffect(() => {
        if (!locationsWatch) return;

        const filledIndexes = locationsWatch
            .map((l, i) => (l.country_Id || l.state_Id || l.city_Id || l.address ? i : null))
            .filter((i) => i !== null);

        if (filledIndexes.length === 1) {
            const idx = filledIndexes[0];

            if (!locationsWatch[idx]?.is_Primary) {
                [0, 1, 2].forEach((i) => setValue(`locations.${i}.is_Primary`, i === idx, { shouldDirty: false }));
            }
        }
    }, [locationsWatch, setValue]);

    const { data: countries = [] } = useQuery({
        queryKey: ['country-list'],
        queryFn: CountryListApi,
        select: (res) => res.data.countries ?? []
    });

    const [states, setStates] = useState([[], [], []]);
    const [cities, setCities] = useState([[], [], []]);

    const fetchStates = async (countryId, index) => {
        if (!countryId) return;

        try {
            const res = await StateByCountryListApi({ countryId });

            setStates((prev) => {
                const newState = [...prev];
                newState[index] = res?.data?.states ?? [];
                return newState;
            });
        } catch (err) {
            console.error('Failed to fetch states', err);
            setStates((prev) => {
                const newState = [...prev];
                newState[index] = [];
                return newState;
            });
        }
    };

    const fetchCities = async (stateId, index) => {
        if (!stateId) return;

        try {
            const res = await CityByStateListApi({ stateId });

            setCities((prev) => {
                const newCity = [...prev];
                newCity[index] = res?.data?.cities ?? [];
                return newCity;
            });
        } catch (err) {
            console.error('Failed to fetch cities', err);
            setCities((prev) => {
                const newCity = [...prev];
                newCity[index] = [];
                return newCity;
            });
        }
    };

    useEffect(() => {
        if (!data?.locations) return;

        data.locations.forEach((loc, index) => {
            if (index > 2) return;

            if (loc.country_Id) {
                fetchStates(loc.country_Id, index);
            }
            if (loc.state_Id) {
                fetchCities(loc.state_Id, index);
            }
        });
    }, [data]);

    const submitHandler = async (formData) => {
        const payload = {
            id: formData.id ?? null,
            name: formData.name,
            description: '',
            website_url: formData.website_url || null,
            email: formData.email,
            phone_no: formData.phone_no || null,
            first_name: formData.first_name,
            last_name: formData.last_name,
            industry_Type_Id: formData.industry_Type_Id,
            number_Of_Employees: formData.number_Of_Employees || null,
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
            departments: formData.industry_Type_Department.map((dept) => ({
                name: dept,
                industry_Type_Id: formData.industry_Type_Id
            }))
        };

        if (!isEdit) {
            payload.password = formData.password;
        }

        await mutation.mutateAsync(payload);
        navigate('/organization');
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
        <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 py-8">
            <div className="w-full max-w-4xl mx-auto">
                {/* Header */}
                {isEdit ? (
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 flex items-center justify-center gap-2">
                            <FiCheck className="text-indigo-500" />
                            Update Organization
                        </h1>
                        <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl mx-auto">Modify the details and save changes.</p>
                    </div>
                ) : (
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 flex items-center justify-center gap-2">
                            <FiPlus className="text-indigo-500" />
                            Create Organization
                        </h1>
                        <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
                            Enter the organization&apos;s details and save to create a new organization.
                        </p>
                    </div>
                )}
                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 lg:p-8 flex flex-col gap-6"
                >
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
                                        <InputField {...field} placeholder="e.g. 50" error={!!errors.number_Of_Employees} />
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
                                    render={({ field }) => <InputField {...field} placeholder="e.g. Amit" error={!!errors.first_name} />}
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
                                    render={({ field }) => <InputField {...field} placeholder="e.g. Sharma" error={!!errors.last_name} />}
                                />
                                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
                            </div>
                        </div>

                        {/* Email + Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className={cn(id && 'col-span-2')}>
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
                            {!id && (
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
                            )}
                        </div>

                        {/* Phone & Website */}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div>
                                <label htmlFor="industry_Type_Department" className="block text-xs font-semibold text-gray-600 mb-1">
                                    Department <span className="text-red-500">*</span>
                                </label>

                                <Controller
                                    name="industry_Type_Department"
                                    control={control}
                                    render={({ field }) => {
                                        const selected = field.value || [];

                                        return (
                                            <div className="relative" ref={departmentRef}>
                                                {/* Input Box */}
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!industryTypeId) return;
                                                        setOpenDepartment(true);
                                                    }}
                                                    className={cn(
                                                        'min-h-[42px] w-full px-2 py-1 border rounded-lg bg-slate-50/60 flex flex-wrap gap-1 items-center focus-within:ring-2',
                                                        errors.industry_Type_Department
                                                            ? 'border-red-500 focus-within:ring-red-400'
                                                            : 'border-slate-300 focus-within:ring-indigo-400',
                                                        !industryTypeId ? 'cursor-not-allowed opacity-60' : 'cursor-text'
                                                    )}
                                                >
                                                    {selected.length === 0 && (
                                                        <span className="text-sm text-gray-400 px-1"> Select departments </span>
                                                    )}

                                                    {/* Chips */}
                                                    {selected.map((dept) => (
                                                        <span
                                                            key={dept}
                                                            className="flex items-center gap-1 bg-indigo-100 text-indigo-700
                           px-2 py-0.5 rounded-md text-xs"
                                                        >
                                                            {dept}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    field.onChange(selected.filter((d) => d !== dept));
                                                                }}
                                                                className="hover:text-indigo-900"
                                                            >
                                                                ✕
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Dropdown */}
                                                {openDepartment && (
                                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                        {isDepartmentLoading ? (
                                                            <div className="p-2 text-sm text-gray-500">Loading...</div>
                                                        ) : departments.length === 0 ? (
                                                            <div className="p-2 text-sm text-gray-500">No options</div>
                                                        ) : (
                                                            departments.map((dept) => {
                                                                const isSelected = selected.includes(dept);

                                                                return (
                                                                    <div
                                                                        key={dept}
                                                                        onClick={() => {
                                                                            if (isSelected) {
                                                                                field.onChange(selected.filter((d) => d !== dept));
                                                                            } else {
                                                                                field.onChange([...selected, dept]);
                                                                            }
                                                                        }}
                                                                        className={cn(
                                                                            'px-3 py-2 cursor-pointer flex justify-between items-center text-sm',
                                                                            isSelected
                                                                                ? 'bg-indigo-50 text-indigo-700'
                                                                                : 'hover:bg-gray-100'
                                                                        )}
                                                                    >
                                                                        {dept}
                                                                        {isSelected && <FiCheck size={14} />}
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }}
                                />

                                {errors.industry_Type_Department && (
                                    <p className="text-xs text-red-500 mt-1"> {errors.industry_Type_Department.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {errors.locations?.root?.message && (
                                <p className="text-xs text-red-500 mb-2">{errors.locations.root.message}</p>
                            )}
                            {[0, 1, 2].map((index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'p-4 rounded-lg mb-4 space-y-2 border',
                                        hasLocationRootError ? 'border-red-500' : 'border-gray-200'
                                    )}
                                >
                                    {/* Radio for primary */}
                                    <div className="flex items-center gap-2">
                                        <Controller
                                            name={`locations.${index}.is_Primary`}
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type="radio"
                                                    value={index}
                                                    checked={field.value === true}
                                                    onChange={() => {
                                                        [0, 1, 2].forEach((i) =>
                                                            setValue(`locations.${i}.is_Primary`, i === index, {
                                                                shouldDirty: true
                                                            })
                                                        );
                                                    }}
                                                    className="accent-indigo-600"
                                                />
                                            )}
                                        />
                                    </div>

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
                                                        open={openCountry[index]}
                                                        onOpenChange={(val) =>
                                                            setOpenCountry((prev) => {
                                                                const next = [...prev];
                                                                next[index] = val;
                                                                return next;
                                                            })
                                                        }
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            setValue(`locations.${index}.state_Id`, null);
                                                            setValue(`locations.${index}.city_Id`, null);
                                                            fetchStates(value, index);
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
                                                            <Select.Value
                                                                placeholder={isDropdownLoading ? 'Loading...' : 'Select a country'}
                                                            />
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
                                                        open={openState[index]}
                                                        onOpenChange={(val) =>
                                                            setOpenState((prev) => {
                                                                const next = [...prev];
                                                                next[index] = val;
                                                                return next;
                                                            })
                                                        }
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            setValue(`locations.${index}.city_Id`, '');
                                                            fetchCities(value, index);
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
                                                            <Select.Value
                                                                placeholder={isDropdownLoading ? 'Loading...' : 'Select a state'}
                                                            />
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
                                                                    {states[index]?.map((state) => (
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
                                                        open={openCity[index]}
                                                        onOpenChange={(val) =>
                                                            setOpenCity((prev) => {
                                                                const next = [...prev];
                                                                next[index] = val;
                                                                return next;
                                                            })
                                                        }
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
                                                            <Select.Value
                                                                placeholder={isDropdownLoading ? 'Loading...' : 'Select a city'}
                                                            />
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
                                                                    {cities[index]?.map((city) => (
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
                                                    <InputField
                                                        {...field}
                                                        placeholder="325288"
                                                        error={!!errors.locations?.[index]?.zip_Code}
                                                    />
                                                )}
                                            />
                                            {errors.locations?.[index]?.zip_Code && (
                                                <p className="text-xs text-red-500 mt-1">{errors.locations[index].zip_Code.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address textarea */}
                                    <div>
                                        <label>Address {index + 1}</label>
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
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/organization`);
                            }}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className="px-4 py-2 text-sm"
                            disabled={mutation.isPending}
                            loading={mutation.isPending}
                        >
                            {mutation.isPending ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

OrganizationForm.propTypes = {
    onClose: PropTypes.func,
    OrganizationId: PropTypes.string
};

export default OrganizationForm;
