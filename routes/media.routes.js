const express = require('express');
const router = express.Router();
const DbService = require('../services/db.service');
const dbService = new DbService();

// GET all Images
router.get('/', async (req, res) => {
    try {
        const allImages = await dbService.getAllImages();
        res.status(200).send(allImages);
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});


// POST media array
router.post('/', async (req, res) => {
    try {
        const results = [];
        for (const item of req.body) {
            const media = {
                media_id: item.media_id,
                caption: item.caption,
                media_type: item.media_type,
                media_url: item.media_url,
                timestamp: item.timestamp,
                permalink: item.permalink
            };
            const result = await dbService.postOneImage(media);
            results.push(result);
        }
        res.status(201).send(results);
    } catch (error) {
        res.status(404).send({
            error: "Image can't be inserted"
        });
    }
});

module.exports = router;