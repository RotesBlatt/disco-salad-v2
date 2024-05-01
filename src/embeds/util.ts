import { ColorResolvable } from "discord.js";

interface EmbedColor {
    SUCCESSFUL: ColorResolvable,
    ERROR: ColorResolvable,
}

export const EmbedColors: EmbedColor = {
    SUCCESSFUL: '#00aaff',
    ERROR: '#c71224',
};

export const secondsToHHMMSS = (durationSeconds: number): string => {
    var hours: number | string = Math.floor(durationSeconds / 3600);
    var minutes: number | string = Math.floor((durationSeconds - (hours * 3600)) / 60);
    var seconds: number | string = durationSeconds - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }

    if (hours === "00") {
        return `${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}:${seconds}`;
}