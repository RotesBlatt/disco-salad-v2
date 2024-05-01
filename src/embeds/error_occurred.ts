import { EmbedBuilder } from "discord.js";
import { EmbedColors } from "./util";

export const errorOccurred = (errorMessage: string, userIconUrl: string): EmbedBuilder => {
    return new EmbedBuilder()
        .setColor(EmbedColors.ERROR)
        .setTitle(`:x: ${errorMessage}`)
        .setAuthor({
            name: 'Something went wrong',
            iconURL: userIconUrl,
        })
        .setTimestamp();
}