import mongoose from "mongoose";
import UserSchema from "../schemas/userSchema.js";

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
