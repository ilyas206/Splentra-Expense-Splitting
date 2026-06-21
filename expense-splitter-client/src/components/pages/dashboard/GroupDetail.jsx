import { axiosClient } from "@/api/axios";
import { useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { Toaster } from "sonner";
import Navbar from "../navbar/Navbar";
import { CircleDollarSign } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import MembersList from "./MembersList";
import ExpensesList from "./ExpensesList";

export default function GroupDetail(){

    const { user } = useAuth()

    const { id } = useParams()

    const { data, isLoading } = useQuery({
        queryKey: ['group', id],
        queryFn: async () => {
            const { data } = await axiosClient.get(`/api/groups/${id}`)
            return data
        }
    })

    const group = data?.group ?? null
    const groupCreator = data?.group?.creator ?? null
    const expenses = data?.expenses ?? null
    const members = data?.group?.users ?? null

    return(
        <div className="min-h-dvh flex flex-col">

            <Navbar/>

            <div className="flex flex-col flex-1 mt-15 text-(--light) w-9/10 mx-auto">
                {
                    isLoading ? 
                    (
                        <div className="flex-1 flex items-center justify-center">
                            <CircleDollarSign size={70} className='animate-spin'/>
                        </div>
                    ) : 
                    (
                        <>
                            <div className="flex flex-col md:flex-row gap-2 mx-auto md:mx-0 md:items-center md:justify-between w-full">
                                <h1 className="text-3xl md:text-4xl text-center font-bold py-3"><b>{group?.title}</b> Group</h1>
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <span className="bg-linear-to-r from-(--medium) to-(--dark) text-(--darkest) text-sm md:text-lg p-2 rounded-lg text-center">Created by <b>{groupCreator?.id === user?.id ? 'Me' : groupCreator?.name}</b></span>
                                    <div className="flex flex-col md:flex-row gap-2 text-center md:ml-auto">
                                        <span className="bg-(--medium) text-(--darkest) text-sm md:text-lg p-2 rounded-lg">Edited <b>{group?.formatted_updated_at}</b></span>
                                        <span className="bg-(--dark) text-(--light) text-sm md:text-lg p-2 rounded-lg">Created <b>{group?.formatted_created_at}</b></span>
                                    </div>
                                </div>
                            </div>

                            <hr className="text-(--input-border) my-7" />

                            <MembersList group={group} groupCreator={groupCreator} members={members}/>

                            <hr className="text-(--input-border) my-7" />

                            <ExpensesList group={group} members={members} expenses={expenses}/>

                            <Toaster/>
                        </>
                    )
                }
            </div>
        </div>
    )
}