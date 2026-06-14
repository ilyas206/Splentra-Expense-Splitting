import { CircleDollarSign, Pen, Plus, Trash, Trash2Icon, X } from "lucide-react";
import Navbar from "../navbar/Navbar";
import { useEffect, useRef, useState } from "react";
import { axiosClient } from "../../../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Dashboard(){
    const [groups, setGroups] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [toggleCreateForm, setToggleCreateForm] = useState(false)
    const [editedGroupID, setEditedGroupID] = useState(null)
    const [editedGroupTitle, setEditedGroupTitle] = useState(null)
    const [error, setError] = useState(null)

    const createTitle = useRef()

    const { user } = useAuth()

    useEffect(() => {
        const getGroups = async () => {
            try{
                setIsLoading(true)
                const {data} = await axiosClient.get('/api/groups')
                setGroups(data)
            }catch(error){
                console.log(error)
            }finally{
                setIsLoading(false)
            }
        }
        getGroups()
    }, [])

    const handleCreate = async (e) => {
        try{
            e.preventDefault()
            setIsActionLoading(true)
            const response = await axiosClient.post('/api/groups', {
                title : createTitle.current.value
            })
            setGroups([...groups, response.data.group])
            createTitle.current.value = ''
            setError(null)
            toast.success(response.data.message, {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
                }
            })
        }catch(error){
            setError(error.response.data)
        }finally{
            setIsActionLoading(false)
        }
    }

    const handleEdit = async (e, id) => {
        try{
            e.preventDefault()
            if(!editedGroupTitle) return 
            setIsActionLoading(true)
            const response = await axiosClient.put(`/api/groups/${id}`, {
                title : editedGroupTitle
            })
            setGroups(groups.map(group => group.id === id ? response.data.group : group))
            setEditedGroupTitle(null)
            setEditedGroupID(null)
            setError(null)
            toast.success(response.data.message, {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
                }
            })
        }catch(error){
            setError(error.response.data)
            if(error.response.data.title){
                toast.warning(error.response.data.title, {
                    description : error.response.data.description,
                    style : {
                        background : "var(--dark)",
                        color : "var(--light)",
                        border : "1px solid var(--input-border)"
                    }
                })
            }
        }finally{
            setIsActionLoading(false)
        }
    }

    const handleDelete = async (id) => {
        try{
            setIsActionLoading(true)
            const response = await axiosClient.delete(`/api/groups/${id}`)
            setGroups(groups.filter(group => group.id !== id))
            setEditedGroupID(null)
            setEditedGroupTitle(null)
            toast.error(response.data.message, {
                style : {
                    background : "var(--danger)",
                    color : "var(--light)"
                }
            })
        }
        catch(error){
            toast.warning(error.response.data.title, {
                description : error.response.data.description,
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

    return(
        <div className="min-h-dvh flex flex-col">

            <Navbar/>

            <div className="flex flex-col flex-1 mt-15 text-(--light) w-9/10 mx-auto">
                {
                    isLoading ? 
                    (
                        <div className="flex-1 flex items-center justify-center text-(--light)">
                            <CircleDollarSign size={70} className='animate-spin'/>
                        </div>
                    ) : 
                    (
                        <>
                            <hr className="text-(--input-border) mb-5" />
                            <div className="flex items-center justify-between">
                                <h1 className="text-4xl font-bold">My Groups</h1>
                                <button 
                                    onClick={() => {
                                        setToggleCreateForm(prev => !prev)
                                        setEditedGroupID(null)
                                        setError(null)
                                    }} 
                                    className='flex items-center gap-2 hover:bg-(--dark) transition-all duration-300 cursor-pointer p-3 rounded-md'>
                                    Create
                                    <Plus size={17} />
                                </button>
                            </div>

                            {/* CREATE FORM */}
                            <>
                                {
                                    toggleCreateForm && 
                                    <div className="my-7">
                                        <h2 className="my-2 text-lg font-bold">Creating a new Group</h2>
                                        <form onSubmit={handleCreate}>
                                            <div className="flex justify-center gap-2 w-full">
                                                <div className="flex-1">
                                                    <input type="text" ref={createTitle} required className={`w-full border focus:ring-1 ${error?.message ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} placeholder="Title..." />
                                                </div>
                                                <button type="submit" className="flex items-center justify-center w-1/10 p-1 border border-(--input-border) rounded-md cursor-pointer transition-all duration-300 text-(--light) hover:bg-(--light) hover:border-(--light) hover:text-(--darkest) hover:tracking-widest">
                                                    {
                                                        isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Create</span>
                                                    }
                                                </button>
                                            </div>
                                            <p className="text-(--danger) font-bold text-sm mt-1">{error?.message}</p>
                                        </form>
                                    </div>
                                }
                            </>

                            {/* EDIT FORM */}
                            <>
                                {
                                    editedGroupID && 
                                    <div className="my-7">
                                        <h2 className="my-2 text-lg font-bold">Editing an existing Group</h2>
                                        <form onSubmit={(e) => handleEdit(e, editedGroupID)}>
                                            <div className="flex justify-center gap-2 w-full">
                                                <div className="flex-1">
                                                    <input type="text" value={editedGroupTitle} onChange={(e) => setEditedGroupTitle(e.target.value)} required className={`w-full border focus:ring-1 ${error?.message ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} placeholder="Title..." />
                                                </div>
                                                <button type="submit" className="flex items-center justify-center w-1/10 p-1 border border-(--input-border) rounded-md cursor-pointer transition-all duration-300 text-(--light) hover:bg-(--light) hover:border-(--light) hover:text-(--darkest) hover:tracking-widest">
                                                    {
                                                        isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Edit</span>
                                                    }
                                                </button>
                                            </div>
                                            <p className="text-(--danger) font-bold text-sm mt-1">{error?.message}</p>
                                        </form>
                                    </div>
                                }
                            </>

                            {
                                groups.length > 0 ? 
                                    <div className="grid grid-cols-3 gap-4 mt-7">
                                        {
                                        groups.map(group => {
                                            const isCreator = user?.id === group.created_by
                                            return <div key={group.id} className="bg-(--dark) shadow-2xl rounded-md p-3 flex flex-col items-center justify-center">

                                                <div className="flex items-center justify-center gap-2">

                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Link to={`/groups/${group.id}`}>
                                                                <h1 className="text-2xl font-semibold">{group.title}</h1>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <span>View Group Details</span>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {
                                                        isCreator &&
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <div>
                                                                    <span className="py-1 px-2 font-bold bg-(--darkest) text-(--light) rounded-lg">Creator</span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <span>You are the Creator and the First Member of this Group</span>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    }
                                                </div>
                                                
                                                <div className="flex items-center justify-center gap-2 my-3">
                                                    
                                                    {
                                                        isCreator ? 
                                                        <>
                                                            <button disabled={!isCreator} 
                                                                onClick={() => {
                                                                    setEditedGroupTitle(group.title)
                                                                    setEditedGroupID(group.id)
                                                                    setToggleCreateForm(false)
                                                                    setError(null)
                                                                }} 
                                                                className="flex items-center gap-2 text-(--light) hover:bg-(--light) hover:text-(--darkest) disabled:hover:bg-(--dark) disabled:text-gray-400/80 p-2 rounded-md transition-all duration-300 cursor-pointer disabled:cursor-not-allowed">
                                                                Edit
                                                                <Pen size={15} />
                                                            </button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <button className="flex items-center gap-2 text-(--light) hover:bg-(--danger) p-2 rounded-md transition-all duration-300 cursor-pointer">
                                                                        Delete
                                                                        <Trash size={15} />
                                                                    </button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent size="sm" className="bg-(--darker) text-(--light)">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogMedia className="bg-destructive/10 text-destructive/90 dark:bg-destructive/20 dark:text-destructive">
                                                                            <Trash2Icon />
                                                                        </AlertDialogMedia>
                                                                        <AlertDialogTitle>Delete <b>"{group.title}"</b> Group ?</AlertDialogTitle>
                                                                            <AlertDialogDescription className="text-(--light)">
                                                                                This will permanently delete this group as well as its related expenses AND also their expense splits.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogAction onClick={() => handleDelete(group.id)} variant="destructive">
                                                                            {
                                                                                isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Delete</span>
                                                                            }
                                                                        </AlertDialogAction>
                                                                        <AlertDialogCancel className="text-(--light) hover:bg-(--dark) transition-all duration-300" variant="outlined">Cancel</AlertDialogCancel>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </> : 
                                                        <>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <span 
                                                                        className="flex items-center gap-2 text-gray-400/80 p-2 cursor-not-allowed">
                                                                        Edit
                                                                        <Pen size={15} />
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <span>Only the Creator CAN Edit this Group</span>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <span 
                                                                        className="flex items-center gap-2 text-gray-400/80 p-2 cursor-not-allowed">
                                                                        Delete
                                                                        <Trash size={15} />
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <span>Only the Creator CAN Delete this Group</span>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </>
                                                    }
                                                    
                                                </div>

                                                <p className="font-thin text-sm text-center">Edited <b>{group.formatted_updated_at}</b></p>
                                            </div>
                                        })
                                    }
                                </div> : <div className="flex items-center justify-center gap-3 min-h-96">
                                        <X size={30} />
                                        <h2 className="text-2xl font-bold">You are NOT a member in any Group so far</h2>
                                    </div>
                            }
                            <Toaster/>
                        </>
                    )
                }
            </div>
        </div>
    )
}