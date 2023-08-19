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
    range: number[]
}

function PostThread({userId, threadId, text, isMobile}: { userId: string, threadId?: string; text?: string; isMobile: boolean;}) {
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
                mentions: [] as UserMentions[]
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
        if(!form.formState.isSubmitting || form.formState.isSubmitSuccessful)
        {
            setShowEmoji(!showEmoji)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-10 flex flex-col justify-start gap-5 relative">
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
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <div className={"flex justify-between"}>
                    <div className={"cursor-pointer"} onClick={handleStateEmoji}>
                        <Image src={'/assets/emoji.png'} className={"invert"} alt={'Emoji'} width={32} height={32}/>
                    </div>

                    <Button type={"submit"}
                            disabled={!form.formState.isValid || form.formState.isSubmitting || form.formState.isSubmitSuccessful}
                            className={'bg-primary-500'}>
                        {form.formState.isSubmitting || form.formState.isSubmitSuccessful ? 'Posting...' : 'Post thread'}
                    </Button>
                </div>

                <div className={`${showEmoji ? 'flex' : 'hidden'}`}>
                    <EmojiPicker height={isMobile ? 250 : 350} searchDisabled={isMobile}
                                 onEmojiClick={onSmileClick} previewConfig={{showPreview: false}} theme={Theme.DARK}/>
                </div>

            </form>
        </Form>
    )
}

export default PostThread;