import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { EmbedColors, secondsToHHMMSS } from "./util";
import { GuildManager } from "../util/guild_manager";
import { SongData } from "../util/audio_player";

export const showQueue = (guild_manager: GuildManager, showPage: number, clientIconUrl: string): EmbedBuilder => {
    const isLooping = guild_manager.audioPlayer.isCurrentSongLooping();

    const description = createSongQueueDescription(guild_manager, showPage);

    return new EmbedBuilder()
        .setColor(EmbedColors.SUCCESSFUL)
        .setTitle('Songs in queue')
        .setFooter({
            text: `Page: ${showPage} | Song Loop: ${!isLooping ? '❌' : '✅'}`,
            iconURL: clientIconUrl,
        })
        .setDescription(description)
        .setTimestamp();
}

export const queuePageButtons = (): ActionRowBuilder<ButtonBuilder> => {
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('back')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⏪')
                .setLabel('previous page'),
            new ButtonBuilder()
                .setCustomId('next')
                .setStyle(ButtonStyle.Primary)
                .setLabel('next page')
                .setEmoji('⏩'),

        );
    return row;
}


const createSongQueueDescription = (guildManager: GuildManager, showPage: number): string => {
    const currentSong = guildManager.audioPlayer.getCurrentSong();
    const songQueue = guildManager.audioPlayer.getSongQueue();

    var description = `__Now playing:__ \n ${formatSongDescription(currentSong!)}\n`;

    if (songQueue.length !== 0) {
        description = description.concat('__Up next:__\n');
    }

    // Show only 10 Elements in the queue because of discords character limit in embeds
    const loopStartIndex = Math.floor((showPage - 1) * 10);
    for (let i = loopStartIndex; i < songQueue.length && i < loopStartIndex + 10; i++) {
        const song = songQueue.at(i)!;
        description = description.concat(`\n${i + 1}. ${formatSongDescription(song)}\n`);
    }

    var totalSongQueueLength = guildManager.audioPlayer.getCurrentSongLength() - guildManager.audioPlayer.getCurrentSongPlaybackTime();
    songQueue.forEach((song) => {
        totalSongQueueLength += song.infoData.video_details.durationInSec;
    })

    description = description.concat(`\n **Songs in queue: ${songQueue.length} | Total playback time: ${secondsToHHMMSS(totalSongQueueLength)}**`);

    return description;
}

const formatSongDescription = (song: SongData): string => {
    return `[${song.infoData.video_details.title}](${song.infoData.video_details.url}) | ${secondsToHHMMSS(song.infoData.video_details.durationInSec)} |  Requested by: ${song.userInfo.name}`;
}