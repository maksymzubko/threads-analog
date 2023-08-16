"use client";

import {FacebookIcon, FacebookShareButton} from "next-share";
import React from "react";
import {RWebShare} from "react-web-share";
import Image from "next/image";

const Share = ({url, text}:{url: string, text: string}) => {

    return (
        <RWebShare
            sites={['telegram', 'linkedin', 'twitter', 'copy']}
            data={{
                text: text,
                url,
                title: "Share",
            }}
            onClick={() => console.log("shared successfully!")}
        >
            <Image src={"/assets/share.svg"} alt={"share"} width={24} height={24}
                   className={"cursor-pointer object-contain"}/>
        </RWebShare>
    );
};

export default Share;