# discli


## What is discli?

Discli is a cli tool that lets you generate a Discord.JS project (version 12 or version 11), in a matter of seconds.

Currently supports JavaScript and TypeScript.

# Instructions

Install discli by running `npm i @redbow26/discli` on your terminal or Windows CMD. This will install discli globally.

- To create a project, type `discli`, or simply type `discli new <name of project>`

- Follow the steps and enter your Bot Token and Prefix.

- Once done, `cd` into your project by typing `cd <name of project>`

- To run the bot, type `npm run dev`. This will run the bot using `nodemon`, you MUST have `nodemon` installed, otherwise, use `npm run start`

# Generating Commands

- Discli allows you to generate commands into categories. You can type `discli` and select **Generate** to generate a command, or `discli new command`.

- It will ask you for a name, and then a category. This will generate all commands in the `src/commands` folder, in the correct category.

# Generating Events

- You can generate events by running `discli new event`, this will prompt you to select which events you would like to generate.

- To select event(s), press space bar and use the up and down arrow keys to navigate. Hit enter when you're done and your event files will be generated in the `src/events` folder.


