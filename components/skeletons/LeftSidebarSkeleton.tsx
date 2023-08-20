import {sidebarLinks} from "@/constants";

const LeftSidebarSkeleton = () => {
    return (
        <div className={"flex h-screen w-fit flex-col justify-between overflow-auto border-r border-r-dark-4 bg-dark-2 pb-5 pt-28 max-md:hidden animate-pulse"}>
            <div className={"flex w-full flex-1 flex-col gap-6 px-6"}>
                {sidebarLinks.map(link => {
                        return (
                            <div key={link.label} className={`leftsidebar_link h-[60px] w-[180px] bg-dark-3`}></div>
                        )
                    }
                )}
            </div>
        </div>
    );
};

export default LeftSidebarSkeleton;