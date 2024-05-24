const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
    try {

        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = req.headers.authorization.replace("Bearer ", "");
        const user = await User.findOne({ token: token }).select("account");

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.user = user;
        return next();

    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });

    }
};

module.exports = isAuthenticated;
