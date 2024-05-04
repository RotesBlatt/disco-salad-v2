import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ClientAdapter } from "../util/client_adapter";
import getLogger from "../setup/logging";
import embed from "../embeds/embed";

const logger = getLogger();

export default {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Loops the currently playing song or stops looping if it is already looping')
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as ClientAdapter;
        const guildManager = client.guildManagerCollection.get(interaction.guild?.id!);

        const iconURL = client.user?.avatarURL()!;

        if (!guildManager?.audioPlayer.isPlaying()) {
            logger.warn('Looping failed because no song is currently playing');
            await interaction.reply({ embeds: [embed.errorOccurred('Looping song failed, because no song is currently playing', iconURL)] });
            return;
        }

        const isLooping = guildManager.audioPlayer.loopSong();

        if (isLooping) {
            await interaction.reply(':repeat_one: **Enabled**');
        } else {
            await interaction.reply(':repeat_one: **Disabled**');
        }

    }
}