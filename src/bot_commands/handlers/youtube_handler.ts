import { InfoData, search, video_info } from "play-dl";

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
}