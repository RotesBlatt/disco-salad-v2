import { getGuildLogger } from "./logging";

import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";
import { REST, Routes, SlashCommandBuilder } from "discord.js";


dotenv.config();

const logger = getGuildLogger('main_application_logger');

const excludeFromGlobalCommands = ['reload.ts'];

const commands: SlashCommandBuilder[] = [];
const commandsFolderPath = path.resolve("src/bot_commands");
const commandsFolderPathImport = "../bot_commands";
const commandFiles = fs.readdirSync(commandsFolderPath).filter(file => {
    if (excludeFromGlobalCommands.includes(file)) {
        return false;
    } else {
        return file.endsWith('.ts');
    }
});

commandFiles.forEach(async file => {
    const importPath = `${commandsFolderPathImport}/${file}`;
    const command = require(importPath);
    logger.info(`Importing command from path: ${importPath}`);
    try {
        const commandAsJson = command.default.data.toJSON();
        commands.push(commandAsJson);
    } catch (error) {
        logger.error('Parsing command to JSON failed, the commands description might be missing. Error:', error);
    }
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);

(async function deploy() {
    logger.info(`Registering ${commands.length} global application commands (/)`);
    try {
        const data = await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
            { body: commands },
        ) as SlashCommandBuilder[];

        logger.info(`Successfully registered ${data.length} (/) commands: ${commandFiles}`);
    } catch (error) {
        logger.error('Registration of application commands failed. Error: ', error);
    }
})();

// deleting for global commands
// rest.delete(Routes.applicationCommand(process.env.DISCORD_CLIENT_ID!, '1234956223946690621'))
// 	.then(() => console.log('Successfully deleted application command'))
// 	.catch(console.error);