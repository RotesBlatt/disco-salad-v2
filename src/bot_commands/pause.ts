import embed from "../embeds/embed";
import getLogger from "../setup/logging";
import { ClientAdapter } from "../util/client_adapter";

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const logger = getLogger();

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the playback')
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as ClientAdapter;
        const guildManager = client.guildManagerCollection.get(interaction.guild?.id!);

        if (!guildManager?.audioPlayer.isPlaying()) {
            logger.warn('Attempted to pause playback without playing any music');
            await interaction.reply({ embeds: [embed.errorOccurred("Can't pause the playback because no song is playing", client.user?.avatarURL()!)] });
            return;
        }

        const paused = guildManager.audioPlayer.pausePlayback();
        if (paused) {
            await interaction.reply('Paused playback');
        } else {
            await interaction.reply({ embeds: [embed.errorOccurred('Pausing playback failed', client.user?.avatarURL()!)] });
        }
    }
}