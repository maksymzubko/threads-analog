"use server"

import {connectToDB} from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";
import Thread from "@/lib/models/thread.model";
import {FilterQuery, SortOrder} from "mongoose";
import Community from "@/lib/models/community.model";

interface UpdateUserParams {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string
}

interface GetUsersParams {
    userId: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
    searchString?: string;
}

export async function updateUser({userId, username, name, bio, image, path}: UpdateUserParams): Promise<void> {
    connectToDB();

    try {
        await User.findOneAndUpdate(
            {id: userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true
            },
            {upsert: true}
        );

        if (path === '/profile/edit') {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }

}

export async function fetchUser(userId: string) {
    try {
        connectToDB();
        return await User.findOne({$or: [{id: userId}, {username: userId.replace("%40","")}]});
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`)
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        return await User
            .findOne({id: userId})
            .populate({
                path: 'threads',
                model: Thread,
                populate: [{
                    path: "community",
                    model: Community,
                }, {
                    path: 'children', model: Thread,
                    populate: {path: 'author', model: User, select: 'name username image id'}
                }]
            })
    } catch (error: any) {
        throw new Error(`Failed to fetch posts: ${error.message}`)
    }
}

export async function fetchUsers({userId, searchString = "", pageNumber = 1, pageSize = 20, sortBy = "desc"}: GetUsersParams) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, 'i');

        const query: FilterQuery<typeof User> = {id: {$ne: userId}}

        if(searchString?.trim() !== '') {
            query.$or = [
                {username: {$regex: regex}},
                {name: {$regex: regex}}
            ]
        }

        const sortOptions = {createdAt: sortBy};

        const usersQuery = User
            .find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return {users, isNext};
    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`)
    }
}

export async function getActivity(userId: string) {
    try {
        connectToDB();

        const userThreads = await Thread.find({author: userId});

        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        }, [])

        const replies = await Thread.find({
            _id: {$in: childThreadIds},
            author: {$ne: userId}
        }).populate({
            path: 'author',
            model: User,
            select: 'name image id username _id'
        })

        return replies;
    } catch (error: any) {
        throw new Error(`Failed to get user activity: ${error.message}`)
    }
}