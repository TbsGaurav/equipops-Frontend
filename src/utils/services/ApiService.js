import axiosInstance from '../axiosInstance';

const response = (res, response_type) => {
    switch (response_type) {
        case 'data':
            return res.data;
        default:
            return res;
    }
};

const ApiService = {
    get(url, params = {}, options = {}, response_type = 'data') {
        const { authorization = true, ...rest } = options;
        return axiosInstance.get(url, { params, authorization, ...rest }).then((res) => response(res, response_type));
    },

    post(url, data = {}, options = {}) {
        const { authorization = true, ...rest } = options;
        return axiosInstance.post(url, data, { authorization, ...rest }).then((res) => res.data);
    },

    put(url, data = {}, options = {}) {
        const { authorization = true, ...rest } = options;
        return axiosInstance.put(url, data, { authorization, ...rest }).then((res) => res.data);
    },

    delete(url, options = {}) {
        const { authorization = true, ...rest } = options;
        return axiosInstance.delete(url, { authorization, ...rest }).then((res) => res.data);
    }
};

export default ApiService;
