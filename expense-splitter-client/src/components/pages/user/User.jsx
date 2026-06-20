import { useAuth } from "@/components/context/AuthContext"
import { useRef, useState } from "react"
import Navbar from "../navbar/Navbar"
import { toast, Toaster } from "sonner"
import Profile from "../../../assets/Profile.png" 
import { CircleDollarSign, Pen, Trash, Trash2Icon } from "lucide-react"
import { axiosClient } from "@/api/axios"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useNavigate } from "react-router-dom"

export default function Dashboard(){
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [toggleEditForm, setToggleEditForm] = useState(false)
    const [errors, setErrors] = useState(null)

    const name = useRef()
    const email = useRef()
    const current_password = useRef()
    const new_password = useRef()
    const new_password_confirmation = useRef()

    const { user, setUser, setToken } = useAuth()
    const navigate = useNavigate()

    const handleEditProfile = async (e) => {
        try{
            e.preventDefault()
            setIsActionLoading(true)
            const payload = {}
            if(name.current.value) payload.name = name.current.value
            if(email.current.value) payload.email = email.current.value
            if(new_password.current.value){
                payload.password = new_password.current.value
                payload.password_confirmation = new_password_confirmation.current.value
            }
            payload.current_password = current_password.current.value

            const {data} = await axiosClient.put(`/api/users/${user?.id}`, payload)

            setUser(data.user)
            setToggleEditForm(false)
            name.current.value = ''
            email.current.value = ''
            current_password.current.value = ''
            new_password.current.value = ''
            new_password_confirmation.current.value = ''
            setErrors(null)
            toast.success(data.message, {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
                }
            })
        }catch(error){
            setErrors(error.response.data)
        }finally{
            setIsActionLoading(false)
        }
    }

    const handleDeleteProfile = async () => {
        try{
            setIsActionLoading(true)
            const {data} = await axiosClient.delete(`/api/users/${user?.id}`)
            localStorage.removeItem('token')
            delete axiosClient.defaults.headers.common['Authorization']
            setToken(null)
            setUser(null)
            navigate('/login')
            toast.error(data.message, {
                style : {
                    background : "var(--danger)",
                    color : "var(--light)"
                }
            })
        }
        catch(error){
            toast.warning(error.response.data.message, {
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

            <div className="flex flex-col items-center border border-(--medium) text-(--light) rounded-lg text-center w-9/10 md:w-1/2 mx-auto mt-10 p-5">
                <div>
                    <img src={Profile} alt="user profile" className="w-15 h-15 md:w-25 md:h-25 mx-auto my-2 rounded-full" />
                </div>
                <div className="flex flex-col items-center">
                    <h2 className="font-extrabold text-(--medium) text-xl md:text-2xl">{user?.name.toUpperCase()}</h2>
                    <p className="font-extralight text-sm md:text-md mt-1">{user?.email}</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 mt-5 mb-3">
                    <button
                        onClick={() => setToggleEditForm(prev => !prev)}
                        className='flex items-center justify-center gap-2 hover:bg-(--dark) text-xs md:text-base transition-all duration-300 cursor-pointer p-2 md:my-3 rounded-md'>
                        Editing Profile
                        <Pen size={15} />
                    </button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                className='flex items-center justify-center gap-2 hover:bg-(--danger) text-xs md:text-base transition-all duration-300 cursor-pointer p-2 md:my-3 rounded-md'>
                                Deleting Profile
                                <Trash size={15} />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm" className="bg-(--darker) text-(--light)">
                            <AlertDialogHeader>
                                <AlertDialogMedia className="bg-destructive/10 text-destructive/90 dark:bg-destructive/20 dark:text-destructive">
                                    <Trash2Icon />
                                </AlertDialogMedia>
                                <AlertDialogTitle>Delete your Account ?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-(--light)">
                                        This will permanently delete your account as well as .
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogAction 
                                    onClick={handleDeleteProfile} 
                                    variant="destructive">
                                        {
                                            isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Delete</span>
                                        }
                                </AlertDialogAction>
                                <AlertDialogCancel className="text-(--light) hover:bg-(--dark) transition-all duration-300" variant="outlined">Cancel</AlertDialogCancel>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {
                    errors?.message && <p className="text-(--danger) font-bold text-sm mb-3">{errors.message}</p>
                }

                {
                    toggleEditForm && <form onSubmit={handleEditProfile} className="flex flex-col gap-2 w-full">
                        <label className="text-left text-sm md:text-md">The current Password is required to complete the editing</label>
                        <input type="password" ref={current_password} className="w-full border border-(--input-border) rounded-md p-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-(--medium) transition-all duration-300" placeholder="Current Password..." />
                        <label className="mt-4 text-left text-sm md:text-md">Editing General Infos</label>
                        <input type="text" ref={name} defaultValue={user?.name} className={`w-full border ${errors?.errors?.name ? 'border-(--danger)' : 'border-(--input-border)' } rounded-md p-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-(--medium) transition-all duration-300`} placeholder="New Name..." />
                        {
                            errors?.errors?.name && <p className="text-(--danger) font-bold text-xs md:text-sm text-left">{errors.errors.name[0]}</p>
                        }
                        <input type="email" ref={email} defaultValue={user?.email} className={`w-full border ${errors?.errors?.email ? 'border-(--danger)' : 'border-(--input-border)' } rounded-md p-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-(--medium) transition-all duration-300`} placeholder="New Email..." />
                        {
                            errors?.errors?.email && <p className="text-(--danger) font-bold text-xs md:text-sm text-left">{errors.errors.email[0]}</p>
                        }
                        <label className="mt-4 text-left text-sm md:text-md">Editing Password</label>
                        <input type="password" ref={new_password} className={`w-full border ${errors?.errors?.password ? 'border-(--danger)' : 'border-(--input-border)' } rounded-md p-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-(--medium) transition-all duration-300`} placeholder="New Password..." />
                        <input type="password" ref={new_password_confirmation} className={`w-full border ${errors?.errors?.password ? 'border-(--danger)' : 'border-(--input-border)' } rounded-md p-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-(--medium) transition-all duration-300`} placeholder="Confirm New Password..." />
                        {
                            errors?.errors?.password && <p className="text-(--danger) font-bold text-xs md:text-sm text-left">{errors.errors.password[0]}</p>
                        }
                        <button type="submit" className="flex items-center justify-center w-full md:w-2/10 ml-auto p-1 border border-(--input-border) rounded-md cursor-pointer transition-all duration-300 text-(--light) hover:bg-(--light) hover:border-(--light) hover:text-(--darkest) hover:tracking-widest">
                            {
                                isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Edit</span>
                            }
                        </button>
                    </form>
                }
            </div>
            <Toaster/>
        </div>
    )
}