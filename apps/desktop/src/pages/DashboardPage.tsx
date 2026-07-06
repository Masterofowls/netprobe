import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { useT } from "../hooks/useTranslation";
import { ResourceCard } from "../components/ResourceCard";
import { StatusSummary } from "../components/StatusSummary";
import type { SortMode } from "@core/types";

export const DashboardPage = () => {
  const t = useT();
  const {
    isChecking,
    checkAllResources,
    lastFullCheck,
    getVisibleResources,
    updateSettings,
    settings,
    addResource,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [quickUrl, setQuickUrl] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);

  useAutoRefresh();

  useEffect(() => {
    checkAllResources();
  }, [checkAllResources]);

  const visible = getVisibleResources();
  const filtered = useMemo(
    () =>
      visible.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.category?.toLowerCase().includes(search.toLowerCase()),
      ),
    [visible, search],
  );

  const lastCheckLabel = lastFullCheck
    ? new Date(lastFullCheck).toLocaleTimeString()
    : t.never;

  const handleQuickAdd = async () => {
    let url = quickUrl.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    try {
      const parsed = new URL(url);
      const name =
        parsed.hostname.replace(/^www\./, "").split(".")[0] ?? "Website";
      await addResource({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        url,
        icon: "🌐",
        color: "#6750A4",
      });
      setQuickUrl("");
      setQuickOpen(false);
    } catch {
      // invalid url
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">
            {t.lastCheck}: {lastCheckLabel}
          </p>
        </div>
        <div className="header-actions">
          <select
            value={settings.sortMode}
            onChange={(e) =>
              updateSettings({ sortMode: e.target.value as SortMode })
            }
            aria-label="Sort"
          >
            <option value="default">{t.sortDefault}</option>
            <option value="status">{t.sortStatus}</option>
            <option value="name">{t.sortName}</option>
          </select>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => checkAllResources()}
            disabled={isChecking}
          >
            {isChecking ? t.statusChecking : "Refresh all"}
          </button>
        </div>
      </header>

      <StatusSummary />

      <div className="toolbar">
        <input
          className="search"
          placeholder={t.searchResources}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn" onClick={() => setQuickOpen(true)}>
          {t.quickAdd}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">{search ? t.noMatch : t.noResources}</p>
      ) : (
        <div className="resource-grid">
          {filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}

      {quickOpen && (
        <div className="modal-backdrop" onClick={() => setQuickOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t.quickAdd}</h3>
            <p className="muted">{t.quickAddHint}</p>
            <input
              className="input"
              placeholder={t.pasteUrl}
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
            />
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setQuickOpen(false)}>
                {t.cancel}
              </button>
              <button type="button" className="btn btn--primary" onClick={handleQuickAdd}>
                {t.addWebsite}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
