import Image from 'next/image'
import { FileProps } from '@/components/forms/PostThread'

interface Props {
  files: FileProps[]
  deleteImage: (id: string) => void
}

const PostThreadImages = ({ files, deleteImage }: Props) => {
  return (
    <>
      {files.length > 0 && (
        <>
          <div className={'flex flex-wrap items-center gap-2'}>
            {files.map((f) => (
              <div
                key={f.id}
                className={
                  'item relative cursor-pointer bg-none transition ease-in-out group'
                }
                onClick={(e) => deleteImage(f.id)}
              >
                <div
                  className={
                    'absolute w-full transition ease-in-out h-full z-50'
                  }
                >
                  <span
                    className={
                      'group-hover:scale-100 translate-x-[-50%] translate-y-[-50%] rotate-[45deg] h-[30px] w-[4px] top-1/2 left-1/2 bg-white transition absolute scale-0'
                    }
                  ></span>
                  <span
                    className={
                      'group-hover:scale-100 translate-x-[-50%] translate-y-[-50%] rotate-[-45deg] h-[30px] w-[4px] top-1/2 left-1/2 bg-white transition absolute scale-0'
                    }
                  ></span>
                </div>
                <Image
                  className={
                    'group-hover:grayscale transition ease-in-out group-hover:opacity-30'
                  }
                  draggable={true}
                  src={f.data}
                  alt={'img'}
                  width={60}
                  height={60}
                />
              </div>
            ))}
          </div>
          <div className={'border-[1px] border-dark-3'} />
        </>
      )}
    </>
  )
}

export default PostThreadImages
