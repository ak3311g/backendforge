import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { downloadTemplate } from 'giget';
import * as p from '@clack/prompts';
import color from 'picocolors';
import { ProjectOptions } from '../cli/prompts/project.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub repository where remote templates live.
const GITHUB_REPO = 'github:ak3311g/backendforge';

/**
 * 1. Checks if the template exists locally on disk.
 * 2. If not found, downloads it on-demand from GitHub.
 */
// Hardcoded until `layered` templates exist and architecture becomes a real
// CLI choice (registry/architectures/*.json are currently empty stubs and
// only `modular` has templates on disk for any stack).
const DEFAULT_ARCHITECTURE = 'modular';

async function resolveTemplate(language: string, framework: string, targetDir: string): Promise<'local' | 'remote'> {
  const relativeSubpath = path.join('templates', language, framework, DEFAULT_ARCHITECTURE);

  // Check candidate paths for bundled templates. In a compiled Bun exe,
  // __dirname resolves to Bun's internal virtual bundle root (~BUN/$bunfs),
  // not a real disk path — so it can never find a sibling templates/
  // folder. process.execPath IS the real path to the running executable,
  // which is what a hybrid "exe + shipped templates" setup needs.
  const localCandidates = [
    path.resolve(path.dirname(process.execPath), relativeSubpath),
    path.resolve(__dirname, '../..', relativeSubpath), // When running from dist/
    path.resolve(__dirname, '..', relativeSubpath),    // Direct relative
    path.resolve(process.cwd(), relativeSubpath),     // Local development
  ];

  let localDir: string | null = null;
  for (const candidate of localCandidates) {
    if (await fs.pathExists(candidate)) {
      localDir = candidate;
      break;
    }
  }

  // Path A: Local Bundled Template Found
  if (localDir) {
    const excludedDirs = new Set(['node_modules', 'dist', '.venv']);
    await fs.copy(localDir, targetDir, {
      overwrite: true,
      filter: (src) => {
        // Check path segments RELATIVE to the template root, not the full
        // absolute path — a substring check on the full path breaks every
        // global npm install, since the install itself lives under a
        // folder literally named `node_modules`.
        const relative = path.relative(localDir as string, src);
        const segments = relative.split(path.sep);
        return !segments.some((segment) => excludedDirs.has(segment));
      },
    });
    return 'local';
  }

  // Path B: Remote Fetch on Demand
  const spinner = p.spinner();
  spinner.start(`Local template not found. Downloading ${color.cyan(`${language}/${framework}`)} from GitHub...`);

  try {
    await downloadTemplate(`${GITHUB_REPO}/templates/${language}/${framework}/${DEFAULT_ARCHITECTURE}`, {
      dir: targetDir,
      force: true,
    });
    spinner.stop(color.green(`Downloaded ${language}/${framework} template from GitHub`));
    return 'remote';
  } catch (err: any) {
    spinner.stop(color.red('Failed to fetch remote template.'));
    throw new Error(`Template not found locally and remote download failed: ${err.message}`);
  }
}

// Recursive helper to update module import names across all .go files
async function replaceGoModuleNames(dir: string, oldModule: string, newModule: string): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await replaceGoModuleNames(fullPath, oldModule, newModule);
    } else if (entry.name.endsWith('.go') || entry.name === 'go.mod') {
      let content = await fs.readFile(fullPath, 'utf8');
      if (content.includes(oldModule)) {
        content = content.replaceAll(oldModule, newModule);
        await fs.writeFile(fullPath, content, 'utf8');
      }
    }
  }
}

export async function generateProject(options: ProjectOptions): Promise<string> {
  const targetDir = path.resolve(process.cwd(), options.projectName);

  if (await fs.pathExists(targetDir)) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      throw new Error(`Directory "${options.projectName}" already exists and is not empty.`);
    }
  }

  await fs.ensureDir(targetDir);

  await resolveTemplate(options.language, options.framework, targetDir);

  const gitignoreSource = path.join(targetDir, '_gitignore');
  const gitignoreTarget = path.join(targetDir, '.gitignore');
  if (await fs.pathExists(gitignoreSource)) {
    if (gitignoreSource !== gitignoreTarget) {
      await fs.move(gitignoreSource, gitignoreTarget, { overwrite: true });
    }
  }

  const envExamplePath = path.join(targetDir, '.env.example');
  const envTargetPath = path.join(targetDir, '.env');
  if (await fs.pathExists(envExamplePath) && !(await fs.pathExists(envTargetPath))) {
    await fs.copy(envExamplePath, envTargetPath);
  }

  const pkgPath = path.join(targetDir, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    try {
      const pkg = await fs.readJson(pkgPath);
      pkg.name = options.projectName;
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    } catch {
      // Ignore if not a valid JSON
    }
  }

  if (options.language === 'go') {
    const defaultGoModule = 'my-gin-backend';
    await replaceGoModuleNames(targetDir, defaultGoModule, options.projectName);
  }

  if (!options.useDocker) {
    const dockerfile = path.join(targetDir, 'Dockerfile');
    const dockerCompose = path.join(targetDir, 'docker-compose.yml');

    if (await fs.pathExists(dockerfile)) {
      await fs.remove(dockerfile);
    }
    if (await fs.pathExists(dockerCompose)) {
      await fs.remove(dockerCompose);
    }
  }

  return targetDir;
}