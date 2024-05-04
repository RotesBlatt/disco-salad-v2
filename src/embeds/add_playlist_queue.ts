import { APIEmbedField, EmbedBuilder } from "discord.js";
import { EmbedColors } from "./util";
import { YouTubePlayList } from "play-dl";

export const addPlaylist = (playlist: YouTubePlayList, clientIconUrl: string): EmbedBuilder => {
    const fields: APIEmbedField[] = [
        { name: 'Playlist creator', value: playlist.channel?.name!, inline: true },
        { name: 'Number of songs added', value: playlist.total_videos.toString(), inline: true }
    ]

    return new EmbedBuilder()
        .setColor(EmbedColors.SUCCESSFUL)
        .setTitle(playlist.title!)
        .setURL(playlist.url!)
        .setAuthor({
            name: 'Added songs from playlist',
            iconURL: clientIconUrl,
        })
        .setThumbnail(playlist.thumbnail?.url!)
        .addFields(fields)
        .setTimestamp();
}