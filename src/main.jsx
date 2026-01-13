import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import store, { persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';

console.log(import.meta.env.MODE);

const isProduction = import.meta.env.MODE === 'production';
const Wrapper = isProduction ? StrictMode : ({ children }) => <>{children}</>;

createRoot(document.getElementById('root')).render(
    <Wrapper>
        <Provider store={store}>
            <PersistGate loading={<div>Loading Page ...</div>} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </Wrapper>
);
