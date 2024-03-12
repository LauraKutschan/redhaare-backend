const axios = require('axios');
const { ACCESS_TOKEN, PROFILE_ID } = require('../configure/instagram');
const { mediaCollection } = require("../configure/db");
const DbService = require('../services/db.service');

class InstagramService {
    constructor() {
        this.fields = 'id,caption,media_type,media_url,timestamp,permalink';
        this.wantedMediaTypes = ['IMAGE', 'CAROUSEL_ALBUM'];
        this.filter = '';
        this.dbService = new DbService();
    }

    /**
     * Fetches the latest posts from the Instagram profile.
     * @returns {Promise<Array>} An array of media objects representing the latest posts.
     */
    async getLatestPosts() {
        try {
            const profileMedia = await this.getProfileMedia();
            const mediaObjects = await this.extractMediaUrls(profileMedia);
            const nonDuplicates = await this.filterDuplicates(mediaObjects);
            await this.pushNewMediaToDb(nonDuplicates);
            return nonDuplicates;
        } catch (error) {
            throw new Error("Error getting latest posts: " + error.message);
        }
    }

    /**
     * Fetches media associated with the Instagram profile.
     * @returns {Promise<Array>} An array of media objects associated with the profile.
     */
    async getProfileMedia() {
        try {
            const url = `https://graph.facebook.com/${PROFILE_ID}/media?access_token=${ACCESS_TOKEN}`;
            const response = await axios.get(url);
            return response.data.data;
        } catch (error) {
            throw new Error("Error getting profile media: " + error.message);
        }
    }

    /**
     * Extracts relevant media URLs from the profile media.
     * @param {Array} profileMedia An array of media objects associated with the profile.
     * @returns {Promise<Array>} An array of media objects with relevant URLs.
     */
    async extractMediaUrls(profileMedia) {
        try {
            const mediaObjects = [];
            for (const mediaItem of profileMedia) {
                const mediaData = await this.getMediaData(mediaItem.id);
                if (mediaData && this.wantedMediaTypes.includes(mediaData.media_type) && mediaData.caption.includes(this.filter)) {
                    const mediaObject = this.buildMediaObject(mediaData);
                    mediaObjects.push(mediaObject);
                }
            }
            return mediaObjects;
        } catch (error) {
            throw new Error("Error extracting media URLs: " + error.message);
        }
    }

    /**
     * Fetches data for a specific media item.
     * @param {string} mediaId The ID of the media item.
     * @returns {Promise<object>} The data associated with the media item.
     */
    async getMediaData(mediaId) {
        try {
            const url = `https://graph.facebook.com/${mediaId}?fields=${this.fields}&access_token=${ACCESS_TOKEN}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            throw new Error("Error getting media data: " + error.message);
        }
    }

    /**
     * Filters out duplicate media based on media ID.
     * @param {Array} media An array of media objects.
     * @returns {Promise<Array>} An array of media objects with duplicates removed.
     */
    async filterDuplicates(media) {
        try {
            const mediaIds = media.map(item => item.media_id);
            const allImagesFromDb = await mediaCollection.find({ media_id: { $in: mediaIds } }).toArray();
            const imageSet = new Set(allImagesFromDb.map(item => item.media_id));
            return media.filter(item => !imageSet.has(item.media_id));
        } catch (error) {
            throw new Error("Error fetching images from DB: " + error.message);
        }
    }

    /**
     * Pushes new media objects to the database.
     * @param {Array} media An array of media objects to push to the database.
     * @returns {Promise<void>}
     */
    async pushNewMediaToDb(media) {
        try {
            await Promise.all(media.map(item => this.dbService.postOneImage(item)));
        } catch (error) {
            throw new Error("Error pushing new media to DB: " + error.message);
        }
    }

    /**
     * Builds a media object from fetched media data.
     * @param {object} mediaData The raw media data fetched from the API.
     * @returns {object} The formatted media object.
     */
    buildMediaObject(mediaData) {
        return {
            media_id: mediaData.id,
            media_url: mediaData.media_url,
            caption: mediaData.caption,
            media_type: mediaData.media_type,
            timestamp: mediaData.timestamp,
            permalink: mediaData.permalink
        };
    }
}

module.exports = InstagramService;
