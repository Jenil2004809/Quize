const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images and bulk imports (json/excel/csv)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /json|csv|xlsx|xls/;
  
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype;

  const isImage = allowedImageTypes.test(ext) || mimetype.includes('image/');
  const isDocument = allowedDocTypes.test(ext) || 
                     mimetype.includes('json') || 
                     mimetype.includes('csv') || 
                     mimetype.includes('sheet') || 
                     mimetype.includes('excel');

  if (isImage || isDocument) {
    return cb(null, true);
  }
  
  cb(new Error('Invalid file type! Only images (JPEG, JPG, PNG, WEBP) and import sheets (JSON, CSV, XLS, XLSX) are allowed.'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limits
  fileFilter: fileFilter
});

module.exports = upload;
