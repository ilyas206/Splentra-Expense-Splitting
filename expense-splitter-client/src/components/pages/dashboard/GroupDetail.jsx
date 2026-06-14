import { axiosClient } from "@/api/axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import Navbar from "../navbar/Navbar";
import { CircleDollarSign } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import MembersList from "./MembersList";
import ExpensesList from "./ExpensesList";

export default function GroupDetail(){
    
    const [isLoading, setIsLoading] = useState(false)
    const [group, setGroup] = useState(null)
    const [groupCreator, setGroupCreator] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [members, setMembers] = useState([])
    const { user } = useAuth()

    const { id } = useParams()

    useEffect(() => {
        const getGroup = async () => {
            try{
                setIsLoading(true)
                const {data} = await axiosClient.get(`/api/groups/${id}`)
                setGroup(data.group)
                setGroupCreator(data.group.creator)
                setExpenses(data.expenses)
                setMembers(data.group.users)
            }catch(error){
                toast.warning(error.response.data, {
                    style : {
                        background : "var(--dark)",
                        color : "var(--light)",
                        border : "1px solid var(--input-border)"
                    }
                })
            }finally{
                setIsLoading(false)
            }
        }
        getGroup()
    }, [])

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
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-bold"><b>{group?.title}</b> Group</h1>
                                    <span className="bg-(--medium) text-(--darkest) p-2 rounded-lg">Created by <b>{groupCreator?.id === user?.id ? 'Me' : groupCreator?.name}</b></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <span className="bg-(--medium) text-(--darkest) p-2 rounded-lg">Edited <b>{group?.formatted_updated_at}</b></span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <span>Last Group Edit</span>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <span className="bg-(--dark) text-(--light) p-2 rounded-lg">Created <b>{group?.formatted_created_at}</b></span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <span>Group Creation</span>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>

                            <hr className="text-(--input-border) my-7" />

                            <MembersList group={group} groupCreator={groupCreator} members={members} setMembers={setMembers}/>

                            <hr className="text-(--input-border) my-7" />

                            <ExpensesList group={group} members={members} expenses={expenses} setExpenses={setExpenses}/>

                            <Toaster/>
                        </>
                    )
                }
            </div>
        </div>
    )
}