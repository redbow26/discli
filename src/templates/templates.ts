import { capitalize } from '../utils';

export function getEnvTemplate(token: string, prefix: string) {
  return `DISCORD_BOT_TOKEN=${token}\nDISCORD_BOT_PREFIX=${prefix}`;
}

export function getMainFile() {
  return `require('dotenv').config();
const { Client } = require('discord.js');
const { registerCommands, registerEvents } = require('./utils/registry');
const client = new Client();

(async () => {
  client.commands = new Map();
  client.events = new Map();
  client.prefix = process.env.DISCORD_BOT_PREFIX;
  await registerCommands(client, '../commands');
  await registerEvents(client, '../events');
  await client.login(process.env.DISCORD_BOT_TOKEN);
})();\n
`;
}

export function getMainFileTS() {
  return `import { config } from 'dotenv';
config();
import { registerCommands, registerEvents } from './utils/registry';
import DiscordClient from './client/client';
const client = new DiscordClient({});

(async () => {
  client.prefix = process.env.DISCORD_BOT_PREFIX || client.prefix;
  await registerCommands(client, '../commands');
  await registerEvents(client, '../events');
  await client.login(process.env.DISCORD_BOT_TOKEN);
})();\n
`;
}

export function getTypescriptBotFile() {
  return `import { Client, ClientOptions, Collection } from 'discord.js';
import BaseEvent from '../utils/structures/BaseEvent';
import BaseCommand from '../utils/structures/BaseCommand';

export default class DiscordClient extends Client {

  private _commands = new Collection<string, BaseCommand>();
  private _events = new Collection<string, BaseEvent>();
  private _prefix: string = '!';

  constructor(options?: ClientOptions) {
    super(options);
  }

  get commands(): Collection<string, BaseCommand> { return this._commands; }
  get events(): Collection<string, BaseEvent> { return this._events; }
  get prefix(): string { return this._prefix; }

  set prefix(prefix: string) { this._prefix = prefix; }

}
`;
}

export function getRegistryFileTS() {
  return `
import path from 'path';
import { promises as fs } from 'fs';
import DiscordClient from '../client/client';

export async function registerCommands(client: DiscordClient, dir: string = '') {
  const filePath = path.join(__dirname, dir);
  const files = await fs.readdir(filePath);
  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    if (stat.isDirectory()) registerCommands(client, path.join(dir, file));
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      const { default: Command } = await import(path.join(dir, file));
      const command = new Command();
      client.commands.set(command.getName(), command);
      command.getAliases().forEach((alias: string) => {
        client.commands.set(alias, command);
      });
    }
  }
}

export async function registerEvents(client: DiscordClient, dir: string = '') {
  const filePath = path.join(__dirname, dir);
  const files = await fs.readdir(filePath);
  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    if (stat.isDirectory()) registerEvents(client, path.join(dir, file));
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      const { default: Event } = await import(path.join(dir, file));
      const event = new Event();
      client.events.set(event.getName(), event);
      client.on(event.getName(), event.run.bind(event, client));
    }
  }
}
`;
}

export function getRegistryFile() {
  return `
const path = require('path');
const fs = require('fs').promises;
const BaseCommand = require('./structures/BaseCommand');
const BaseEvent = require('./structures/BaseEvent');

async function registerCommands(client, dir = '') {
  const filePath = path.join(__dirname, dir);
  const files = await fs.readdir(filePath);
  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    if (stat.isDirectory()) registerCommands(client, path.join(dir, file));
    if (file.endsWith('.js')) {
      const Command = require(path.join(filePath, file));
      if (Command.prototype instanceof BaseCommand) {
        const cmd = new Command();
        client.commands.set(cmd.name, cmd);
        cmd.aliases.forEach((alias) => {
          client.commands.set(alias, cmd);
        });
      }
    }
  }
}

async function registerEvents(client, dir = '') {
  const filePath = path.join(__dirname, dir);
  const files = await fs.readdir(filePath);
  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    if (stat.isDirectory()) registerEvents(client, path.join(dir, file));
    if (file.endsWith('.js')) {
      const Event = require(path.join(filePath, file));
      if (Event.prototype instanceof BaseEvent) {
        const event = new Event();
        client.events.set(event.name, event);
        client.on(event.name, event.run.bind(event, client));
      }
    }
  }
}

module.exports = { 
  registerCommands, 
  registerEvents,
};`;
}

export function getBaseCommand() {
  return `module.exports = class BaseCommand {
  constructor(name, category, aliases) {
    this.name = name;
    this.category = category;
    this.aliases = aliases;
  }
}`;
}

export function getBaseCommandTS() {
  return `
import { Message } from 'discord.js';
import DiscordClient from '../../client/client';
import BaseCheck from "./BaseCheck";

export default abstract class BaseCommand {
  protected constructor(private name: string, private category: string, private description: string, private aliases: Array<string>, private checks: Array<BaseCheck>) {}

  getName(): string { return this.name; }
  getCategory(): string { return this.category; }
  getDescription(): string { return this.description; }
  getAliases(): Array<string> { return this.aliases; }
  getChecks(): Array<BaseCheck> { return this.checks; }

  passChecks(client: DiscordClient, message: Message): boolean {
    let pass = true;
    // Verify each check
    this.checks.forEach(check => {
      // If the check failed emit checkFailed event
      if (!check.run(client, message)) {
        client.emit("checkFailed", message, check);
        pass = false;
      }
    });
    return pass;
  }

  abstract async run(client: DiscordClient, message: Message, args: Array<string> | null): Promise<void>;
}`;
}

export function getBaseEvent() {
  return `module.exports = class BaseEvent {
  constructor(name) {
    this.name = name;
  }
}`;
}

export function getBaseEventTS() {
  return `
import DiscordClient from '../../client/client';

export default abstract class BaseEvent {
  protected constructor(private name: string) { }

  getName(): string { return this.name; }
  abstract run(client: DiscordClient, ...args: any): void;
}`;
}

export function getBaseCheckTS() {
  return `
import { Message } from 'discord.js';
import DiscordClient from '../../client/client';

export default abstract class BaseCommand {
    protected constructor(private name: string, private failedDesc: string, private callback: boolean = true, ...args: any | null) {}

    getName(): string { return this.name; }
    getFailedDesc(): string { return this.failedDesc; }
    getCallback(): boolean { return this.callback; }

    abstract run(client: DiscordClient, message: Message): boolean;
}`;
}

export function getReadyEvent() {
  return `const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }
  async run (client) {
    console.log(client.user.tag + ' has logged in.');
  }
}`;
}

export function getReadyEventTS() {
  return `import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/client';

export default class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }
  async run (client: DiscordClient) {
    console.log('Bot has logged in.');
  }
}`;
}

export function getCheckFailedEventTS() {
  return `
import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/client';
import {Message} from "discord.js";
import BaseCheck from "../../utils/structures/BaseCheck";

export default class CheckFailedEvent extends BaseEvent {
  constructor() {
    super('checkFailed');
  }
  async run (client: DiscordClient, message: Message, check: BaseCheck) {
    console.log(\`\${check.getName()} failed\`);
    if (check.getCallback())
      await message.channel.send(check.getFailedDesc());
  }
}`;
}

export function getMessageEvent() {
  return `const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super('message');
  }
  
  async run(client, message) {
    if (message.author.bot) return;
    if (message.content.startsWith(client.prefix)) {
      const [cmdName, ...cmdArgs] = message.content
      .slice(client.prefix.length)
      .trim()
      .split(/\\s+/);
      const command = client.commands.get(cmdName);
      if (command) {
        command.run(client, message, cmdArgs);
      }
    }
  }
}`;
}

export function getMessageEventTS() {
  return `import BaseEvent from '../../utils/structures/BaseEvent';
import { Message } from 'discord.js';
import DiscordClient from '../../client/client';

export default class MessageEvent extends BaseEvent {
  constructor() {
    super('message');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    if (message.content.startsWith(client.prefix)) {
      const [cmdName, ...cmdArgs] = message.content
        .slice(client.prefix.length)
        .trim()
        .split(/\\s+/);
      const command = client.commands.get(cmdName);
      if (command) {
        command.run(client, message, cmdArgs);
      }
    }
  }
}`;
}

export function getHasPermissionsCheckTS() {
  return `import DiscordClient from "../../client/client";
import {Message, PermissionString} from "discord.js";
import BaseCheck from "../structures/BaseCheck";


export default class HasPermissions extends BaseCheck {
    permissions: Array<PermissionString>;

    constructor(permissions: Array<PermissionString>, callback?: boolean) {
        super(
            "HasPermissions",
            "You don't have the permissions to use this command",
            callback
        );

        this.permissions = permissions;
    }


    run(client: DiscordClient, message: Message): boolean {
        let pass = true;
        const userPermissions: Array<string> = message.member.permissions.toArray();
        this.permissions.forEach(permission => {
            pass &&= userPermissions.includes(permission);
        })
        return pass;
    }
}
`;
}

export function getIsOwnerCheckTS() {
  return `import DiscordClient from "../../client/client";
import {Message} from "discord.js";
import BaseCheck from "../structures/BaseCheck";

export default class IsOwner extends BaseCheck {
    constructor(callback?: boolean) {
        super(
            "IsOwner",
            "You need to be the owner of the bot.",
            callback
        );
    }

    run(client: DiscordClient, message: Message): boolean {
        // Verify if the author of the message is the owner of the bot
        return message.author.id == process.env.OWNER;
    }
}
`;
}

export function getIsGuildOwnerCheckTS() {
  return `import DiscordClient from "../../client/client";
import {Message} from "discord.js";
import BaseCheck from "../structures/BaseCheck";

export default class IsGuildOwner extends BaseCheck {
    constructor(callback?: boolean) {
        super(
            "IsGuildOwner",
            "You need to be the owner of the guild.",
            callback
            );
    }

    run(client: DiscordClient, message: Message): boolean {
        // Verify if the author of the message is the guild owner
        return message.author.id == message.guild.ownerID;
    }
}
`;
}

export function getTestCommand() {
  return `const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class TestCommand extends BaseCommand {
  constructor() {
    super('test', 'testing', []);
  }

  async run(client, message, args) {
    message.channel.send('Test command works');
  }
}`;
}

export function getTestCommandTS() {
  return `import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class TestCommand extends BaseCommand {
  constructor() {
    super('test', 'testing', "", [], []);
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    message.channel.send('Test command works');
  }
}`;
}

export function getCommandTemplate(name: string, category: string) {
  return `const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class ${capitalize(name)}Command extends BaseCommand {
  constructor() {
    super('${name}', '${category}', []);
  }

  run(client, message, args) {
    message.channel.send('${name} command works');
  }
}`;
}

export function getCommandTemplateTS(name: string, category: string) {
  return `import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class ${capitalize(name)}Command extends BaseCommand {
  constructor() {
    super('${name}', '${category}', "", [], []);
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    message.channel.send('${name} command works');
  }
}`;
}

export function getEventTemplate(name: string) {
  return `const BaseEvent = require('../../utils/structures/BaseCommand');

module.exports = class ${capitalize(name)}Command extends BaseEvent {
  constructor() {
    super('${name}');
  }

  run(client) {
  }
}`;
}

export function getEventTemplateTS(name: string) {
  return `import { Message } from 'discord.js';
import BaseEvent from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class ${capitalize(name)}Command extends BaseEvent {
  constructor() {
    super('${name}');
  }

  async run(client: DiscordClient) {
  }
}`;
}

export function getCheckTemplateTS(name: string) {
  return `import DiscordClient from "../../client/client";
import {Message} from "discord.js";
import BaseCheck from "../structures/BaseCheck";

export default class ${capitalize(name)} extends BaseCheck {
    constructor(callback?: boolean) {
        super(
            '${name}',
            "",
            callback
        );
    }

    run(client: DiscordClient, message: Message): boolean {
    }
}`;
}

export const TSCONFIG = `
{
  "compilerOptions": {
    "target": "es6",                          /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', or 'ESNEXT'. */
    "module": "commonjs",                     /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. */
    "outDir": "./build",                      /* Redirect output structure to the directory. */
    "esModuleInterop": true,                  /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
  }
}
`;
