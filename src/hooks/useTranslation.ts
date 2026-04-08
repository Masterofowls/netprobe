import { useAppStore } from '../store/useAppStore';
import { getTranslations } from '../constants/i18n';
import type { Translations } from '../constants/i18n';

export const useT = (): Translations => {
  const { settings } = useAppStore();
  return getTranslations(settings.language);
};
