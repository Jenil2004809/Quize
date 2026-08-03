const cloudinary = require('cloudinary').v2;

// Check if credentials are provided in env, else use standard credentials or mock helper
const isConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                    process.env.CLOUDINARY_API_KEY && 
                    process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary Configured Successfully');
} else {
  console.log('⚠️  Cloudinary Credentials Missing. Using Local File Storage Upload fallback.');
}

// Export a helper that checks configuration and falls back to uploading or returning local path
const uploadImage = async (filePath, folder = 'quiz_system') => {
  if (!isConfigured) {
    // If not configured, we return the local file path as a fallback
    return {
      secure_url: filePath,
      public_id: null
    };
  }
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadImage
};
