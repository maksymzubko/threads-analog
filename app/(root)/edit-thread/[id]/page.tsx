import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { fetchUser } from '@/lib/actions/user.actions'
import PostThread from '@/components/forms/PostThread'
import { fetchThreadById } from '@/lib/actions/thread.actions'
import { headers } from 'next/headers'

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser()
  if (!user) return null

  if (!params?.id) return null

  const userInfo = await fetchUser(user.id)

  if (!userInfo?.onboarded) redirect('/onboarding')

  const thread = await fetchThreadById(params.id)
  if (thread.author.id !== user.id) return null

  const headersList = headers()
  const userAgent = headersList.get('user-agent')

  const isMobileView = !!userAgent!.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  )

  return (
    <>
      <h1 className={'head-text'}>Edit Thread</h1>

      <PostThread
        userId={userInfo?._id}
        threadId={thread.id}
        text={thread.text}
        currentUserImg={userInfo?.image}
        mentioned={thread.mentioned.map(
          (m: any) => new Object({ user: m.user?._id.toString() })
        )}
        images={thread.images}
        isMobile={isMobileView}
      />
    </>
  )
}

export default Page
