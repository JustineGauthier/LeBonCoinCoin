const express = require("express");
const router = express.Router();
const User = require("../models/User");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password, newsletter } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "We need all the information !",
            });
        }

        const emailAlreadyExists = await User.findOne({ email });

        if (emailAlreadyExists) {
            return res.status(400).json({
                message: "User already exists !",
            });
        }

        const salt = uid2(20);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(20);

        const newUser = new User({
            email,
            account: { username },
            newsletter,
            token,
            hash,
            salt,
        });

        await newUser.save();

        return res.status(201).json({
            message: "User successfully created !",
        });

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "We need all the information !",
            });
        }

        const account = await User.findOne({ email });

        if (!account) {
            return res.status(400).json({
                message: "Incorrect email !",
            });
        }

        const accountSalt = account.salt;
        const accountHash = account.hash;
        const hash = SHA256(password + accountSalt).toString(encBase64);

        if (accountHash !== hash) {
            return res.status(400).json({
                message: "Incorrect password !",
            });
        }

        return res.status(201).json({
            message: "User successfully connected !",
        });

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
