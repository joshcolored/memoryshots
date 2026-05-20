import crypto from 'node:crypto';
import path from 'node:path';
import { ObjectId } from 'mongodb';
import { getGridBucket } from '../config/gridfs.js';
import { cloudinary } from '../config/cloudinary.js';

const extensionByType = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

export async function storePhoto({ file, event, guest }) {
  const ext = extensionByType[file.mimetype] || path.extname(file.originalname || '') || '.jpg';
  const filename = `${Date.now()}-${crypto.randomUUID()}`;
  const publicId = `events/${event.slug}/${guest._id}/${filename}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'image',
        overwrite: false,
        use_filename: false,
        unique_filename: false,
        folder: undefined,
        context: {
          event_id: String(event._id),
          guest_id: String(guest._id),
          original_filename: file.originalname || ''
        }
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Cloudinary upload failed'));
        resolve({
          fileId: result.public_id,
          storagePath: `${publicId}${ext}`,
          imageUrl: result.secure_url
        });
      }
    );

    uploadStream.end(file.buffer);
  });
}

export async function streamPhotoById(fileId, res) {
  const bucket = getGridBucket();
  const _id = new ObjectId(fileId);
  const files = await bucket.find({ _id }).toArray();
  if (!files.length) {
    const error = new Error('Image not found');
    error.status = 404;
    throw error;
  }

  res.setHeader('Content-Type', files[0].contentType || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  return bucket.openDownloadStream(_id).pipe(res);
}

export async function deleteStoredPhoto(fileId) {
  if (ObjectId.isValid(fileId)) {
    const bucket = getGridBucket();
    await bucket.delete(new ObjectId(fileId));
    return;
  }

  await cloudinary.uploader.destroy(fileId, { resource_type: 'image' });
}

export function isGridFsPhoto(fileId) {
  return ObjectId.isValid(fileId);
}

export async function getGridFsDownloadStream(fileId) {
  const bucket = getGridBucket();
  return bucket.openDownloadStream(new ObjectId(fileId));
}
