import Link from "next/link";
import Image from "next/image";
import {formatDateForPost, formatDateString} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import React, {useState} from "react";
import EditCardForm from "@/components/forms/EditCardForm";
import HoverUserCard from "@/components/cards/HoverUserCard";
import ThreadActions from "@/components/shared/Threads/ThreadActions";
import ImageBlock from "@/components/shared/ImageBlock";

interface Params {
    id: string,
    currentUserId: string,
    parentId: string | null,
    content: string,
    author: { name: string, image: string, id: string; username: string; bio: string; },
    community?: { id: string, name: string, image: string } | null
    createdAt: string
    comments: any[];
    isComment?: boolean;
    isMain?: boolean;
    isChild?: boolean;
    index?: number;
    mentions?: any;
    likes: any[];
    isEdited?: boolean;
    images: string[];
}

const ThreadCard = async ({
                        id,
                        currentUserId,
                        parentId,
                        content,
                        author,
                        community,
                        createdAt,
                        comments,
                        isComment,
                        isMain,
                        isChild,
                        likes,
                        index,
                        images,
                        mentions,
                        isEdited,
                    }: Params) => {
    let _index = index ?? 0;
    const child = comments?.at(0) ?? null;

    const normalizeContent = () => {
        const listOfValues = content.split(/(@\[[\S]+\]\([\S]+\))/);
        return (
            <>
                {listOfValues.map(v => {
                    if (!!v.match(/@\[[\S]+\]\([\S]+\)/g)) {
                        const data = /@\[([\S]+)\]\(([\S]+)\)/g.exec(v);
                        const name = data?.at(1) ?? "";
                        const id = data?.at(2) ?? "";
                        const user = mentions.find((m: any) => m.user._id.toString() === id)?.user;

                        if (!user) return <span>{v}</span>

                        return <HoverUserCard username={name} image={user?.image} createdAt={user?.registeredAt}
                                              bio={user?.bio} name={user?.name}>
                            <Link href={`/profile/@${name}`} className={"hover:underline text-primary-500"}>
                                @{name}
                            </Link>
                        </HoverUserCard>
                    } else if (v !== "")
                        return <span>{v}</span>
                })}
            </>)
    }

    return (
        <>
            <article id={`${id}`}
                     className={`flex w-full flex-col ${isComment ? `px-0 xs:px-7 ${!child?.author && 'border-b-[1px] border-dark-3'}` : 'bg-dark-2 p-7 rounded-xl'}`}>
                <div
                    className={`${isComment && !isChild && 'mt-5'} ${isComment && (child ? 'mb-2' : 'mb-5')} flex items-start justify-between relative`}>
                    <div className={"flex w-full flex-1 flex-row gap-4"}>
                        <div className={"flex flex-col items-center"}>
                            <Link href={`/profile/@${author.username}`} className={"relative h-11 w-11"}>
                                <Image priority src={author.image} alt={"Profile image"} fill
                                       className={"cursor-pointer rounded-full object-cover"}/>
                            </Link>

                            {(comments.length > 0 || isMain) && <div className={"thread-card_bar"}/>}

                            {currentUserId === author.id &&
                                <EditCardForm id={id}/>
                            }
                        </div>
                        <div className={`flex w-full flex-col`}>
                            <div className={"w-fit flex gap-2 text-gray-1 items-center"}>
                                <HoverUserCard
                                    username={author.username}
                                    image={author.image}
                                    createdAt={createdAt}
                                    bio={author.bio}
                                    name={author.name}
                                >
                                    <Link href={`/profile/@${author.username}`}
                                          className={`flex gap-2 text-gray-1 items-center text-ellipsis [&>*]:whitespace-nowrap [&>*]:overflow-hidden [&>*]:overflow-ellipsis [&>*]:max-w-[60px] ${isComment ? '' : 'xs:[&>*]:max-w-[100px]'} sm:[&>*]:max-w-[100px] md:[&>*]:max-w-[120px]`}>
                                        <h4 className={"cursor-pointer text-base-semibold text-light-1 hover:underline"}>{author.name}</h4>
                                        <h5 className={"hover:underline"}>@{author.username}</h5>
                                    </Link>
                                </HoverUserCard>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <h5 className={`${isComment ? '' : 'hidden sm:flex'}`}>
                                                {" · "}{formatDateForPost(createdAt)}
                                            </h5>
                                        </TooltipTrigger>
                                        <TooltipContent className={"bg-dark-2 border-none text-light-2"}>
                                            <p>{formatDateString(createdAt)}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <p className={"mt-2 text-small-regular text-light-2"}>{normalizeContent()}</p>

                            <ImageBlock images={images}/>

                            <ThreadActions currentUserId={currentUserId} likes={likes.map(l => l.user.id)} id={id}
                                           content={content} commentsLength={comments.length} isComment={isComment}
                                           isMain={isMain}/>
                        </div>
                    </div>
                </div>

                {/*Show more button, exists when thread has more than 3 answers*/}
                {index === 2 && child &&
                    <Link href={`/thread/${parentId}`}>
                        <div className={"text-light-2 cursor-pointer mb-4"}>
                            Show more
                        </div>
                    </Link>}

                {/*Count of replies (only on main page)*/}
                {!isComment && !isMain && comments.length > 0 && (
                    <div className='ml-1 mt-3 flex items-center gap-2'>
                        <div className={"flex items-center"}>
                            {comments.slice(0, 2).map((comment, index) => (
                                <div className={`${index !== 0 && "-ml-3"} relative w-[24px] h-[24px]`}>
                                    <Image
                                        priority
                                        key={index}
                                        src={comment.author.image}
                                        alt={`user_${index}`}
                                        fill
                                        className={`rounded-full object-cover`}
                                    />
                                </div>
                            ))}
                        </div>

                        <Link href={`/thread/${id}`}>
                            <p className='mt-1 text-subtle-medium text-gray-1'>
                                {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                            </p>
                        </Link>
                    </div>
                )}

                {/*Date string with name of community (if it has)*/}
                {!isComment && (
                    <p className='text-subtle-medium text-gray-1 mt-5 flex items-center'>
                        {formatDateString(createdAt)} {isEdited && ` (edited)`}
                        {community && ` - ${community?.name} Community`}
                        {community && <Image priority src={community.image} alt={community.name} width={14} height={14}
                                             className={"ml-1 h-[14px] hidden md:block rounded-full object-cover"}/>}
                    </p>
                )}
            </article>

            {/*Child thread card  (only if this card has a child)*/}
            {isComment && child && _index < 2 &&
                <ThreadCard
                    id={child._id}
                    currentUserId={currentUserId}
                    parentId={isChild ? parentId : id}
                    content={child.text}
                    author={child.author}
                    createdAt={child.createdAt}
                    comments={child.children}
                    mentions={child.mentioned}
                    isComment
                    isChild
                    images={child.images}
                    likes={child.likes}
                    index={_index + 1}
                />
            }
        </>
    )
}

export default ThreadCard;