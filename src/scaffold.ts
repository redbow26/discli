/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import prompts from 'prompts';
import path from 'path';
import chalk from 'chalk';
import symbols from 'log-symbols';
import {
  dependencySelect,
  getCredentials, getGit, setupTypescript,
} from './questions';
import {
  exists,
  createDirectory,
  initializeNPM,
  npmInstallDiscordJS,
  npmInstallDotenv,
  npmInstallTSNode,
  npmInstallTypes,
  npmInstallTypescript,
  yarnInstallDiscordJS,
  yarnInstallDotenv,
  yarnInstallTSNode,
  yarnInstallTypes,
  yarnInstallTypescript,
  createSrcFolder,
  createEnvironmentFile,
  createMainFile,
  deleteDirectory,
  generateTemplates,
  generateTSTemplates,
  modifyPackageJSONFile,
  createCommandFile,
  createEventFile,
  createProjectDetailsFile,
  getFile,
  setupTSConfigTemplate,
  createGitignoreFile,
  initializeGit,
  gitInitAdd,
  gitInitCommit, initializeYARN,
} from './filesystem';
import { getEnvTemplate, getMainFile, getMainFileTS } from './templates/templates';
import { capitalize } from './utils';
import eventTemplates from './templates/events';
import eventTemplatesTS from './templates/tsevents';

const events: any = eventTemplates;
const eventsTS: any = eventTemplatesTS;

const dir = process.cwd();

export async function createNewProject(name: string, language: string) {
  const filePath = path.join(dir, name);
  const dirExists = await exists(filePath);
  if (!dirExists) {
    try {
      await createDirectory(filePath);
      console.log(chalk.yellow.bold(`${symbols.success} Generated ${filePath}`));
      await createProjectDetailsFile(filePath, name, language);
      const { dependency } = await prompts(dependencySelect);
      console.log(dependency);
      if (dependency === 'npm') {
        await initializeNPM(filePath);
        console.log(chalk.yellow.bold(`${symbols.success} Initialized NPM`));
        await npmInstallDiscordJS(filePath);
        console.log(chalk.yellow.bold(`${symbols.success} Installed Discord.JS`));
        await npmInstallDotenv(filePath);
        console.log(chalk.yellow.bold(`${symbols.success} Installed dotenv.`));
        await createSrcFolder(filePath);
      } else if (dependency === 'yarn') {
        await initializeYARN(filePath);
        console.log(chalk.yellow.bold(`${symbols.success} Initialized Yarn`));
        await yarnInstallDiscordJS(filePath);
        console.log(chalk.yellow.bold(`${symbols.success} Installed Discord.JS`));
        await yarnInstallDotenv(filePath);
        console.log(chalk.yellow.bold(`${symbols.success} Installed dotenv.`));
        await createSrcFolder(filePath);
      }
      const { token, prefix } = await prompts(getCredentials);
      const env = getEnvTemplate(token, prefix);
      await createEnvironmentFile(filePath, env);
      console.log(chalk.yellow.bold(`${symbols.success} Created .env file.`));
      const main = language === 'js' ? getMainFile() : getMainFileTS();
      await createMainFile(filePath, main, language);
      console.log(chalk.yellow.bold(`${symbols.success} Created main bot.${language} file.`));
      const templates = language === 'js' ? await generateTemplates(filePath) : await generateTSTemplates(filePath);
      console.log(chalk.yellow.bold(`${symbols.success} Generated templates.`));
      await modifyPackageJSONFile(filePath, language);
      if (language === 'ts') {
        const { value } = await prompts(setupTypescript);
        if (value) {
          if (dependency === 'npm') {
            await npmInstallTypescript(filePath);
            console.log(chalk.yellow.bold(`${symbols.success} Installed TypeScript`));
            await npmInstallTSNode(filePath);
            console.log(chalk.yellow.bold(`${symbols.success} Installed ts-node.`));
            await npmInstallTypes(filePath);
            console.log(chalk.yellow.bold(`${symbols.success} Installed @types/node.`));
            await setupTSConfigTemplate(filePath);
            console.log(chalk.yellow.bold(`${symbols.success} Setup tsconfig.json`));
          } else if (dependency === 'yarn') {
            await yarnInstallTypescript(filePath);
            console.log(chalk.yellow.bold(`${symbols.success} Installed TypeScript`));
            await yarnInstallTSNode(filePath);
            console.log(chalk.yellow.bold(`${symbols.success} Installed ts-node.`));
            await yarnInstallTypes(filePath);
            console.log(chalk.yellow.bold(`${symbols.success} Installed @types/node.`));
            await setupTSConfigTemplate(filePath);
            console.log(chalk.yellow.bold(`${symbols.success} Setup tsconfig.json`));
          }
        }
      }
      const { git } = await prompts(getGit);
      if (git === 'yes') {
        const gitignore = 'node_modules\n.env\n.idea';
        await createGitignoreFile(filePath, gitignore);
        console.log(chalk.yellow.bold(`${symbols.success} Created .gitignore file.`));
        await initializeGit(filePath);
        await gitInitAdd(filePath);
        await gitInitCommit(filePath);
        console.log(chalk.yellow.bold(`${symbols.success} Git initialized.`));
      }
      console.log(chalk.yellow.bold(`${symbols.success} Success!`));
      if (dependency === 'npm') console.log(`Type ${chalk.red.bold(`cd ./${name} and then npm run start`)}`);
      else if (dependency === 'yarn') console.log(`Type ${chalk.red.bold(`cd ./${name} and then yarn start`)}`);
      return true;
    } catch (err) {
      console.log(err);
      await deleteDirectory(filePath);
      return err;
    }
  } else {
    throw new Error(`File/Folder with name: ${name} already exists. Cannot create file.`);
  }
}

export async function generateNewCommand(commandName: string, category: string) {
  const discliFile = path.join(dir, 'discli.json');
  const fileExists = await exists(discliFile);
  if (fileExists) {
    const { language } = await getFile(discliFile);
    // Check the language
    // Check if commands folder has category.
    // if it exists, create it in there, if not, create folder.
    const commandsPath = path.join(dir, 'src', 'commands', category);
    const categoryExists = await exists(commandsPath);
    if (categoryExists) {
      // Check if command already exists.
      const commandFile = language === 'js' ? `${capitalize(commandName)}Command.js` : `${capitalize(commandName)}Command.ts`;
      const commandFilePath = path.join(commandsPath, commandFile);
      const commandExists = await exists(commandFilePath);
      if (!commandExists) return createCommandFile(commandsPath, commandName, category, language);
      throw new Error(`Command already exists. ${commandFile}`);
    }
    await createDirectory(commandsPath);
    return createCommandFile(commandsPath, commandName, category, language);
  } throw new Error('Not a discli project');
}

export async function generateNewEvent(eventsArray: Array<string>) {
  const discliFile = path.join(dir, 'discli.json');
  const discliFileExists = await exists(discliFile);
  const eventsPath = path.join(dir, 'src', 'events');
  try {
    if (discliFileExists) {
      const { language } = await getFile(discliFile);
      const fileExists = await exists(eventsPath);
      if (!fileExists) await createDirectory(eventsPath);
      const js = language === 'js';
      // eslint-disable-next-line no-restricted-syntax
      for (const event of eventsArray) {
        const eventsFilePath = js
          ? path.join(eventsPath, `${capitalize(event)}Event.js`)
          : path.join(eventsPath, `${capitalize(event)}Event.ts`);
        const eventsFileExists = await exists(eventsFilePath);
        // eslint-disable-next-line max-len
        if (!eventsFileExists) await createEventFile(eventsFilePath, js ? events[event] : eventsTS[event]);
        console.log(`${symbols.success} Created ${eventsFilePath}`);
      }
    } else throw new Error(`${symbols.error} Not a discli project`);
  } catch (err) {
    console.log(err);
  }
}
