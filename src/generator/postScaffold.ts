import { spawn } from 'node:child_process';
import * as p from '@clack/prompts';
import color from 'picocolors';
import { ProjectOptions } from '../cli/prompts/project.js';

// Safe promise wrapper around native child_process.spawn
function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // shell: true is critical for Windows support with npm, git, mvn, etc.
    const child = spawn(command, args, {
      cwd,
      stdio: 'ignore',
      shell: true,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}`));
      }
    });
  });
}

function detectNodePackageManager(): 'bun' | 'pnpm' | 'yarn' | 'npm' {
  const userAgent = process.env.npm_config_user_agent || '';
  if (userAgent.startsWith('bun')) return 'bun';
  if (userAgent.startsWith('pnpm')) return 'pnpm';
  if (userAgent.startsWith('yarn')) return 'yarn';
  return 'npm';
}

export async function runPostScaffold(targetDir: string, options: ProjectOptions): Promise<void> {
  const spinner = p.spinner();

  // 1. Git Initialization
  if (options.initGit) {
    spinner.start('Initializing Git repository...');
    try {
      await runCommand('git', ['init'], targetDir);
      await runCommand('git', ['add', '-A'], targetDir);
      await runCommand('git', ['commit', '-m', '"Initial commit from BackendForge"'], targetDir);
      spinner.stop('Initialized Git repository');
    } catch {
      spinner.stop(color.yellow('Skipped Git initialization (git might not be installed)'));
    }
  }

  // 2. Dependency Installation
  if (options.installDeps) {
    spinner.start('Installing dependencies...');
    try {
      if (options.language === 'typescript' || options.language === 'javascript') {
        const pm = detectNodePackageManager();
        await runCommand(pm, ['install'], targetDir);

        // Auto-run prisma generate if present
        try {
          if (pm === 'npm') {
            await runCommand('npx', ['prisma', 'generate'], targetDir);
          } else {
            await runCommand(pm, ['prisma', 'generate'], targetDir);
          }
        } catch {
          // Ignore if prisma is not used
        }

        spinner.stop(`Installed dependencies using ${color.cyan(pm)}`);
      } else if (options.language === 'python') {
        try {
          await runCommand('python', ['-m', 'venv', '.venv'], targetDir);
        } catch {
          await runCommand('python3', ['-m', 'venv', '.venv'], targetDir);
        }

        const isWin = process.platform === 'win32';
        const pipPath = isWin ? '.venv\\Scripts\\pip' : '.venv/bin/pip';

        await runCommand(pipPath, ['install', '-r', 'requirements.txt'], targetDir);
        spinner.stop('Created virtual environment and installed Python packages');
      } else if (options.language === 'go') {
        await runCommand('go', ['mod', 'tidy'], targetDir);
        spinner.stop('Tidied and downloaded Go modules');
      } else if (options.language === 'java') {
        const isWin = process.platform === 'win32';
        const mvnCmd = isWin ? 'mvn.cmd' : 'mvn';
        await runCommand(mvnCmd, ['dependency:resolve'], targetDir);
        spinner.stop('Resolved Maven dependencies');
      }
    } catch {
      spinner.stop(color.yellow('Could not finish automatic installation. You can install manually.'));
    }
  }
}