"use client";

import React, {useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {DialogClose} from "@radix-ui/react-dialog";
import {deleteThread} from "@/lib/actions/thread.actions";
import {usePathname} from "next/navigation";

const EditCardForm = ({id}: { id: string }) => {
    const [loading, setLoading] = useState(false)
    const [opened, setOpened] = useState(false)
    const path = usePathname();
    const deleteThreadEvent = async () => {
        setLoading(true)
        await deleteThread(id, path);
        setLoading(false);
        handleClose();
    }

    const handleOpen = () => {
        setOpened(true)
    }

    const handleClose = () => {
        setOpened(false);
    }

    return (
        <Dialog open={opened}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div
                        className={"absolute flex flex-col gap-0.5 top-0 right-0 cursor-pointer transition ease-in-out [&>*]:hover:bg-gray-200"}>
                        <span className={"block w-1.5 h-1.5 bg-gray-400 rounded-full"}></span>
                        <span className={"block w-1.5 h-1.5 bg-gray-400 rounded-full"}></span>
                        <span className={"block w-1.5 h-1.5 bg-gray-400 rounded-full"}></span>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <Link href={`/edit-thread/${id}`}>
                        <DropdownMenuItem className={"cursor-pointer"}>
                            Edit
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className={"cursor-pointer w-full"} onClick={handleOpen}>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent className={"w-[95vw] md:w-auto"}>
                <DialogHeader>
                    <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete this thread from our servers.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className={"!justify-evenly flex-row items-center gap-2"}>
                    <Button className={"w-1/4"} type={"submit"} disabled={loading} onClick={handleClose}>Close</Button>
                    <Button className={"w-1/4"} type={"submit"} disabled={loading}
                            onClick={deleteThreadEvent}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditCardForm;