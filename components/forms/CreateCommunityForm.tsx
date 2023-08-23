"use client";

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import * as zod from 'zod';
import Image from "next/image";
import {ChangeEvent, useState} from "react";
import {CommunityValidation} from "@/lib/validations/community";
import {newCommunity} from "@/lib/actions/community.actions";
import {useRouter} from "next/navigation";
import {useToast} from "@/components/ui/use-toast";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";

const CreateCommunityForm = ({id, onClose, userId}: { id?: string, onClose: () => void; userId: string; }) => {
    const [files, setFiles] = useState<File[]>([])
    const router = useRouter();
    const {toast} = useToast();

    const form = useForm(
        {
            resolver: zodResolver(CommunityValidation),
            defaultValues: {
                slug: '',
                name: '',
                description: '',
                image: '',
                variant: 'public',
            }
        });

    const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
        e.preventDefault();

        if (e.target.files && e.target.files.length) {
            const fileReaderString = new FileReader();

            const file = e.target.files[0];
            setFiles([e.target.files[0]]);

            if (!file.type.includes('image')) return;

            fileReaderString.onload = async (event) => {
                const imageDataUrl = event.target?.result?.toString() || "";

                fieldChange(imageDataUrl);
            }

            fileReaderString.readAsDataURL(file);
        }
    }

    function convertToPattern(inputString: string, isSlug: boolean = false) {
        const pattern = /[^a-z0-9\s-]/g;
        const cleanedString = inputString
            .replace(pattern, '')
            .replace(/\s+/g, '-');

        if (isSlug) {
            const noConsecutiveHyphens = cleanedString
                .replace(/-{2,}/g, '-');
            return noConsecutiveHyphens
                .replace(/-$/g, '-');
        }
        return cleanedString
            .replace(/-$/g, '');
    }

    const onChange = (event: any) => {
        if (event.target.name === 'name' || event.target.name === 'slug')
            form.setValue('slug', convertToPattern(event.target.value.toLowerCase(), event.target.name === 'slug'));
    }

    const onCancel = () => {
        form.reset();
        setFiles([]);
        onClose();
    }

    const onSubmit = async (values: zod.infer<typeof CommunityValidation>) => {
        const fixedSlug = convertToPattern(form.getValues().slug);
        form.setValue('slug', fixedSlug)

        const formData = new FormData();
        formData.set('uploader_user_id', userId);
        if (files[0]) formData.set('file', files[0], "file");

        const {
            organization,
            errors
        } = await newCommunity(userId, values.description, values.variant, values.name, fixedSlug, formData);

        if (errors.length) {
            errors.forEach((err: any) => {
                form.setError(err.name, {message: err.message});
            })
        }

        if (!organization) return;
        // onClose();

        toast({
            title: `Success`,
            description: `Community "${organization.name.length > 15 ? organization.name.substring(0, 15) + "..." : organization.name}" created, you will be redirected in few seconds..`,
            duration: 1500
        })

        setTimeout(() => {
            router.push(`/communities/${organization.slug}`)
        }, 1500)
    }

    return (
        <section className={"p-8 w-[90%] md:w-[600px] bg-dark-3 rounded-2xl max-h-[100%] overflow-auto"}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} onChange={onChange} autoComplete={"off"}
                      className="flex flex-col justify-start gap-10">
                    <FormField
                        control={form.control}
                        name="image"
                        render={({field}) => (
                            <FormItem className={"flex items-center gap-4"}>
                                <FormLabel
                                    className={"account-form_image-label relative hover:bg-dark-3 hover: cursor-pointer group"}>
                                    {field?.value ?
                                        <Image
                                            src={field.value}
                                            alt={"profile_photo"}
                                            fill
                                            priority
                                            className={"rounded-full object-cover"}
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
                                    <div
                                        className={"group-hover:bg-[#00000080] rounded-full transition ease-in-out h-full w-full absolute"}
                                        onClick={() => form.setFocus('image')}/>
                                </FormLabel>
                                <FormControl className={"flex-1 text-base-semibold text-gray-200"}>
                                    <Input
                                        type={"file"}
                                        accept={"image/*"}
                                        placeholder={"Upload a photo"}
                                        className={"account-form_image-input hidden h-auto"}
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
                        name="slug"
                        render={({field}) => (
                            <FormItem className={"flex flex-col w-full gap-3"}>
                                <FormLabel className={"text-base-semibold text-light-2"}>
                                    Slug
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type={"text"}
                                        placeholder={"This is your slug."}
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
                        name="variant"
                        render={({field}) => (
                            <FormItem className={"flex flex-col w-full gap-3"}>
                                <FormLabel className={"text-base-semibold text-light-2"}>
                                    Variant
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue="public" className={"flex gap-4"}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="public" id="r1" />
                                            <Label htmlFor="r1">Public</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="private" id="r2" />
                                            <Label htmlFor="r2">Private</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem className={"flex flex-col w-full gap-3"}>
                                <FormLabel className={"text-base-semibold text-light-2"}>
                                    Description
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={"This is community description"}
                                        className={"account-form_input no-focus max-h-[300px] resize-none md:min-h-[200px] min-h-[100px]"}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <div className={"flex items-center justify-evenly gap-4"}>
                        <Button type={"button"}
                                disabled={form.formState.isSubmitting}
                                className={"bg-primary-500 w-[40%]"}
                                onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit"
                                disabled={!form.formState.isValid || form.formState.isSubmitting || form.formState.isSubmitSuccessful}
                                className={"bg-primary-500 w-[40%]"}>
                            {form.formState.isSubmitting || form.formState.isSubmitSuccessful ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </Form>
        </section>
    )
}

export default CreateCommunityForm;