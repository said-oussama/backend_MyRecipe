import multer, { diskStorage } from "multer";
import path, { join, dirname } from "path";
import { fileURLToPath } from "url";

const MIME_TYPES = {
    "video/mp4": "mp4",
    "video/avi": "avi",
    "video/mpeg": "mpeg",
};

export default multer({
    storage: diskStorage({
        destination: (req, file, callback) => {
            const __dirname = dirname(fileURLToPath(import.meta.url));
            callback(null, join(__dirname, "../upload/videos"));
        },
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const extension = MIME_TYPES[file.mimetype];
            callback(null, `${file.fieldname}_${uniqueSuffix}.${extension}`);
        },
    }),
    limits: 50 * 1024 * 1024, // increase the limit to 50MB
}).single("video");
