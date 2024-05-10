import embed from '../embeds/embed';
import { getGuildLogger } from "../setup/logging";
import { ClientAdapter } from "../util/client_adapter";
import { YoutubeHandler } from './handlers/youtube_handler';

import playdl from 'play-dl';
import { joinVoiceChannel } from "@discordjs/voice";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SongData } from '../util/audio_player';
import { User } from '../util/user_information';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from Youtube')
        .addStringOption(option => option
            .setName('search')
            .setDescription('Youtube URL or search input')
            .setRequired(true)
        )
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const guildId = interaction.guild?.id!;
        const logger = getGuildLogger(guildId);

        const searchOptionInput = interaction.options.getString('search', true);

        const client = interaction.client as ClientAdapter;
        const iconURL = client.user?.avatarURL()!;


        // Always present, in index.ts we add a guildManager if not already in the collection
        const guildManager = client.guildManagerCollection.get(guildId)!;

        var songInfo = undefined;
        const inputType = await playdl.validate(searchOptionInput);
        switch (inputType) {
            case 'search':
                songInfo = await YoutubeHandler.getInfoFromSearch(searchOptionInput);
                // Searching for input string might result in no video found
                if (!songInfo) {
                    logger.warn(`Search for '${searchOptionInput}' failed, found no matching video on Youtube`);
                    await interaction.editReply({ embeds: [embed.errorOccurred(`Searching for \`${searchOptionInput}\` resulted in nothing, try something else`, iconURL)] });
                    return;
                }
                break;
            case 'yt_video':
                songInfo = await YoutubeHandler.getVideoInfoFromUrl(searchOptionInput);
                break;
            case 'yt_playlist':
                const songsFromPlaylist = await YoutubeHandler.getInfoFromPlaylist(searchOptionInput);
                const songs = await YoutubeHandler.convertToSongData(songsFromPlaylist, new User(interaction.user.displayName, interaction.user.avatarURL()!));
                guildManager.audioPlayer.addSongs(songs);

                // If the bot wasn't active until now, send into channel separately because 'now-playing' message will edit the reply. Otherwise edit the reply 
                if (guildManager.audioPlayer.isPlaying()) {
                    await interaction.editReply({ embeds: [embed.addPlaylist(songsFromPlaylist, iconURL)] });
                } else {
                    await interaction.channel?.send({ embeds: [embed.addPlaylist(songsFromPlaylist, iconURL)] });
                }
                break;
            default:
                logger.warn(`Search option '${searchOptionInput}' not recognized as valid input`);
                await interaction.editReply({ embeds: [embed.errorOccurred('The search option was not a recognized input type', iconURL)] });
                return;
        }

        // Join voice channel after successfully retrieving a song from the input
        const voiceChannel = interaction.guild?.members.cache.get(interaction.member?.user.id!)?.voice.channel!;
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: interaction.guild?.voiceAdapterCreator!,
        });

        // If search input was not a playlist, add the found song to the queue
        if (songInfo) {
            const songData = new SongData(songInfo.video_details, new User(interaction.user.displayName, interaction.user.avatarURL()!));
            guildManager.audioPlayer.addSong(songData);
        }

        // Add to queue if the player is playing a song, otherwise play the song which was just added
        if (guildManager.audioPlayer.isPlaying()) {
            // By adding a playlist to the queue, it might already have replied to the interaction and in this case don't do anything
            if (!interaction.replied) {
                await interaction.editReply({ embeds: [embed.addQueue(guildManager, iconURL)] });
            }
        } else {
            await guildManager.audioPlayer.startPlaying();
            await interaction.editReply({ embeds: [embed.currentSong(guildManager, iconURL)] });
        }
    },

};