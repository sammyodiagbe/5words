import mongoose from "mongoose";
import { UserSchema } from "../schemas.js";

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
