import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  walletAddress: { type: String, unique: true, required: true },
  sbtAddress: { type: String, unique: true, sparse: true },
});

export default mongoose.models.User || mongoose.model('User', UserSchema); 