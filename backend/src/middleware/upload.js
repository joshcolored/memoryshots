import multer from 'multer';

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxPhotoSizeMb = Number(process.env.MAX_PHOTO_SIZE_MB || 5);

export const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxPhotoSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only jpg, jpeg, png, and webp images are allowed'));
    }
    cb(null, true);
  }
}).single('photo');

export const uploadCoverImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxPhotoSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only jpg, jpeg, png, and webp images are allowed'));
    }
    cb(null, true);
  }
}).single('cover_image_file');

export function handleMulter(req, res, next) {
  uploadPhoto(req, res, (error) => {
    if (!error) return next();
    error.status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 422;
    next(error);
  });
}

export function handleCoverImageMulter(req, res, next) {
  uploadCoverImage(req, res, (error) => {
    if (!error) return next();
    error.status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 422;
    next(error);
  });
}
