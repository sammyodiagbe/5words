import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  verified: Boolean,
});

export default UserSchema;
