import store from '@/store';
import { clearUser } from '@/store/userSlice';
import axios from 'axios';
import cookie from 'react-cookies';
import { getLanguageId } from './Utils';
const env = import.meta.env;

const axiosInstance = axios.create({
    baseURL: env.VITE_API_URL, // Replace with your API base URL
    headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'ngrok-skip-browser-warning': true
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = cookie.load('accessKey');
        const languageId = getLanguageId();

        if (token && config.authorization !== false) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (languageId) {
            config.headers['language-id'] = languageId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            store.dispatch(clearUser());
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
