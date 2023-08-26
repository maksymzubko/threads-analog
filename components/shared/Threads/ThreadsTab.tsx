import { fetchUserPosts } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import ThreadCard from '@/components/cards/ThreadCard'
import { fetchCommunityPosts } from '@/lib/actions/community.actions'

interface Props {
  currentUserId: string
  accountId: string
  accountType: string
}

interface Result {
  name: string
  image: string
  id: string
  username?: string
  bio: string
  threads: {
    _id: string
    text: string
    parentId: string | null
    author: {
      name: string
      image: string
      id: string
      username: string
      bio: string
    }
    community: {
      id: string
      name: string
      image: string
    } | null
    createdAt: string
    children: {
      author: {
        image: string
      }
    }[]
  }[]
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let result: Result
  if (accountType === 'Community') {
    result = await fetchCommunityPosts(accountId)
  } else {
    result = await fetchUserPosts(accountId)
  }

  if (!result) redirect('/')

  return (
    <section className={'mt-9 flex flex-col gap-10'}>
      {result.threads
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .map((thread: any) => {
          const authorObj =
            accountType === 'User'
              ? {
                  name: result.name,
                  image: result.image,
                  id: result.id,
                  username: result.username,
                  bio: result.bio,
                }
              : {
                  name: thread.author.name,
                  image: thread.author.image,
                  id: thread.author.id,
                  username: thread.author.username,
                  bio: thread.author.bio,
                }

          return (
            <ThreadCard
              key={thread._id.toString()}
              id={thread._id.toString()}
              currentUserId={currentUserId}
              parentId={thread.parentId}
              content={thread.text}
              author={authorObj}
              mentions={thread.mentioned}
              likes={thread.likes}
              community={
                accountType === 'Community'
                  ? { name: result.name, id: result.id, image: result.image }
                  : thread.community
              }
              images={thread.images}
              createdAt={thread.createdAt}
              comments={thread.children}
            />
          )
        })}
    </section>
  )
}

export default ThreadsTab
