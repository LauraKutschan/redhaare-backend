const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    media_id: String,
    media_url: String,
    caption: String,
    media_type: String,
    timestamp: String,
    permalink: String
});

module.exports = mongoose.model('images', schema);