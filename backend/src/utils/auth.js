const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Génère un token JWT et le stocke dans un cookie
const generateToken = (res, userId) => {
    const jwtSecret = process.env.JWT_SECRET || "";

    const token = jwt.sign({ userId }, jwtSecret, {
        expiresIn: "7d", // 7 jours
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000 * 8, // 8 heures en millisecondes
    });
};

// Efface le token JWT en réglant son expiration à une date antérieure
const clearToken = (res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
};

// Récupère le nom de l'utilisateur actuellement connecté à partir du token JWT stocké dans un cookie
const getCurrentUser = async (req) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return null; // Aucun token trouvé
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");

        const user = await User.findById(decoded.userId);

        if (!user) {
            return null; // Utilisateur non trouvé
        }

        return user.Name; // Assurez-vous que votre modèle User a une propriété 'Name'
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
    }
};

module.exports = { generateToken, getCurrentUser, clearToken };
