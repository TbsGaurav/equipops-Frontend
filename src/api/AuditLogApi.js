import ApiService from '@/utils/services/ApiService';

export const AuditLogListApi = async (data) => {
    return await ApiService.get('/AuditLog/auditLogList', data, { authorization: false });
};
