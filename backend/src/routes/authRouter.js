const express = require("express");
const {
    registerUser,
    authenticateUser,
    logoutUser,
    modifyPassword,
    resetPassword,
    forgotPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authenticateUser);
router.post("/logout", logoutUser);
router.post("/modify-password", modifyPassword);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);

module.exports = router;
