import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import { FiChevronDown, FiCheck, FiPlus } from 'react-icons/fi';
import * as Select from '@radix-ui/react-select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserByIdApi, UserUpsertApi } from '@/api/UserApi';
import { RotatingLines } from 'react-loader-spinner';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MasterDropdownListApi } from '@/api/MasterDropdownApi';
import useAuth from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router';
import Toast from '@/utils/toast';

// ------------------------- VALIDATION ------------------------
const getValidationSchema = (isSuperAdmin) =>
    yup.object({
        id: yup.mixed().nullable(),
        first_name: yup.string().trim().required('First name is required'),
        last_name: yup.string().trim().required('Last name is required'),
        email: yup.string().trim().required('Email is required').email('Enter a valid email'),
        phone_Number: yup.string().nullable(),
        role_Name: isSuperAdmin ? yup.string().required('Role is required') : yup.string().notRequired(),
        organization_Id: isSuperAdmin ? yup.string().required('Organization is required') : yup.string().notRequired(),
        language_Id: yup.string().required('Language is required'),
        status: yup.string().oneOf(['active', 'inactive']).required(),
        avatar: yup
            .mixed()
            .nullable()
            .test('fileSize', 'Max file size 2MB', (file) => {
                if (!file || typeof file === 'string') return true;
                return file.size <= 2 * 1024 * 1024;
            })
    });

// ------------------------- FORM -------------------------------
const UserForm = () => {
    const { user } = useAuth();
    const roleName = user?.roleName;
    const isSuperAdmin = roleName === 'Super Admin';
    const isOrgAdmin = roleName === 'Organization Admin';

    const validationSchema = useMemo(() => getValidationSchema(isSuperAdmin), [isSuperAdmin]);

    const { userId: id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [openOrganization, setOpenOrganization] = useState(false);
    const [openRole, setOpenRole] = useState(false);
    const [openLanguage, setOpenLanguage] = useState(false);

    const queryClient = useQueryClient();

    // LOAD USER IN EDIT MODE
    const { data, isFetching } = useQuery({
        queryKey: ['user-by-id', id],
        queryFn: () => UserByIdApi({ id: id }),
        enabled: !!id,
        select: (res) => res.data
    });

    const { data: dropdownRes, isFetching: isDropdownLoading } = useQuery({
        queryKey: ['master-dropdowns'],
        queryFn: MasterDropdownListApi,
        select: (res) => res.data
    });

    const roles = useMemo(() => dropdownRes?.roles ?? [], [dropdownRes]);
    const organizations = useMemo(() => dropdownRes?.organizations ?? [], [dropdownRes]);
    const languages = useMemo(() => dropdownRes?.languages ?? [], [dropdownRes]);
    const menuPermissions = useMemo(() => dropdownRes?.menu_Permissions ?? [], [dropdownRes]);

    const permissionUi = useMemo(() => {
        if (!dropdownRes) return [];

        const menuMap = {};

        menuPermissions.forEach((perm) => {
            const parts = perm.slug.split('_');
            const menuKey = parts[0];
            const actionName = parts.slice(1).join('_');

            if (!menuMap[menuKey]) {
                menuMap[menuKey] = {
                    label: menuKey,
                    key: menuKey,
                    actions: []
                };
            }

            menuMap[menuKey].actions.push({
                slug: perm.slug,
                action: actionName,
                menu_permission_id: perm.id,
                id: null,
                is_allowed: false
            });
        });

        // 2️⃣ Overlay USER permissions in EDIT mode
        if (isEdit && data?.userAccessRole?.length) {
            data.userAccessRole.forEach((item) => {
                const normalizedMenuKey = item.slug.split('_')[0];
                const menu = menuMap[normalizedMenuKey];

                if (!menu) return;

                const action = menu.actions.find((a) => a.slug === item.slug);
                if (!action) return;

                action.id = item.user_access_role_id;
                action.is_allowed = item.is_allowed === true;
            });
        }

        return Object.values(menuMap);
    }, [dropdownRes, menuPermissions, isEdit, data]);

    const defaultPermissions = {};
    permissionUi.forEach((menu) => {
        defaultPermissions[menu.key] = {};
        menu.actions.forEach((action) => {
            defaultPermissions[menu.key][action.slug] = action.is_allowed || false;
        });
    });

    const buildPermissionsFromApi = (userAccessRole) => {
        const permissions = {};

        userAccessRole.forEach((item) => {
            if (!permissions[item.menu_type_name]) {
                permissions[item.menu_type_name] = {};
            }

            permissions[item.menu_type_name][item.slug] = item.is_allowed === true;
        });

        return permissions;
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue
    } = useForm({
        defaultValues: {
            id: id || null,
            first_name: '',
            last_name: '',
            email: '',
            phone_Number: '',
            role_Name: '',
            organization_Id: '',
            language_Id: '',
            status: 'active',
            avatar: null,
            permissions: defaultPermissions
        },
        resolver: yupResolver(validationSchema)
    });

    useEffect(() => {
        if (!id && !isSuperAdmin && user?.organizationId) {
            reset((prev) => ({
                ...prev,
                organization_Id: user.organizationId
            }));
        }
    }, [id, isSuperAdmin, user?.organizationId, reset]);

    useEffect(() => {
        if (isOrgAdmin && !id) {
            reset((prev) => ({
                ...prev,
                role: 'User'
            }));
        }
    }, [isOrgAdmin, id, reset]);

    useEffect(() => {
        if (!data || !languages.length) return;

        const selectedLanguageId = languages.find((l) => l.name === data.language)?.id ?? '';

        const permissionValues = buildPermissionsFromApi(data.userAccessRole || []);

        reset({
            id: data.id ?? null,
            first_name: data.first_name ?? '',
            last_name: data.last_name ?? '',
            email: data.email ?? '',
            phone_Number: data.phone_number ?? '',
            role_Name: roles.find((r) => r.name === data.role)?.name ?? '',
            organization_Id: organizations.find((o) => o.name === data.organization)?.id ?? '',
            language_Id: selectedLanguageId,
            status: data.status ?? 'active',
            avatar: null,
            permissions: permissionValues
        });
    }, [data, roles, organizations, languages, reset]);

    const mutation = useMutation({
        mutationFn: async (payload) => UserUpsertApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            Toast.success(isEdit ? 'User updated successfully' : 'User created successfully');
            setTimeout(() => {
                navigate('/user-management');
            }, 200);
        },

        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save user';

            Toast.error(errorMessage);
        }
    });

    useEffect(() => {
        if (!permissionUi.length) return;

        permissionUi.forEach((menu) => {
            menu.actions.forEach((action) => {
                setValue(`permissions.${menu.key}.${action.slug}`, action.is_allowed === true, { shouldDirty: false });
            });
        });
    }, [permissionUi, setValue]);

    const submitHandler = async (formData) => {
        const userAccessRole = [];

        permissionUi.forEach((menu) => {
            menu.actions.forEach((action) => {
                const isAllowed = formData.permissions?.[menu.key]?.[action.slug] ?? false;

                if (!action.menu_permission_id) {
                    console.warn('Missing menu_permission_id for slug:', action.slug);
                    return;
                }

                userAccessRole.push({
                    id: action.id || null,
                    menu_permission_id: action.menu_permission_id,
                    is_checked: isAllowed
                });
            });
        });

        const rest = { ...formData };
        delete rest.permissions;

        const payload = {
            ...rest,
            organization_Id: isSuperAdmin ? formData.organization_Id : user.organizationId,
            userAccessRole
        };

        if (payload.avatar instanceof File) {
            const fd = new FormData();
            Object.keys(payload).forEach((key) => {
                if (payload[key] !== null) {
                    fd.append(key, payload[key]);
                }
            });
            await mutation.mutateAsync(fd);
        } else {
            await mutation.mutateAsync(payload);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-10">
                <RotatingLines height="1.2em" width="1.2em" strokeWidth="5" />
                <span className="ml-3 text-gray-600 text-sm">Loading user data...</span>
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
                            Update User
                        </h1>
                        <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl mx-auto">Modify the details and save changes.</p>
                    </div>
                ) : (
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 flex items-center justify-center gap-2">
                            <FiPlus className="text-indigo-500" />
                            Create User
                        </h1>
                        <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
                            Enter the user&apos;s details and save to create a new user.
                        </p>
                    </div>
                )}
                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 lg:p-8 flex flex-col gap-6"
                >
                    <div className="space-y-4">
                        {isSuperAdmin && (
                            <div>
                                <label htmlFor="organization_Id" className="block text-xs font-semibold text-gray-600 mb-1">
                                    Organization <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="organization_Id"
                                    control={control}
                                    rules={{ required: 'Organization is required' }}
                                    render={({ field }) => (
                                        <Select.Root
                                            value={field.value}
                                            open={openOrganization}
                                            onOpenChange={setOpenOrganization}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setOpenOrganization(false);
                                            }}
                                            disabled={isDropdownLoading}
                                        >
                                            <Select.Trigger
                                                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg 
                                                                                   bg-slate-50/60 flex justify-between items-center
                                                                                   focus:ring-2 focus:ring-indigo-400 outline-none"
                                            >
                                                <Select.Value placeholder={isDropdownLoading ? 'Loading...' : 'Select an organization'} />
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
                                                        {organizations.map((org) => (
                                                            <Select.Item
                                                                key={org.id}
                                                                value={org.id}
                                                                className="px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 flex justify-between"
                                                            >
                                                                <Select.ItemText>{org.name}</Select.ItemText>
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
                                {errors.organization_Id && <p className="text-xs text-red-500">{errors.organization_Id.message}</p>}
                            </div>
                        )}

                        {/* First / Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
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
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => <InputField {...field} placeholder="user@domain.com" error={!!errors.email} />}
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1"> Phone No </label>
                                <Controller
                                    name="phone_Number"
                                    control={control}
                                    render={({ field }) => <InputField {...field} placeholder="9876543210" error={!!errors.phone_Number} />}
                                />
                                {errors.phone_Number && <p className="text-xs text-red-500 mt-1">{errors.phone_Number.message}</p>}
                            </div>
                        </div>

                        {/* ROLE + STATUS using RAW RADIX SELECT */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isSuperAdmin && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="role_Name"
                                        control={control}
                                        rules={{ required: 'Role is required' }}
                                        render={({ field }) => (
                                            <Select.Root
                                                value={field.value}
                                                open={openRole}
                                                onOpenChange={setOpenRole}
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setOpenRole(false);
                                                }}
                                            >
                                                <Select.Trigger
                                                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg 
                                                                                   bg-slate-50/60 flex justify-between items-center
                                                                                   focus:ring-2 focus:ring-indigo-400 outline-none"
                                                >
                                                    <Select.Value placeholder={isDropdownLoading ? 'Loading...' : 'Select a role'} />
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
                                                            {roles.map((role) => (
                                                                <Select.Item
                                                                    key={role.id}
                                                                    value={role.name}
                                                                    className="px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 flex justify-between"
                                                                >
                                                                    <Select.ItemText>{role.name}</Select.ItemText>
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
                                    {errors.role_Name && <p className="text-xs text-red-500">{errors.role_Name.message}</p>}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Language <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="language_Id"
                                    control={control}
                                    rules={{ required: 'Language is required' }}
                                    render={({ field }) => (
                                        <Select.Root
                                            key={field.value || 'language_Id'}
                                            value={field.value ?? ''}
                                            open={openLanguage}
                                            onOpenChange={setOpenLanguage}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setOpenLanguage(false);
                                            }}
                                            disabled={isDropdownLoading}
                                        >
                                            <Select.Trigger
                                                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg 
                                                                                   bg-slate-50/60 flex justify-between items-center
                                                                                   focus:ring-2 focus:ring-indigo-400 outline-none"
                                            >
                                                <Select.Value placeholder={isDropdownLoading ? 'Loading...' : 'Select a language'} />
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
                                                        {languages.map((lang) => (
                                                            <Select.Item
                                                                key={lang.id}
                                                                value={lang.id}
                                                                className="px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 flex justify-between"
                                                            >
                                                                <Select.ItemText>
                                                                    {lang.name} ({lang.code})
                                                                </Select.ItemText>
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
                                {errors.language_Id && <p className="text-xs text-red-500">{errors.language_Id.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* ---------------- PERMISSIONS ---------------- */}
                    <div className="border border-slate-300 rounded-lg rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Permissions</h3>

                        {permissionUi.map((menu) => (
                            <div key={menu.key} className="border-b border-slate-300 last:border-b-0 py-3">
                                {/* Module header */}
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">{menu.label}</span>

                                    {/* Select All */}
                                    <label className="flex items-center gap-2 text-xs text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={menu.actions.every((action) => !!watch(`permissions.${menu.key}.${action.slug}`))}
                                            onChange={(e) => {
                                                menu.actions.forEach((a) => {
                                                    setValue(`permissions.${menu.key}.${a.slug}`, e.target.checked, {
                                                        shouldDirty: true
                                                    });
                                                });
                                            }}
                                        />
                                        Select All
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-6 flex-wrap">
                                    {menu.actions.map((action, index) => (
                                        <label key={`${menu.key}_${action.slug}_${index}`} className="flex items-center gap-2 text-sm">
                                            <Controller
                                                name={`permissions.${menu.key}.${action.slug}`}
                                                control={control}
                                                render={({ field }) => (
                                                    <input
                                                        type="checkbox"
                                                        checked={!!field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                    />
                                                )}
                                            />
                                            {action.action}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FOOTER BUTTONS */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/user-management`);
                            }}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={mutation.isPending || isDropdownLoading}
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

UserForm.propTypes = {
    onClose: PropTypes.func,
    UserId: PropTypes.string
};

export default UserForm;
