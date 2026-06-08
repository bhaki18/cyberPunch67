const express = require("express");
const jwt = require("jsonwebtoken");
const { CreaPlayer, LoginPlayer } = require("./database");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const player = await CreaPlayer(
            req.body.username,
            req.body.password
        );

        res.json({ success: true, userId: player._id });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const player = await LoginPlayer(
            req.body.username,
            req.body.password
        );

        const token = jwt.sign(
            {
                userId: player._id,
                username: player.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            token
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;