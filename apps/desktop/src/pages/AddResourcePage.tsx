import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useT } from "../hooks/useTranslation";

const ICONS = ["🌐", "📡", "☁️", "🔒", "📦", "🛒", "🎮", "📰"];
const COLORS = ["#6750A4", "#2E7D32", "#1565C0", "#C62828", "#EF6C00", "#6A1B9A"];

export const AddResourcePage = () => {
  const t = useT();
  const addResource = useAppStore((s) => s.addResource);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [icon, setIcon] = useState("🌐");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }
    let target = url.trim();
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = `https://${target}`;
    }
    try {
      const parsed = new URL(target);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        setError(t.invalidProtocol);
        return;
      }
      await addResource({
        name: name.trim(),
        url: target,
        icon,
        color,
        category: category.trim() || undefined,
        keyword: keyword.trim() || undefined,
      });
      navigate("/");
    } catch {
      setError(t.invalidUrl);
    }
  };

  return (
    <div className="page page--narrow">
      <header className="page-header">
        <div>
          <h2>{t.newCustomResource}</h2>
          <p className="muted">{t.addCustomSubtitle}</p>
        </div>
      </header>

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <label>
          {t.resourceName}
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.resourceNamePlaceholder}
          />
        </label>
        <label>
          {t.url}
          <input
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.urlPlaceholder}
          />
        </label>
        <label>
          {t.categoryOptional}
          <input
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t.categoryPlaceholder}
          />
        </label>
        <label>
          Keyword (optional)
          <input
            className="input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. Welcome"
          />
        </label>

        <fieldset className="picker">
          <legend>{t.icon}</legend>
          <div className="picker-row">
            {ICONS.map((value) => (
              <button
                key={value}
                type="button"
                className={`chip ${icon === value ? "chip--active" : ""}`}
                onClick={() => setIcon(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="picker">
          <legend>{t.color}</legend>
          <div className="picker-row">
            {COLORS.map((value) => (
              <button
                key={value}
                type="button"
                className={`color-swatch ${color === value ? "color-swatch--active" : ""}`}
                style={{ backgroundColor: value }}
                onClick={() => setColor(value)}
                aria-label={value}
              />
            ))}
          </div>
        </fieldset>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn" onClick={() => navigate("/")}>
            {t.cancel}
          </button>
          <button type="submit" className="btn btn--primary">
            {t.save}
          </button>
        </div>
      </form>
    </div>
  );
};
