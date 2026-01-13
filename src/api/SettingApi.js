/****************************************************************************************************************
 *                                            Language                                            *
 ****************************************************************************************************************/
import ApiService from '@/utils/services/ApiService';

export const LanguageListApi = async (data) => {
    return await ApiService.get('/setting/Language/list', data, { authorization: true });
};

export const LanguageByIdApi = async (data) => {
    return await ApiService.get('/setting/Language/getById', data, { authorization: true });
};

export const LanguageUpsertApi = async (data) => {
    return await ApiService.post('/setting/Language/createUpdate', data, { authorization: true });
};

export const LanguageDeleteApi = async (data) => {
    return await ApiService.post('/setting/Language/delete', data, { authorization: true });
};

/****************************************************************************************************************
 *                                            RolePermission                                            *
 ****************************************************************************************************************/

export const RolePermissionListApi = async (data) => {
    return await ApiService.get('/setting/userrole/UserAccessRoleList', data, { authorization: true });
};

export const RolePermissionByIdApi = async (data) => {
    return await ApiService.get('/setting/UserRole/userAccessRoleById', data, { authorization: true });
};

export const RolePermissionUpsertApi = async (data) => {
    return await ApiService.post('/setting/UserRole/userAccessRoleCreate', data, { authorization: true });
};

export const RolePermissionDeleteApi = async (data) => {
    return await ApiService.post('/setting/UserRole/userRoleDelete', data, { authorization: true });
};

/****************************************************************************************************************
 *                                            Subscription Type                                            *
 ****************************************************************************************************************/

export const SubscriptionTypeListApi = async (data) => {
    return await ApiService.get('/setting/subscription/subscriptiontypelist', data, { authorization: true });
};

export const SubscriptionTypeByIdApi = async (data) => {
    return await ApiService.get('/setting/subscription/SubscriptionTypeById', data, { authorization: true });
};

export const SubscriptionTypeUpsertApi = async (data) => {
    return await ApiService.post('/setting/subscription/createUpdateType', data, { authorization: true });
};

export const SubscriptionTypeDeleteApi = async (data) => {
    return await ApiService.post('/setting/subscription/SubscriptionTypeDelete', data, { authorization: true });
};

export const SubscriptionTypesApi = async (data) => {
    return await ApiService.get('/setting/Subscription/SubscriptionTypes', data, { authorization: true });
};

/****************************************************************************************************************
 *                                            Menu                                          *
 ****************************************************************************************************************/

export const MenuByLanguageApi = async (data) => {
    return await ApiService.get('/setting/MenuLanguage/getByLanguage', data, { authorization: true });
};

export const MenuByLanguageUpdateApi = async (data) => {
    return await ApiService.post('/setting/MenuLanguage/updateByLanguage', data, { authorization: true });
};

/****************************************************************************************************************
 *                                            EmailTemplate                                          *
 ****************************************************************************************************************/
export const EmailTemplateListApi = async (data) => {
    return await ApiService.get('/setting/EmailTemplate/EmailTemplateList', data, { authorization: true });
};

export const EmailTemplateByIdApi = async (data) => {
    return await ApiService.get('/setting/EmailTemplate/EmailTemplateById', data, { authorization: true });
};

export const EmailTemplateUpsertApi = async (data) => {
    return await ApiService.post('/setting/EmailTemplate/createUpdate', data, { authorization: true });
};

export const EmailTemplateDeleteApi = async (data) => {
    return await ApiService.post('/setting/EmailTemplate/EmailTemplateDelete', data, { authorization: true });
};

/****************************************************************************************************************
 *                                            MenuType                                            *
 ****************************************************************************************************************/

export const MenuTypeListApi = async (data) => {
    return await ApiService.get('/setting/MenuType/list', data, { authorization: true });
};
export const MenuTypeByIdApi = async ({ id }) => {
    return await ApiService.get(`/setting/MenuType/getById?Id=${id}`, null, { authorization: true });
};

export const MenuTypeUpsertApi = async (data) => {
    return await ApiService.post('/setting/MenuType/createUpdate', data, { authorization: true });
};

export const MenuTypeDeleteApi = async (data) => {
    return await ApiService.post('/setting/MenuType/delete', data, { authorization: true });
};

/****************************************************************************************************************
 *                                            Menu Permission                                           *
 ****************************************************************************************************************/

export const MenuListApi = async (data) => {
    return await ApiService.get('/setting/MenuType/menuPermissionList', data, { authorization: true });
};
export const MenuByIdApi = async ({ id }) => {
    return await ApiService.get(`/setting/MenuType/menuPermissionById?Id=${id}`, null, { authorization: true });
};

export const MenuUpsertApi = async (data) => {
    return await ApiService.post('/setting/MenuType/menuPermissionCreate', data, { authorization: true });
};

export const MenuDeleteApi = async (data) => {
    return await ApiService.post('/setting/MenuType/menuPermissionDelete', data, { authorization: true });
};

export const MasterMenuListApi = async (data) => {
    return await ApiService.get('/setting/MasterDropdown/list', data, { authorization: true });
};
