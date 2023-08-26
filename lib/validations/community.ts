import * as zod from 'zod'

export const CommunityValidation = zod.object({
  name: zod
    .string()
    .nonempty()
    .regex(/^(?!\s*$).+/)
    .min(1),
  slug: zod.string().min(1),
  description: zod.string().max(100),
  image: zod.string(),
  variant: zod.string().nonempty(),
})
