import { axiosClient } from "@/api/axios"
import { useAuth } from "@/components/context/AuthContext"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useQueryClient } from "@tanstack/react-query"
import { Banknote, CircleDollarSign, Pen, Plus, Trash, Trash2Icon, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

export default function ExpensesList({group, members, expenses}){

    const [toggleCreateExpenseForm, setToggleCreateExpenseForm] = useState(false)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [editedExpense, setEditedExpense] = useState(null)
    const [selectedMemberIds, setSelectedMemberIds] = useState([])
    const [errors, setErrors] = useState(null)

    const queryClient = useQueryClient()

    const { user } = useAuth()

    const category = useRef()
    const description = useRef()
    const amount = useRef()
    const currency = useRef()

    useEffect(() => {
        const getExpenseSplits = async () => {
            if(editedExpense){
                const {data} = await axiosClient.get(`/api/expenses/${editedExpense.id}/splits`)
                const memberIds = data.expenseSplits.map(split => split.user_id)
                setSelectedMemberIds(memberIds)
            }
        }
        getExpenseSplits()
    }, [editedExpense?.id])

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
            const {data} = await axiosClient.post(`/api/groups/${group.id}/expenses`, {
                category : category.current.value,
                description : description.current.value,
                amount : amount.current.value,
                currency : currency.current.value,
                member_ids : selectedMemberIds
            })
            queryClient.invalidateQueries({ queryKey: ['group', group.id] })
            category.current.value = ''
            description.current.value = ''
            amount.current.value = ''
            currency.current.value = ''
            setSelectedMemberIds([])
            setErrors(null)
            toast.success(data.message, {
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
                currency : editedExpense.currency,
                member_ids : selectedMemberIds
            })
            queryClient.invalidateQueries({ queryKey: ['group', group.id] })
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
            queryClient.invalidateQueries({ queryKey: ['group', group.id] })
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

    const truncateWords = (text, maxWords) => {
    const words = text.split(' ');

    return words.length > maxWords
        ? words.slice(0, maxWords).join(' ') + '...'
        : text;
    }

    return <>
    <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-2xl font-bold">Group Expenses</h1>
        <button 
            onClick={() => {
                setToggleCreateExpenseForm(prev => !prev)
                setEditedExpense(null)
                setSelectedMemberIds([user?.id])
                setErrors(null)
            }}
            className='flex items-center gap-2 hover:bg-(--dark) text-sm md:text-lg transition-all duration-300 cursor-pointer p-3 rounded-md'>
            Create
            <Plus size={15} />
        </button>
    </div>

    {/* CREATE EXPENSE FORM */}
    <>
        {
            toggleCreateExpenseForm && 
            <div className="my-7">
                <h2 className="my-2 text-md md:text-lg font-bold">Creating a new Expense</h2>
                <form onSubmit={handleCreate}>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <input type="text" ref={category} placeholder="Category..." required className={`w-full md:w-5/10 border focus:ring-1 ${errors?.category ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} />
                        {
                            errors?.category && <p className="md:hidden w-full text-(--danger) font-bold text-sm">{errors.category[0]}</p>
                        }
                        <input type="number" step="0.01" min="5.01" ref={amount} placeholder="Amount ( e.g. 1000.00 )" required className={`w-full md:w-3/10 border focus:ring-1 ${errors?.amount ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} />
                        {
                            errors?.amount && <p className="md:hidden w-full text-(--danger) font-bold text-sm">{errors.amount[0]}</p>
                        } 
                        <input type="text" ref={currency} placeholder="Currency ( MAD , USD...)" required className={`w-full md:w-2/10 border focus:ring-1 ${errors?.currency ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} />
                        {
                            errors?.currency && <p className="md:hidden w-full text-(--danger) font-bold text-sm">{errors.currency[0]}</p>
                        } 
                    </div>
                    {/* This layout is only displayed for medium screens and above */}
                    <div className="hidden md:flex items-center gap-2 my-2">
                        <p className="w-5/10 text-(--danger) font-bold text-sm">{errors?.category && errors.category[0]}</p>
                        <p className="w-3/10 text-(--danger) font-bold text-sm">{errors?.amount && errors.amount[0]}</p>
                        <p className="w-2/10 text-(--danger) font-bold text-sm">{errors?.currency && errors.currency[0]}</p>
                    </div>

                    <div>
                        <textarea placeholder="Description..." ref={description} required className={`w-full resize-none border focus:ring-1 ${errors?.description ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 mt-2 md:mt-0 outline-none placeholder:text-sm transition-all duration-300`}></textarea>
                        <p className="text-(--danger) font-bold text-sm mt-1">{errors?.description && errors.description[0]}</p>
                    </div>

                    <h3 className="text-sm md:text-lg font-bold mb-4">Select Members</h3>
                    <FieldGroup className="ml-2">
                        {
                            members?.map(member => <Field key={member.id} orientation="horizontal">
                                <Checkbox 
                                    id={`member_${member.id}`} 
                                    onCheckedChange={(isChecked) => handleMemberToggle(member.id, isChecked)}
                                    checked={selectedMemberIds.includes(member.id) || member.id === user?.id}
                                    disabled={member.id === user?.id}
                                    className="data-checked:bg-(--light) data-checked:text-(--darkest)" />
                                <Label htmlFor={`member_${member.id}`}><b>{member.name}</b> <span className="font-light">{member.email}</span></Label>
                            </Field>)
                        }
                        <p className="text-(--danger) font-bold text-sm mt-1">{errors?.member_ids && errors.member_ids[0]}</p>
                    </FieldGroup>

                    <button type="submit" className="flex items-center justify-center w-full md:w-1/10 p-1 my-3 border border-(--input-border) rounded-md cursor-pointer transition-all duration-300 text-(--light) hover:bg-(--light) hover:border-(--light) hover:text-(--darkest) hover:tracking-widest">
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
                <h2 className="my-2 text-md md:text-lg font-bold">Editing an existing Expense</h2>
                <form onSubmit={handleEdit}>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <input type="text" value={editedExpense.category} onChange={(e) => setEditedExpense({...editedExpense, category : e.target.value})} placeholder="Category..." required className={`w-full md:w-5/10 border focus:ring-1 ${errors?.category ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} />
                        {
                            errors?.category && <p className="md:hidden w-full text-(--danger) font-bold text-sm">{errors.category[0]}</p>
                        }
                        <input type="number" value={editedExpense.amount} onChange={(e) => setEditedExpense({...editedExpense, amount : e.target.value})} step="0.01" min="5.01" placeholder="Amount..." required className={`w-full md:w-3/10 border focus:ring-1 ${errors?.amount ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} />
                        {
                            errors?.amount && <p className="md:hidden w-full text-(--danger) font-bold text-sm">{errors.amount[0]}</p>
                        } 
                        <input type="text" value={editedExpense.currency} onChange={(e) => setEditedExpense({...editedExpense, currency : e.target.value})} placeholder="Currency ( MAD , USD...)" required className={`w-full md:w-2/10 border focus:ring-1 ${errors?.currency ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 outline-none placeholder:text-sm transition-all duration-300`} />
                        {
                            errors?.currency && <p className="md:hidden w-full text-(--danger) font-bold text-sm">{errors.currency[0]}</p>
                        } 
                    </div>
                    {/* This layout is only displayed for medium screens and above */}
                    <div className="hidden md:flex items-center gap-2 my-2">
                        <p className="w-5/10 text-(--danger) font-bold text-sm">{errors?.category && errors.category[0]}</p>
                        <p className="w-3/10 text-(--danger) font-bold text-sm">{errors?.amount && errors.amount[0]}</p>
                        <p className="w-2/10 text-(--danger) font-bold text-sm">{errors?.currency && errors.currency[0]}</p>
                    </div>

                    <div>
                        <textarea placeholder="Description..." required value={editedExpense.description} onChange={(e) => setEditedExpense({...editedExpense, description : e.target.value})}
                            className={`w-full resize-none border focus:ring-1 ${errors?.description ? 'border-(--danger) focus:ring-(--danger)' : 'border-(--input-border) focus:ring-(--medium)'} rounded-md p-2 mt-2 md:mt-0 outline-none placeholder:text-sm transition-all duration-300`}>
                        </textarea>
                        <p className="text-(--danger) font-bold text-sm mt-1">{errors?.description && errors.description[0]}</p>
                    </div>

                    <h3 className="text-sm md:text-lg font-bold mb-4">Select Members</h3>
                    <FieldGroup className="ml-2">
                        {
                            members?.map(member => <Field key={member.id} orientation="horizontal">
                                <Checkbox 
                                    id={`member_${member.id}`} 
                                    onCheckedChange={(isChecked) => handleMemberToggle(member.id, isChecked)}
                                    checked={selectedMemberIds.includes(member.id)}
                                    disabled={member.id === editedExpense.payer_id}
                                    className="data-checked:bg-(--light) data-checked:text-(--darkest)" />
                                <Label htmlFor={`member_${member.id}`}><b>{member.name}</b> <span className="font-light">{member.email}</span></Label>
                            </Field>)
                        }
                        <p className="text-(--danger) font-bold text-sm">{errors?.member_ids && errors.member_ids[0]}</p>
                    </FieldGroup>

                    <button type="submit" className="flex items-center justify-center w-full md:w-1/10 p-1 my-3 border border-(--input-border) rounded-md cursor-pointer transition-all duration-300 text-(--light) hover:bg-(--light) hover:border-(--light) hover:text-(--darkest) hover:tracking-widest">
                        {
                            isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Edit</span>
                        }
                    </button>
                </form>
            </div>
        }
    </>

    {
        expenses?.length > 0 ? <div className="grid grid-col-1 md:grid-cols-3 gap-4 mt-7">
            {
                expenses.map(expense => {
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
                            isPayer &&
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
                                    <h1 className="text-xl font-bold">{truncateWords(expense.description, 7)}</h1>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span>View Expense Details</span>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="flex items-center justify-center">
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="bg-(--medium) text-(--darkest) p-2 rounded-lg flex items-center gap-2 mt-3">
                                    <Banknote size={20} />
                                    <span className="font-black">{expense.amount}</span>
                                    <span className="font-black">{expense.currency}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
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
                                        setSelectedMemberIds([])
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
        </div> : <div className="flex items-center justify-center gap-3 min-h-96 w-8/10 mx-auto">
            <X size={30} />
            <h2 className="text-md md:text-2xl font-bold">No {group?.title} Group Expenses so far</h2>
        </div>
        
    }
    </>
}