const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');

router.get('/', albumController.getAllAlbums);
router.get('/:id', albumController.getAlbumById);
router.post('/', albumController.createAlbum);
router.delete('/:id', albumController.deleteAlbum); // <--- Endpoint para eliminar

module.exports = router;