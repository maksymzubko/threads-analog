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
    onlyNickname?: boolean;
    isPlain?: boolean;
}

export async function createUser({userId, username, name, bio, image, path}: UpdateUserParams): Promise<any> {
    connectToDB();

    try {
        const existedUser = await User.findOne({username: username.toLowerCase(), id: {$ne: userId}});
        if (existedUser)
            return {
                error: {
                    name: 'username',
                    error: {type: 'custom', message: 'User with same name is already exist!'}
                }
            }

        await User.create({
            id: userId,
            username: username.toLowerCase(),
            name,
            bio,
            image,
            onboarded: true
        })
    } catch (error: any) {
        throw new Error(`Failed to create user: ${error.message}`)
    }
}

export async function updateUser({userId, username, name, bio, image, path}: UpdateUserParams): Promise<any> {
    connectToDB();

    try {
        const existedUser = await User.findOne({username: username.toLowerCase(), id: {$ne: userId}});
        if (existedUser)
            return {
                error: {
                    name: 'username',
                    error: {type: 'custom', message: 'User with same name is already exist!'}
                }
            }

        await User.findOneAndUpdate(
            {id: userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true
            }
        );

        if (path === '/profile/edit') {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to update user: ${error.message}`)
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();
        return await User.findOne({$or: [{id: userId}, {username: userId.replace("%40", "")}]});
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
                populate: [
                    {
                        path: "community",
                        model: Community,
                    }, {
                        path: 'children', model: Thread,
                        populate: {path: 'author', model: User, select: 'name username image id'}
                    },
                    {
                        path: 'mentioned',
                        populate: {
                            path: 'user',
                            model: User,
                            select: "_id id image registeredAt bio name username"
                        }
                    }
                ]
            })
    } catch (error: any) {
        throw new Error(`Failed to fetch posts: ${error.message}`)
    }
}

export async function fetchUsers({
                                     userId,
                                     searchString = "",
                                     pageNumber = 1,
                                     pageSize = 20,
                                     sortBy = "desc",
                                     onlyNickname = false,
                                     isPlain = false
                                 }: GetUsersParams) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString?.replaceAll(/[.[.(.)\]]/gm, ''), 'i');

        const query: FilterQuery<typeof User> = {id: {$ne: userId}}

        if (searchString?.trim() !== '' && !onlyNickname) {
            query.$or = [
                {username: {$regex: regex}},
                {name: {$regex: regex}}
            ]
        } else
            query.$or = [
                {username: {$regex: regex}},
            ]

        const sortOptions = {createdAt: sortBy};

        const usersQuery = User
            .find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);

        let users = await usersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return {users, isNext};
    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`)
    }
}

const findReplies = async (childThreadIds: any[], userId: string) => {
    const result: any[] = [];
    const replies = await Thread.find({
        _id: {$in: childThreadIds},
        author: {$ne: userId}
    }).populate({
        path: 'author',
        model: User,
        select: 'name image id bio username _id'
    }).populate({
        path: 'mentioned',
        populate: {
            path: 'user',
            model: User,
            select: 'name image id bio username _id registeredAt'
        }
    })
    replies.map(r=>{
        result.push({...r?._doc, type: 'reply', date: new Date(r?._doc.createdAt).getTime()});
    })
    return result;
}

const findLikes = async (childThreadIds: any[], userId: string) => {
    const result: any[] = [];
    const threadsWithLikes = await Thread.find({
        author: userId,
        likes: {$exists: true, $elemMatch:{user: {$ne: userId}}}
    }).populate({
        path: 'likes',
        populate: {
            path: 'user',
            model: User,
            select: 'name image bio id username _id'
        }
    }).populate({
        path: 'author',
        model: User,
        select: 'name image bio id username _id'
    }).populate({
        path: 'mentioned',
        populate: {
            path: 'user',
            model: User,
            select: 'name image id bio username _id registeredAt'
        }
    })
    threadsWithLikes.map(th=>{
        th.likes.map((l:any)=>{
            console.log(l.user, userId)
            result.push({...th?._doc, user: l.user, type: 'like', date: new Date(l.createdAt).getTime()})
        })
    })

    return result;
}

const findTags = async (childThreadIds: any[], userId: string) => {
    const result: any[] = [];
    const threadsWithTags = await Thread.find({
        author: {$ne: userId},
        mentioned: {$exists: true, $elemMatch:{user: userId}}
    }).populate({
        path: 'mentioned',
        populate: {
            path: 'user',
            model: User,
            select: 'name image id bio username _id registeredAt'
        }
    }).populate({
        path: 'author',
        model: User,
        select: 'name image id bio username _id'
    })
    threadsWithTags.map(th=>{
        th.mentioned.map((l:any)=>{
            result.push({...th?._doc, user: l.user, type: 'tag', date: new Date(th?._doc.createdAt).getTime()})
        })
    })
    return result;
}

export async function getActivity(userId: string, type: "reply" | "like" | "tag" | "all" = "all") {
    try {
        connectToDB();

        const userThreads = await Thread.find({author: userId});

        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        }, [])

        const result: any[] = [];

        if(type === 'reply')
            return (await findReplies(childThreadIds, userId)).sort((a,b)=>b.date-a.date);

        if(type === 'like')
            return (await findLikes(childThreadIds, userId)).sort((a,b)=>b.date-a.date);


        if(type === 'tag')
            return (await findTags(childThreadIds, userId)).sort((a,b)=>b.date-a.date);

        if(type === 'all')
        {
            let replies = await findReplies(childThreadIds, userId);
            const likes = await findLikes(childThreadIds, userId);
            const tags = await findTags(childThreadIds, userId);
            const fixedTags = tags.filter((item, idx) =>{
                const index = replies.findIndex(r=>r.id===item.id);
                if(index !== -1)
                {
                    replies[index].type = 'tag|reply';
                    return false;
                }
                return true;
            })

            const sorted = [...replies, ...likes, ...fixedTags].sort((a,b)=>b.date-a.date);

            result.push(...sorted)
        }

        return result;
    } catch (error: any) {
        throw new Error(`Failed to get user activity: ${error.message}`)
    }
}