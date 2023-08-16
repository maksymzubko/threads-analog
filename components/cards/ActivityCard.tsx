import Link from "next/link";
import Image from "next/image";
import {formatDateForPost, formatDateString} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface Params {
    id: string,
    parentId: string | null,
    content: string,
    author: { name: string, image: string, id: string; username: string; },
    createdAt: string
    comments: any[];
}

const ActivityCard = ({
                          id,
                          parentId,
                          content,
                          author,
                          createdAt,
                          comments,
                      }: Params) => {

    return (
        <>
            <article
                className={`flex w-full flex-col 'bg-dark-2 p-7 rounded-xl bg-dark-3`}>
                <Link href={`/thread/${parentId}/#${id}`}>
                    <div
                        className={`flex items-start justify-between`}>
                        <div className={"flex w-full flex-1 flex-row gap-4"}>
                            <div className={"flex flex-col items-center"}>
                                <Link href={`/profile/@${author.username}`} className={"relative h-11 w-11"}>
                                    <Image src={author.image} alt={"Profile image"} fill
                                           className={"cursor-pointer rounded-full"}/>
                                </Link>
                            </div>
                            <div className={`flex w-full flex-col`}>
                                <Link href={`/profile/@${author.username}`}
                                      className={"w-fit flex gap-2 text-gray-1 items-center"}>
                                    <h4 className={"cursor-pointer text-base-semibold text-light-1"}>{author.name}</h4>
                                    <h5>@{author.username} ·</h5>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <h5>
                                                    {formatDateForPost(createdAt)}
                                                </h5>
                                            </TooltipTrigger>
                                            <TooltipContent className={"bg-dark-2 border-none text-light-2"}>
                                                <p>{formatDateString(createdAt)}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Link>

                                <p className={"text-small-medium text-gray-1"}>replied on thread</p>

                                <p className={"mt-2 text-small-regular text-light-2"}>{content}</p>

                                <div className={`mt-5 flex flex-col gap-3`}>
                                    <div className={"flex justify-between md:justify-start gap-3.5"}>
                                        <div
                                            className={"flex items-center justify-center h-[30px] w-[30px] transition ease-in-out hover:bg-[#5c5c7b33] rounded-full"}>
                                            <Image src={"/assets/heart-gray.svg"} alt={"heart"} width={24} height={24}
                                                   className={"cursor-pointer object-contain"}/>
                                        </div>
                                        <Link href={`/thread/${id}`}
                                              className={'flex items-center text-gray-1 text-base-regular'}>
                                            <div className={"flex justify-center h-[30px] w-[30px] transition ease-in-out hover:bg-[#5c5c7b33] rounded-full"}>
                                                <Image src={"/assets/reply.svg"} alt={"reply"} width={24} height={24}
                                                       className={"cursor-pointer object-contain"}/>
                                            </div>
                                            {comments.length > 0 && <p>{comments.length}</p>}
                                        </Link>
                                        <div
                                            className={"flex items-center justify-center h-[30px] w-[30px] transition ease-in-out hover:bg-[#5c5c7b33] rounded-full"}>
                                            <Image src={"/assets/share.svg"} alt={"share"} width={24} height={24}
                                                   className={"cursor-pointer object-contain"}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </article>
        </>
    )
}

export default ActivityCard;