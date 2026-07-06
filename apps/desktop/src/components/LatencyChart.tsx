import type { CheckResult } from "@core/types";
import { useT } from "../hooks/useTranslation";

export const LatencyChart = ({ history }: { history: CheckResult[] }) => {
  const t = useT();
  const samples = history.slice(0, 20).reverse();
  const max = Math.max(...samples.map((s) => s.latency ?? 0), 1);

  if (samples.length === 0) {
    return <p className="muted">{t.never}</p>;
  }

  return (
    <div className="latency-chart" role="img" aria-label="Latency history">
      {samples.map((sample, index) => {
        const height = ((sample.latency ?? 0) / max) * 100;
        const tone =
          sample.status === "online"
            ? "bar-online"
            : sample.status === "checking"
              ? "bar-checking"
              : "bar-error";
        return (
          <div
            key={`${sample.timestamp}-${index}`}
            className={`latency-bar ${tone}`}
            style={{ height: `${Math.max(height, 8)}%` }}
            title={`${sample.latency ?? "?"} ms — ${sample.status}`}
          />
        );
      })}
    </div>
  );
};
