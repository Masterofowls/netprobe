import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useAppStore } from "../store/useAppStore";
import { useT } from "../hooks/useTranslation";
import { StatusBadge } from "../components/StatusBadge";
import { LatencyChart } from "../components/LatencyChart";
import { DeepCheckPanel } from "../components/DeepCheckPanel";

export const ResourceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();
  const resources = useAppStore((s) => s.resources);
  const checkSingleResource = useAppStore((s) => s.checkSingleResource);
  const deleteResource = useAppStore((s) => s.deleteResource);

  const resource = resources.find((r) => r.id === id);

  useEffect(() => {
    if (resource) checkSingleResource(resource.id);
  }, [resource?.id, checkSingleResource]);

  if (!resource) {
    return (
      <div className="page">
        <p>{t.noResources}</p>
        <Link to="/">Back</Link>
      </div>
    );
  }

  const check = resource.lastCheck;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/" className="back-link">
            ← Dashboard
          </Link>
          <h2>{resource.name}</h2>
          <p className="muted">{resource.url}</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn"
            onClick={() => openUrl(resource.url)}
          >
            Open
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => checkSingleResource(resource.id)}
          >
            Re-check
          </button>
          {!resource.isBuiltIn && (
            <button
              type="button"
              className="btn btn--danger"
              onClick={async () => {
                await deleteResource(resource.id);
                navigate("/");
              }}
            >
              Delete
            </button>
          )}
        </div>
      </header>

      <section className="panel detail-hero">
        {check && <StatusBadge status={check.status} />}
        {check?.latency != null && (
          <span className="detail-latency">{check.latency} ms</span>
        )}
        {check?.statusCode != null && (
          <span className="muted">HTTP {check.statusCode}</span>
        )}
      </section>

      <section className="panel">
        <h3>Latency history</h3>
        <LatencyChart history={resource.history} />
      </section>

      <DeepCheckPanel check={check} />
    </div>
  );
};
