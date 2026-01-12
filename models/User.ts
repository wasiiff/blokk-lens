import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false, minLength: 6 },
        provider: {
            type: String,
            default: "credentials",
        },

    },
    { timestamps: true }
)

export default mongoose.models.User || mongoose.model("User", UserSchema);