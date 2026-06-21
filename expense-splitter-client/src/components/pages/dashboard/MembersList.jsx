import { axiosClient } from "@/api/axios"
import { useAuth } from "@/components/context/AuthContext"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { CircleDollarSign, Plus, Trash2Icon } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

export default function MembersList({group, groupCreator, members}){

    const [toggleAddMemberForm, setToggleAddMemberForm] = useState(false)
    const [isActionLoading, setIsActionLoading] = useState(false)

    const queryClient = useQueryClient()

    const { user } = useAuth()

    const email = useRef()

    const checkUserValid = async () => {
        const emailValue = email.current.value.trim()

        if(!emailValue){
            toast.error("Please enter an email address", {
                style : {
                    background : "var(--danger)",
                    color : "var(--light)"
                }
            })
            return null
        }

        // Check if group creator is trying to add themselves
        if (emailValue === user?.email) {
            toast.error("You are already a member in the group", {
                style : {
                    background : "var(--danger)",
                    color : "var(--light)"
                }
            })
            return null
        }

        // Check if user already belongs
        const userAlreadyBelongs = members.find(member => member.email === emailValue)
        if(userAlreadyBelongs){
            toast.error("This user is already a member in this group", {
                style : {
                    background : "var(--danger)",
                    color : "var(--light)"
                }
            })
            return null
        }

        try{
            return await axiosClient.get(`/api/users/search?q=${emailValue}`)
        }
        catch(error){
            toast.error(error.response?.data?.message || "User not found", {
                style : {
                    background : "var(--danger)",
                    color : "var(--light)"
                }
            })
            return null
        }
    }

    const handleAddMember = async () => {
        try{
            setIsActionLoading(true)
            const response = await checkUserValid()
            if(!response) return 
            const {data} = await axiosClient.post(`/api/groups/${group.id}/members`, {
                user_id : response.data.id
            })
            queryClient.invalidateQueries({ queryKey: ['group', group.id] })
            setToggleAddMemberForm(false)
            email.current.value = ''
            toast.success(data.message, {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
                }
            })
        }
        catch(error){
            toast.warning(error.response?.data?.message || "Error adding member", {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
                }
            })
        }finally{
            setIsActionLoading(false)
        }
    }

    const handleRemoveMember = async (id) => {
        try{
            setIsActionLoading(true)
            const {data} = await axiosClient.delete(`/api/groups/${group.id}/members/${id}`)
            queryClient.invalidateQueries({ queryKey: ['group', group.id] })
            setToggleAddMemberForm(false)
            email.current.value = ''
            toast.success(data.message, {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
                }
            })
        }
        catch(error){
            toast.warning(error.response?.data?.message || "Error removing member", {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
                }
            })
        }finally{
            setIsActionLoading(false)
        }
    }

    return <>
        <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-2xl font-bold">Group Members</h1>
            {
                groupCreator?.id === user?.id && <button 
                    onClick={() => {
                        setToggleAddMemberForm(prev => !prev)
                    }}
                    className='flex items-center gap-1 hover:bg-(--dark) text-sm md:text-lg transition-all duration-300 cursor-pointer p-3 rounded-md'>
                    Add Member
                    <Plus size={15} />
                </button>
            }
        </div>

        <div className="flex flex-col-reverse md:flex-row items-center gap-7 mt-7">
            <div className="md:w-9/12">
                {
                    members?.map((member, key) => {
                        return <div key={key} className="flex items-center gap-3 my-3">
                            <span className="flex items-center justify-center bg-linear-to-tr from-(--darkest) to-(--light) text-(--darkest) font-extrabold w-7 h-7 md:w-10 md:h-10 rounded-full">{key + 1}</span>
                            <p><span className="font-bold text-sm md:text-lg">{member.name}</span> / <span className="font-light text-sm md:text-lg">{member.email}</span></p>
                            {
                                // Only the group creator can see REMOVE button for non-creator members
                                (groupCreator?.id === user?.id && groupCreator?.id !== member.id) && 
                                <div className="ml-auto md:ml-0">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button className="text-(--input-border) hover:text-(--danger) underline cursor-pointer">Remove</button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent size="sm" className="bg-(--darker) text-(--light)">
                                            <AlertDialogHeader>
                                                <AlertDialogMedia className="bg-destructive/10 text-destructive/90 dark:bg-destructive/20 dark:text-destructive">
                                                    <Trash2Icon />
                                                </AlertDialogMedia>
                                                <AlertDialogTitle>Remove <b>"{member.name}"</b> From the Group ?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-(--light)">
                                                        This will permanently remove this member from the group so it won't be able to share expenses with other members.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogAction 
                                                    onClick={() => handleRemoveMember(member.id)} 
                                                    variant="destructive">
                                                        {
                                                            isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Remove</span>
                                                        }
                                                </AlertDialogAction>
                                                <AlertDialogCancel className="text-(--light) hover:bg-(--dark) transition-all duration-300" variant="outlined">Cancel</AlertDialogCancel>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            }
                        </div>
                    })
                }
            </div>
                {
                toggleAddMemberForm &&
                <div className="flex-1">
                    <input type="email" ref={email} required className={`w-full border-2 border-(--input-border) focus:ring-(--medium) focus:ring-2 rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} placeholder="Type the new Member Email..." />
                    <button onClick={handleAddMember} className="flex items-center justify-center p-2 mt-2 w-full border-2 border-(--input-border) rounded-md cursor-pointer transition-all duration-300 text-(--light) hover:bg-(--light) hover:border-(--light) hover:text-(--darkest) hover:tracking-widest">
                        {
                            isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Add</span>
                        }
                    </button>
                </div>
            }
        </div>
    </>
}