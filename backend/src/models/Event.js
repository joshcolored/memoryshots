import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    event_type: {
      type: String,
      enum: ['Wedding', 'Christening', 'Birthday', 'Corporate', 'Anniversary', 'Custom'],
      default: 'Wedding'
    },
    photo_limit: { type: Number, default: 24, min: 1, max: 200 },
    cover_image: { type: String, default: '' },
    event_date: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
    watermark_enabled: { type: Boolean, default: false },
    guestbook_enabled: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

eventSchema.index({ slug: 1 });

export default mongoose.model('Event', eventSchema);
