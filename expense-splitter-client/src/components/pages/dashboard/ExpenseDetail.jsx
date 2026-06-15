import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import { CircleDollarSign, CircleQuestionMark, DollarSign, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/components/context/AuthContext";
import { useParams } from "react-router-dom";
import { axiosClient } from "@/api/axios";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ExpenseDetail(){

    const [isLoading, setIsLoading] = useState(false)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [expense, setExpense] = useState(null)
    const [expensePayer, setExpensePayer] = useState(null)
    const [expenseGroup, setExpenseGroup] = useState(null)
    const [expenseSplits, setExpenseSplits] = useState([])
    const [memberSplit, setMemberSplit] = useState(null)
    const [isPayer, setIsPayer] = useState(false)
    const { user } = useAuth()

    const { id } = useParams()

    useEffect(() => {
        const getExpense = async () => {
            try{
                setIsLoading(true)
                const {data} = await axiosClient.get(`/api/expenses/${id}`)
                setExpense(data.expense)
                setExpensePayer(data.expense.user)
                setExpenseGroup(data.expense.group)
                setIsPayer(data.expense.payer_id === user?.id)
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
        const getExpenseSplits = async () => {
            try{
                setIsLoading(true)
                const {data} = await axiosClient.get(`/api/expenses/${id}/splits`)
                setExpenseSplits(data.expenseSplits)
                const currentUserSplit = data.expenseSplits.find(split => split.user_id === user?.id)
                setMemberSplit(currentUserSplit)
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
        getExpense()
        getExpenseSplits()
    }, [user, id])

    const isPaidClasses = (split) => {
        const isSplitMemberPayer = expense?.payer_id === split.user_id

        if(isSplitMemberPayer){
            return 'flex items-center justify-center gap-2 bg-linear-to-tr from-(--darkest) to-(--warning) text-(--light) border-2 border-(--border-color) font-extrabold text-sm md:text-base w-25 h-8 md:w-30 md:h-10 rounded-full'
        }else if(split.is_paid && !isSplitMemberPayer){
            return 'flex items-center justify-center gap-2 bg-linear-to-tr from-(--darkest) to-(--dark) text-(--light) border-2 border-(--border-color) font-extrabold text-sm md:text-base w-25 h-8 md:w-30 md:h-10 rounded-full'
        }else{
            return 'cursor-pointer flex items-center justify-center gap-2 bg-linear-to-tr from-(--darkest) to-(--danger) text-(--light) border-2 border-(--border-color) font-extrabold text-sm md:text-base w-25 h-8 md:w-30 md:h-10 rounded-full'
        }
    }

    const unknownPaidClasses = (split) => {
        if(expense?.payer_id === split.user_id){
            return 'flex items-center justify-center gap-2 bg-linear-to-tr from-(--darkest) to-(--warning) text-(--light) border-2 border-(--border-color) font-extrabold text-sm md:text-base w-25 h-8 md:w-30 md:h-10 rounded-full'
        }else{
            return 'flex items-center justify-center gap-2 bg-linear-to-tr from-(--darkest) to-(--input-border) text-(--light) border-2 border-(--border-color) font-extrabold text-sm md:text-base w-25 h-8 md:w-30 md:h-10 rounded-full'
        }
    }

    const isPaidTooltip = (split) => {
        const isSplitExpensePayer = expense?.payer_id === split.user_id

        if(isSplitExpensePayer){
            return 'You Are The Payer So Your Split Is Already Paid'
        }else if(split.is_paid && !isSplitExpensePayer){
            return 'This Member Has Paid Their Split'
        }else{
            return 'This Member Has NOT Paid Their Split Yet'
        }
    }

    const handleMarkAsPaid = async () => {
        try{
                setIsActionLoading(true)
                const {data} = await axiosClient.put(`/api/expense_splits/${memberSplit.id}`)
                const updatedSplit = {...memberSplit, is_paid : true}
                setMemberSplit(updatedSplit)
                setExpenseSplits(expenseSplits.map(split => 
                    split.id === memberSplit.id ? updatedSplit : split
                ))
                toast.success(data.message, {
                    style : {
                        background : "var(--dark)",
                        color : "var(--light)",
                        border : "1px solid var(--input-border)"
                    }
                })
            }catch(error){
                toast.warning(error.response.data, {
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
                            <Breadcrumb className="mb-6 mx-auto md:mx-0">
                                <BreadcrumbList className="text-(--light)">
                                    <BreadcrumbItem>
                                        <BreadcrumbLink className="hover:text-(--medium) text-xs md:text-base" href="/dashboard">Groups</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink className="hover:text-(--medium) text-xs md:text-base" href={`/groups/${expenseGroup?.id}`}>{expenseGroup?.title} Group</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-(--medium) text-xs md:text-base">{expense?.category} Expense</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>

                            <div className="flex flex-col md:flex-row gap-7 items-center justify-between">
                                <div className="flex flex-col text-center md:text-left gap-2">
                                    <h1 className="text-4xl font-bold"><b>{expense?.category}</b> Expense</h1>
                                    <p className="text-sm font-light">{expense?.description}</p>
                                    <p className="text-sm font-light">Amount <span className="text-3xl font-medium">{expense?.amount}</span></p>
                                </div>
                                <div className="flex flex-col gap-3 md:gap-4">
                                    <div className="flex text-center flex-1">
                                        <span className="bg-linear-to-r from-(--medium) to-(--dark) text-(--darkest) text-sm md:text-lg p-2 rounded-lg w-full">Paid by <b>{expensePayer?.id === user?.id ? 'Me' : expensePayer?.name}</b></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <span className="bg-(--medium) text-(--darkest) text-sm md:text-lg p-2 rounded-lg">Edited <b>{expense?.formatted_updated_at}</b></span>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <span>Last Expense Edit</span>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <span className="bg-(--dark) text-(--light) text-sm md:text-lg p-2 rounded-lg">Created <b>{expense?.formatted_created_at}</b></span>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <span>Expense Creation</span>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>

                            <hr className="text-(--input-border) my-7" />

                            {
                                isPayer ? <>
                                    <h1 className="text-md md:text-xl font-bold text-center md:text-left">Splits Status for Members ({expenseSplits?.length} Splits)</h1>
                                    <div className={`${expenseSplits.length > 2 ? 'grid grid-col-1 mx-auto md:mx-0 md:grid-cols-3' : 'flex flex-col md:flex-row mx-auto md:mx-0 md:items-center md:justify-around'} mt-7`}>
                                        {
                                            expenseSplits?.map((split, key) => {
                                                return <div key={key} className="flex items-center gap-3 my-3">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <span className={isPaidClasses(split)}>{split.is_paid ? <DollarSign size={20}/> : <X size={20}/>} {split.share_amount}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <span>{isPaidTooltip(split)}</span>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <p><span className="font-bold text-sm md:text-lg">{split.user.name}</span> / <span className="font-light text-sm md:text-lg">{split.user.email}</span></p>
                                                </div>
                                            })
                                        }
                                    </div>
                                </> : <>
                                    <h1 className="text-md md:text-xl font-bold text-center md:text-left">Expense Members</h1>
                                    <div className={`${expenseSplits.length > 2 ? 'grid grid-col-1 mx-auto md:mx-0 md:grid-cols-3' : 'flex flex-col md:flex-row mx-auto md:mx-0 md:items-center md:justify-around'} mt-7`}>
                                        {
                                            expenseSplits?.map((split, key) => {
                                                if(split.user_id === user?.id){
                                                    return <div key={key} className="flex items-center gap-3 my-3">
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                {
                                                                    !split.is_paid ? <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <span className={isPaidClasses(split)}><X size={20}/> {split.share_amount}</span>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent size="sm" className="bg-(--darker) text-(--light)">
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogMedia className="bg-(--light)/10 text-(--light)/90 dark:bg-(--light)/20 dark:text-(--light)">
                                                                                    <DollarSign />
                                                                                </AlertDialogMedia>
                                                                                <AlertDialogTitle>Mark my Split as Paid ?</AlertDialogTitle>
                                                                                    <AlertDialogDescription className="text-(--light)">
                                                                                        This action is irreversible.
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogAction 
                                                                                    onClick={handleMarkAsPaid} 
                                                                                    variant="outlined"
                                                                                    className="bg-(--light)/10 text-(--light)/90 hover:bg-(--dark) transition-all duration-300">
                                                                                        {
                                                                                            isActionLoading ? <CircleDollarSign size={20} className='animate-spin'/> : <span>Mark</span>
                                                                                        }
                                                                                </AlertDialogAction>
                                                                                <AlertDialogCancel className="text-(--light) hover:bg-(--dark) transition-all duration-300" variant="outlined">Cancel</AlertDialogCancel>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog> : <span className={isPaidClasses(split)}><DollarSign size={20} /> {split.share_amount}</span>
                                                                }
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <span>{split.is_paid ? 'You Already Have Paid Your Split' : 'You Have NOT Paid Your Split Yet , Pay NOW ?'}</span>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <p><span className="font-bold text-sm md:text-lg">{split.user.name}</span> / <span className="font-light text-sm md:text-lg">{split.user.email}</span></p>
                                                    </div>
                                                }else{
                                                    const isSplitExpensePayer = split.user_id === expense?.payer_id
                                                    return <div key={key} className="flex items-center gap-3 my-3">
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <span className={unknownPaidClasses(split)}>{isSplitExpensePayer ? <DollarSign size={20} /> : <CircleQuestionMark size={20} />} {split.share_amount}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <span>{isSplitExpensePayer ? split.user.name + ' Is The Payer So His Split Is Already Paid' : 'You Cannot See Other Members Payment Status'}</span>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <p><span className="font-bold text-sm md:text-lg">{split.user.name}</span> / <span className="font-light text-sm md:text-lg">{split.user.email}</span></p>
                                                    </div>
                                                }
                                            })
                                        }
                                    </div>
                                </>
                            }

                            <Toaster/>
                        </>
                    )
                }
            </div>
        </div>
    )
}


