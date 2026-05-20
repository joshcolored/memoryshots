import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema(
  {
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    session_token: { type: String, required: true },
    photo_count: { type: Number, default: 0, min: 0 }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('Guest', guestSchema);
