import { id, type TranslationKey } from './id';

export const i18n = {
  currentLanguage: 'id',
  t: id,
};

export function useI18n(): TranslationKey {
  return i18n.t;
}
