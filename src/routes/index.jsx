import { createBrowserRouter, RouterProvider } from 'react-router';
import ProtectedRoutes from './ProtectedRoutes';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthRoutes from './AuthRoutes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Landing from '@/views/Landing';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false, // 🚫 no retry on failure
            refetchOnWindowFocus: false, // optional
            refetchOnReconnect: false // optional
        }
    }
});
const AppRoutes = () => {
    const router = createBrowserRouter([{ path: '', element: <Landing /> }, ...ProtectedRoutes, AuthRoutes]);
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <LanguageProvider>
                    <RouterProvider router={router} />
                </LanguageProvider>
            </ThemeProvider>
            <Toaster
                duration={5000}
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    duration: 5000
                }}
            />
        </QueryClientProvider>
    );
};

export default AppRoutes;
