import mongoose from 'mongoose';

const guestbookMessageSchema = new mongoose.Schema(
  {
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    guest_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: ['pending', 'approved', 'hidden'], default: 'pending' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('GuestbookMessage', guestbookMessageSchema);
