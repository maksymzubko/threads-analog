"use client";

import React, {useEffect, useState} from 'react';
import {Mention, MentionItem, MentionsInput, SuggestionDataItem} from "react-mentions";
import {fetchUsers} from "@/lib/actions/user.actions";
import UserCard from "@/components/cards/UserCard";

interface TagBarProps {
    search: string;
    disabled?: boolean;
    userId: string;
    field?: any;
    form: any;
    isComment?: boolean;
}


const CustomTextField = ({search, userId, disabled, field, form, isComment}: TagBarProps) => {
    const [results, setResults] = useState<{ users: any[], isNext: boolean; }>({users: [], isNext: false})
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState({
        query: "", callback: (data: any) => {
        }
    });

    // query after 0.3s of no input
    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            fetchUserByFilter(query.query, query.callback)
        }, 300);

        return () => {
            setLoading(false);
            clearTimeout(delayDebounceFn);
        }
    }, [query]);

    const fetchUserByFilter = (search: string, callback: (item: any) => void) => {
        fetchUsers({
            userId: userId,
            searchString: search,
            pageSize: 10,
            pageNumber: 1,
            sortBy: "asc",
            onlyNickname: true,
            isPlain: true
        })
            .then(res => {
                const users = res.users.map(u => {
                    return {id: u._id.toString(), display: u.username};
                })
                setResults(res);
                callback(users);
            })
            .finally(() => setLoading(false));
    }

    const onChange = (event: {
        target: { value: string }
    }, newValue: string, newPlainTextValue: string, mentions: MentionItem[]) => {
        field?.onChange(event);
        const transformedMentions = mentions.map(m => {
            return {user: m.id};
        })
        //@ts-ignore
        form.setValue('mentions', transformedMentions);
    }

    const onAdd = (id: (string | number), display: string) => {
        const mentions = form.getValues().mentions;
        if (!mentions.some((m:any) => m.user === id)) {
            mentions.push({
                user: id
            })
            //@ts-ignore
            form.setValue('mentions', mentions);
        }
    }

    return (
        <>
            <MentionsInput disabled={disabled} style={{
                "&multiLine": {control: {outline: "none", fontSize: "16px", minHeight: isComment ? '150px' : '300px'}},
                suggestions: {
                    list: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        overflow: "auto",
                        maxHeight: "250px"
                    }
                }
            }}
                           className={`flex gap-4 relative bg-[#020617] border-[1px] [&_textarea]:rounded-2xl [&_textarea]:outline-none [&_textarea]:!text-[20px]`}
                           {...field}
                           onChange={onChange}
                           rows={isComment ? 10 : 15}
                           value={search}
                           customSuggestionsContainer={(children) => {
                               //@ts-ignore
                               const childrenLength = children?.props?.children?.length ?? 0;
                               if (!search.length || !search.includes('@')) return <></>

                               return <div className={`w-[300px] p-3 bg-dark-4`}>
                                   {childrenLength === 0 && search.includes('@') &&
                                       <div className={'no-result'}>Not found users!</div>}
                                   {children}
                               </div>
                           }}>
                <Mention
                    onAdd={onAdd}
                    appendSpaceOnAdd={true}
                    trigger="@"
                    displayTransform={(id, display) => `@${display}`}
                    renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => {
                        if (!results.users.length) return <></>

                        const user = results.users.find(u => u._id.toString() === suggestion.id.toString());
                        return <UserCard
                            key={user?.id?.toString()}
                            id={user?.id?.toString()}
                            name={user.name}
                            username={user.username}
                            imgUrl={user.image}
                            personType={'User'}
                            disableButtons
                            focused={focused}
                        />
                    }}
                    data={(query, callback) => {
                        setQuery({query, callback})
                    }}
                />
            </MentionsInput>
        </>
    );
};

export default CustomTextField;