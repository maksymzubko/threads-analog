import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { fetchUser } from '@/lib/actions/user.actions'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import PostThread from '@/components/forms/PostThread'
import PostThreadSkeleton from '@/components/skeletons/PostThreadSkeleton'

async function Page() {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await fetchUser(user.id)

  if (!userInfo?.onboarded) redirect('/onboarding')

  const headersList = headers()
  const userAgent = headersList.get('user-agent')

  const isMobileView = !!userAgent!.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  )

  return (
    <div>
      <h1 className={'head-text'}>Create Thread</h1>

      <Suspense fallback={<PostThreadSkeleton />}>
        <PostThread
          userId={userInfo?._id.toString() ?? ''}
          currentUserImg={userInfo?.image}
          isMobile={isMobileView}
        />
      </Suspense>
    </div>
  )
}

export default Page
