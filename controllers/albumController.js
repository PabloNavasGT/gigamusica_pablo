const Album = require('../models/album');
// Obtener todos los álbumes
exports.getAlbums = async (req, res) => {
    try {
        const albums = await Album.find();
        res.json(albums);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un álbum por ID (para el Now Play)
exports.getAlbumById = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ error: 'Álbum no encontrado' });
        res.json(album);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo álbum con su listado de canciones
exports.createAlbum = async (req, res) => {
    try {
        const { title, releaseDate, artist, coverImage, price, songs } = req.body;
        const newAlbum = new Album({ title, releaseDate, artist, coverImage, price, songs });
        await newAlbum.save();
        res.status(201).json({ message: 'Álbum creado exitosamente', album: newAlbum });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};