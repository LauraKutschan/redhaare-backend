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
        const mediaArray = req.body;

        // Input validation
        if (!Array.isArray(mediaArray) || mediaArray.length === 0) {
            return res.status(400).send({ error: "Request body must be a non-empty array" });
        }

        // Use Promise.all() for concurrent database insertions
        const insertionPromises = mediaArray.map(async (item) => {
            const media = {
                media_id: item.media_id,
                caption: item.caption,
                media_type: item.media_type,
                media_url: item.media_url,
                timestamp: item.timestamp,
                permalink: item.permalink
            };
            return dbService.postOneImage(media);
        });

        const results = await Promise.all(insertionPromises);
        res.status(201).send(results);
    } catch (error) {
        console.error("Error inserting images:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

module.exports = router;
