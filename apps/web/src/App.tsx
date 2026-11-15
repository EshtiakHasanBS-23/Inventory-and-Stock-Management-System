/**
 * Providers and routes (frontend-components.md Routes). Each page is loaded on
 * demand with React.lazy, so Sign in loads only the shell and its form (NFR5.4).
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { i18n } from "./i18n";
import {
  PublicLayout,
  RoleHomeRedirect,
  RoleRoute,
  SignedInLayout,
} from "./layouts/Layouts";
import { SessionProvider } from "./session/SessionProvider";

const SignUpPage = lazy(() =>
  import("./pages/SignUpPage").then((m) => ({ default: m.SignUpPage })),
);
const SignInPage = lazy(() =>
  import("./pages/SignInPage").then((m) => ({ default: m.SignInPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/stock/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const ProductsPage = lazy(() =>
  import("./pages/stock/ProductsPage").then((m) => ({
    default: m.ProductsPage,
  })),
);
const StockPage = lazy(() =>
  import("./pages/stock/StockPage").then((m) => ({ default: m.StockPage })),
);
const CountPage = lazy(() =>
  import("./pages/stock/CountPage").then((m) => ({ default: m.CountPage })),
);
const StaffPage = lazy(() =>
  import("./pages/stock/StaffPage").then((m) => ({ default: m.StaffPage })),
);
const HistoryPage = lazy(() =>
  import("./pages/stock/HistoryPage").then((m) => ({ default: m.HistoryPage })),
);

/** React Router v7 behaviour, opted into now so the upgrade changes nothing. */
export const ROUTER_FUTURE = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

export interface AppProvidersProps {
  queryClient: QueryClient;
  fetchFn?: typeof fetch;
  children: ReactNode;
}

export function AppProviders({
  queryClient,
  fetchFn,
  children,
}: AppProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider fetchFn={fetchFn}>{children}</SessionProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
      </Route>
      <Route element={<SignedInLayout />}>
        <Route index element={<RoleHomeRedirect />} />
        <Route
          path="/dashboard"
          element={
            <RoleRoute path="/dashboard">
              <DashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/products"
          element={
            <RoleRoute path="/products">
              <ProductsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <RoleRoute path="/stock">
              <StockPage />
            </RoleRoute>
          }
        />
        <Route
          path="/history"
          element={
            <RoleRoute path="/history">
              <HistoryPage />
            </RoleRoute>
          }
        />
        <Route
          path="/count"
          element={
            <RoleRoute path="/count">
              <CountPage />
            </RoleRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <RoleRoute path="/staff">
              <StaffPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App({ queryClient }: { queryClient: QueryClient }) {
  return (
    <AppProviders queryClient={queryClient}>
      <BrowserRouter future={ROUTER_FUTURE}>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
