const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Role = require("../models/Role");
const nodemailer = require('nodemailer'); // Ajoutez cette ligne
const { generateToken } = require("../utils/auth");
const { BadRequestError } = require("../middlewares/errorMiddleware");

// Fonction pour déterminer le rôle d'un utilisateur
const getUserRole = async () => {
    const userCount = await User.countDocuments({});

    // Si c'est le premier utilisateur, le rôle sera "Administrateur"
    if (userCount === 0) {
        return 'Administrateur';
    } else {
        // Pour les utilisateurs suivants, le rôle peut être choisi
        return ['Administrateur', 'Utilisateur', 'Technicien'];
    }
};

// Enregistrement d'un nouvel utilisateur
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new BadRequestError("L'utilisateur existe déjà avec cet email");
    }

    // Vérification du nombre d'utilisateurs dans la base
    const userCount = await User.countDocuments({});

    // Le premier utilisateur devient administrateur
    let roleName;
    if (userCount === 0) {
        roleName = 'Administrateur';
    } else {
        // Si ce n'est pas le premier utilisateur, le rôle doit être spécifié
        if (!role) {
            throw new BadRequestError("Le rôle doit être spécifié pour les utilisateurs suivants");
        }
        roleName = role;
    }

    // Récupérer ou créer le rôle dans la base de données
    let userRole = await Role.findOne({ Titre: roleName });
    if (!userRole) {
        userRole = await Role.create({ Titre: roleName });
    }

    // Création de l'utilisateur avec le rôle approprié
    const user = await User.create({
        Name: name,
        Email: email,
        Password: password,
        R_ID: userRole._id, // Associe le rôle à l'utilisateur
    });

    // Génération du jeton JWT
    generateToken(res, user._id);
    res.status(201).json({
        id: user._id,
        name: user.Name,
        email: user.Email,
        role: userRole.Titre,
    });
});

// Authentification d'un utilisateur
const authenticateUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Chercher l'utilisateur par email
    const user = await User.findOne({ Email: email });
    if (!user || !(await user.comparePassword(password))) {
        throw new BadRequestError("Email ou mot de passe incorrect");
    }

    // Générer le token JWT
    generateToken(res, user._id);
    res.status(200).json({
        id: user._id,
        name: user.Name,
        email: user.Email,
        role: user.R_ID,
    });
});

// Déconnexion d'un utilisateur
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Déconnexion réussie" });
});

// Modifier le mot de passe d'un utilisateur
const modifyPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || !(await user.comparePassword(currentPassword))) {
        throw new BadRequestError("Mot de passe actuel incorrect");
    }

    user.Password = newPassword;
    await user.save();
    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
});

// Mot de passe oublié
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ Email: email });

    if (!user) {
        throw new BadRequestError("Utilisateur non trouvé");
    }

    // Générer un jeton de réinitialisation
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Créer l'URL de réinitialisation
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Envoyer l'email (exemple basique)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.Email,
        subject: 'Réinitialisation du mot de passe',
        text: `Vous avez demandé une réinitialisation de votre mot de passe. Veuillez cliquer sur ce lien : ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email de réinitialisation envoyé" });
});

// Réinitialiser le mot de passe
const resetPassword = asyncHandler(async (req, res) => {
    const resetToken = req.params.token;
    const { password } = req.body;

    // Trouver l'utilisateur avec le token
    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new BadRequestError("Jeton invalide ou expiré");
    }

    // Mettre à jour le mot de passe
    user.Password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
});

module.exports = {
    registerUser,
    authenticateUser,
    logoutUser,
    modifyPassword,
    forgotPassword,
    resetPassword,
};
