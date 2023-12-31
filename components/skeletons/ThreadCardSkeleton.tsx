import React, {useEffect} from 'react';
import {log} from "util";

interface Props {
    isComment?: boolean;
    isChild?: boolean;
    index: number;
    comments?: any[];
}

const ThreadCardSkeleton = ({isComment, isChild, index, comments}:Props) => {
    const hasChild = comments?.at(0) ?? null;
    return (
        <>
            <article className={`flex animate-pulse w-full flex-col ${isComment ? `px-0 xs:px-7` : 'bg-dark-2 p-7 rounded-xl'}`}>
                <div
                    className={`${isComment && !isChild && 'mt-5'} ${isComment && (hasChild ? 'mb-2' : 'mb-5')} flex items-start justify-between relative`}>
                    <div className={"flex w-full flex-1 flex-row gap-4"}>
                        <div className={"flex flex-col items-center"}>
                            <svg className="w-[48px] h-[48px] text-grclassName0 dark:text-gray-700" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                            </svg>
                        </div>
                        <div className={`flex w-full flex-col`}>
                            <div className={"w-full h-[20px] bg-dark-4"}/>

                            <div className={"mt-2 h-[60px] w-full bg-dark-4"}/>

                            <div className={"mt-5 flex justify-between md:justify-start gap-3.5"}>
                                <div
                                    className="flex items-center justify-center classNameify-center h-[32px] w-[32px] bg-gray-300 rounded dark:bg-dark-3">
                                    <svg className="h-[16px] w-[16px] text-grclassName0 dark:text-gray-600" aria-hidden="true"
                                         xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                                        <path
                                            d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                                        <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                                    </svg>
                                </div>
                                <div
                                    className="flex items-center justify-center classNameify-center h-[32px] w-[32px] bg-gray-300 rounded dark:bg-dark-3">
                                    <svg className="h-[16px] w-[16px] text-grclassName0 dark:text-gray-600" aria-hidden="true"
                                         xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                                        <path
                                            d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                                        <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                                    </svg>
                                </div>
                                <div
                                    className="flex items-center justify-center classNameify-center h-[32px] w-[32px] bg-gray-300 rounded dark:bg-dark-3">
                                    <svg className="h-[16px] w-[16px] text-grclassName0 dark:text-gray-600" aria-hidden="true"
                                         xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                                        <path
                                            d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                                        <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {index === 2 && hasChild &&
                        <div className={"mb-4 bg-dark-2 h-[14px] w-[50px]"}/>
                }
            </article>

            {isComment && hasChild && index < 2 &&
                <ThreadCardSkeleton
                    index={index++}
                    isChild
                    isComment
                    comments={hasChild?.comments
                }/>
            }
        </>
    );
};

export default ThreadCardSkeleton;