import * as zod from 'zod';

export const UserValidation = zod.object({
    profile_photo: zod.string().url().nonempty(),
    name: zod.string().min(3).max(30),
    username: zod.string().min(3).max(30),
    bio: zod.string().min(3).max(1000),
})