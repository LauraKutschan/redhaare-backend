const InstagramService = require('../services/instagram.service');
const instagramService = new InstagramService();
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        await instagramService.getLatestPosts();
        res.status(200).send();
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

module.exports = router;
