import * as zod from 'zod';

export const ThreadValidation = zod.object({
    thread: zod.string().nonempty().min(3),
    accountId: zod.string(),
})

export const CommentValidation = zod.object({
    thread: zod.string().nonempty().min(3),
})