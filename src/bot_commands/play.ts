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
            .setName('url')
            .setDescription('Youtube video URL')
        )
        .addStringOption(option => option
            .setName('search')
            .setDescription('Youtube search string')
        )
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const client = interaction.client as ClientAdapter;
        const iconURL = client.user?.avatarURL()!;

        const songURL = interaction.options.getString('url', false);
        const searchString = interaction.options.getString('search', false);
        if (!songURL && !searchString) {
            logger.warn('No parameters given in order to play a song');
            interaction.editReply({ embeds: [embed.errorOccurred('No URL or search input was provided', iconURL)] })
            return;
        }

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

        var songInfo = null;
        if (songURL) {
            songInfo = await playdl.video_info(songURL);
            guildManager.audioPlayer.addSongToQueue(songInfo);
        } else if (searchString) {
            const searchResults = await playdl.search(searchString, {
                limit: 1,
            });

            const searchResultUrl = searchResults.at(0)?.url;
            //Check that a video was found for the given search string, otherwise there is no song to be played
            if (!searchResultUrl) {
                logger.warn(`Search for '${searchString}' failed, found no matching video on Youtube`);
                interaction.editReply({ embeds: [embed.errorOccurred(`Searching for \`${searchString}\` resulted in nothing, try something else`, iconURL)] });
                return;
            }

            songInfo = await playdl.video_info(searchResultUrl);
            guildManager.audioPlayer.addSongToQueue(songInfo);
        }

        // Add to queue if there the player is playing a song, otherwise play the song which was just added
        if (guildManager.audioPlayer.isPlaying()) {
            await interaction.editReply({ embeds: [embed.addQueue(songInfo!, iconURL)] });
        } else {
            await guildManager.audioPlayer.startPlaying();
            await interaction.editReply({ embeds: [embed.currentSong(guildManager, iconURL)] });
        }
    },

};