const Album = require('../models/album');

// Obtener todos los álbumes
exports.getAllAlbums = async (req, res) => {
    try {
        const albums = await Album.find();
        res.json(albums);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un álbum por su ID
exports.getAlbumById = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ error: 'Álbum no encontrado' });
        res.json(album);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo álbum
exports.createAlbum = async (req, res) => {
    try {
        const newAlbum = new Album(req.body);
        await newAlbum.save();
        res.status(201).json({ message: 'Álbum creado con éxito', album: newAlbum });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un álbum
exports.deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAlbum = await Album.findByIdAndDelete(id);
        
        if (!deletedAlbum) {
            return res.status(404).json({ success: false, message: 'Álbum no encontrado' });
        }

        res.json({ success: true, message: 'Álbum eliminado correctamente', album: deletedAlbum });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};