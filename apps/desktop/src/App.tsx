import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { ResourceDetailPage } from "./pages/ResourceDetailPage";
import { AddResourcePage } from "./pages/AddResourcePage";
import { CatalogPage } from "./pages/CatalogPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useThemeMode } from "./hooks/useTheme";
import { useAppStore } from "./store/useAppStore";
import { useEffect } from "react";

function AppRoutes() {
  useThemeMode();
  const loadData = useAppStore((s) => s.loadData);
  const ready = useAppStore((s) => s.ready);
  const setNetworkState = useAppStore((s) => s.setNetworkState);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const update = () =>
      setNetworkState({
        isConnected: navigator.onLine,
        type: "desktop",
        isInternetReachable: navigator.onLine,
        details: null,
      });
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [setNetworkState]);

  if (!ready) {
    return (
      <div className="boot-screen">
        <div className="boot-spinner" />
        <p>Loading NetProbe…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="resource/:id" element={<ResourceDetailPage />} />
        <Route path="add" element={<AddResourcePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
