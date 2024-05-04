import { APIEmbedField, EmbedBuilder } from "discord.js"
import { EmbedColors, secondsToHHMMSS } from "./util";
import { GuildManager } from "../util/guild_manager";

export const addQueue = (guildManager: GuildManager, userIconUrl: string): EmbedBuilder => {
    const songQueue = guildManager.audioPlayer.getSongQueue();
    const lastAddedSong = songQueue.at(songQueue.length - 1)!;
    const songDetails = lastAddedSong.infoData;
    const songDuration = secondsToHHMMSS(songDetails.durationInSec);

    const fields: APIEmbedField[] = [
        { name: 'Channel', value: songDetails.channel?.name!, inline: true },
        { name: 'Song length', value: `${songDuration}`, inline: true },
        { name: 'Position in queue', value: guildManager.audioPlayer.getSongQueue().length.toString(), inline: true}
    ];

    return new EmbedBuilder()
        .setColor(EmbedColors.SUCCESSFUL)
        .setTitle(songDetails.title!)
        .setAuthor({
            name: 'Added song to queue',
            iconURL: userIconUrl
        })
        .setURL(songDetails.url!)
        .setThumbnail(songDetails.thumbnails[3].url!)
        .addFields(fields)
        .setFooter({
            text: `Requested by: ${lastAddedSong.userInfo.name}`,
            iconURL: lastAddedSong.userInfo.iconUrl,
        })
        .setTimestamp();

}