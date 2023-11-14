import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (_request, _file, callback) {
    callback(null, "./uploads/videos");
  },
  filename: function (_request, file, callback) {
    callback(
      null,
      "IMAGE_" + Date.now() + path.extname(file.originalname)
    );
  },
});

export const upload = multer({ storage: storage });
