import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    image: String,
    bio: String,
    registeredAt: {
        type: Date,
        default: Date.now
    },
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ],
    onboarded: {
        type: Boolean,
        default: false
    },
    subscribes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    subscribers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    communities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community'
        }
    ]
})

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;