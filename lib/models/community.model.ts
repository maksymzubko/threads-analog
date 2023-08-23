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
    variant: {
        type: String,
        required: true,
    },
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
    requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    members: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            role: {
                type: String
            }
        },
    ],
});

const Community =
    mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;