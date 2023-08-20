"use client";

import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CommentValidation, ThreadValidation} from "@/lib/validations/thread";
import {v4 as uuidv4} from 'uuid';

import {Button} from "@/components/ui/button";
import {usePathname, useRouter} from "next/navigation";
import {addCommentToThread, createThread, updateThread} from "@/lib/actions/thread.actions";
import {useOrganization} from "@clerk/nextjs";
import CustomTextField from "@/components/shared/CustomTextField";
import {EmojiClickData} from "emoji-picker-react";

import {ChangeEvent, useState} from "react";
import Image from "next/image";
import {isBase64Image} from "@/lib/utils";
import {useUploadThing} from "@/lib/uploadthing";
import PostThreadActions from "@/components/shared/Threads/PostThreadActions";
import PostThreadImages from "@/components/shared/Threads/PostThreadImages";

interface UserMentions {
    user: string,
}

interface Props {
    userId: string,
    threadId?: string;
    text?: string;
    isMobile: boolean;
    mentioned?: any[];
    currentUserImg?: string;
    onHome?: boolean;
    images?: string[]
    isComment?: boolean;
}

export interface FileProps {
    id: string,
    data: string,
    file: File | null
}

function PostThread({userId, threadId, text, isMobile, mentioned, currentUserImg, onHome, images = [], isComment}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [files, setFiles] = useState<FileProps[]>(images.map(i => {
        return {id: uuidv4(), data: i, file: null}
    }))

    const {startUpload} = useUploadThing('media');

    const {organization} = useOrganization();
    const form = useForm(
        isComment ?
            {
                resolver: zodResolver(CommentValidation),
                defaultValues: {
                    thread: '',
                    mentions: []
                }
            } :
            {
                resolver: zodResolver(ThreadValidation),
                defaultValues: {
                    thread: text ? text : '',
                    accountId: userId,
                    mentions: mentioned ?? [] as UserMentions[],
                }
            });

    const uploadFiles = async () => {
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
        return images;
    }

    const onSubmitComment = async (values: any) => {
        const images = await uploadFiles();

        await addCommentToThread({
            text: values.thread,
            threadId: threadId ?? "",
            userId: userId,
            path: pathname,
            mentions: values.mentions,
            images
        });

        form.reset();
        setFiles([])
    }

    const onSubmitThread = async (values: any) => {
        const images = await uploadFiles();

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

            if (!onHome)
                router.push('/');
            else {
                form.reset();
                setFiles([])
            }
        }
    }

    const onSmileClick = (emoji: EmojiClickData) => {
        const value = form.getValues().thread;
        form.setValue('thread', `${value}${emoji.emoji}`, {shouldValidate: true});
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
                setFiles(prev => [...prev, {id, data: imageDataUrl, file}]);
            }

            fileReader.readAsDataURL(file);
        }
    }

    const deleteImage = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    }

    return (
        <div className={"flex items-start mt-10 gap-4 border-dark-3 p-5 rounded-2xl border-[1px]"}>
            <div className={"w-[48px] h-[48px] relative"}>
                <Image priority src={currentUserImg ?? ""} alt={"Profile image"} fill
                       className={"rounded-full object-cover"}/>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(isComment ? onSubmitComment : onSubmitThread)}
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
                                        disabled={form.formState.isSubmitting || (form.formState.isSubmitSuccessful && !onHome && !isComment)}
                                        form={form}
                                        field={field}
                                        userId={userId}
                                        isComment={isComment}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className={"border-[1px] border-dark-3"}/>

                    <PostThreadImages files={files} deleteImage={deleteImage}/>

                    <div className={"flex justify-between"}>
                        <PostThreadActions
                            disabled={form.formState.isSubmitting}
                            isMobile={isMobile}
                            handleImage={handleImage}
                            onSmileClick={onSmileClick}
                            filesLength={files?.length ?? 0}
                        />

                        <Button type={"submit"}
                                disabled={!form.formState.isValid || form.formState.isSubmitting || (form.formState.isSubmitSuccessful && !onHome && !isComment)}
                                className={'!bg-primary-500 !text-dark-3 hover:!bg-[#6056df]'}>
                            {form.formState.isSubmitting || (form.formState.isSubmitSuccessful && !onHome && isComment) ? `${isComment ? 'Replying...' : 'Posting...'}` : `${isComment ? 'Reply' : 'Post thread'}`}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default PostThread;