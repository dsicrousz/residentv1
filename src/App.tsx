import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import createStore from "react-auth-kit/createStore";
import AuthKitProvider from "react-auth-kit";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/login";
import MainLayout from "./components/MainLayout";
import { ConfigProvider } from "antd";
import frFR from "antd/lib/locale/fr_FR";
import { MantineProvider, createTheme } from '@mantine/core';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const mantineTheme = createTheme({
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  headings: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
  },
  primaryColor: 'blue',
  defaultRadius: 'md',
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const store = createStore({
    authName: 'resident_auth',
    authType: 'localstorage',
    cookieDomain: window.location.hostname,
    cookieSecure: window.location.protocol === 'https:',
  });

  return (
    <AuthKitProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={frFR}
          theme={{
            token: {
              colorPrimary: '#2563eb',
              colorInfo: '#2563eb',
              colorSuccess: '#10b981',
              colorWarning: '#f59e0b',
              colorError: '#ef4444',
              colorTextBase: '#0f172a',
              colorBgLayout: '#f8fafc',
              borderRadius: 10,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: 14,
              boxShadowSecondary: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 10px -6px rgba(15, 23, 42, 0.04)',
            },
            components: {
              Button: {
                controlHeight: 38,
                controlHeightLG: 44,
                fontWeight: 500,
                borderRadius: 10,
                primaryShadow: '0 4px 12px rgba(37, 99, 235, 0.22)',
              },
              Card: {
                borderRadiusLG: 14,
                paddingLG: 24,
              },
              Table: {
                headerBg: '#f8fafc',
                headerColor: '#475569',
                rowHoverBg: '#f1f5f9',
                borderColor: '#f1f5f9',
                borderRadius: 12,
              },
              Input: {
                controlHeight: 40,
                controlHeightLG: 46,
                borderRadius: 10,
              },
              Select: {
                controlHeight: 40,
                controlHeightLG: 46,
                borderRadius: 10,
              },
              Modal: {
                borderRadiusLG: 16,
              },
            },
          }}
        >
          <MantineProvider theme={mantineTheme}>
            <Routes>
              <Route index element={<Login />} />
              <Route path="login" element={<Login />} />
              <Route
                path="dashboard/*"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MantineProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </AuthKitProvider>
  );
}

export default App;
