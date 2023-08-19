import * as zod from 'zod';

export const ThreadValidation = zod.object({
    thread: zod.string().min(1),
    accountId: zod.string(),
    mentions: zod.object({
        user: zod.string(),
        range: zod.number().array()
    }).array()
})

export const CommentValidation = zod.object({
    thread: zod.string().nonempty().min(1),
    mentions: zod.object({
        user: zod.string(),
        range: zod.number().array()
    }).array()
})