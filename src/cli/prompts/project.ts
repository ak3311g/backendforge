import * as p from '@clack/prompts';
import { getAvailableLanguages, getAvailableFrameworks } from '../../registry/loader.js';

export interface ProjectOptions {
  projectName: string;
  language: string;
  framework: string;
  initGit: boolean;
  installDeps: boolean;
  useDocker: boolean;
  forceRemote?: boolean;
}

export async function promptProjectOptions(): Promise<ProjectOptions> {
  const project = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'What is your project named?',
          placeholder: 'my-backend-api',
          validate: (value) => {
            if (!value.trim()) return 'Project name cannot be empty';
            if (/[^a-zA-Z0-9-_]/.test(value)) return 'Only letters, numbers, hyphens, and underscores are allowed';
          },
        }),

      language: async () => {
        const languages = await getAvailableLanguages();
        return p.select<string>({
          message: 'Select a programming language:',
          options: languages,
        });
      },

      framework: async ({ results }) => {
        const frameworks = await getAvailableFrameworks(results.language as string);
        if (frameworks.length === 0) {
          p.cancel(`No frameworks registered for language: ${results.language}`);
          process.exit(0);
        }
        return p.select({
          message: 'Select a framework:',
          options: frameworks,
        });
      },

      useDocker: () =>
        p.confirm({
          message: 'Include Docker & Docker Compose setup?',
          initialValue: true,
        }),

      initGit: () =>
        p.confirm({
          message: 'Initialize a new Git repository?',
          initialValue: true,
        }),

      installDeps: () =>
        p.confirm({
          message: 'Install dependencies automatically?',
          initialValue: true,
        }),
    },
    {
      onCancel: () => {
        p.cancel('Operation cancelled.');
        process.exit(0);
      },
    }
  );

  return project as ProjectOptions;
}