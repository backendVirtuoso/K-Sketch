import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './store';
import { BrowserRouter } from 'react-router-dom';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from "recoil";

// QueryClient 생성
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RecoilRoot>
          <App />
        </RecoilRoot>
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);

reportWebVitals();
