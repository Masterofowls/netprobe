import type { CheckResult } from "@core/types";
import { useT } from "../hooks/useTranslation";

export const DeepCheckPanel = ({ check }: { check?: CheckResult }) => {
  const t = useT();
  if (!check) return null;

  return (
    <section className="panel deep-check">
      <h3>{t.deepChecks}</h3>
      {check.dns && (
        <div className="deep-row">
          <strong>DNS</strong>
          <span>
            {check.dns.resolved
              ? `OK — ${check.dns.addresses.join(", ")}`
              : check.dns.error ?? "Failed"}
            {check.dns.latencyMs != null && ` (${check.dns.latencyMs} ms)`}
          </span>
        </div>
      )}
      {check.tls && (
        <div className="deep-row">
          <strong>TLS</strong>
          <span>
            {check.tls.skipped
              ? check.tls.error ?? "Skipped"
              : check.tls.valid
                ? `Valid${check.tls.daysUntilExpiry != null ? ` — ${check.tls.daysUntilExpiry}d left` : ""}`
                : check.tls.error ?? "Invalid"}
          </span>
        </div>
      )}
      {check.keyword && (
        <div className="deep-row">
          <strong>Keyword</strong>
          <span>
            {check.keyword.matched ? "Matched" : "Not found"}
            {check.keyword.error ? ` — ${check.keyword.error}` : ""}
          </span>
        </div>
      )}
      {(check.resolvedIp || check.countryCode) && (
        <div className="deep-row">
          <strong>Geo</strong>
          <span>
            {[check.resolvedIp, check.countryCode].filter(Boolean).join(" · ")}
          </span>
        </div>
      )}
    </section>
  );
};
