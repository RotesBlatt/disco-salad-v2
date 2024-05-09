import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getGuildLogger } from "../setup/logging";

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pings the user')
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply(`Pong Ping Pong`);
        const logger = getGuildLogger(interaction.guild?.id!);

        logger.error('Error occured')
    }
};