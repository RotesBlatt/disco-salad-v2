import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ClientAdapter } from "../util/client_adapter";
import { getGuildLogger } from "../setup/logging";
import embed from "../embeds/embed";


export default {
    data: new SlashCommandBuilder()
        .setName('now-playing')
        .setDescription('Returns information about the currently playing song')
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as ClientAdapter;
        const guildId = interaction.guild?.id!;
        const guildManager = client.guildManagerCollection.get(guildId)!;

        const logger = getGuildLogger(guildId);

        const clientIconUrl = client.user?.avatarURL()!;

        const currentSong = guildManager.audioPlayer.getCurrentSong();
        if (!currentSong) {
            logger.warn('Failed to return information about the current song because no song is playing');
            await interaction.reply({ embeds: [embed.errorOccurred('Can not return song information because no song is playing', clientIconUrl)] });
            return;
        }

        logger.info(`Showing current song information about song: '${currentSong?.infoData.title}'`);

        await interaction.reply({ embeds: [embed.currentSong(guildManager, clientIconUrl)] });
    }
}