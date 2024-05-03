import getLogger from "../setup/logging";
import { InfoData, stream_from_info } from "play-dl";
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, getVoiceConnection, NoSubscriberBehavior } from "@discordjs/voice";

const logger = getLogger();
/**
 * Creates a Wrapper for an audio player.
 * 
 * Takes song information as Input and plays a stream from Youtube inside the connected voice channel.
 * Uses a song queue to store incoming songs to play
 */
export class AudioPlayerAdapter {
    private guildId: string;
    private player: AudioPlayer;
    private resource: AudioResource | undefined;

    private songQueue: InfoData[] = [];
    private currentPlayingSong: InfoData | undefined;

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
            logger.warn("Pausing playback failed because no song is playing");
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
            logger.warn("Resuming playback failed because no song is playing");
        } else {
            logger.info('Resumed playback');
        }

        return resumed;
    }

    /**
     * Adds the given song to the queue
     * @param songInfo Information about the song provided by play-dl.video_info()
     */
    public addSongToQueue(songInfo: InfoData): void {
        this.songQueue.push(songInfo);

        logger.info(`Added '${songInfo.video_details.title}' to the queue`);
    }

    /**
     * Returns whether a song is playing (true) or not (false)
     * @returns boolean
     */
    public isPlaying(): boolean {
        return this.player.checkPlayable();
    }

    /**
     * Song information for the current playing song. If no song is playing, returns nothing
     * @returns currently playing song information
     */
    public getCurrentSong(): InfoData | undefined {
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

    public getCurrentSongDuration(): number {
        if (!this.currentPlayingSong) {
            logger.warn('Trying to access song duration, bot no song is playing');
            return -1;
        }
        return this.currentPlayingSong?.video_details.durationInSec;
    }

    /**
     * Configures the audio player:
     * - Play songs until there are no more items in the song queue
     * - Log current playing song activity
     */
    private configureAudioPlayer(): void {
        this.player.on(AudioPlayerStatus.Idle, async () => {
            const songInfo = this.songQueue.shift();
            if (!songInfo) {
                logger.info('Leaving voicechannel because song queue is empty');
                getVoiceConnection(this.guildId)!.disconnect();
                this.currentPlayingSong = undefined;
            } else {
                await this.playSong(songInfo);
            }
        });

        this.player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
            if (oldState.status == AudioPlayerStatus.Idle || oldState.status == AudioPlayerStatus.Buffering) {
                logger.info(`Playing song '${this.currentPlayingSong?.video_details.title}'`);
            }
        })

        this.player.on('error', (error) => {
            logger.error(`There was an error playing the current song '${this.currentPlayingSong?.video_details.title}'`, error);
        });
    }

    /**
     * Creates a resource based on the given song information and starts playing the song. Subscribes the current voice connection to the the player  
     * @param songInfo Information about the song to be played
     */
    private async playSong(songInfo: InfoData): Promise<void> {
        const audioStream = await stream_from_info(songInfo, {
            quality: 0,
            precache: 1,
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
}