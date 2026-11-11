const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const albumRoutes = require('./routes/albumRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes'); // <--- ¡Asegúrate de tener esta línea!

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 Conectado exitosamente a MongoDB'))
    .catch((err) => console.error('🔴 Error de conexión a MongoDB:', err));

// Registrar Endpoints / Capas
app.use('/api/albums', albumRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes); // <--- ¡Asegúrate de montar esta ruta aquí!

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});