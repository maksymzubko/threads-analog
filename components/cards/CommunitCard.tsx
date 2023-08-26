import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

interface Props {
  id: string
  name: string
  slug: string
  imgUrl: string
  description: string
  members: {
    image: string
  }[]
}

function CommunityCard({
  id,
  name,
  slug,
  imgUrl,
  description,
  members,
}: Props) {
  return (
    <article className="community-card">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/communities/${slug}`} className="relative h-12 w-12">
          <Image
            src={imgUrl}
            alt="community_logo"
            fill
            className="rounded-full object-cover"
          />
        </Link>

        <div
          className={
            '[&_*]:whitespace-nowrap [&_*]:overflow-hidden [&_*]:overflow-ellipsis [&_*]:max-w-[160px] md:[&_*]:max-w-[220px]'
          }
        >
          <Link href={`/communities/${slug}`}>
            <h4 className="text-base-semibold text-light-1">{name}</h4>
          </Link>
          <p className="text-small-medium text-gray-1">@{slug}</p>
        </div>
      </div>

      <p className="mt-4 text-subtle-medium text-gray-1 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px] sm:max-w-[330px]">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/communities/${slug}`}>
          <Button size="sm" className="community-card_btn">
            View
          </Button>
        </Link>

        {members.length > 0 && (
          <div className="flex items-center">
            {members.map((member, index) => (
              <div className={'relative h-[28px] w-[28px]'}>
                <Image
                  key={index}
                  src={member.image}
                  alt={`user_${index}`}
                  fill
                  className={`${
                    index !== 0 && '-ml-2'
                  } rounded-full object-cover`}
                />
              </div>
            ))}
            {members.length > 3 && (
              <p className="ml-1 text-subtle-medium text-gray-1">
                {members.length}+ Users
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default CommunityCard
