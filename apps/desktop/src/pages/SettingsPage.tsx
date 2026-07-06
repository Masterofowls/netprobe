import { save, open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useAppStore } from "../store/useAppStore";
import { useT } from "../hooks/useTranslation";
import { createBackup, parseBackup, serializeBackup, buildStatusShareText } from "../services/dataExport";

export const SettingsPage = () => {
  const t = useT();
  const { settings, resources, updateSettings, resetToDefaults, importBackup } =
    useAppStore();

  const customResources = resources.filter((r) => !r.isBuiltIn);

  const handleExport = async () => {
    const backup = createBackup(customResources, settings);
    const path = await save({
      defaultPath: `netprobe-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (path) {
      await writeTextFile(path, serializeBackup(backup));
    }
  };

  const handleImport = async () => {
    const path = await open({
      multiple: false,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (!path || Array.isArray(path)) return;
    const raw = await readTextFile(path);
    const backup = parseBackup(raw);
    await importBackup(backup);
  };

  const handleShareStatus = async () => {
    const text = buildStatusShareText(resources);
    const path = await save({
      defaultPath: `netprobe-status-${new Date().toISOString().slice(0, 10)}.txt`,
      filters: [{ name: "Text", extensions: ["txt"] }],
    });
    if (path) await writeTextFile(path, text);
  };

  return (
    <div className="page page--narrow">
      <header className="page-header">
        <h2>{t.settings}</h2>
      </header>

      <section className="panel settings-group">
        <h3>{t.autoRefresh}</h3>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.autoRefresh}
            onChange={(e) => updateSettings({ autoRefresh: e.target.checked })}
          />
          <span>{t.autoRefreshDesc}</span>
        </label>
        <label>
          {t.refreshInterval}
          <select
            value={settings.refreshInterval}
            onChange={(e) =>
              updateSettings({ refreshInterval: Number(e.target.value) })
            }
          >
            <option value={15000}>{t.sec15}</option>
            <option value={30000}>{t.sec30}</option>
            <option value={60000}>{t.min1}</option>
            <option value={300000}>{t.min5}</option>
          </select>
        </label>
        <label>
          {t.requestTimeout}
          <select
            value={settings.timeout}
            onChange={(e) => updateSettings({ timeout: Number(e.target.value) })}
          >
            <option value={5000}>{t.sec5}</option>
            <option value={10000}>{t.sec10}</option>
            <option value={15000}>15s</option>
          </select>
        </label>
      </section>

      <section className="panel settings-group">
        <h3>{t.theme}</h3>
        <div className="radio-row">
          {(["system", "light", "dark"] as const).map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="theme"
                checked={settings.theme === value}
                onChange={() => updateSettings({ theme: value })}
              />
              {value === "system"
                ? t.systemDefault
                : value === "light"
                  ? t.light
                  : t.dark}
            </label>
          ))}
        </div>
        <label>
          Language
          <select
            value={settings.language}
            onChange={(e) =>
              updateSettings({ language: e.target.value as "en" | "ru" })
            }
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </label>
      </section>

      <section className="panel settings-group">
        <h3>{t.deepChecks}</h3>
        <p className="muted">{t.deepChecksDesc}</p>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.enableDnsCheck}
            onChange={(e) => updateSettings({ enableDnsCheck: e.target.checked })}
          />
          <span>DNS</span>
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.enableTlsCheck}
            onChange={(e) => updateSettings({ enableTlsCheck: e.target.checked })}
          />
          <span>TLS</span>
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) =>
              updateSettings({ notificationsEnabled: e.target.checked })
            }
          />
          <span>Desktop notifications</span>
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.hideBuiltIn}
            onChange={(e) => updateSettings({ hideBuiltIn: e.target.checked })}
          />
          <span>{t.hideBuiltIn}</span>
        </label>
      </section>

      <section className="panel settings-group">
        <h3>Data</h3>
        <div className="button-row">
          <button type="button" className="btn" onClick={handleExport}>
            Export backup
          </button>
          <button type="button" className="btn" onClick={handleImport}>
            Import backup
          </button>
          <button type="button" className="btn" onClick={handleShareStatus}>
            Export status report
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => resetToDefaults()}
          >
            {t.resetToDefaults}
          </button>
        </div>
      </section>
    </div>
  );
};
