import mongoose, { Schema } from "mongoose"

const FavoriteSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        coinId: { type: String, required: true },
        chainId: { type: String, required: true },
        address: { type: String, required: true }
    },
    { timestamps: true }
)

FavoriteSchema.index({ userId: 1, coinId: 1 }, { unique: true });

export default mongoose.models.Favorite ||
    mongoose.model("Favorite", FavoriteSchema);