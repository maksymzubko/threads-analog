"use client";

import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {usePathname, useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CommentValidation, ThreadValidation} from "@/lib/validations/thread";
import * as zod from "zod";
import {addCommentToThread, createThread} from "@/lib/actions/thread.actions";
import {Input} from "@/components/ui/input";
import Image from "next/image";
import CustomTextField from "@/components/shared/CustomTextField";
import {useState} from "react";
import {randomInteger} from "@/lib/utils";
import EmojiPicker, {EmojiClickData, Theme} from "emoji-picker-react";

interface Params {
    threadId: string;
    currentUserImg: string;
    currentUserId: string;
    isMobile: boolean;
}

const Comment = ({threadId, currentUserImg, currentUserId, isMobile}: Params) => {
    const pathname = usePathname();
    const [showEmoji, setShowEmoji] = useState(false)

    const form = useForm(
        {
            resolver: zodResolver(CommentValidation),
            defaultValues: {
                thread: '',
                mentions: []
            }
        });

    const onSubmit = async (values: zod.infer<typeof CommentValidation>) => {
        setShowEmoji(false);
        await addCommentToThread({
            text: values.thread,
            threadId,
            userId: JSON.parse(currentUserId),
            path: pathname,
            mentions: values.mentions
        });

        form.reset();
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
                <Image src={currentUserImg} alt={"Profile image"} width={48} height={48}
                       className={"rounded-full object-cover"}/>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full flex flex-col justify-start gap-5 relative peer">
                    <FormField
                        control={form.control}
                        name="thread"
                        render={({field}) => (
                            <FormItem className={"flex w-full gap-3 relative"}>
                                <FormControl>
                                    <div
                                        className={'w-full field no-focus border-none border-dark-4 text-light-1 max-h-[200px] min-h-[150px]'}>
                                        <CustomTextField search={field.value}
                                                         disabled={form.formState.isSubmitting}
                                                         isComment form={form} field={field} userId={currentUserId}/>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div className={"border-[1px] border-dark-3"}/>

                    <div className={"flex w-full justify-between"}>
                        <div className={"cursor-pointer relative"}>
                            <Image onClick={handleStateEmoji} src={'/assets/emoji.png'} className={"invert"} alt={'Emoji'} width={32} height={32}/>
                            <div className={`${showEmoji ? 'flex' : 'hidden'} absolute z-50 top-[50px]`}>
                                <EmojiPicker height={isMobile ? 250 : 350} lazyLoadEmojis={true}
                                             searchDisabled={isMobile}
                                             onEmojiClick={onSmileClick} previewConfig={{showPreview: false}}
                                             theme={Theme.DARK}/>
                            </div>
                        </div>

                        <Button type={"submit"}
                                disabled={!form.formState.isValid || form.formState.isSubmitting}
                                className={'bg-primary-500'}>
                            {form.formState.isSubmitting ? 'Replying...' : 'Reply'}
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    )
}

export default Comment;