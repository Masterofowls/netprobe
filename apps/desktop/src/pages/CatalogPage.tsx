import { useMemo, useState } from "react";
import { RESOURCE_CATALOG } from "@core/constants/catalog";
import { useAppStore } from "../store/useAppStore";
import { useT } from "../hooks/useTranslation";

export const CatalogPage = () => {
  const t = useT();
  const enabledIds = useAppStore((s) => s.settings.enabledCatalogIds);
  const toggleCatalogResource = useAppStore((s) => s.toggleCatalogResource);
  const setCatalogResources = useAppStore((s) => s.setCatalogResources);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      RESOURCE_CATALOG.filter(
        (entry) =>
          entry.name.toLowerCase().includes(search.toLowerCase()) ||
          entry.category.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof RESOURCE_CATALOG>();
    for (const entry of filtered) {
      const list = map.get(entry.category) ?? [];
      list.push(entry);
      map.set(entry.category, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>{t.resourceCatalog}</h2>
          <p className="muted">
            {enabledIds.length} / {RESOURCE_CATALOG.length} enabled
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn"
            onClick={() =>
              setCatalogResources(RESOURCE_CATALOG.map((e) => e.id))
            }
          >
            Enable all
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setCatalogResources([])}
          >
            Disable all
          </button>
        </div>
      </header>

      <input
        className="search"
        placeholder={t.searchResources}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="catalog-list">
        {grouped.map(([category, entries]) => (
          <section key={category} className="catalog-section">
            <h3>{category}</h3>
            <ul>
              {entries.map((entry) => {
                const enabled = enabledIds.includes(entry.id);
                return (
                  <li key={entry.id} className="catalog-item">
                    <span>
                      {entry.icon} {entry.name}
                    </span>
                    <button
                      type="button"
                      className={`btn btn--small ${enabled ? "btn--primary" : ""}`}
                      onClick={() => toggleCatalogResource(entry.id)}
                    >
                      {enabled ? "Enabled" : "Enable"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};
