import {
  currentUser,
  useOrganizationList,
  CreateOrganization,
} from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import Searchbar from '@/components/shared/Searchbar'
import Pagination from '@/components/shared/Pagination'
import CommunityCard from '@/components/cards/CommunitCard'

import { fetchUser } from '@/lib/actions/user.actions'
import { fetchCommunities } from '@/lib/actions/community.actions'
import CreateCommunity from '@/components/shared/CommunityAction'
import { clerkClient } from '@clerk/clerk-sdk-node'
import CommunityAction from '@/components/shared/CommunityAction'
import { Button } from '@/components/ui/button'

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await fetchUser(user.id)
  if (!userInfo?.onboarded) redirect('/onboarding')

  const result = await fetchCommunities({
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  })

  return (
    <>
      <div className={'flex items-center gap-3 justify-between'}>
        <h1 className="head-text">Communities</h1>
        <CommunityAction userId={user.id}>
          <Button
            className={
              'block overflow-hidden max-w-[100px] xs:max-w-full text-ellipsis'
            }
          >
            Create my own
          </Button>
        </CommunityAction>
      </div>

      <div className="mt-5 flex items-end flex-col justify-center gap-3">
        <div className={'w-full'}>
          <Searchbar routeType="communities" />
        </div>
      </div>

      <section className="mt-9 flex flex-wrap gap-4">
        {result.communities.length === 0 ? (
          <p className="no-result">No Result</p>
        ) : (
          <>
            {result.communities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                slug={community.slug}
                imgUrl={community.image}
                description={community.description}
                members={community.members}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path="communities"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  )
}

export default Page
