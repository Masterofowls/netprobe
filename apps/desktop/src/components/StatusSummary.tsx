import { useAppStore } from "../store/useAppStore";
import { useT } from "../hooks/useTranslation";
import { isOfflineStatus } from "../lib/checkUtils";

export const StatusSummary = () => {
  const resources = useAppStore((s) => s.resources);
  const t = useT();

  const online = resources.filter((r) => r.lastCheck?.status === "online").length;
  const issues = resources.filter((r) =>
    r.lastCheck ? isOfflineStatus(r.lastCheck.status) : false,
  ).length;
  const pending = resources.filter((r) => !r.lastCheck).length;

  return (
    <div className="status-summary">
      <div className="summary-card summary-card--online">
        <span className="summary-value">{online}</span>
        <span className="summary-label">{t.online}</span>
      </div>
      <div className="summary-card summary-card--issues">
        <span className="summary-value">{issues}</span>
        <span className="summary-label">{t.issues}</span>
      </div>
      <div className="summary-card summary-card--pending">
        <span className="summary-value">{pending}</span>
        <span className="summary-label">{t.pending}</span>
      </div>
      <div className="summary-card">
        <span className="summary-value">{resources.length}</span>
        <span className="summary-label">{t.total}</span>
      </div>
    </div>
  );
};
