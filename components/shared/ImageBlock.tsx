import Image from "next/image";

const ImageBlock = ({images}:{images:string[]}) => {
    return (
        <>
            {images?.length > 0 && <div className={`mt-5 flex gap-2`}>
                {images.map(i => {
                    return <div
                        className={`aspect-video w-full relative max-h-[${images.length > 1 ? '100px' : '500px'}]`}
                    >
                        <Image src={i} fill className={"w-full object-contain object-left"} alt={'img'}/>
                    </div>
                })}
            </div>}
        </>
    );
};

export default ImageBlock;