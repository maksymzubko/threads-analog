import {fetchThreads} from "@/lib/actions/thread.actions";
import ThreadCard from "@/components/cards/ThreadCard";
import {currentUser} from "@clerk/nextjs";
import {headers} from "next/headers";
import PostThread from "@/components/forms/PostThread";
import {fetchUser} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";
import Pagination from "@/components/shared/Pagination";

export default async function Home(
    {searchParams}: {
        searchParams: { [key: string]: string | undefined };
    }) {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const result = await fetchThreads(
        searchParams.page ? +searchParams.page : 1,
        30
    );

    const headersList = headers();
    const userAgent = headersList.get('user-agent');

    const isMobileView = !!userAgent!.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    );

    return (
        <>
            <h1 className={"head-text text-left"}>Home</h1>

            <section>
                <PostThread userId={userInfo?._id.toString() ?? ""} currentUserImg={userInfo?.image}
                            isMobile={isMobileView} onHome/>
            </section>

            <section className={"mt-9 flex flex-col gap-10"}>
                {result.threads.length === 0 ? <p className={"no-result"}>No threads found!</p> :
                    <>
                        {result.threads.map((post) =>
                            <ThreadCard
                                key={post._id.toString()}
                                id={post._id.toString()}
                                currentUserId={user?.id || ""}
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
                        )}
                    </>}
            </section>

            <Pagination
                path='/'
                pageNumber={searchParams?.page ? +searchParams.page : 1}
                isNext={result.isNext}
            />
        </>
    )
}