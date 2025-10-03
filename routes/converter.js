const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("pointcloud"), (req, res) => {
  const uploadedFile = req.file;
  const folderName = req.body.outputPath?.trim() || "default_project";
  const outputPath = path.join(__dirname, "../public/converted", folderName);

  if (!uploadedFile) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }
  const ext = path.extname(uploadedFile.originalname) || ".laz";
  const newPath = uploadedFile.path + ext;

  fs.renameSync(uploadedFile.path, newPath);


  fs.mkdirSync(outputPath, { recursive: true });

  const potreeConverterPath = path.resolve(__dirname, "../PotreeConverter/PotreeConverter.exe");
  const cmd = `"${potreeConverterPath}" "${newPath}" -o "${outputPath}"`;

  console.log("Running:", cmd);

  exec(cmd, (error, stdout, stderr) => {
		console.log("STDOUT:", stdout);
		console.log("STDERR:", stderr);
		
		fs.unlinkSync(newPath);

		if (error) {
			return res.json({ success: false, error: stderr || error.message });
		}

		res.json({ success: true, outputPath, message: stdout });
	});
});

module.exports = router;
