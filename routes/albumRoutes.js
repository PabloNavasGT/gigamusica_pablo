const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');

router.get('/', albumController.getAlbums);
router.get('/:id', albumController.getAlbumById);
router.post('/', albumController.createAlbum);

module.exports = router;