const Order = require('../models/Order');
const User = require('../models/User');

exports.createOrder = async (req, res) => {
    try {
        const { userId, items, totalAmount, billing } = req.body;

        const rawCard = billing.cardNumber || '';
        const last4 = rawCard.slice(-4) || '4444';
        const maskedCard = `**** **** **** ${last4}`;

        const newOrder = new Order({
            userId,
            items,
            totalAmount,
            billing: {
                cardName: billing.cardName,
                maskedCard,
                address: billing.address
            }
        });

        await newOrder.save();

        // Si hay un usuario logueado, agregar los álbumes a su lista de purchasedAlbums
        if (userId) {
            const albumIds = items.map(item => item._id);
            await User.findByIdAndUpdate(userId, {
                $addToSet: { purchasedAlbums: { $each: albumIds } }
            });
        }

        res.status(201).json({ message: 'Compra registrada con éxito', order: newOrder });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};