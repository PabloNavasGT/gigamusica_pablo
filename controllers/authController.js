const User = require('../models/User');

// Asegúrate de tener este controlador actualizado en tu backend:
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('purchasedAlbums');
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener datos actualizados del usuario (incluyendo biblioteca)
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('purchasedAlbums');
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};