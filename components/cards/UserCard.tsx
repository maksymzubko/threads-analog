"use client";

import Image from "next/image";
import {useRouter} from "next/navigation";

import {Button} from "../ui/button";
import Link from "next/link";

interface Props {
    id: string;
    name: string;
    username: string;
    imgUrl: string;
    personType: string;
    disableButtons?: boolean;
    focused?: boolean;
}

function UserCard({id, name, username, imgUrl, personType, disableButtons, focused}: Props) {
    const router = useRouter();

    const isCommunity = personType === "Community";

    return (
        <article className={`user-card ${disableButtons && 'cursor-pointer'} rounded-2xl transition ease-in-out ${focused && 'bg-dark-3'}`}>
            <div className='user-card_avatar'>
                <div className={`relative ${disableButtons ? 'h-9 w-9' : 'h-12 w-12'}`}>
                    <Image
                        src={imgUrl}
                        alt='user_logo'
                        fill
                        className='rounded-full object-cover'
                    />
                </div>

                <div
                    className='flex-1 text-ellipsis [&>*]:whitespace-nowrap [&>*]:overflow-hidden [&>*]:overflow-ellipsis [&>*]:w-[180px]'>
                    <h4 className='text-base-semibold text-light-1'>{name}</h4>
                    <p className='text-small-medium text-gray-1'>@{username}</p>
                </div>
            </div>

            {!disableButtons && <Button
                className='user-card_btn'
                onClick={() => {
                    if (isCommunity) {
                        router.push(`/communities/${username}`);
                    } else {
                        router.push(`/profile/@${username}`);
                    }
                }}
            >
                View
            </Button>}
        </article>
    );
}

export default UserCard;