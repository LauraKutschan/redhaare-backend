const {mediaCollection} = require("../configure/db");

class DbService {
    constructor() {}

    async getAllImages() {
        return await mediaCollection.find().toArray();
    }

    async postOneImage(media) {
        return await mediaCollection.insertOne(media);
    }
}

module.exports = DbService;