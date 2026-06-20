import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Wishlist owner identifier is mandatory'],
    unique: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  }]
}, {
  timestamps: true
});

export default mongoose.model('Wishlist', WishlistSchema);
