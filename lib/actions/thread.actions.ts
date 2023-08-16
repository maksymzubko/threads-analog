"use server"

import {connectToDB} from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";

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

        const createdThread = await Thread.create({text, author, community: communityId});

        await User.findByIdAndUpdate(author, {$push: {threads: createdThread._id}});

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

export async function fetchThreadById(threadId: string) {
    try {
        connectToDB();

        return await Thread
            .findById(threadId)
            .populate({path: 'author', model: User, select: "_id id name image"})
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