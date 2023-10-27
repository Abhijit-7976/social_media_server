const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer();

router.post("/upload", upload.single("file"), async (req, res) => {
  const b64 = Buffer.from(req.file.buffer).toString("base64");
  let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
  try {
    const result = await cloudinary.uploader.upload(dataURI, {
      upload_preset: "ShiniSphere",
    });
    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/delete", async (req, res) => {
  console.log(req.body);
  try {
    const result = await cloudinary.uploader.destroy(req.body.public_id);
    console.log(result);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
