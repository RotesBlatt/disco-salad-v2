import getLogger from "../setup/logging";
import { ClientAdapter, CommandExecutor } from "../util/client_adapter";

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads the given command')
        .addStringOption(option => option.
            setName('command')
            .setDescription('The command to reload.')
            .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const logger = getLogger();
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const client = interaction.client as ClientAdapter;
        const command = client.commandCollection.get(commandName);

        if (!command) {
            logger.warn(`Cannot reload command with name '${commandName}' because no command matching that name was found`);
            return await interaction.reply(`There is no command with name \`${commandName}\``);
        }

        delete require.cache[require.resolve(`./${commandName}.ts`)];
        client.commandCollection.delete(command.data.name);

        try {
            const refreshedCommand = require(`./${command.data.name}.ts`).default as CommandExecutor;
            client.commandCollection.set(command.data.name, refreshedCommand);
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`Reloading command '${commandName}' failed with Error:`, error);
                await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
                // Reinsert current command into list in case command there was an error loading the command
                client.commandCollection.set(command.data.name, command);
                return;
            }
        }



        logger.info(`Reloaded command '${command.data.name}'`);
        await interaction.reply(`Successfully reloaded command \`${command.data.name}\``);
    }
}