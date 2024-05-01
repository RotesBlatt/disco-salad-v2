import embed from '../embeds/embed';
import getLogger from "../setup/logging";
import { ClientAdapter } from "../util/client_adapter";

import playdl from 'play-dl';
import { joinVoiceChannel } from "@discordjs/voice";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const logger = getLogger();

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from Youtube')
        .addStringOption(option => option
            .setName('song')
            .setDescription('Song URL from Youtube')
            .setRequired(true)
        )
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const songURL = interaction.options.getString('song', true);

        const client = interaction.client as ClientAdapter;
        const iconURL = client.user?.avatarURL()!;
        
        const guildId = interaction.guild?.id!;
        const guildManager = client.guildManagerCollection.get(guildId);
        if (!guildManager) {
            logger.error('Found no guild manager');
            await interaction.editReply({ embeds: [embed.errorOccurred('There was an error while executing your command', iconURL)] });
            return;
        }

        const voiceChannel = interaction.guild?.members.cache.get(interaction.member?.user.id!)?.voice.channel!;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: interaction.guild?.voiceAdapterCreator!,
        });

        const songInfo = await playdl.video_info(songURL);
        guildManager.audioPlayer.addSongToQueue(songInfo);

        if (guildManager.audioPlayer.isPlaying()) {
            await interaction.editReply({ embeds: [embed.addQueue(guildManager, iconURL)] });
        } else {
            await guildManager.audioPlayer.startPlaying();
            await interaction.editReply({ embeds: [embed.currentSong(guildManager, iconURL)] });
        }
    },

};