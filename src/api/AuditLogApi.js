import axios from 'axios';

const env = import.meta.env;

/****************************************************************************************************************
 *                                         Audit Log                                                             *
 ****************************************************************************************************************/

export const AuditLogListApi = async (params) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/AuditLog/auditLogList', { params });
        return response.data;
    } catch (error) {
        console.error('AuditLogListApi error', error);
        throw error;
    }
};

export const AuditLogByIdApi = async (audit_id) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/AuditLog/auditLogById', { params: { audit_id } });
        return response.data;
    } catch (error) {
        console.error('AuditLogByIdApi error', error);
        throw error;
    }
};
