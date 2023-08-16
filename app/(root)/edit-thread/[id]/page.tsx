import {currentUser} from "@clerk/nextjs";
import {redirect} from "next/navigation";
import {fetchUser} from "@/lib/actions/user.actions";
import PostThread from "@/components/forms/PostThread";
import {fetchThreadById} from "@/lib/actions/thread.actions";

async function Page({params}:{params:{id: string}}) {
    const user = await currentUser();
    if (!user) return null;

    if(!params?.id) return null;

    const userInfo = await fetchUser(user.id);

    if (!userInfo.onboarded) redirect('/onboarding');

    const thread = await fetchThreadById(params.id)
    if(thread.author.id !== user.id) return null;

    return (
        <>
            <h1 className={'head-text'}>Edit Thread</h1>

            <PostThread userId={userInfo?._id} threadId={thread.id} text={thread.text}/>
        </>
    )
}

export default Page;