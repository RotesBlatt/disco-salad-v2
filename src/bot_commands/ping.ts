import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pings the user')
        .setDMPermission(false),
        
    async execute(interaction: ChatInputCommandInteraction){
        await interaction.reply(`Pong Ping Pong`);
    }
};