import path from 'node:path';
import fs from 'fs-extra';

export interface LanguageMetadata {
  id: string;
  name: string;
  hint?: string;
  enabled: boolean;
}

export interface FrameworkMetadata {
  id: string;
  name: string;
  hint?: string;
  languages: string[];
  enabled: boolean;
}

// Helper to find the correct registry path whether running from src/ or dist/
function getRegistryPath(subfolder: string): string {
  // Option 1: Try relative to project root / current working directory
  const cwdPath = path.resolve(process.cwd(), 'registry', subfolder);
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }

  // Option 2: Try relative to this file's directory (src/registry/ or dist/registry/)
  const relativePath = path.resolve(__dirname, '../../registry', subfolder);
  if (fs.existsSync(relativePath)) {
    return relativePath;
  }

  // Fallback for dist subfolder layouts
  return path.resolve(__dirname, '../registry', subfolder);
}

// 1. Dynamically load all enabled languages
export async function getAvailableLanguages(): Promise<Array<{ value: string; label: string; hint?: string }>> {
  const registryDir = getRegistryPath('languages');

  if (!(await fs.pathExists(registryDir))) {
    console.error(`[Debug] Languages folder not found at: ${registryDir}`);
    return [];
  }

  const files = await fs.readdir(registryDir);
  const languages: Array<{ value: string; label: string; hint?: string }> = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(registryDir, file);
      try {
        const metadata: LanguageMetadata = await fs.readJson(filePath);
        if (metadata.enabled) {
          languages.push({
            value: metadata.id,
            label: metadata.name,
            hint: metadata.hint,
          });
        }
      } catch (err) {
        console.error(`Failed to parse language file: ${file}`);
      }
    }
  }

  return languages;
}

// 2. Dynamically load frameworks supporting the chosen language
export async function getAvailableFrameworks(selectedLanguage: string): Promise<Array<{ value: string; label: string; hint?: string }>> {
  const registryDir = getRegistryPath('frameworks');

  if (!(await fs.pathExists(registryDir))) {
    console.error(`[Debug] Frameworks folder not found at: ${registryDir}`);
    return [];
  }

  const files = await fs.readdir(registryDir);
  const frameworks: Array<{ value: string; label: string; hint?: string }> = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(registryDir, file);
      try {
        const metadata: FrameworkMetadata = await fs.readJson(filePath);
        if (metadata.enabled && metadata.languages.includes(selectedLanguage)) {
          frameworks.push({
            value: metadata.id,
            label: metadata.name,
            hint: metadata.hint,
          });
        }
      } catch (err) {
        console.error(`Failed to parse framework file: ${file}`);
      }
    }
  }

  return frameworks;
}