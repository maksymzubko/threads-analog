import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import Image from "next/image";
import {CalendarIcon} from "@radix-ui/react-icons";
import {formatDateStringByOptions} from "@/lib/utils";
import Link from "next/link";
import React from "react";

const HoverUserCard = ({username, image, createdAt, bio, name}: {
    username: string,
    image: string,
    createdAt: string,
    bio: string,
    name: string
}) => {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <Link className={"text-primary-500"} href={`/profile/@${username}`}>
                    @{username}
                </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                    <div className={"h-auto w-auto"}>
                        <Image className={"rounded-full"} src={image} height={80} width={80} alt={'Photo image'}/>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold">@{username}</h4>
                        <p className="text-sm">
                            {bio.length > 50 ? `${bio.substring(0, 50)}...` : bio}
                        </p>
                        <div className="flex items-center pt-2">
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