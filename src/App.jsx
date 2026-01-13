import { useDispatch } from 'react-redux';
import AppRoutes from './routes';
import { useEffect } from 'react';
import { RefreshTokenApi } from './api/AuthApi';
import { setUser } from './store/userSlice';

function App() {
    const dispatch = useDispatch();

    const userAgent = navigator.userAgent;
    const test = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    console.log(test);

    useEffect(() => {
        const refreshUser = async () => {
            const res = await RefreshTokenApi();

            if (res?.status === 1 && res?.data) {
                dispatch(setUser(res.data));
            }
        };

        refreshUser();
    }, [dispatch]);

    return <AppRoutes />;
}

export default App;
