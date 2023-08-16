import * as zod from 'zod';

export const UserValidation = zod.object({
    profile_photo: zod.string().url().nonempty(),
    name: zod.string().min(3, "Minimal length 3 character(s)").max(30, "Maximal length 3 character(s)"),
    username: zod.string().min(3, "Minimal length 3 character(s)").max(30, "Maximal length 3 character(s)"),
    bio: zod.string().max(1000, "Maximal length 100 character(s)"),
})