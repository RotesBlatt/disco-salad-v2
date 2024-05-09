import { getGuildLogger } from "./logging";
import { CommandExecutor } from "../util/client_adapter";

import path from "path";
import fs from "node:fs";
import { Collection } from "discord.js";


const logger = getGuildLogger('main_application_logger');

const loadCommands = async (): Promise<Collection<string, CommandExecutor>> => {
    const commands = new Collection<string, CommandExecutor>();
    const commandsFolderPath = path.resolve('./src/bot_commands');
    const commandsFolderPathImport = "../bot_commands";

    logger.info(`Collecting command files from path: '${commandsFolderPath}'`);
    const commandFilesName = fs.readdirSync(commandsFolderPath).filter(file => file.endsWith('.ts'));

    logger.info(`Trying to load ${commandFilesName.length} (/) commands`);
    for (let i = 0; i < commandFilesName.length; i++) {
        const command = (await import(`${commandsFolderPathImport}/${commandFilesName[i]}`)).default;
        if ('data' in command && 'execute' in command) {
            commands.set(command.data.name, command);
        } else {
            logger.warn(`The command in file '${commandFilesName[i]}' is missing a required "data" or "execute" property.`)
        }
    }

    logger.info(`Loaded ${commands.size} (/) commands: ${commandFilesName}`);

    return commands;
}

export default loadCommands;