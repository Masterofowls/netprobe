import type { Resource } from "@core/types";
import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { useAppStore } from "../store/useAppStore";

const favicon = (url: string) => {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
};

export const ResourceCard = ({ resource }: { resource: Resource }) => {
  const togglePin = useAppStore((s) => s.togglePin);
  const pinnedIds = useAppStore((s) => s.settings.pinnedIds);
  const isPinned = pinnedIds.includes(resource.id);
  const status = resource.lastCheck?.status ?? "unknown";
  const latency = resource.lastCheck?.latency;
  const icon = favicon(resource.url);

  return (
    <article className="resource-card">
      <div className="resource-card__header">
        <div className="resource-card__identity">
          {icon ? (
            <img src={icon} alt="" className="resource-card__favicon" />
          ) : (
            <span
              className="resource-card__emoji"
              style={{ backgroundColor: resource.color }}
            >
              {resource.icon}
            </span>
          )}
          <div>
            <Link to={`/resource/${resource.id}`} className="resource-card__title">
              {resource.name}
            </Link>
            <p className="resource-card__url">{resource.url}</p>
          </div>
        </div>
        <button
          type="button"
          className={`pin-btn ${isPinned ? "pin-btn--active" : ""}`}
          onClick={() => togglePin(resource.id)}
          aria-label={isPinned ? "Unpin" : "Pin"}
        >
          ★
        </button>
      </div>
      <div className="resource-card__footer">
        <StatusBadge status={status} />
        {latency != null && <span className="latency">{latency} ms</span>}
        {resource.lastCheck?.countryCode && (
          <span className="country">{resource.lastCheck.countryCode}</span>
        )}
      </div>
    </article>
  );
};
