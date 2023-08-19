import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import Image from "next/image";
import {CalendarIcon} from "@radix-ui/react-icons";
import {formatDateStringByOptions} from "@/lib/utils";
import Link from "next/link";
import React from "react";

const HoverUserCard = ({username, image, createdAt, bio, name, children}: {
    username: string,
    image: string,
    createdAt: string,
    bio: string,
    name: string
    children: any;
}) => {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                    <div className={"h-[80px] w-[80px]"}>
                        <Image className={"rounded-full"} src={image} height={80} width={80} alt={'Photo image'}/>
                    </div>
                    <div className="space-y-1">
                        <div className={"flex items-center gap-1 text-ellipsis [&>*]:whitespace-nowrap [&>*]:overflow-hidden [&>*]:overflow-ellipsis [&>*]:max-w-[100px]"}>
                            <h4 className='inline-block text-base-semibold text-light-1'>{name}</h4>
                            <p className='inline-block text-small-medium text-gray-1'>@{username}</p>
                        </div>
                        <p className="text-small-medium">
                            {bio.length > 50 ? `${bio.substring(0, 50)}...` : bio}
                        </p>
                        <div className="flex items-center pt-2 text-gray-1 text-small-medium">
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-70"/>{" "}
                            <span className="text-xs text-muted-foreground">
                Joined {formatDateStringByOptions({year: 'numeric', month: 'long'}, createdAt)}
              </span>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export default HoverUserCard;