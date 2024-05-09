import { getVoiceConnection } from "@discordjs/voice";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getGuildLogger } from "../setup/logging";
import embed from "../embeds/embed";
import { ClientAdapter } from "../util/client_adapter";

export default {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leaves the voice channel and clears the song queue')
        .setDMPermission(false),
    async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as ClientAdapter;
        const guildId = interaction.guild?.id!;
        const voiceConnection = getVoiceConnection(guildId);

        const logger = getGuildLogger(guildId);

        if (!voiceConnection) {
            logger.warn('Leaving voice channel failed, not connected to voice channel');
            await interaction.reply({ embeds: [embed.errorOccurred("Can only disconnect from voice channel if previously connected", client.user!.avatarURL()!)] });
            return;
        }

        const guildManager = client.guildManagerCollection.get(interaction.guild?.id!);
        // WARN: Triggers the voice channel disconnect in the audio player. If behavior on empty song queue changes, this needs to be reworked as well
        guildManager?.audioPlayer.stopPlayback();

        await interaction.reply('Leaving voice channel');
    }
}