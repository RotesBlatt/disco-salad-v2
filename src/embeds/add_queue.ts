import { APIEmbedField, EmbedBuilder } from "discord.js"
import { EmbedColors, secondsToHHMMSS } from "./util";
import { SongData } from "../util/audio_player";

export const addQueue = (songData: SongData, userIconUrl: string): EmbedBuilder => {
    const songDetails = songData.infoData.video_details;
    const songDuration = secondsToHHMMSS(songData.infoData.video_details.durationInSec);

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
        .setFooter({
            text: `Requested by: ${songData.userInfo.name}`,
            iconURL: songData.userInfo.iconUrl,
        })
        .setTimestamp();

}