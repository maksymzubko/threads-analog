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
    path: string
}

interface CreateCommentProps {
    threadId: string,
    text: string,
    userId: string,
    path: string
}

export async function createThread({text, author, communityId, path}: CreateThreadProps) {
    try {
        connectToDB();

        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );

        console.log(communityId)

        const createdThread = await Thread.create({text, author, community: communityIdObject});

        await User.findByIdAndUpdate(author, {$push: {threads: createdThread._id}});

        if (communityIdObject) {
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: { threads: createdThread._id },
            });
        }

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
    const childThreads = await Thread.find({ parentId: threadId });

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
        await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        // Update Community model
        await Community.updateMany(
            { _id: { $in: Array.from(uniqueCommunityIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
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
                {path: 'author', model: User, select: "_id id name username parentId image"},
                {
                    path: 'children',
                    model: Thread,
                    populate: [{path: 'author', model: User, select: "_id id name username parentId image"}, {
                        path: 'children',
                        model: Thread,
                        populate: [
                            {path: 'author', model: User, select: "_id id name username parentId image"}, {
                                path: 'children',
                                model: Thread,
                                populate: {path: 'author', model: User, select: "_id id name username parentId image"}
                            }]
                    }]
                }
            ]).exec();
    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}

export async function addCommentToThread({threadId, text, userId, path}: CreateCommentProps) {
    try {
        connectToDB();

        const originalThread = await Thread.findById(threadId);

        if (!originalThread) {
            throw new Error("Thread not found!");
        }

        const commentThread = new Thread({text, author: userId, parentId: threadId})
        const savedCommentThread = await commentThread.save();

        originalThread.children.push(savedCommentThread._id);
        await originalThread.save();

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Error adding comment: ${error.message}`)
    }
}