const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthenticated");
const fileupload = require("express-fileupload");
const convertToBase64 = require("../utils/convertToBase64");
const cloudinary = require("cloudinary").v2;


router.post("/publish", isAuthenticated, fileupload(), async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            condition,
            city,
            brand,
            size,
            color
        } = req.body;

        const pictureData = await cloudinary.uploader.upload(
            convertToBase64(req.files.picture)
        );

        const offer = new Offer({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
                { MARQUE: brand },
                { TAILLE: size },
                { ETAT: condition },
                { COULEUR: color },
                { EMPLACEMENT: city },
            ],
            product_image: { pictureData },
            owner: req.user,
        });

        await offer.save();
        res.json(offer);

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const { title, priceMin, priceMax, sort, page } = req.query;

        const filter = {};

        if (title) {
            filter.product_name = new RegExp(title, "i");
        }

        if (priceMin) {
            filter.product_price = { $gte: priceMin };
        }

        if (priceMax) {
            if (filter.product_price) {
                filter.product_price.$lte = priceMax;
            } else {
                filter.product_price = { $lte: priceMax };
            };
        }

        const sortFilter = {};

        if (sort === "price-desc") {
            sortFilter.product_price = -1;
        } else if (sort === "price-asc") {
            sortFilter.product_price = 1;
        };

        const limit = 3;
        const pageNumber = page || 1;
        const numberToSkip = (pageNumber - 1) * limit;

        const offers = await Offer.find(filter)
            .sort(sortFilter)
            .limit(limit)
            .skip(numberToSkip)
            .populate("owner", "account");
        // .select("product_price product_name -_id");

        res.status(200).json(offers);
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;