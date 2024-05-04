import { InfoData, playlist_info, search, video_info, YouTubePlayList } from "play-dl";
import { User } from "../../util/user_information";
import { SongData } from "../../util/audio_player";

/**
 * Contains helper methods which are relevant to Youtube specific things
 */
export class YoutubeHandler {
    /**
     * Returns information about the Youtube video provided as a url 
     * @param url link to youtube video
     * @returns InfoData Object with Information about the Youtube video
     */
    public static async getVideoInfoFromUrl(url: string): Promise<InfoData> {
        return await video_info(url);
    }

    /**
     * Searches for a video on Youtube which matches the input string
     * @param searchInput Search input for which to search for
     * @returns InfoData Object if a video was found, otherwise if no video was found return undefined
     */
    public static async getInfoFromSearch(searchInput: string): Promise<InfoData | undefined> {
        const searchResults = await search(searchInput, {
            limit: 1,
        });

        const searchResultUrl = searchResults.shift()?.url;

        if (!searchResultUrl) {
            return undefined;
        }

        return this.getVideoInfoFromUrl(searchResultUrl);
    }

    /**
     * Returns an array of Youtube video information for each video in the playlist
     * 
     * @param searchInput Link to a Youtube playlist
     * @returns Array of InfoData objects containing each video in the playlist
     */
    public static async getInfoFromPlaylist(searchInput: string): Promise<YouTubePlayList> {
        const playlistInfo = await playlist_info(searchInput, {
            incomplete: true,
        });

        return playlistInfo;
    }

    public static async convertToSongData(playlist: YouTubePlayList, user: User): Promise<SongData[]> {
        const allVideos = await playlist.all_videos();

        const songDataArray: SongData[] = [];
        allVideos.forEach((video) => {
            songDataArray.push({
                userInfo: user,
                infoData: video,
            })
        });

        return songDataArray;
    }
}