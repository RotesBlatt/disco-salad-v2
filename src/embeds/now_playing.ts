import { APIEmbedField, EmbedBuilder } from "discord.js"
import { EmbedColors, secondsToHHMMSS } from "./util";
import { GuildManager } from "../util/guild_manager";

export const currentSong = (guildManager: GuildManager, userIconUrl: string): EmbedBuilder => {
    const currentSongInfo = guildManager.audioPlayer.getCurrentSong()?.video_details;

    const songPlaybackTime = secondsToHHMMSS(guildManager.audioPlayer.getCurrentSongPlaybackTime());
    const songDuration = secondsToHHMMSS(guildManager.audioPlayer.getCurrentSongLength());

    const fields: APIEmbedField[] = [
        { name: 'Channel', value: currentSongInfo?.channel?.name!, inline: true },
        { name: 'Remaining song duration', value: `${songPlaybackTime}/${songDuration}`, inline: true },
    ];

    return new EmbedBuilder()
        .setColor(EmbedColors.SUCCESSFUL)
        .setTitle(currentSongInfo?.title!)
        .setAuthor({
            name: 'Now playing',
            iconURL: userIconUrl,
        })
        .setURL(currentSongInfo?.url!)
        .setThumbnail(currentSongInfo?.thumbnails[3].url!)
        .addFields(fields)
        .setTimestamp();

}