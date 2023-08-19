"use client";

import Image from "next/image";
import Link from "next/link";
import Share from "@/components/cards/Share";
import React, {useState} from "react";
import {likeFuncThread} from "@/lib/actions/thread.actions";

interface ThreadActionsProps {
    isComment?: boolean;
    isMain?: boolean;
    id: string;
    likes: any[];
    content: string;
    currentUserId: string;
    commentsLength: number;
}

const ThreadActions = ({isComment, isMain, id, likes, content, commentsLength, currentUserId}: ThreadActionsProps) => {
    const [liked, setLiked] = useState(likes.some(l => l === currentUserId))
    const [_likes, setLikes] = useState(likes);

    const likeFunc = async () => {
        likeFuncThread({threadId: id, userId: currentUserId}).then(res =>
        {
            setLiked(res.some((l: string) => l === currentUserId));
            setLikes(res);
        });
    }

    return (
        <div className={`mt-5 flex flex-col gap-3`}>
            <div className={"flex justify-between md:justify-start gap-3.5"}>
                <div
                    className={"flex items-center text-gray-1 text-base-regular"}
                    onClick={likeFunc}>
                    <div className={"flex items-center justify-center h-[30px] w-[30px] transition ease-in-out hover:bg-[#5c5c7b33] rounded-full"}>
                        <Image src={`/assets/heart-${liked ? 'filled' : 'gray'}.svg`} alt={"heart"} width={24} height={24}
                               className={"cursor-pointer object-contain"}/>
                    </div>
                    {_likes.length > 0 && <p>{_likes.length}</p>}
                </div>
                <Link href={`/thread/${id}`}
                      className={'flex items-center text-gray-1 text-base-regular'}>
                    <div
                        className={"flex items-center justify-center h-[30px] w-[30px] transition ease-in-out hover:bg-[#5c5c7b33] rounded-full"}>
                        <Image src={"/assets/reply.svg"} alt={"reply"} width={24} height={24}
                               className={"cursor-pointer object-contain"}/>
                    </div>
                    {(isComment || isMain) && commentsLength > 0 && <p>{commentsLength}</p>}
                </Link>

                <div
                    className={"flex items-center justify-center h-[30px] w-[30px] transition ease-in-out hover:bg-[#5c5c7b33] rounded-full"}>
                    <Share url={`${process.env.HOST}/thread/${id}`} text={content}/>
                </div>

            </div>
        </div>
    );
};

export default ThreadActions;