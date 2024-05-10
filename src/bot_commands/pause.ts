import embed from "../embeds/embed";
import { getGuildLogger } from "../setup/logging";
import { ClientAdapter } from "../util/client_adapter";

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";


export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the playback')
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as ClientAdapter;
        const guildId = interaction.guild?.id!;
        const guildManager = client.guildManagerCollection.get(guildId);

        const logger = getGuildLogger(guildId);
        if (!guildManager?.audioPlayer.isPlaying()) {
            logger.warn('Attempted to pause playback without playing any music');
            await interaction.reply({ embeds: [embed.errorOccurred("Can't pause the playback because no song is playing", client.user?.avatarURL()!)] });
            return;
        }

        const paused = guildManager.audioPlayer.pausePlayback();
        if (paused) {
            await interaction.reply(':pause_button: **Pausing playback**');
        } else {
            await interaction.reply({ embeds: [embed.errorOccurred('Pausing playback failed because song is already paused', client.user?.avatarURL()!)] });
        }
    }
}