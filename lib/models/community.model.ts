import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: String,
    registeredAt: {
        type: Date,
        default: Date.now
    },
    description: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
        },
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});

const Community =
    mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;