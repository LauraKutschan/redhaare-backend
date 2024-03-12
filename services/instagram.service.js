const axios = require('axios');
const { ACCESS_TOKEN, PROFILE_ID } = require('../configure/instagram');
const { mediaCollection } = require("../configure/db");
const DbService = require('../services/db.service');

class InstagramService {
    constructor() {
        this.fields = 'id,caption,media_type,media_url,timestamp,permalink';
        this.filter = '';
        this.dbService = new DbService();
    }

    async getLatestPosts() {
        try {
            const profileMedia = await this.getProfileMedia();
            const mediaObjects = await this.extractMediaUrls(profileMedia);
            const nonDuplicates = await this.getAllImagesFromDbAndDeleteDuplicates(mediaObjects);
            await this.pushNewMediaToDb(nonDuplicates);
            return nonDuplicates;
        } catch (error) {
            console.error("Error getting latest posts:", error);
        }
    }

    async getProfileMedia() {
        try {
            const url = `https://graph.facebook.com/${PROFILE_ID}/media?access_token=${ACCESS_TOKEN}`;
            const response = await axios.get(url);
            return response.data.data;
        } catch (error) {
            console.error("Error getting profile media:", error);
            return [];
        }
    }

    async extractMediaUrls(profileMedia) {
        try {
            const mediaObjects = [];
            for (const media of profileMedia) {
                const mediaData = await this.getMediaData(media.id);
                if (mediaData && (mediaData.media_type === 'IMAGE' || mediaData.media_type === 'CAROUSEL_ALBUM') && mediaData.caption.includes(this.filter)) {
                    const mediaObject = {
                        media_id: media.id,
                        media_url: media.media_url,
                        caption: media.caption,
                        media_type: media.media_type,
                        timestamp: media.timestamp,
                        permalink: media.permalink
                    };
                    mediaObjects.push(mediaObject);
                }
            }
            return mediaObjects;
        } catch (error) {
            console.error("Error extracting media URLs:", error);
            return [];
        }
    }

    async getMediaData(mediaId) {
        try {
            const url = `https://graph.facebook.com/${mediaId}?fields=${this.fields}&access_token=${ACCESS_TOKEN}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("Error getting media data:", error);
            return null;
        }
    }

    async getAllImagesFromDbAndDeleteDuplicates(media) {
        try {
            const allImages = await mediaCollection.find().toArray();
            const fieldToCompare = 'media_id';
            const imageSet = new Set(allImages.map(item => item[fieldToCompare]));
            console.log('MEDIA: ' + media.filter(item => !imageSet.has(item[fieldToCompare])));
            return media.filter(item => !imageSet.has(item[fieldToCompare]));
        } catch (error) {
            console.error("Error fetching images from DB:", error);
            return [];
        }
    }

    async pushNewMediaToDb(media) {
        try {
            for (const item of media) {
                await this.dbService.postOneImage(item);
            }
        } catch (error) {
            console.error("Error pushing new media to DB:", error);
        }
    }

}

module.exports = InstagramService;
