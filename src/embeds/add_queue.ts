import { APIEmbedField, EmbedBuilder } from "discord.js"
import { EmbedColors, secondsToHHMMSS } from "./util";
import { GuildManager } from "../util/guild_manager";

export const addQueue = (guildManager: GuildManager, userIconUrl: string): EmbedBuilder => {
    const currentSongInfo = guildManager.audioPlayer.getCurrentSong()?.video_details;
    const songDuration = secondsToHHMMSS(guildManager.audioPlayer.getCurrentSongDuration())

    const fields: APIEmbedField[] = [
        { name: 'Channel', value: currentSongInfo?.channel?.name!, inline: true },
        { name: 'Song length', value: `${songDuration}`, inline: true },
    ];

    return new EmbedBuilder()
        .setColor(EmbedColors.SUCCESSFUL)
        .setTitle(currentSongInfo?.title!)
        .setAuthor({
            name: 'Added song',
            iconURL: userIconUrl
        })
        .setURL(currentSongInfo?.url!)
        .setThumbnail(currentSongInfo?.thumbnails[3].url!)
        .addFields(fields)
        .setTimestamp();

}