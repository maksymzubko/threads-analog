import Link from "next/link";
import Image from "next/image";
import {formatDateForPost, formatDateString} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import HoverUserCard from "@/components/cards/HoverUserCard";
import React from "react";

interface Params {
    id: string,
    parentId: string | null,
    content: string,
    author: { name: string, image: string, id: string; username: string; bio?: string; },
    createdAt: string
    mentions: any[];
    type: "reply" | "like" | "tag" | "tag|reply";
    user?: any;
}

const ActivityCard = ({
                          id,
                          parentId,
                          content,
                          author,
                          createdAt,
                          mentions,
                          type,
                          user,
                      }: Params) => {

    const normalizeContent = () => {
        const listOfValues = content.split(/(@\[[\S]+\]\([\S]+\))/);
        return (
            <>
                {listOfValues.map(v => {
                    if (!!v.match(/@\[[\S]+\]\([\S]+\)/g)) {
                        const data = /@\[([\S]+)\]\(([\S]+)\)/g.exec(v);
                        const name = data?.at(1) ?? "";
                        const id = data?.at(2) ?? "";
                        const user = mentions.find((m: any) => m.user._id.toString() === id).user;

                        return <HoverUserCard
                            username={name}
                            image={user?.image}
                            createdAt={user?.registeredAt}
                            bio={user?.bio}
                            name={user?.name}
                        >
                            <Link href={`/profile/@${name}`} className={"hover:underline text-primary-500"}>
                                @{name}
                            </Link>
                        </HoverUserCard>
                    } else if (v !== "")
                        return <span>{v}</span>
                })}
            </>)
    }

    const getActionText = () => {
        if (type === 'reply')
            return <>replied on thread</>
        if (type === 'like')
            return <>liked your thread</>
        if (type === 'tag')
            return <>tagged you in thread</>
        if (type === 'tag|reply')
            return <>replied and tagged you in thread</>
    }

    return (
        <>
            <article
                className={`flex w-full flex-col 'bg-dark-2 p-5 sm:p-7 rounded-xl bg-dark-3`}>
                <Link href={`/thread/${parentId ? `${parentId}/#${id}` : id}`}>
                    <div
                        className={`flex items-start justify-between`}>
                        <div className={"flex w-full flex-1 flex-row gap-4"}>
                            <div className={"flex flex-col items-center"}>
                                <Link href={`/profile/@${type === 'like' ? user.username : author.username}`}
                                      className={"relative h-11 w-11"}>
                                    <Image src={type === 'like' ? user.image : author.image} alt={"Profile image"} fill
                                           className={"cursor-pointer rounded-full"}/>
                                </Link>
                            </div>
                            <div className={`flex w-full flex-col`}>
                                <div className={"w-fit flex gap-2 text-gray-1 items-center"}>
                                    <HoverUserCard
                                        username={type === 'like' ? user.username : author.username}
                                        image={type === 'like' ? user.image : author.image}
                                        createdAt={createdAt}
                                        bio={type === 'like' ? user.bio : author.bio}
                                        name={type === 'like' ? user.name : author.name}
                                    >
                                        <Link href={`/profile/@${type === 'like' ? user.username : author.username}`}
                                              className={"flex gap-2 text-gray-1 items-center text-ellipsis [&>*]:whitespace-nowrap [&>*]:overflow-hidden [&>*]:overflow-ellipsis [&>*]:max-w-[100px] xs:[&>*]:max-w-[60px] sm:[&>*]:max-w-[100px] md:[&>*]:max-w-[120px]"}>
                                            <h4 className={"cursor-pointer text-base-semibold text-light-1 hover:underline"}>{type === 'like' ? user.name : author.name}</h4>
                                            <h5 className={"hover:underline"}>@{type === 'like' ? user.username : author.username}</h5>
                                        </Link>
                                    </HoverUserCard>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <h5 className={"hidden xs:flex"}>
                                                    {" · "}{formatDateForPost(createdAt)}
                                                </h5>
                                            </TooltipTrigger>
                                            <TooltipContent className={"bg-dark-2 border-none text-light-2"}>
                                                <p>{formatDateString(createdAt)}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>


                                <p className={"text-small-medium text-gray-1"}>{getActionText()}</p>

                                <blockquote
                                    className={"mt-2 text-small-regular text-light-2 p-2 my-4 border-l-4 border-gray-300 bg-gray-50 dark:border-gray-500 dark:bg-gray-800"}>
                                    {normalizeContent()}
                                </blockquote>
                            </div>
                        </div>
                    </div>
                    <div className={"text-gray-1 text-small-medium xs:hidden"}>{formatDateForPost(createdAt)}</div>
                </Link>
            </article>
        </>
    )
}

export default ActivityCard;