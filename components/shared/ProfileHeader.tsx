import Image from "next/image";
import Link from "next/link";
import {formatDateStringByOptions} from "@/lib/utils";
import React from "react";
import {CalendarIcon} from "@radix-ui/react-icons";

interface Props {
    accountId: string;
    authUserId: string;
    name: string;
    imgUrl: string;
    bio: string;
    username: string;
    type?: string;
    registeredAt: string;
    isAdmin?: boolean;
}

const ProfileHeader = ({
                           accountId,
                           authUserId,
                           name,
                           imgUrl,
                           username,
                           bio,
                            type,
                            registeredAt,
                            isAdmin,
                       }: Props) => {
    return (
        <div className='flex w-full flex-col justify-start'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='relative h-20 w-20 object-cover'>
                        <Image
                            src={imgUrl}
                            alt='logo'
                            fill
                            className='rounded-full object-cover shadow-2xl'
                        />
                    </div>

                    <div className='flex-1'>
                        <h2 className='text-left text-heading3-bold text-light-1 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[120px] md:max-w-[140px] 2xl:max-w-[180px]'>
                            {name}
                        </h2>
                        <p className='text-base-medium text-gray-1 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[120px] md:max-w-[140px] 2xl:max-w-[180px]'>@{username}</p>
                    </div>
                </div>
                {accountId === authUserId && type !== "Community" && (
                    <Link href='/profile/edit'>
                        <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
                            <Image
                                src='/assets/edit.svg'
                                alt='logout'
                                width={16}
                                height={16}
                            />

                            <p className='text-light-2 max-sm:hidden'>Edit</p>
                        </div>
                    </Link>
                )}
            </div>

            <p className='mt-6 max-w-lg text-base-regular text-light-2'>{bio}</p>
            <div className="flex items-center pt-2">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70"/>{" "}
                <span className="text-xs text-muted-foreground text-gray-1 text-small-medium">
                {type === 'Community' ? 'Created' : 'Joined'} {formatDateStringByOptions({year: 'numeric', month: 'long'}, registeredAt)}
              </span>
            </div>
            <div className='mt-5 h-0.5 w-full bg-dark-3' />
        </div>
    );
};

export default ProfileHeader;