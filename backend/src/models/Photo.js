import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    guest_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true, index: true },
    image_url: { type: String, required: true },
    storage_path: { type: String, required: true },
    storage_file_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    original_filename: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'hidden'], default: 'pending', index: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('Photo', photoSchema);
