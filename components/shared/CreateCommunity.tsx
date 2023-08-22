"use client";

import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import CreateCommunityForm from "@/components/forms/CreateCommunityForm";
import {CreateOrganization, useOrganizationList} from "@clerk/nextjs";

const CreateCommunity = ({userId}:{userId: string}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        document.body.style.overflow = show ? "hidden" : "auto";
    }, [])

    return (
        <div>
            <Button className={"block overflow-hidden max-w-[100px] xs:max-w-full text-ellipsis"} onClick={()=>setShow(true)}>Create my own</Button>
            {<div className={`fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] ${show ? 'flex' : 'hidden'} z-50 bg-[#00000080] w-full h-screen flex items-center justify-center`}>
                    <CreateCommunityForm onClose={()=>setShow(false)} userId={userId}/>
            </div>}
        </div>
    );
};

export default CreateCommunity;