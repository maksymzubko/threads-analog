import Image from "next/image";
import EmojiPicker, {EmojiClickData, Theme} from "emoji-picker-react";
import {ImageIcon} from "@radix-ui/react-icons";
import {Input} from "@/components/ui/input";
import {ChangeEvent, useEffect, useRef, useState} from "react";

interface Props {
    disabled: boolean
    isMobile: boolean;
    onSmileClick: (emoji: EmojiClickData) => void;
    handleImage:(e: ChangeEvent<HTMLInputElement>)=>void;
    filesLength: number;
}

const PostThreadActions = ({disabled, isMobile, onSmileClick, handleImage, filesLength}: Props) => {
    const [showEmoji, setShowEmoji] = useState(false)
    const input = useRef<any>();
    const block = useRef<any>();

    useEffect(() => {
        const handleOutSideClick = (event: any) => {
            if (!block.current?.contains(event.target)) {
                setShowEmoji(false)
            }
        };

        window.addEventListener("mousedown", handleOutSideClick);

        return () => {
            window.removeEventListener("mousedown", handleOutSideClick);
        };
    }, [block, showEmoji]);

    const handleStateEmoji = () => {
        if (!disabled) {
            setShowEmoji(!showEmoji)
        }
    }
    const computeStyle = () => {
        const height = window?.innerHeight ?? 0;
        const fromBottom = block?.current?.getBoundingClientRect().bottom;
        const containerHeight = isMobile ? 250 : 320;

        if (height - fromBottom - 120 < containerHeight)
            return {bottom: 50, left: isMobile ? '-300%' : 0}
        else return {top: 50, left: isMobile ? '-300%' : 0}
    }

    return (
        <div className={"flex items-center gap-2"}>
            <div ref={block} className={"cursor-pointer relative"}>
                <Image onClick={handleStateEmoji} src={'/assets/emoji.png'}
                       className={"invert transition ease-in-out hover:grayscale-[1px]"} alt={'Emoji'}
                       width={32} height={32}/>
                <div style={{...computeStyle()}}
                     className={`${showEmoji ? 'flex' : 'hidden'} absolute z-50`}>
                    <EmojiPicker height={isMobile ? 250 : 320} searchDisabled={isMobile}
                                 onEmojiClick={onSmileClick} previewConfig={{showPreview: false}}
                                 theme={Theme.DARK}/>
                </div>
            </div>
            <div className={"cursor-pointer"}>
                <ImageIcon
                    className={`h-[28px] w-[28px] transition ease-in-out ${filesLength >= 1 && 'opacity-40 cursor-auto'} hover:opacity-40`}
                    color={"#b7b7b7"} onClick={e => input?.current?.click()}/>
                <Input
                    disabled={filesLength >= 1}
                    ref={input}
                    type={"file"}
                    accept={"image/*"}
                    placeholder={"Upload a photo"}
                    className={"hidden"}
                    onChange={e => handleImage(e)}
                />
            </div>
        </div>
    );
};

export default PostThreadActions;