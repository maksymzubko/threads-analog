"use client";

import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ThreadValidation} from "@/lib/validations/thread";
import {v4 as uuidv4} from 'uuid';

import {Button} from "@/components/ui/button";
import * as zod from 'zod';
import {usePathname, useRouter} from "next/navigation";
import {createThread, updateThread} from "@/lib/actions/thread.actions";
import {useOrganization} from "@clerk/nextjs";
import CustomTextField from "@/components/shared/CustomTextField";
import EmojiPicker, {EmojiClickData, Theme} from "emoji-picker-react";

import {ChangeEvent, useEffect, useRef, useState} from "react";
import Image from "next/image";
import {ImageIcon} from "@radix-ui/react-icons";
import {Input} from "@/components/ui/input";
import {isBase64Image} from "@/lib/utils";
import {useUploadThing} from "@/lib/uploadthing";

interface UserMentions {
    user: string,
}

function PostThread({userId, threadId, text, isMobile, mentioned, currentUserImg, onHome, images = []}: {
    userId: string,
    threadId?: string;
    text?: string;
    isMobile: boolean;
    mentioned?: any[];
    currentUserImg?: string;
    onHome?: boolean;
    images?: string[]
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [showEmoji, setShowEmoji] = useState(false)
    const [files, setFiles] = useState<{id: string, data: string, file: File | null}[]>(images.map(i=> {
        return {id: uuidv4(), data: i, file: null}
    }))

    const input = useRef<any>();
    const block = useRef<any>();
    const {startUpload} = useUploadThing('media');

    const {organization} = useOrganization();
    const form = useForm(
        {
            resolver: zodResolver(ThreadValidation),
            defaultValues: {
                thread: text ? text : '',
                accountId: userId,
                mentions: mentioned ?? [] as UserMentions[],
            }
        });

    const onSubmit = async (values: zod.infer<typeof ThreadValidation>) => {
        setShowEmoji(false);
        const images: string[] = [];

        const needUpload = files.filter(f=>isBase64Image(f.data) && f.file);
        const dontNeedUpload = files.filter(f=>f.data !== "" && !f.file)

        images.push(...dontNeedUpload.map(f=>f.data))

        if (needUpload.length > 0) {
            const imgResponse = await startUpload(needUpload.map(f=>f.file ?? new File([], "")));

            if (imgResponse) {
                images.push(...imgResponse.map(img=>img.fileUrl));
            }
        }

        if (threadId) {
            await updateThread({
                text: values.thread,
                path: pathname,
                id: threadId,
                mentions: values.mentions as UserMentions[],
                images
            });
            router.back();
        } else {
            await createThread({
                text: values.thread,
                author: values.accountId,
                path: pathname,
                communityId: organization ? organization.id : null,
                mentions: values.mentions as UserMentions[],
                images
            });

            if(!onHome)
                router.push('/');
            else {
                form.reset();
                setFiles([])
            }
        }
    }

    const onSmileClick = (emoji: EmojiClickData) => {
        form.setValue('thread', `${form.getValues('thread')}${emoji.emoji}`);
    }

    const handleStateEmoji = () => {
        if (!form.formState.isSubmitting || form.formState.isSubmitSuccessful) {
            setShowEmoji(!showEmoji)
        }
    }

    const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        const fileReader = new FileReader();

        if (e.target.files && e.target.files.length) {
            const file = e.target.files[0];
            const id = uuidv4()

            if (!file.type.includes('image')) return;

            fileReader.onload = async (event) => {
                const imageDataUrl = event.target?.result?.toString() || "";
                 setFiles(prev=>[...prev, {id, data: imageDataUrl, file}]);
            }

            fileReader.readAsDataURL(file);
        }
    }

    const computeStyle = () => {
        const height = window?.innerHeight ?? 0;
        const fromBottom = block?.current?.getBoundingClientRect().bottom;
        const containerHeight = isMobile ? 250 : 320;

        if(height - fromBottom - 120 < containerHeight)
            return {bottom: 50, left: isMobile ? '-300%' : 0}
        else return {top: 50, left: isMobile ? '-300%' : 0}
    }

    const deleteImage = (id: string) => {
        setFiles(prev=>prev.filter(f=>f.id!==id));
    }

    return (
        <div className={"flex items-start mt-10 gap-4 border-dark-3 p-5 rounded-2xl border-[1px]"}>
            <div>
                <Image src={currentUserImg ?? ""} alt={"Profile image"} width={48} height={48}
                       className={"rounded-full object-cover"}/>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full flex flex-col justify-start gap-5 relative peer">
                    <FormField
                        control={form.control}
                        name="thread"
                        render={({field}) => (
                            <FormItem className={"flex flex-col w-full gap-3 relative"}>
                                <FormControl
                                    className={'no-focus border border-dark-4 bg-dark-3 text-light-1 max-h-[400px] min-h-[250px]'}>
                                    <CustomTextField
                                        search={field.value}
                                        disabled={form.formState.isSubmitting || (form.formState.isSubmitSuccessful && !onHome)}
                                        form={form}
                                        field={field}
                                        userId={userId}
                                        isComment={onHome}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className={"border-[1px] border-dark-3"}/>

                    {files.length > 0 && <>
                        <div className={"flex flex-wrap items-center gap-2"}>
                            {files.map(f =>
                                <div key={f.id} className={'item relative cursor-pointer bg-none transition ease-in-out group'} onClick={e=>deleteImage(f.id)}>
                                    <div className={"absolute w-full transition ease-in-out h-full z-50"}>
                                        <span className={"group-hover:scale-100 translate-x-[-50%] translate-y-[-50%] rotate-[45deg] h-[30px] w-[4px] top-1/2 left-1/2 bg-white transition absolute scale-0"}></span>
                                        <span className={"group-hover:scale-100 translate-x-[-50%] translate-y-[-50%] rotate-[-45deg] h-[30px] w-[4px] top-1/2 left-1/2 bg-white transition absolute scale-0"}></span>
                                    </div>
                                    <Image className={"group-hover:grayscale transition ease-in-out group-hover:opacity-30"} draggable={true} src={f.data} alt={'img'} width={60} height={60}/>
                                </div>
                            )}
                        </div>
                        <div className={"border-[1px] border-dark-3"}/>
                    </>}

                    <div className={"flex justify-between"}>
                        <div className={"flex items-center gap-2"}>
                            <div ref={block} className={"cursor-pointer relative"}>
                                <Image onClick={handleStateEmoji} src={'/assets/emoji.png'}
                                       className={"invert transition ease-in-out hover:grayscale-[1px]"} alt={'Emoji'}
                                       width={32} height={32}/>
                                <div style={{...computeStyle()}}
                                     className={`${showEmoji ? 'flex' : 'hidden'} absolute z-50`}>
                                    <EmojiPicker height={isMobile ? 250 : 320} searchDisabled={isMobile}
                                                 onEmojiClick={onSmileClick} previewConfig={{showPreview: false}}
                                                 theme={Theme.DARK}/>
                                </div>
                            </div>
                            <div className={"cursor-pointer"}>
                                <ImageIcon className={`h-[28px] w-[28px] transition ease-in-out ${files.length >= 1 && 'opacity-40 cursor-auto'} hover:opacity-40`}
                                           color={"#b7b7b7"} onClick={e => input?.current?.click()}/>
                                <Input
                                    disabled={files.length >= 1}
                                    ref={input}
                                    type={"file"}
                                    accept={"image/*"}
                                    placeholder={"Upload a photo"}
                                    className={"hidden"}
                                    onChange={e => handleImage(e)}
                                />
                            </div>
                        </div>

                        <Button type={"submit"}
                                disabled={!form.formState.isValid || form.formState.isSubmitting || (form.formState.isSubmitSuccessful && !onHome)}
                                className={'!bg-primary-500 !text-dark-3 hover:!bg-[#6056df]'}>
                            {form.formState.isSubmitting || (form.formState.isSubmitSuccessful && !onHome) ? 'Posting...' : 'Post thread'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default PostThread;