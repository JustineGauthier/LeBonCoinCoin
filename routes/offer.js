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

        let pictureData;
        if (req.files && req.files.picture) {
            pictureData = await cloudinary.uploader.upload(
                convertToBase64(req.files.picture)
            );
        }

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

router.put("/update/:id", isAuthenticated, fileupload(), async (req, res) => {
    try {
        const offer_id = req.params.id;
        if (offer_id) {
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

            // Vérifiez que req.user est défini
            if (!req.user) {
                return res.status(401).json({ message: "Utilisateur non authentifié" });
            }

            // Récupérer l'annonce à mettre à jour
            const offer = await Offer.findById(offer_id);
            if (!offer) {
                return res.status(404).json({ message: "Annonce non trouvée" });
            }

            // Vérifiez que offer.user est défini et correspond à l'utilisateur authentifié
            if (!offer.owner._id || offer.owner._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Accès refusé, vous n'êtes pas le propriétaire de cette annonce" });
            }

            let pictureData;
            if (req.files && req.files.picture) {
                pictureData = await cloudinary.uploader.upload(
                    convertToBase64(req.files.picture)
                );
            }

            const updatedOffer = await Offer.findOneAndUpdate(
                { _id: offer_id },
                {
                    product_name: title,
                    product_description: description,
                    product_price: price,
                    product_details: [
                        { MARQUE: brand },
                        { TAILLE: size },
                        { ETAT: condition },
                        { COULEUR: color },
                        { EMPLACEMENT: city }
                    ],
                    ...(pictureData && { product_image: pictureData })
                },
                { new: true } // Retourne le document mis à jour
            );

            res.json(updatedOffer);
        } else {
            res.status(400).json({ messsage: "Id de l'annonce manquant !" });
        }

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: error.message });
    }
});

router.delete("/delete/:id", isAuthenticated, fileupload(), async (req, res) => {
    try {
        if (req.params.id) {
            await Offer.findByIdAndDelete(req.params.id);

            res.json({ message: "Offer removed" });
        } else {
            res.status(400).json({ messsage: "Id de l'annonce manquant !" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;