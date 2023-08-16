"use client";

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ThreadValidation} from "@/lib/validations/thread";

import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import * as zod from 'zod';
import {usePathname, useRouter} from "next/navigation";
import {createThread, updateThread} from "@/lib/actions/thread.actions";
import {useOrganization} from "@clerk/nextjs";

function PostThread({userId, threadId, text}: { userId: string, threadId?: string; text?: string; }) {
    const router = useRouter();
    const pathname = usePathname();

    const {organization} = useOrganization();
    const form = useForm(
        {
            resolver: zodResolver(ThreadValidation),
            defaultValues: {
                thread: text ? text : '',
                accountId: userId
            }
        });

    const onSubmit = async (values: zod.infer<typeof ThreadValidation>) => {
        if (threadId) {
            await updateThread({
                text: values.thread,
                path: pathname,
                id: threadId
            });
            router.back();
        } else {
            await createThread({
                text: values.thread,
                author: values.accountId,
                path: pathname,
                communityId: organization ? organization.id : null
            });
            router.push('/');
        }}

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 flex flex-col justify-start gap-10">
                <FormField
                    control={form.control}
                    name="thread"
                    render={({field}) => (
                        <FormItem className={"flex flex-col w-full gap-3"}>
                            <FormLabel className={"text-base-semibold text-light-2"}>
                                Content
                            </FormLabel>
                            <FormControl
                                className={'no-focus border border-dark-4 bg-dark-3 text-light-1 max-h-[400px] min-h-[250px]'}>
                                <Textarea
                                    rows={15}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type={"submit"}
                        disabled={!form.formState.isValid || form.formState.isSubmitting || form.formState.isSubmitSuccessful}
                        className={'bg-primary-500'}>
                    {form.formState.isSubmitting || form.formState.isSubmitSuccessful ? 'Posting...' : 'Post thread'}
                </Button>
            </form>
        </Form>
    )
}

export default PostThread;