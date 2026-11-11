const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    purchasedAlbums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }]
});

module.exports = mongoose.model('User', userSchema);