import { AudioPlayerAdapter } from "./audio_player";

export class GuildManager {
    public audioPlayer: AudioPlayerAdapter;

    constructor(guildId: string) {
        this.audioPlayer = new AudioPlayerAdapter(guildId);
    }
}