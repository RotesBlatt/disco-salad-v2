import * as dotenv from "dotenv";
import { Events, GatewayIntentBits, Guild } from "discord.js";

import getLogger from "./src/setup/logging";
import loadCommands from "./src/setup/commands";
import { ClientAdapter } from "./src/util/client_adapter";
import { GuildManager } from "./src/util/guild_manager";

dotenv.config();

const logger = getLogger();

const client = new ClientAdapter({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ],
});

client.once(Events.ClientReady, async readyClient => {
    logger.info(`Logged in as ${readyClient.user.tag}`);
    client.commandCollection = await loadCommands();
});


client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const currentClient = interaction.client as ClientAdapter;

    const guildId = interaction.guild?.id!;
    if (!currentClient.guildManagerCollection.get(guildId)) {
        currentClient.guildManagerCollection.set(guildId, new GuildManager(guildId));
    }

    const command = currentClient.commandCollection.get(interaction.commandName);

    if (!command) {
        logger.warn(`No command matching ${interaction.commandName} was found. Exiting interaction.`)
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            console.log(error); // FIXME: Remove line, should not print error to console  
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
        logger.error(`Execution of command '${interaction.commandName}' in guild '${interaction.guild?.name}' failed. Error: `, error);
    }
});

logger.info(`Logging into Discord Bot application`);
client.login(process.env.DISCORD_BOT_TOKEN);