import {fetchThreads} from "@/lib/actions/thread.actions";
import ThreadCard from "@/components/cards/ThreadCard";
import {currentUser} from "@clerk/nextjs";

export default async function Home() {
    const result = await fetchThreads(1, 30);
    const user = await currentUser();

    return (
        <>
            <h1 className={"head-text text-left"}>Home</h1>

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
                            likes={post.likes}
                            comments={post.children}
                        />
                    )}
                </>}
            </section>
        </>
    )
}