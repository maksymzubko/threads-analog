"use server"

import {connectToDB} from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";
import Community from "@/lib/models/community.model";

interface CreateThreadProps {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
    mentions: { user: string }[]
}

interface UpdateThreadProps {
    text: string;
    id: string;
    path: string;
    mentions: { user: string }[];
}

interface CreateCommentProps {
    threadId: string,
    text: string,
    userId: string,
    path: string,
    mentions: any[]
}

interface LikeProps {
    threadId: string,
    userId: string,
}

export async function createThread({text, author, communityId, mentions, path}: CreateThreadProps) {
    try {
        connectToDB();

        const communityIdObject = await Community.findOne(
            {id: communityId},
            {_id: 1}
        );

        const createdThread = await Thread.create({text, author, community: communityIdObject, mentioned: mentions});

        await User.findByIdAndUpdate(author, {$push: {threads: createdThread._id}});

        if (communityIdObject) {
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: {threads: createdThread._id},
            });
        }

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`)
    }
}

export async function updateThread({text, id, mentions, path}: UpdateThreadProps) {
    try {
        connectToDB();

        const thread = await Thread.findById(id);
        if (!thread) throw new Error("Not found thread");

        await Thread.findByIdAndUpdate(thread._id, {text, mentioned: mentions});

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`)
    }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const threadsQuery = Thread
            .find({parentId: {$in: [null, undefined]}})
            .sort({createdAt: 'desc'})
            .skip(skipAmount)
            .limit(pageSize)
            .populate({path: 'author', model: User})
            .populate({
                path: 'mentioned',
                populate: {
                    path: 'user',
                    model: User,
                    select: "_id id username image name bio registeredAt"
                }
            })
            .populate({
                path: 'likes',
                populate: {
                    path: 'user',
                    model: User,
                    select: "_id id"
                }
            })
            .populate({
                path: "community",
                model: Community,
            })
            .populate({
                path: 'children',
                populate: {path: 'author', model: User, select: "_id name username parentId image"}
            })

        const totalThreadsCount = await Thread.countDocuments({parentId: {$in: [null, undefined]}});
        const threads = await threadsQuery.exec();

        const isNext = totalThreadsCount > skipAmount + threads.length;

        return {threads, isNext};
    } catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`)
    }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({parentId: threadId});

    const descendantThreads = [];
    for (const childThread of childThreads) {
        const descendants = await fetchAllChildThreads(childThread._id);
        descendantThreads.push(childThread, ...descendants);
    }

    return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
    try {
        connectToDB();

        // Find the thread to be deleted (the main thread)
        const mainThread = await Thread.findById(id).populate("author community");

        if (!mainThread) {
            throw new Error("Thread not found");
        }

        // Fetch all child threads and their descendants recursively
        const descendantThreads = await fetchAllChildThreads(id);

        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantThreadIds = [
            id,
            ...descendantThreads.map((thread) => thread._id),
        ];

        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.community?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        // Recursively delete child threads and their descendants
        await Thread.deleteMany({_id: {$in: descendantThreadIds}});

        // Update User model
        await User.updateMany(
            {_id: {$in: Array.from(uniqueAuthorIds)}},
            {$pull: {threads: {$in: descendantThreadIds}}}
        );

        // Update Community model
        await Community.updateMany(
            {_id: {$in: Array.from(uniqueCommunityIds)}},
            {$pull: {threads: {$in: descendantThreadIds}}}
        );

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to delete thread: ${error.message}`);
    }
}

export async function fetchThreadById(threadId: string) {
    try {
        connectToDB();

        return await Thread
            .findById(threadId)
            .populate({path: 'author', model: User, select: "_id id name image"})
            .populate({
                path: "community",
                model: Community,
                select: "_id id name image",
            })
            .populate([
                {
                    path: 'likes',
                    populate: {
                        path: 'user',
                        model: User,
                        select: "_id id"
                    }
                },
                {
                    path: 'mentioned',
                    populate: {
                        path: 'user',
                        model: User,
                        select: "_id id image registeredAt bio name username"
                    }
                },
                {path: 'author', model: User, select: "_id id name username parentId image"},
                {
                    path: 'children',
                    model: Thread,
                    populate: [
                        {path: 'author', model: User, select: "_id id name username parentId image"},
                        {
                            path: 'likes',
                            populate: {
                                path: 'user',
                                model: User,
                                select: "_id id"
                            }
                        },
                        {
                            path: 'mentioned',
                            populate: {
                                path: 'user',
                                model: User,
                                select: "_id id image registeredAt bio name username"
                            }
                        },
                        {
                            path: 'children',
                            model: Thread,
                            populate: [
                                {path: 'author', model: User, select: "_id id name username parentId image"},
                                {
                                    path: 'likes',
                                    populate: {
                                        path: 'user',
                                        model: User,
                                        select: "_id id"
                                    }
                                },
                                {
                                    path: 'mentioned',
                                    populate: {
                                        path: 'user',
                                        model: User,
                                        select: "_id id image registeredAt bio name username"
                                    }
                                },
                                {
                                    path: 'children',
                                    model: Thread,
                                    populate: {
                                        path: 'author',
                                        model: User,
                                        select: "_id id name username parentId image"
                                    }
                                }
                            ]
                        }
                    ]
                }
            ])
            .populate({
                path: 'mentioned',
                populate: {
                    path: 'user',
                    model: User,
                    select: "_id id image registeredAt bio name username"
                }
            })
            .populate({
                path: 'likes',
                populate: {
                    path: 'user',
                    model: User,
                    select: "_id id"
                }
            }).exec();

    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}

export async function addCommentToThread({threadId, text, userId, path, mentions = []}: CreateCommentProps) {
    try {
        connectToDB();

        const originalThread = await Thread.findById(threadId);

        if (!originalThread) {
            throw new Error("Thread not found!");
        }

        const commentThread = new Thread({text, author: userId, parentId: threadId, mentioned: mentions})
        const savedCommentThread = await commentThread.save();

        originalThread.children.push(savedCommentThread._id);
        await originalThread.save();

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Error adding comment: ${error.message}`)
    }
}

export async function likeFuncThread({threadId, userId}: LikeProps) {
    try {
        connectToDB();

        const originalThread = await Thread.findById(threadId)
            .populate({path: 'likes', populate: {path: 'user', model: User, select: '_id id'}});

        if (!originalThread) {
            throw new Error("Thread not found!");
        }

        const user = await User.findOne({id: userId});

        if (!user) {
            throw new Error("User not found!");
        }

        if (originalThread?.likes?.some((l: any) => l.user.id === userId)) {
            originalThread.likes = originalThread.likes.filter((l: any) => l.user.id !== userId);
        } else {
            originalThread.likes.push({user: user._id, createdAt: new Date()});
        }

        await originalThread.save();

        return (await Thread
            .findById(threadId)
            .select('_id likes')
            .populate({path: 'likes', populate: {path: 'user', model: User, select: '_id id'}}))
            ?.likes.map((l: any) => l?.user?.id);

    } catch (error: any) {
        throw new Error(`Error likeFunc thread: ${error.message}`)
    }
}