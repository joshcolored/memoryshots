import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let bucket;

export function attachGridBucket() {
  bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'eventPhotos' });
  return bucket;
}

export function getGridBucket() {
  if (!bucket) return attachGridBucket();
  return bucket;
}
