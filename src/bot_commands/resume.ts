import embed from "../embeds/embed";
import { getGuildLogger } from "../setup/logging";
import { ClientAdapter } from "../util/client_adapter";

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";


export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the playback')
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as ClientAdapter;
        const guildId = interaction.guild?.id!;
        const guildManager = client.guildManagerCollection.get(guildId);

        const logger = getGuildLogger(guildId);

        if (!guildManager?.audioPlayer.isPlaying()) {
            logger.warn('Attempted to resume playback without playing any music');
            await interaction.reply({ embeds: [embed.errorOccurred("Can't resume the playback because no song is playing", client.user?.avatarURL()!)] });
            return;
        }

        const resumed = guildManager.audioPlayer.resumePlayback();
        if (resumed) {
            await interaction.reply(':play_pause: **Resuming playback**');
        } else {
            await interaction.reply({ embeds: [embed.errorOccurred('Resuming playback failed because song is already playing', client.user?.avatarURL()!)] });
        }
    }
}