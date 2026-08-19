import { LANGUAGES, FRAMEWORKS } from './data.js';

// Languages/frameworks are statically embedded (see data.ts) rather than
// read from disk, so this works identically whether running via `bun run`,
// the npm-installed CLI, or a Bun --compile standalone .exe with no
// registry/ folder anywhere near it.

export async function getAvailableLanguages(): Promise<Array<{ value: string; label: string; hint?: string }>> {
  return LANGUAGES.filter((lang) => lang.enabled).map((lang) => ({
    value: lang.id,
    label: lang.name,
    hint: lang.hint,
  }));
}

export async function getAvailableFrameworks(selectedLanguage: string): Promise<Array<{ value: string; label: string; hint?: string }>> {
  return FRAMEWORKS.filter((fw) => fw.enabled && fw.languages.includes(selectedLanguage)).map((fw) => ({
    value: fw.id,
    label: fw.name,
    hint: fw.hint,
  }));
}