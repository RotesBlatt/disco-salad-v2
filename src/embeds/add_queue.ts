import { APIEmbedField, EmbedBuilder } from "discord.js"
import { EmbedColors, secondsToHHMMSS } from "./util";
import { InfoData } from "play-dl";

export const addQueue = (songInfo: InfoData, userIconUrl: string): EmbedBuilder => {
    const songDetails = songInfo.video_details;
    const songDuration = secondsToHHMMSS(songInfo.video_details.durationInSec);

    const fields: APIEmbedField[] = [
        { name: 'Channel', value: songDetails.channel?.name!, inline: true },
        { name: 'Song length', value: `${songDuration}`, inline: true },
    ];

    return new EmbedBuilder()
        .setColor(EmbedColors.SUCCESSFUL)
        .setTitle(songDetails.title!)
        .setAuthor({
            name: 'Added song',
            iconURL: userIconUrl
        })
        .setURL(songDetails.url!)
        .setThumbnail(songDetails.thumbnails[3].url!)
        .addFields(fields)
        .setTimestamp();

}