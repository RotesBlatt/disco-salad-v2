import { APIEmbedField, EmbedBuilder } from "discord.js"
import { EmbedColors, secondsToHHMMSS } from "./util";
import { GuildManager } from "../util/guild_manager";

export const currentSong = (guildManager: GuildManager, userIconUrl: string): EmbedBuilder => {
    const currentSong = guildManager.audioPlayer.getCurrentSong()!;
    const currentSongInfo = currentSong.infoData;

    const songPlaybackTime = secondsToHHMMSS(guildManager.audioPlayer.getCurrentSongPlaybackTime());
    const songDuration = secondsToHHMMSS(guildManager.audioPlayer.getCurrentSongLength());

    const fields: APIEmbedField[] = [
        { name: 'Channel', value: currentSongInfo?.channel?.name!, inline: true },
        { name: 'Time played', value: `${songPlaybackTime}/${songDuration}`, inline: true },
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
        .setFooter({
            text: `Requested by: ${currentSong.userInfo.name}`,
            iconURL: currentSong.userInfo.iconUrl,
        })
        .setTimestamp();

}