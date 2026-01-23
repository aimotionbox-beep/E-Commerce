import multer from "multer";
import fs from "fs";
import path from "path";

// ✅ ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    const safeName = file.originalname.replace(/\s+/g, "_");
    callback(null, Date.now() + "-" + safeName);
  },
});

const upload = multer({ storage });

export default upload;
