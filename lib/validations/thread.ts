import * as zod from 'zod';

export const ThreadValidation = zod.object({
    thread: zod.string().nonempty().regex(/^(?!\s*$).+/).min(1),
    accountId: zod.string(),
    mentions: zod.object({
        user: zod.string(),
    }).array()
})

export const CommentValidation = zod.object({
    thread: zod.string().nonempty().min(1),
    mentions: zod.object({
        user: zod.string(),
    }).array()
})