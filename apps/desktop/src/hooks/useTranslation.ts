import { getTranslations } from "@core/constants/i18n";
import type { Translations } from "@core/constants/i18n";
import { useAppStore } from "../store/useAppStore";

export const useT = (): Translations => {
  const language = useAppStore((s) => s.settings.language);
  return getTranslations(language);
};
