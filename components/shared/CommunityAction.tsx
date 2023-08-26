'use client'

import { useEffect, useState } from 'react'
import ManageCommunityForm from '@/components/forms/ManageCommunityForm'

export interface CommunityActionProps {
  children?: any
  community?: {
    id: string
    name: string
    slug: string
    description: string
    image: string
    variant: string
  }
  onClose?: () => void
  userId: string
}

const CommunityAction = ({
  userId,
  children,
  community,
}: CommunityActionProps) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : 'auto'
  }, [])

  return (
    <div>
      <span onClick={() => setShow(true)}>{children}</span>
      {
        <div
          className={`fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] ${
            show ? 'flex' : 'hidden'
          } z-50 bg-[#00000080] w-full h-screen flex items-center justify-center`}
        >
          <ManageCommunityForm
            onClose={() => setShow(false)}
            userId={userId}
            community={community}
          />
        </div>
      }
    </div>
  )
}

export default CommunityAction
