const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    audioUrl: { type: String, required: true }
});

const albumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    releaseDate: { type: String, required: true },
    artist: { type: String, required: true },
    coverImage: { type: String, required: true },
    songs: [songSchema]
});

module.exports = mongoose.model('Album', albumSchema);