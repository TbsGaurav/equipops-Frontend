import ApiService from '@/utils/services/ApiService';

export const AuditLogListApi = async (data) => {
    return await ApiService.get('/AuditLog/auditLogList', data, { authorization: false });
};

export const AuditLogByIdApi = async (audit_id) => {
    return ApiService.get('/AuditLog/auditLogById', { audit_id }, { authorization: false });
};
