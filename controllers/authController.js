const User = require('../models/User');

// Registro de usuario con soporte de código secreto para Admin
exports.register = async (req, res) => {
    try {
        const { username, email, password, adminSecret } = req.body;

          const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado.' });
        }

         let rol = 'user';
        if (adminSecret && adminSecret === process.env.ADMIN_SECRET_CODE) {
            rol = 'admin';
        }

        const newUser = new User({
            username,
            email,
            password, 
            rol
        });

        await newUser.save();
        res.status(201).json({ 
            success: true, 
            message: `¡Cuenta registrada exitosamente como ${rol.toUpperCase()}!` 
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Inicio de sesión devolviendo datos y rol
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ success: false, message: 'Credenciales inválidas.' });
        }

        res.json({
            success: true,
            message: 'Login exitoso',
            token: 'mock-token-session', // Si usas JWT puedes generarlo aquí
            usuario: {
                id: user._id,
                nombre: user.username,
                email: user.email,
                rol: user.rol
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('purchasedAlbums');
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};