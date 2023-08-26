import ThreadCard from '@/components/cards/ThreadCard'
import { currentUser } from '@clerk/nextjs'
import { fetchUser } from '@/lib/actions/user.actions'
import { redirect, usePathname } from 'next/navigation'
import { fetchThreadById } from '@/lib/actions/thread.actions'
import { headers } from 'next/headers'
import dynamic from 'next/dynamic'

const PostThread = dynamic(() => import('@/components/forms/PostThread'), {
  ssr: false,
})

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null

  const user = await currentUser()
  if (!user) return null

  const userInfo = await fetchUser(user.id)
  if (!userInfo?.onboarded) redirect('/onboarding')

  const thread = await fetchThreadById(params.id)

  const headersList = headers()
  const userAgent = headersList.get('user-agent')

  const isMobileView = !!userAgent!.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  )

  return (
    <section className={'relative'}>
      <div>
        <ThreadCard
          key={thread._id.toString()}
          id={thread._id.toString()}
          currentUserId={user?.id || ''}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
          images={thread.images}
          likes={thread.likes}
          mentions={thread.mentioned}
          isMain
        />
      </div>

      <div className={'mt-7'}>
        <PostThread
          userId={userInfo._id}
          isMobile={isMobileView}
          isComment
          threadId={thread.id}
          currentUserImg={userInfo.image}
        />
      </div>

      <div className={'mt-10'}>
        {thread.children.map((child: any) => {
          return (
            <ThreadCard
              key={child._id.toString()}
              id={child._id.toString()}
              currentUserId={user?.id || ''}
              parentId={child.parentId}
              content={child.text}
              author={child.author}
              community={child.community}
              createdAt={child.createdAt}
              mentions={child.mentioned}
              comments={child.children}
              likes={child.likes}
              images={child.images}
              isComment
            />
          )
        })}
      </div>
    </section>
  )
}

export default Page
