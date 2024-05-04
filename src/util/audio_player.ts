import getLogger from "../setup/logging";
import { InfoData, stream, stream_from_info, YouTubeVideo } from "play-dl";
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, getVoiceConnection, NoSubscriberBehavior } from "@discordjs/voice";
import { User } from "./user_information";

const logger = getLogger();

export class SongData {
    public infoData: YouTubeVideo;
    public userInfo: User;

    constructor(infoData: YouTubeVideo, requestedBy: User) {
        this.infoData = infoData;
        this.userInfo = requestedBy;
    }
}
/**
 * Creates a Wrapper for an audio player.
 * 
 * Takes a guildId as Input and plays an Audio stream inside the corresponding guilds connected voice channel.
 * Uses a song queue to store incoming songs to play
 */
export class AudioPlayerAdapter {
    private guildId: string;
    private player: AudioPlayer;
    private resource: AudioResource | undefined;

    private songQueue: SongData[] = [];
    private currentPlayingSong: SongData | undefined;

    private loopCurrentSong: boolean = false;

    /**
     * Creates an audio player and configures it in a way, so that it can play songs inside of a queue
     * @param guildId The ID of the guild this adapter belongs to. Used for retrieving the current voice Channel in which the bot is in
     */
    constructor(guildId: string) {
        this.guildId = guildId;

        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            }
        });
        this.configureAudioPlayer();
    }

    /**
     * Starts playing the songs in the song queue. Needs to be called once if the audio player isn't playing a song
     * @returns nothing
     */
    public async startPlaying(): Promise<void> {
        const nextSong = this.songQueue.shift();
        if (!nextSong) {
            logger.warn('Tried to start playing even tho no songs are in the queue');
            return;
        }

        logger.info('Starting playback of Songs');
        await this.playSong(nextSong);
    }

    /**
     * Pauses the playback of the current song
     */
    public pausePlayback(): boolean {
        const paused = this.player.pause(true);

        if (!paused) {
            logger.warn("Pausing playback failed because playback was already paused or no song is currently playing");
        } else {
            logger.info('Paused playback')
        }

        return paused;
    }

    /**
     * Resumes the playback of the current song
     */
    public resumePlayback(): boolean {
        const resumed = this.player.unpause();

        if (!resumed) {
            logger.warn("Resuming playback failed because playback has not paused playing or no song is currently playing");
        } else {
            logger.info('Resumed playback');
        }

        return resumed;
    }

    /**
     * Skips the current playing song.
     * @returns true: successfully skipped song false otherwise
     */
    public skipSong(): boolean {
        // Stopping the player moves the player into the idle state which triggers the automatic playing of the next song
        const skipped = this.player.stop();

        if (!skipped) {
            logger.warn('Skipping song failed, no song is currently playing');
        } else {
            logger.info('Skipping song');
        }

        return skipped;
    }

    /**
     * Adds the given song to the queue
     * @param songData Information about the song and the user who added the song
     */
    public addSong(songData: SongData): void {
        this.songQueue.push(songData);

        logger.info(`Added '${songData.infoData.title}' to the queue`);
    }

    /**
     * Adds multiple songs at once to the song queue. Useful for playlist links
     * @param songData Array of SongData elements
     */
    public addSongs(songData: SongData[]): void {
        this.songQueue = this.songQueue.concat(songData);

        logger.info(`Added '${songData.length}' songs to the queue`);
    }

    /**
     * Loop or stop looping the current playing song 
     * 
     * @returns true: song is now looping, false: song has stopped looping
     */
    public loopSong(): boolean {
        this.loopCurrentSong = !this.loopCurrentSong;

        const currentSongName = this.currentPlayingSong?.infoData.title;
        if (this.loopCurrentSong) {
            logger.info(`Looping '${currentSongName}'playing song`);
        } else {
            logger.info(`Stopped looping '${currentSongName}'`);
        }

        return this.loopCurrentSong;
    }

    /**
     * Stops the playback and clears the song queue. Triggers a disconnect because the audio players idle state is disconnecting the bot
     */
    public stopPlayback(): void {
        this.clear();
        this.songQueue = [];

        this.player.stop();
    }

    /**
     * Returns whether a song is playing (true) or not (false)
     * @returns boolean
     */
    public isPlaying(): boolean {
        return this.currentPlayingSong != undefined;
    }

    /**
     * Returns whether the current playing song is looping
     * 
     * @returns true: current song loops, otherwise false
     */
    public isCurrentSongLooping(): boolean {
        return this.loopCurrentSong;
    }

    /**
     * Returns the song queue
     * 
     * @returns Array of SongData elements 
     */
    public getSongQueue(): SongData[] {
        return this.songQueue;
    }

    /**
     * Song information for the current playing song. If no song is playing, returns nothing
     * @returns currently playing song information
     */
    public getCurrentSong(): SongData | undefined {
        return this.currentPlayingSong;
    }

    /**
     * Calculates the current time played from the current playing song.
     *  
     * @returns amount in seconds of time played  
     */
    public getCurrentSongPlaybackTime(): number {
        if (!this.resource) {
            logger.warn('Trying to access playback duration, but no resource is present');
            return -1;
        }

        return Math.floor(this.resource.playbackDuration / 1000);
    }

    /**
     * Returns the total length of the current song in seconds
     * 
     * @returns song length in seconds 
     */
    public getCurrentSongLength(): number {
        if (!this.currentPlayingSong) {
            logger.warn('Trying to access song duration, bot no song is playing');
            return -1;
        }
        return this.currentPlayingSong?.infoData.durationInSec;
    }

    /**
     * Configures the audio player:
     * - Play songs until there are no more items in the song queue
     * - Log current playing song activity
     */
    private configureAudioPlayer(): void {
        this.player.on(AudioPlayerStatus.Idle, async () => {
            // Get next song and start playing it
            const songInfo = this.getNextSong();
            if (!songInfo) {
                logger.info('Leaving voicechannel because song queue is empty');
                // WARN: Triggers the leave commands disconnect call. Change stop command if this line is removed 
                getVoiceConnection(this.guildId)!.disconnect();
                this.clear();
            } else {
                await this.playSong(songInfo);
            }
        });

        this.player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
            if (oldState.status == AudioPlayerStatus.Idle || oldState.status == AudioPlayerStatus.Buffering) {
                logger.info(`Playing song '${this.currentPlayingSong?.infoData.title}'`);
            }
        })

        this.player.on('error', (error) => {
            logger.error(`There was an error playing the current song '${this.currentPlayingSong?.infoData.title}'`, error);
        });
    }

    /**
     * Creates a resource based on the given song information and starts playing the song. Subscribes the current voice connection to the the player  
     * @param songInfo Information about the song to be played
     */
    private async playSong(songInfo: SongData): Promise<void> {
        const audioStream = await stream(songInfo.infoData.url, {
            quality: 0,
        });

        this.resource = createAudioResource(audioStream.stream, {
            inputType: audioStream.type,
        });

        this.player.play(this.resource);

        const subscription = getVoiceConnection(this.guildId)!.subscribe(this.player);
        if (!subscription) {
            logger.warn('Subscribing to player was unsuccessful');
        }

        this.currentPlayingSong = songInfo;
    }

    /**
     * Retrieves the next song to be played. 
     * If Looping is enabled, return the previous played song.
     * Otherwise get the next song from the queue.
     * 
     * @returns InfoData Object if there is a next song, otherwise undefined
     */
    private getNextSong(): SongData | undefined {
        if (this.loopCurrentSong) {
            return this.currentPlayingSong;
        }

        return this.songQueue.shift();
    }

    /**
     * Clears the audio players configuration which was changed during runtime.
     * Resets all configuration attributes to their standard value
     */
    private clear(): void {
        this.currentPlayingSong = undefined;
        this.loopCurrentSong = false;
    }
}