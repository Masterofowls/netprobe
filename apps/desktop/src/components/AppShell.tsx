import { NavLink, Outlet } from "react-router-dom";
import { useT } from "../hooks/useTranslation";
import { useAppStore } from "../store/useAppStore";

export const AppShell = () => {
  const t = useT();
  const networkState = useAppStore((s) => s.networkState);
  const offline = networkState.isConnected === false;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__icon">📡</span>
          <div>
            <h1>{t.appName}</h1>
            <p>{t.appTagline}</p>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
          <NavLink to="/catalog" className={({ isActive }) => (isActive ? "active" : "")}>
            {t.resourceCatalog}
          </NavLink>
          <NavLink to="/add" className={({ isActive }) => (isActive ? "active" : "")}>
            {t.addResource}
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
            {t.settings}
          </NavLink>
        </nav>
      </aside>
      <main className="main">
        {offline && (
          <div className="network-banner" role="alert">
            {t.offline}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};
