class DbService {
    constructor(mediaCollection) {
        this.mediaCollection = mediaCollection;
    }

    /**
     * Retrieves all images from the database.
     * @returns {Promise<Array>} Array of images.
     */
    async getAllImages() {
        try {
            return await this.mediaCollection.find().toArray();
        } catch (error) {
            throw new Error(`Error fetching images: ${error.message}`);
        }
    }

    /**
     * Inserts a single image into the database.
     * @param {object} media The media object to insert.
     * @returns {Promise<object>} The result of the insertion operation.
     */
    async postOneImage(media) {
        try {
            return await this.mediaCollection.insertOne(media);
        } catch (error) {
            throw new Error(`Error inserting image: ${error.message}`);
        }
    }
}

module.exports = DbService;
