import {currentUser} from "@clerk/nextjs";
import {fetchUser, getActivity} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";
import dynamic from "next/dynamic";
import ActivityCard from "@/components/cards/ActivityCard";

const Page = async () => {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect('/onboarding');

    const activity = await getActivity(userInfo._id, 'all');
    return (
        <div>
            <h1 className={"head-text mb-10"}>Activity</h1>

            <section className={"mt-10 flex flex-col gap-5"}>
                {activity.length > 0 ?
                    <>
                        {activity.map(act =>
                            <ActivityCard
                                key={act._id}
                                id={act._id}
                                parentId={act.parentId}
                                content={act.text}
                                author={act.author}
                                mentions={act.mentioned}
                                createdAt={act.date}
                                user={act.type !== 'reply' ? act.user : {}}
                                type={act.type}
                            />
                        )}
                    </>
                    : <p className={"!text-base-regular text-light-3"}>No activity yet</p>
                }
            </section>
        </div>
    );
};

export default Page;