import ApiService from '@/utils/services/ApiService';
import axios from 'axios';

/****************************************************************************************************************
 *                                                Equipment                                                      *
 ****************************************************************************************************************/

export const EquipmentListApi = async (data) => {
    return await ApiService.get('/equipment/Equipment/list', data, { authorization: true });
};

export const EquipmentByIdApi = async (data) => {
    return await ApiService.get('/equipment/Equipment/get-by-id', data, { authorization: true });
};

// export const EquipmentUpsertApi = async (data) => {
//     return await ApiService.post('/equipment/Equipment/create-update', data, { authorization: true });
// };

export const EquipmentDeleteApi = async (data) => {
    return await ApiService.post('/equipment/Equipment/delete', data, { authorization: true });
};

export const EquipmentApiUrl = async (params) => {
    try {
        const response = await axios.get(
            'https://localhost:7013/api/Equipment/list',
            { params } // ✅ query params
        );
        //   console.log(response.data);
        // response.data.data === { totalNumbers, equipmentData }FFF
        return response.data; // ✅ RETURN PROMISE RESULT
    } catch (error) {
        console.error('There was an error!', error);
        throw error;
    }
};

export const EquipmentUpsertApi = async (params) => {
    try {
        const response = await axios.post(
            'https://localhost:7013/api/Equipment/createupdate',
            { params } // ✅ query params
        );
        //   console.log(response.data);
        // response.data.data === { totalNumbers, equipmentData }FFF
        return response.data; // ✅ RETURN PROMISE RESULT
    } catch (error) {
        console.error('There was an error!', error);
        throw error;
    }
};
/****************************************************************************************************************
 *                                            Equipment Settings                                                 *
 ****************************************************************************************************************/

// export const EquipmentSettingListApi = async () => {
//     const res = await ApiService.get(
//         '/equipment/EquipmentSetting/list',
//         null,
//         { authorization: true },
//         'full'
//     );
//     res.headers['x-encryption-secret'];
//     return { headers: res.headers, data: res.data };
// };

// export const EquipmentSettingUpsertApi = async (data) => {
//     return await ApiService.post(
//         '/equipment/EquipmentSetting/create-update',
//         data,
//         { authorization: true }
//     );
// };

/****************************************************************************************************************
 *                                            Equipment For SuperAdmin                                           *
 ****************************************************************************************************************/

// export const EquipmentsForSuperAdminApi = async (data) => {
//     return await ApiService.get(
//         '/equipment/Equipment/all-equipment-list',
//         data,
//         { authorization: true }
//     );
// };

// export const GetEquipmentForSuperAdminApi = async (data) => {
//     return await ApiService.get(
//         '/equipment/Equipment/all-equipment-by-id',
//         data,
//         { authorization: true }
//     );
// };

// export const UpdateEquipmentStatusApi = ({ equipmentId, action }) => {
//     return ApiService.post(
//         '/equipment/Equipment/update-equipment-status',
//         null,
//         {
//             authorization: true,
//             params: {
//                 equipmentId,
//                 action
//             }
//         }
//     );
// };

// export const getEquipmentListByStatusApi = async (commonParams) => {
//     return ApiService.get(
//         '/equipment/Equipment/equipment-list-by-status',
//         commonParams,
//         { authorization: true }
//     );
// };
