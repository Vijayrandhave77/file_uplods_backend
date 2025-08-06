const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const dotenv = require("dotenv").config();



// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send({ message: "No file uploaded" });

  const fileUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;

  res.send({
    message: "File uploaded successfully",
    filename: req.file.filename,
    url: fileUrl,
  });
});

// ✅ New: Get all uploaded files
app.get("/files", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ message: "Error reading files" });

    const fileList = files.map((file) => ({
      filename: file,
      url: `${process.env.BACKEND_URL}/uploads/${file}`,
    }));

    res.json(fileList);
  });
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.BACKEND_URL}`)
);
