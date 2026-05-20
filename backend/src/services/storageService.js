import crypto from 'node:crypto';
import path from 'node:path';
import { ObjectId } from 'mongodb';
import { getGridBucket } from '../config/gridfs.js';

const extensionByType = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

export async function storePhoto({ file, event, guest }) {
  const bucket = getGridBucket();
  const ext = extensionByType[file.mimetype] || path.extname(file.originalname || '') || '.jpg';
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const storagePath = `events/${event.slug}/${guest._id}/${filename}`;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(storagePath, {
      contentType: file.mimetype,
      metadata: {
        event_id: event._id,
        guest_id: guest._id,
        original_filename: file.originalname
      }
    });

    uploadStream.end(file.buffer);
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve({
        fileId: uploadStream.id,
        storagePath,
        imageUrl: `${process.env.PUBLIC_API_URL || ''}/api/photos/${uploadStream.id}/image`
      });
    });
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
  const bucket = getGridBucket();
  await bucket.delete(new ObjectId(fileId));
}
