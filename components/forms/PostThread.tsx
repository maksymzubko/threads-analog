"use client";

import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ThreadValidation} from "@/lib/validations/thread";

import {Button} from "@/components/ui/button";
import * as zod from 'zod';
import {usePathname, useRouter} from "next/navigation";
import {createThread, updateThread} from "@/lib/actions/thread.actions";
import {useOrganization} from "@clerk/nextjs";
import CustomTextField from "@/components/shared/CustomTextField";
import EmojiPicker, {EmojiClickData, Theme} from "emoji-picker-react";

import {useState} from "react";
import Image from "next/image";

interface UserMentions {
    user: string,
}

function PostThread({userId, threadId, text, isMobile, mentioned, currentUserImg, onHome}: {
    userId: string,
    threadId?: string;
    text?: string;
    isMobile: boolean;
    mentioned?: any[];
    currentUserImg?: string;
    onHome?: boolean;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [showEmoji, setShowEmoji] = useState(false)

    const {organization} = useOrganization();
    const form = useForm(
        {
            resolver: zodResolver(ThreadValidation),
            defaultValues: {
                thread: text ? text : '',
                accountId: userId,
                mentions: mentioned ?? [] as UserMentions[]
            }
        });

    const onSubmit = async (values: zod.infer<typeof ThreadValidation>) => {
        setShowEmoji(false);
        if (threadId) {
            await updateThread({
                text: values.thread,
                path: pathname,
                id: threadId,
                mentions: values.mentions as UserMentions[]
            });
            router.back();
        } else {
            await createThread({
                text: values.thread,
                author: values.accountId,
                path: pathname,
                communityId: organization ? organization.id : null,
                mentions: values.mentions as UserMentions[]
            });
            router.push('/');
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
                                        disabled={form.formState.isSubmitting || form.formState.isSubmitSuccessful}
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

                    <div className={"flex justify-between"}>
                        <div className={"cursor-pointer relative"}>
                            <Image onClick={handleStateEmoji} src={'/assets/emoji.png'} className={"invert transition ease-in-out hover:grayscale-[1px]"} alt={'Emoji'} width={32} height={32}/>
                            <div style={window.innerHeight < 900 ? {bottom: 50} : {height: '50px'}} className={`${showEmoji ? 'flex' : 'hidden'} absolute z-50`}>
                                <EmojiPicker height={isMobile ? 250 : 320} searchDisabled={isMobile}
                                             onEmojiClick={onSmileClick} previewConfig={{showPreview: false}}
                                             theme={Theme.DARK}/>
                            </div>
                        </div>

                        <Button type={"submit"}
                                disabled={!form.formState.isValid || form.formState.isSubmitting || form.formState.isSubmitSuccessful}
                                className={'!bg-primary-500 !text-dark-3 hover:!bg-[#6056df]'}>
                            {form.formState.isSubmitting || form.formState.isSubmitSuccessful ? 'Posting...' : 'Post thread'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default PostThread;