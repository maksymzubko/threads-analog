import { fetchUserPosts, getActivity } from '@/lib/actions/user.actions'
import ActivityCard from '@/components/cards/ActivityCard'

interface Props {
  currentUserId: string
  accountId: string
  label: 'replies' | 'tags'
}

const ActivityTab = async ({ currentUserId, accountId, label }: Props) => {
  let result = await getActivity(
    accountId,
    label === 'replies' ? 'reply' : 'tag'
  )

  return (
    <section className={'mt-9 flex flex-col gap-10'}>
      {result.length > 0 ? (
        <>
          {result.map((act) => (
            <ActivityCard
              key={act._id}
              id={act._id}
              parentId={act.parentId}
              content={act.text}
              author={act.author}
              mentions={act.mentioned}
              createdAt={act.date}
              user={act.type !== 'reply' ? act.user : {}}
              type={act.type}
            />
          ))}
        </>
      ) : (
        <p className={'!text-base-regular text-light-3 text-center'}>
          No {label} yet
        </p>
      )}
    </section>
  )
}

export default ActivityTab
