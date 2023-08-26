import { currentUser } from '@clerk/nextjs'
import { fetchUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import ProfileHeader from '@/components/shared/ProfileHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { profileTabs } from '@/constants'
import Image from 'next/image'
import ThreadsTab from '@/components/shared/Threads/ThreadsTab'
import ActivityTab from '@/components/shared/ActivityTab'

const Page = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await fetchUser(params ? params.id : user.id)
  if (!userInfo?.onboarded) redirect('/onboarding')

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
        registeredAt={userInfo.registeredAt}
      />

      <div className={'mt-9'}>
        <Tabs defaultValue={'threads'} className={'w-full'}>
          <TabsList className={'tab'}>
            {profileTabs.map((tab) => (
              <TabsTrigger value={tab.value} key={tab.label} className={'tab'}>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className={'object-contain'}
                />
                <p className={'max-sm:hidden'}>{tab.label}</p>

                {tab.label === 'Threads' && (
                  <p
                    className={
                      'ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'
                    }
                  >
                    {userInfo?.threads?.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className={'w-full text-light-1'}
            >
              {tab.value === 'threads' ? (
                <ThreadsTab
                  currentUserId={user.id}
                  accountId={userInfo.id}
                  accountType={'User'}
                />
              ) : (
                <ActivityTab
                  currentUserId={user.id}
                  accountId={userInfo._id}
                  label={tab.value as 'replies' | 'tags'}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

export default Page
