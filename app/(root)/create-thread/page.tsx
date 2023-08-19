import {currentUser} from "@clerk/nextjs";
import {redirect} from "next/navigation";
import {fetchUser} from "@/lib/actions/user.actions";
import {headers} from "next/headers";
import dynamic from "next/dynamic";

const PostThread = dynamic(()=>import('@/components/forms/PostThread'), {ssr: false})

async function Page() {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);

    if (!userInfo?.onboarded) redirect('/onboarding');

    const headersList = headers();
    const userAgent = headersList.get('user-agent');

    const isMobileView = !!userAgent!.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    );

    return (
        <div>
            <h1 className={'head-text'}>Create Thread</h1>

            <PostThread userId={userInfo?._id.toString() ?? ""} currentUserImg={userInfo?.image} isMobile={isMobileView}/>
        </div>
    )
}

export default Page;