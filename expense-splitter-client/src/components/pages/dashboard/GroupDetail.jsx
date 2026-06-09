import { axiosClient } from "@/api/axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import Navbar from "../navbar/Navbar";
import { Banknote, CircleDollarSign, Pen, Plus, Trash, Trash2Icon, X } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Field, FieldGroup } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function GroupDetail(){
    
    const [isLoading, setIsLoading] = useState(false)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [toggleCreateExpenseForm, setToggleCreateExpenseForm] = useState(false)
    const [toggleAddMemberForm, setToggleAddMemberForm] = useState(false)
    const [group, setGroup] = useState(null)
    const [groupCreator, setGroupCreator] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [members, setMembers] = useState([])
    const [otherUsers, setOtherUsers] = useState([])
    const [newMemberID, setNewMemberID] = useState(null)
    const [errors, setErrors] = useState(null)
    const [selectedMemberIds, setSelectedMemberIds] = useState([])
    const [editedExpense, setEditedExpense] = useState(null)
    const { user } = useAuth()

    const { id } = useParams()

    const category = useRef()
    const description = useRef()
    const amount = useRef()

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

    useEffect(() => {
        const getOtherUsers = async () => {
            try{
                const {data} = await axiosClient.get('/api/users')
                setOtherUsers(data.filter(user => 
                    !members?.some(u => u.id === user.id)
                ))
            }catch(error){
                toast.warning(error.response.data, {
                    style : {
                        background : "var(--dark)",
                        color : "var(--light)",
                        border : "1px solid var(--input-border)"
                    }
                })
            }
        }
        getOtherUsers()
    }, [members])

    useEffect(() => {
        const getExpenseSplits = async () => {
            if(editedExpense){
                const {data} = await axiosClient.get(`/api/expenses/${editedExpense.id}/splits`)
                const memberIds = data.map(split => split.user_id)
                setSelectedMemberIds(memberIds)
            }
        }
        getExpenseSplits()
    }, [editedExpense])

    const handleMemberToggle = (memberId, isChecked) => {
        if (isChecked) {
            setSelectedMemberIds([...selectedMemberIds, memberId])
        } else {
            setSelectedMemberIds(selectedMemberIds.filter(id => id !== memberId))
        }
    } 

    const handleCreate = async (e) => {
        try{
            e.preventDefault()
            setIsActionLoading(true)
            const response = await axiosClient.post(`/api/groups/${group.id}/expenses`, {
                category : category.current.value,
                description : description.current.value,
                amount : amount.current.value,
                member_ids : selectedMemberIds
            })
            setExpenses([...expenses, response.data.expense])
            category.current.value = ''
            description.current.value = ''
            amount.current.value = ''
            setSelectedMemberIds([])
            setErrors(null)
            toast.success(response.data.message, {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
                }
            })
        }catch(error){
            setErrors(error.response.data.errors)
        }finally{
            setIsActionLoading(false)
        }
    }

    const handleEdit = async (e) => {
        try{
            e.preventDefault()
            setIsActionLoading(true)
            const response = await axiosClient.put(`/api/expenses/${editedExpense.id}`, {
                category : editedExpense.category,
                description : editedExpense.description,
                amount : editedExpense.amount,
                member_ids : selectedMemberIds
            })
            setExpenses(expenses.map(expense => expense.id === editedExpense.id ? response.data.expense : expense))
            setEditedExpense(null)
            setErrors(null)
            toast.success(response.data.message, {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
                }
            })
        }catch(error){
            setErrors(error.response.data.errors)
        }finally{
            setIsActionLoading(false)
        }
    }

    const handleDelete = async (id) => {
        try{
            setIsActionLoading(true)
            const response = await axiosClient.delete(`/api/expenses/${id}`)
            setExpenses(expenses.filter(expense => expense.id !== id))
            setEditedExpense(null)
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

    const handleAddMember = async () => {
        try{
            setIsActionLoading(true)
            const {data} = await axiosClient.post(`/api/groups/${group.id}/members`, {
                user_id : newMemberID
            })
            setMembers([...members, data.newMember])
            setNewMemberID(null)
            setToggleAddMemberForm(false)
            toast.success(data.message, {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
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

    const handleRemoveMember = async (id) => {
        try{
            setIsActionLoading(true)
            const {data} = await axiosClient.delete(`/api/groups/${group.id}/members/${id}`)
            setMembers(members.filter(member => member.id !== id))
            setToggleAddMemberForm(false)
            toast.success(data.message, {
                style : {
                    background : "var(--dark)",
                    color : "var(--light)",
                    border : "1px solid var(--input-border)"
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
                                    <span className="bg-(--medium) text-(--darkest) p-2 rounded-lg">Created by <b>{groupCreator?.name === user?.name ? 'Me' : groupCreator?.name}</b></span>
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

                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold"><b>{group?.title}</b> Group Members</h1>
                                <button 
                                    onClick={() => {
                                        setToggleAddMemberForm(prev => !prev)
                                    }}
                                    className='flex items-center gap-2 hover:bg-(--dark) transition-all duration-300 cursor-pointer p-3 rounded-md'>
                                    Add New Member
                                    <Plus size={17} />
                                </button>
                            </div>

                            <div className="flex items-center mt-7">
                                <div className="w-9/12">
                                    {
                                        members?.map((member, key) => {
                                            return <div key={key} className="flex items-center gap-2 my-3">
                                                <span className="bg-linear-to-r from-(--darkest) to-(--light) text-(--darkest) font-extrabold p-3 rounded-r-full">{key + 1}</span>
                                                <p><span className="font-bold text-lg">{member.name}</span> / <span className="font-light">{member.email}</span></p>
                                                
                                                {
                                                    // Only the group creator can see REMOVE button for non-creator members
                                                    (groupCreator.id === user.id && groupCreator.id !== member.id) && 
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
                                                }
                                            </div>
                                        })
                                    }
                                </div>
                                    {
                                    toggleAddMemberForm &&
                                    <div className="flex-1">
                                        <RadioGroup className="border-2 border-(--input-border) rounded-lg p-5 w-full max-h-32 overflow-y-auto custom-scrollbar">
                                            {
                                                otherUsers.length > 0 ? <>
                                                    {otherUsers.map(user => <div key={user.id} className="flex items-center gap-3 my-2">
                                                    <RadioGroupItem 
                                                        value={user.id} id={`user_${user.id}`} 
                                                        onClick={() => setNewMemberID(user.id)}
                                                        className="border-2 border-(--input-border) w-5 h-5 hover:border-(--medium) data-checked:bg-(--medium) data-checked:border-(--medium) transition-colors" />
                                                    <Label htmlFor={`user_${user.id}`}><b>{user.name}</b> <span className="font-light">{user.email}</span></Label>
                                                </div>
                                                )}
                                                </> : <div className="flex items-center gap-2">
                                                        <X size={25} />
                                                        <span className="text-sm">You've added ALL available Users to the Group</span>
                                                    </div>
                                            }
                                        </RadioGroup>
                                        <button onClick={handleAddMember} className="flex items-center justify-center p-2 mt-2 w-full border-2 border-(--input-border) rounded-md cursor-pointer transition-all duration-300 text-(--light) hover:bg-(--light) hover:text-(--darkest) hover:tracking-widest">
                                            {
                                                isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Add</span>
                                            }
                                        </button>
                                    </div>
                                }
                            </div>

                            <hr className="text-(--input-border) my-7" />

                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold"><b>{group?.title}</b> Group Expenses</h1>
                                <button 
                                    onClick={() => {
                                        setToggleCreateExpenseForm(prev => !prev)
                                        setEditedExpense(null)
                                        setSelectedMemberIds([])
                                        setErrors(null)
                                    }}
                                    className='flex items-center gap-2 hover:bg-(--dark) transition-all duration-300 cursor-pointer p-3 rounded-md'>
                                    Create
                                    <Plus size={17} />
                                </button>
                            </div>

                            {/* CREATE EXPENSE FORM */}
                            <>
                                {
                                    toggleCreateExpenseForm && 
                                    <div className="my-7">
                                        <h2 className="my-2 text-lg font-bold">Creating a new Expense</h2>
                                        <form onSubmit={handleCreate}>
                                            <div className="flex items-center gap-2">
                                                <input type="text" ref={category} placeholder="Category..." required className={`w-2/3 border focus:ring-1 ${errors?.category ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} />
                                                <input type="number" step="0.01" min="5.01" ref={amount} placeholder="Amount..." required className={`w-1/3 border focus:ring-1 ${errors?.amount ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} />
                                            </div>
                                            <div className="flex items-center gap-2 my-2">
                                                <p className="w-2/3 text-(--danger) font-bold text-sm">{errors?.category && errors.category[0]}</p>
                                                <p className="w-1/3 text-(--danger) font-bold text-sm">{errors?.amount && errors.amount[0]}</p>
                                            </div>

                                            <div>
                                                <textarea placeholder="Description..." ref={description} required className={`w-full resize-none border focus:ring-1 ${errors?.description ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`}></textarea>
                                                <p className="text-(--danger) font-bold text-sm mt-1">{errors?.description && errors.description[0]}</p>
                                            </div>

                                            <h3 className="font-bold mb-4">Select Members</h3>
                                            <FieldGroup className="ml-2">
                                                {
                                                    members?.map(member => <Field key={member.id} orientation="horizontal">
                                                        <Checkbox 
                                                            id={`member_${member.id}`} 
                                                            onCheckedChange={(isChecked) => handleMemberToggle(member.id, isChecked)}
                                                            checked={selectedMemberIds.includes(member.id)}
                                                            className="data-checked:bg-(--light) data-checked:text-(--darkest)" />
                                                        <Label htmlFor={`member_${member.id}`}><b>{member.name}</b> <span className="font-light">{member.email}</span></Label>
                                                    </Field>)
                                                }
                                                <p className="text-(--danger) font-bold text-sm mt-1">{errors?.member_ids && errors.member_ids[0]}</p>
                                            </FieldGroup>

                                            <button type="submit" className="flex items-center justify-center w-1/10 p-1 my-3 border border-(--input-border) rounded-md cursor-pointer transition-all duration-300 text-(--light) hover:bg-(--light) hover:text-(--darkest) hover:tracking-widest">
                                                {
                                                    isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Create</span>
                                                }
                                            </button>
                                        </form>
                                    </div>
                                }
                            </>

                            {/* EDIT EXPENSE FORM */}
                            <>
                                {
                                    editedExpense && 
                                    <div className="my-7">
                                        <h2 className="my-2 text-lg font-bold">Editing an existing Expense</h2>
                                        <form onSubmit={handleEdit}>
                                            <div className="flex items-center gap-2">
                                                <input type="text" value={editedExpense.category} onChange={(e) => setEditedExpense({...editedExpense, category : e.target.value})} placeholder="Category..." required className={`w-2/3 border focus:ring-1 ${errors?.category ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} />
                                                <input type="number" value={editedExpense.amount} onChange={(e) => setEditedExpense({...editedExpense, amount : e.target.value})} step="0.01" min="5.01" placeholder="Amount..." required className={`w-1/3 border focus:ring-1 ${errors?.amount ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} />
                                            </div>
                                            <div className="flex items-center gap-2 my-2">
                                                <p className="w-2/3 text-(--danger) font-bold text-sm">{errors?.category && errors.category[0]}</p>
                                                <p className="w-1/3 text-(--danger) font-bold text-sm">{errors?.amount && errors.amount[0]}</p>
                                            </div>

                                            <div>
                                                <textarea placeholder="Description..." required value={editedExpense.description} onChange={(e) => setEditedExpense({...editedExpense, description : e.target.value})}
                                                    className={`w-full resize-none border focus:ring-1 ${errors?.description ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`}>
                                                </textarea>
                                                <p className="text-(--danger) font-bold text-sm mt-1">{errors?.description && errors.description[0]}</p>
                                            </div>

                                            <h3 className="font-bold mb-4">Select Members</h3>
                                            <FieldGroup className="ml-2">
                                                {
                                                    members?.map(member => <Field key={member.id} orientation="horizontal">
                                                        <Checkbox 
                                                            id={`member_${member.id}`} 
                                                            onCheckedChange={(isChecked) => handleMemberToggle(member.id, isChecked)}
                                                            checked={selectedMemberIds.includes(member.id)}
                                                            className="data-checked:bg-(--light) data-checked:text-(--darkest)" />
                                                        <Label htmlFor={`member_${member.id}`}><b>{member.name}</b> <span className="font-light">{member.email}</span></Label>
                                                    </Field>)
                                                }
                                                <p className="text-(--danger) font-bold text-sm">{errors?.member_ids && errors.member_ids[0]}</p>
                                            </FieldGroup>

                                            <button type="submit" className="flex items-center justify-center w-1/10 p-1 my-3 border border-(--input-border) rounded-md cursor-pointer transition-all duration-300 text-(--light) hover:bg-(--light) hover:text-(--darkest) hover:tracking-widest">
                                                {
                                                    isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Edit</span>
                                                }
                                            </button>
                                        </form>
                                    </div>
                                }
                            </>

                            <div className="grid grid-cols-3 gap-4 mt-7">
                                {
                                    expenses?.map(expense => {
                                        const isPayer = user?.id === expense.payer_id
                                        return <div key={expense.id} className="bg-(--dark) shadow-2xl rounded-md p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <div className="my-2">
                                                            <span className="py-1 px-2 font-bold bg-(--medium) text-(--darkest) rounded-lg">{expense.category}</span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <span>Expense Category</span>
                                                    </TooltipContent>
                                                </Tooltip>
                                                {
                                                    expense.payer_id === user?.id &&
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div className="my-2">
                                                                <span className="py-1 px-2 font-bold bg-(--darkest) text-(--light) rounded-lg">Payer</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <span>You were initially responsible for the cost of this Expense</span>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                }
                                            </div>

                                            <div className="flex justify-center items-center my-5">
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Link to={`/expenses/${expense.id}`}>
                                                            <h1 className="text-xl font-bold">{expense.description}</h1>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <span>View Expense Details</span>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>

                                            <div className="flex justify-center">
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <div className="bg-(--medium) text-(--darkest) p-2 rounded-lg flex items-center gap-2 mt-3">
                                                            <Banknote size={20} />
                                                            <span className="font-black ">{expense.amount}</span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        <span>Expense Amount</span>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>

                                            <div className="flex items-center justify-center gap-2 my-3">
                                                
                                                {
                                                    isPayer ? 
                                                    <>
                                                        <button 
                                                            onClick={() => {
                                                                setEditedExpense(expense)
                                                                setToggleCreateExpenseForm(false)
                                                                setErrors(null)
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
                                                                    <AlertDialogTitle>Delete <b>"{expense.description}"</b> Expense ?</AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-(--light)">
                                                                            This will permanently delete this expense as well as its related expenses splits.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogAction 
                                                                        onClick={() => handleDelete(expense.id)} 
                                                                        variant="destructive">
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
                                                                <span>Only the Payer CAN Edit this Expense</span>
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
                                                                <span>Only the Payer CAN Delete this Expense</span>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </>
                                                }
                                                
                                            </div>

                                            <p className="font-thin text-sm text-center">Edited <b>{expense.formatted_updated_at}</b></p>
                                        </div>
                                    })
                                }
                            </div>

                            <Toaster/>
                        </>
                    )
                }
            </div>
        </div>
    )
}