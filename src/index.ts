import * as p from '@clack/prompts';
import color from 'picocolors';
import { promptProjectOptions } from './cli/prompts/project.js';
import { generateProject } from './generator/generator.js';
import { runPostScaffold } from './generator/postScaffold.js';


async function main() {
  console.clear();
  p.intro(color.bgCyan(color.black(' ⚡ BACKENDFORGE CLI ')));

  const options = await promptProjectOptions();

  const spinner = p.spinner();
  spinner.start('Scaffolding your modular backend...');

  try {
    const targetDir = await generateProject(options);
    spinner.stop(color.green('Project structure created!'));

    // Run Git init & Dependency installation
    await runPostScaffold(targetDir, options);

    // Dynamic Next Steps
    let startCommand = 'npm run dev';
    if (options.language === 'python') {
      startCommand = process.platform === 'win32' 
        ? '.venv\\Scripts\\activate && uvicorn app.main:app --reload'
        : 'source .venv/bin/activate && uvicorn app.main:app --reload';
    } else if (options.language === 'go') {
      startCommand = 'go run cmd/api/main.go';
    } else if (options.language === 'java') {
      startCommand = './mvnw spring-boot:run';
    }

    const nextSteps = [
      `cd ${options.projectName}`,
      ...(options.installDeps ? [] : ['Install dependencies']),
      startCommand,
    ];

    p.note(nextSteps.join('\n'), 'Next Steps:');
    p.outro(color.green('Happy hacking! 🚀'));
  } catch (error: any) {
    spinner.stop(color.red('Failed to generate project.'));
    p.log.error(error.message);
    process.exit(1);
  }
}

main();