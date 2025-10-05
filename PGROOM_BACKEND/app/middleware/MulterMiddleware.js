const multer = require("multer");

/**
 * File Filter Function
 * 
 * This function is used by Multer to filter uploaded files based on their MIME type.
 * It ensures that only files of specific types (JPEG and PNG) are accepted.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} file - The file object containing information about the uploaded file.
 * @param {Function} cb - The callback function to pass control back to Multer.
 */
const fileFilter = (req, file, cb) => {
  // Allowed MIME types for image uploads
  const allowedTypes = ["image/jpeg", "image/png"];

  // Check if the uploaded file's MIME type is in the list of allowed types
  if (allowedTypes.includes(file.mimetype)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file with an error message
    cb(new Error("Invalid file type. Only JPEG and PNG are allowed."), false);
  }
};

/**
 * Multer Configuration
 * 
 * This configuration sets up Multer to handle file uploads in memory.
 * - `storage`: Uses `memoryStorage` to store uploaded files in memory as a buffer.
 * - `fileFilter`: Applies the `fileFilter` function to validate file types.
 * - `limits`: Restricts the maximum file size to 5MB per file.
 */
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  fileFilter: fileFilter, // Apply file type validation
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

/**
 * Middleware to Validate Number of Files
 * 
 * This middleware ensures that:
 * - At least one file is uploaded.
 * - No more than 10 files are uploaded.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function in the stack.
 */
const validateFileUpload = (req, res, next) => {
  // Check if any files were uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "At least one image is required" });
  }

  // Check if the number of uploaded files exceeds the limit
  if (req.files.length > 10) {
    return res.status(400).json({ error: "You can upload a maximum of 10 images" });
  }

  // Proceed to the next middleware
  next();
};

/**
 * Exported Functions
 * 
 * These functions are exported for use in other parts of the application.
 * 
 * @property {Function} uploadImages - A Multer middleware to handle multiple image uploads.
 *                                      It accepts up to 10 files under the field name "images".
 * @property {Function} validateFileUpload - A middleware to validate the number of uploaded files.
 */
module.exports = {
  /**
   * Middleware for Uploading Images
   * 
   * This middleware allows uploading of multiple images (up to 10) under the field name "images".
   * It uses the configured Multer instance (`upload`) to handle the uploads.
   */
  uploadImages: upload.array("images", 10),

  /**
   * Middleware to Validate File Uploads
   * 
   * Ensures that the number of uploaded files is within the allowed range (1 to 10).
   */
  validateFileUpload,
};