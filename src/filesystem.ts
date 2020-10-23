import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import {
  getBaseCheckTS,
  getBaseCommand,
  getBaseCommandTS,
  getBaseEvent,
  getBaseEventTS,
  getCheckFailedEventTS,
  getCommandTemplate,
  getCommandTemplateTS,
  getEventTemplate,
  getEventTemplateTS,
  getHasPermissionsCheckTS,
  getIsGuildOwnerCheckTS,
  getIsOwnerCheckTS,
  getMessageEvent,
  getMessageEventTS,
  getReadyEvent,
  getReadyEventTS,
  getRegistryFile,
  getRegistryFileTS,
  getTestCommand,
  getTestCommandTS,
  getTypescriptBotFile,
  TSCONFIG,
} from './templates/templates';
import { capitalize } from './utils';

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

export function createProjectDetailsFile(filePath: string, name: string, language: string) {
  const discli = {
    name,
    language,
  };
  return fs.writeFile(path.join(filePath, 'discli.json'), JSON.stringify(discli, null, 2));
}

export async function createDirectory(filePath: string) {
  try {
    return fs.mkdir(filePath);
  } catch (err) {
    return err;
  }
}

export async function createSrcFolder(filePath: string) {
  try {
    return fs.mkdir(path.join(filePath, 'src'));
  } catch (err) {
    return err;
  }
}

export async function createEnvironmentFile(filePath: string, data: string) {
  try {
    return fs.writeFile(path.join(filePath, '.env'), data);
  } catch (err) {
    return err;
  }
}

export async function createMainFile(filePath: string, data: string, language: string) {
  return language === 'ts' ? fs.writeFile(path.join(filePath, 'src', 'bot.ts'), data) : fs.writeFile(path.join(filePath, 'src', 'bot.js'), data);
}

export async function getFile(filePath: string) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text);
}

export async function generateTemplates(filePath: string) {
  try {
    await fs.mkdir(path.join(filePath, 'src', 'utils'));
    await fs.mkdir(path.join(filePath, 'src', 'utils', 'structures'));
    await fs.writeFile(path.join(filePath, 'src', 'utils', 'registry.js'), getRegistryFile());
    await fs.writeFile(path.join(filePath, 'src', 'utils', 'structures', 'BaseCommand.js'), getBaseCommand());
    await fs.writeFile(path.join(filePath, 'src', 'utils', 'structures', 'BaseEvent.js'), getBaseEvent());
    await fs.mkdir(path.join(filePath, 'src', 'commands'));
    await fs.mkdir(path.join(filePath, 'src', 'events'));
    await fs.mkdir(path.join(filePath, 'src', 'commands', 'test'));
    await fs.mkdir(path.join(filePath, 'src', 'events', 'ready'));
    await fs.mkdir(path.join(filePath, 'src', 'events', 'message'));
    await fs.writeFile(path.join(filePath, 'src', 'events', 'ready', 'ready.js'), getReadyEvent());
    await fs.writeFile(path.join(filePath, 'src', 'events', 'message', 'message.js'), getMessageEvent());
    await fs.writeFile(path.join(filePath, 'src', 'commands', 'test', 'TestCommand.js'), getTestCommand());
  } catch (err) {
    throw new Error(err);
  }
}

export async function generateTSTemplates(filePath: string) {
  try {
    await fs.mkdir(path.join(filePath, 'src', 'utils'));
    await fs.mkdir(path.join(filePath, 'src', 'utils', 'structures'));
    await fs.writeFile(path.join(filePath, 'src', 'utils', 'registry.ts'), getRegistryFileTS());
    await fs.writeFile(path.join(filePath, 'src', 'utils', 'structures', 'BaseCommand.ts'), getBaseCommandTS());
    await fs.writeFile(path.join(filePath, 'src', 'utils', 'structures', 'BaseEvent.ts'), getBaseEventTS());
    await fs.writeFile(path.join(filePath, 'src', 'utils', 'structures', 'BaseCheck.ts'), getBaseCheckTS());
    await fs.mkdir(path.join(filePath, 'src', 'commands'));
    await fs.mkdir(path.join(filePath, 'src', 'events'));
    await fs.mkdir(path.join(filePath, 'src', 'checks'));
    await fs.mkdir(path.join(filePath, 'src', 'client'));
    await fs.writeFile(path.join(filePath, 'src', 'client', 'client.ts'), getTypescriptBotFile());
    await fs.mkdir(path.join(filePath, 'src', 'commands', 'test'));
    await fs.mkdir(path.join(filePath, 'src', 'events', 'error'));
    await fs.mkdir(path.join(filePath, 'src', 'events', 'ready'));
    await fs.mkdir(path.join(filePath, 'src', 'events', 'message'));
    await fs.writeFile(path.join(filePath, 'src', 'events', 'ready', 'ready.ts'), getReadyEventTS());
    await fs.writeFile(path.join(filePath, 'src', 'events', 'error', 'CheckFailed.ts'), getCheckFailedEventTS());
    await fs.writeFile(path.join(filePath, 'src', 'events', 'message', 'message.ts'), getMessageEventTS());
    await fs.writeFile(path.join(filePath, 'src', 'commands', 'test', 'TestCommand.ts'), getTestCommandTS());
    await fs.writeFile(path.join(filePath, 'src', 'checks', 'HasPermissions.ts'), getHasPermissionsCheckTS());
    await fs.writeFile(path.join(filePath, 'src', 'checks', 'IsGuildOwner.ts'), getIsGuildOwnerCheckTS());
    await fs.writeFile(path.join(filePath, 'src', 'checks', 'IsOwner.ts'), getIsOwnerCheckTS());
  } catch (err) {
    throw new Error(err);
  }
}

export async function createTemplateCommandFile(
  filePath: string,
  name: string,
  category: string,
  language: string,
) {
  return language === 'js'
    ? fs.writeFile(path.join(filePath, `${capitalize(name)}Command.js`), getCommandTemplate(name, category))
    : fs.writeFile(path.join(filePath, `${capitalize(name)}Command.ts`), getCommandTemplateTS(name, category));
}

export async function createTemplateEventFile(
  filePath: string,
  name: string,
  language: string,
) {
  return language === 'js'
    ? fs.writeFile(path.join(filePath, `${capitalize(name)}Command.js`), getEventTemplate(name))
    : fs.writeFile(path.join(filePath, `${capitalize(name)}Command.ts`), getEventTemplateTS(name));
}

export async function createEventFile(filePath: string, template: string) {
  return fs.writeFile(filePath, template);
}

export async function modifyPackageJSONFile(filePath: string, language: string) {
  const buffer = await fs.readFile(path.join(filePath, 'package.json'), 'utf8');
  const json = JSON.parse(buffer);
  if (!json.scripts) json.scripts = {};
  json.scripts.dev = language === 'js' ? 'nodemon ./src/bot.js' : 'nodemon --exec ts-node src/bot.ts';
  json.scripts.start = language === 'js' ? 'node ./src/bot.js' : 'node ./build/bot.js';
  if (language === 'ts') json.scripts.build = 'tsc --build';
  return fs.writeFile(path.join(filePath, 'package.json'), JSON.stringify(json, null, 2));
}

export async function deleteDirectory(filePath: string) {
  return fs.rmdir(filePath, {
    recursive: true,
  });
}

// region Git initialize
export async function createGitignoreFile(filePath: string, data: string) {
  try {
    return fs.writeFile(path.join(filePath, '.gitignore'), data);
  } catch (err) {
    return err;
  }
}

export async function initializeGit(filePath: string) {
  return execSync('git init', {
    cwd: filePath,
    stdio: 'ignore',
  });
}

export async function gitInitAdd(filePath: string) {
  return execSync('git add .', {
    cwd: filePath,
    stdio: 'ignore',
  });
}

export async function gitInitCommit(filePath: string) {
  return execSync('git commit -m "Discli: Initial commit"', {
    cwd: filePath,
    stdio: 'ignore',
  });
}
// endregion

// region Npm install
export async function initializeNPM(filePath: string) {
  return execSync('npm init -y', {
    cwd: filePath,
  });
}

export async function npmInstallDiscordJS(filePath: string) {
  return execSync('npm i discord.js@latest', {
    cwd: filePath,
    stdio: 'ignore',
  });
}

export async function npmInstallTypescript(filePath: string) {
  return execSync('npm i -D typescript', {
    cwd: filePath,
    stdio: 'ignore',
  });
}

export async function npmInstallTSNode(filePath: string) {
  return execSync('npm i -D ts-node', {
    cwd: filePath,
    stdio: 'ignore',
  });
}
export async function npmInstallTypes(filePath: string) {
  return execSync('npm i -D @types/node', {
    cwd: filePath,
    stdio: 'ignore',
  });
}

export async function npmInstallDotenv(filePath: string) {
  return execSync('npm i dotenv', {
    cwd: filePath,
    stdio: 'ignore',
  });
}
// endregion

// region yarn install
export async function initializeYARN(filePath: string) {
  return execSync('yarn init -y', {
    cwd: filePath,
  });
}

export async function yarnInstallDiscordJS(filePath: string) {
  return execSync('yarn add discord.js@latest', {
    cwd: filePath,
    stdio: 'ignore',
  });
}

export async function yarnInstallTypescript(filePath: string) {
  return execSync('yarn add typescript --dev', {
    cwd: filePath,
    stdio: 'ignore',
  });
}

export async function yarnInstallTSNode(filePath: string) {
  return execSync('yarn add ts-node --dev', {
    cwd: filePath,
    stdio: 'ignore',
  });
}
export async function yarnInstallTypes(filePath: string) {
  return execSync('yarn add @types/node --dev', {
    cwd: filePath,
    stdio: 'ignore',
  });
}

export async function yarnInstallDotenv(filePath: string) {
  return execSync('yarn add dotenv', {
    cwd: filePath,
    stdio: 'ignore',
  });
}
// endregion

// install tsconfig file
export async function setupTSConfigTemplate(filePath: string) {
  return fs.writeFile(path.join(filePath, 'tsconfig.json'), TSCONFIG);
}
