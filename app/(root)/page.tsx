import { fetchThreads } from '@/lib/actions/thread.actions'
import ThreadCard from '@/components/cards/ThreadCard'
import { currentUser } from '@clerk/nextjs'
import { headers } from 'next/headers'
import { fetchUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import Pagination from '@/components/shared/Pagination'
import { Suspense } from 'react'

import PostThreadSkeleton from '@/components/skeletons/PostThreadSkeleton'
import ThreadCardSkeleton from '@/components/skeletons/ThreadCardSkeleton'
import dynamic from 'next/dynamic'
import PostThread from '@/components/forms/PostThread'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const user = await currentUser()
  // if (!user) return null;

  const userInfo = user ? await fetchUser(user.id) : null
  if (!userInfo?.onboarded && user) redirect('/onboarding')

  const result = await fetchThreads(
    searchParams.page ? +searchParams.page : 1,
    30
  )

  const headersList = headers()
  const userAgent = headersList.get('user-agent')

  const isMobileView = !!userAgent!.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  )

  return (
    <>
      <h1 className={'head-text text-left'}>Home</h1>

      {userInfo && (
        <section>
          <Suspense fallback={<PostThreadSkeleton />}>
            <PostThread
              userId={userInfo?._id.toString() ?? ''}
              currentUserImg={userInfo?.image}
              isMobile={isMobileView}
              onHome
            />
          </Suspense>
        </section>
      )}

      {/*<Suspense fallback={<div>Loading</div>}>*/}
      <section className={'mt-9 flex flex-col gap-10'}>
        {result.threads.length === 0 ? (
          <p className={'no-result'}>No threads found!</p>
        ) : (
          <>
            {result.threads.map((post) => (
              <Suspense
                fallback={
                  <ThreadCardSkeleton
                    key={post._id.toString()}
                    comments={post.children}
                    index={0}
                  />
                }
              >
                <ThreadCard
                  key={post._id.toString()}
                  id={post._id.toString()}
                  currentUserId={user?.id || ''}
                  parentId={post.parentId}
                  content={post.text}
                  author={post.author}
                  mentions={post.mentioned}
                  community={post.community}
                  createdAt={post.createdAt}
                  images={post.images}
                  likes={post.likes}
                  comments={post.children}
                />
              </Suspense>
            ))}
          </>
        )}
      </section>
      {/*</Suspense>*/}

      <Pagination
        path="/"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  )
}
