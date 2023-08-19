"use client";

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {UserValidation} from "@/lib/validations/user";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import * as zod from 'zod';
import Image from "next/image";
import {ChangeEvent, useState} from "react";
import {isBase64Image} from "@/lib/utils";
import {useUploadThing} from "@/lib/uploadthing";
import {createUser, updateUser} from "@/lib/actions/user.actions";
import {usePathname, useRouter} from "next/navigation";
import {useUser} from "@clerk/nextjs";

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        bio: string;
        image: string;
        name: string;
    };
    btnTitle: string;
}

const AccountProfile = ({user, btnTitle}: Props) => {
    const [files, setFiles] = useState<File[]>([])
    const {startUpload} = useUploadThing('media');
    const router = useRouter();
    const pathname = usePathname();

    const clerkUser = useUser()

    const form = useForm(
        {
            resolver: zodResolver(UserValidation),
            defaultValues: {
                profile_photo: user?.image || '',
                name: user?.name || '',
                username: user?.username || '',
                bio: user?.bio || ''
            }
        });

    const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
        e.preventDefault();

        const fileReader = new FileReader();

        if (e.target.files && e.target.files.length) {
            const file = e.target.files[0];
            setFiles(Array.from(e.target.files));

            if (!file.type.includes('image')) return;

            fileReader.onload = async (event) => {
                const imageDataUrl = event.target?.result?.toString() || "";

                fieldChange(imageDataUrl);
            }

            fileReader.readAsDataURL(file);
        }
    }

    const onSubmit = async (values: zod.infer<typeof UserValidation>) => {
        const blob = values.profile_photo;

        const hasImageChange = isBase64Image(blob);

        if (hasImageChange) {
            const imgResponse = await startUpload(files);

            if (imgResponse && imgResponse[0]?.fileUrl) {
                values.profile_photo = imgResponse[0].fileUrl;
            }
        }
        let result: any;

        if(pathname === '/profile/edit')
        {
            result = await updateUser({
                userId: user.id,
                username: values.username,
                name: values.name,
                bio: values.bio,
                image: values.profile_photo,
                path: pathname,
            });
        }
        else
        {
            result = await createUser({
                userId: user.id,
                username: values.username,
                name: values.name,
                bio: values.bio,
                image: values.profile_photo,
                path: pathname,
            });
        }

        if(result?.error){
            form.setError(result.error.name, result.error.error);
            return;
        }

        await clerkUser.user?.update({username: values.username.toLowerCase()});

        if(pathname === '/profile/edit') {
            router.back();
        } else {
            router.push('/');
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
                <FormField
                    control={form.control}
                    name="profile_photo"
                    render={({field}) => (
                        <FormItem className={"flex items-center gap-4"}>
                            <FormLabel className={"account-form_image-label"}>
                                {field?.value ?
                                    <Image
                                        src={field.value}
                                        alt={"profile_photo"}
                                        width={96}
                                        height={96}
                                        priority
                                        className={"rounded-full object-contain"}
                                    />
                                    :
                                    <Image
                                        src={"/assets/profile.svg"}
                                        alt={"profile_photo"}
                                        width={24}
                                        height={24}
                                        className={"object-contain"}
                                    />
                                }
                            </FormLabel>
                            <FormControl className={"flex-1 text-base-semibold text-gray-200"}>
                                <Input
                                    type={"file"}
                                    accept={"image/*"}
                                    placeholder={"Upload a photo"}
                                    className={"account-form_image-input"}
                                    onChange={e => handleImage(e, field.onChange)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem className={"flex flex-col w-full gap-3"}>
                            <FormLabel className={"text-base-semibold text-light-2"}>
                                Name
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type={"text"}
                                    placeholder={"This is your public display name."}
                                    className={"account-form_input no-focus"}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="username"
                    render={({field}) => (
                        <FormItem className={"flex flex-col w-full gap-3"}>
                            <FormLabel className={"text-base-semibold text-light-2"}>
                                Username
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type={"text"}
                                    placeholder={"This is your username."}
                                    className={"account-form_input no-focus"}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({field}) => (
                        <FormItem className={"flex flex-col w-full gap-3"}>
                            <FormLabel className={"text-base-semibold text-light-2"}>
                                Bio
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={10}
                                    placeholder={"This is your bio."}
                                    className={"account-form_input no-focus max-h-[300px] min-h-[200px]"}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting || form.formState.isSubmitSuccessful} className={"bg-primary-500"}>
                    {form.formState.isSubmitting || form.formState.isSubmitSuccessful ? 'Submitting...' : 'Submit'}
                </Button>
            </form>
        </Form>
    )
}

export default AccountProfile;