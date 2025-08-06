const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const dotenv = require("dotenv").config();

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(
  cors({
    origin: "*", // ✅ Replace with your frontend domain
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

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

// ✅ Upload a file
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send({ message: "No file uploaded" });

  const fileUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;

  res.send({
    message: "File uploaded successfully",
    filename: req.file.filename,
    url: fileUrl,
  });
});

// ✅ Get all uploaded files
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

// ✅ Delete a file
app.delete("/delete/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({ message: "Error deleting file" });
    }

    res.json({ message: "File deleted successfully", filename });
  });
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.BACKEND_URL}`)
);
