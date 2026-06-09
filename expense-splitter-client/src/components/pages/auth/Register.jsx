import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { Link } from "react-router-dom"
import SplentraSlogan from "../../../assets/SplentraSlogan.png"
import { CircleDollarSign } from "lucide-react"

export default function Register(){
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState(null)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password_confirmation, setPasswordConfirmation] = useState('')
    const { register } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {   
            setIsLoading(true)
            await register({name, email, password, password_confirmation})
        } catch (error) {
            setErrors(error.response.data)
        } finally {
            setIsLoading(false)
        }
    }

    return(
        <div className="flex items-center justify-around min-h-screen">
            <div>
                <img src={SplentraSlogan} alt="Splentra" className="w-140" />
            </div>
            <div className="border border-(--border-color) shadow-2xl rounded-md w-2/5 p-7 text-(--light) bg-(--dark)">
                <h1 className="text-center text-4xl font-bold mb-7">Let's get started !</h1>
                <p className="text-center font-thin">Please enter your informations</p>
                <h4 className="text-center text-(--danger) font-bold my-3">{errors?.message}</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input type="text" className="w-full border border-(--input-border) rounded-md p-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-(--medium) transition-all duration-300" onChange={(e) => setName(e.target.value)} placeholder="Name..." />
                        <p className="text-(--danger) font-bold text-sm mt-1">{errors?.errors?.name?.[0]}</p>
                    </div>

                    <div className="mb-3">
                        <input type="email" className="w-full border border-(--input-border) rounded-md p-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-(--medium) transition-all duration-300" onChange={(e) => setEmail(e.target.value)} placeholder="Email..." />
                        <p className="text-(--danger) font-bold text-sm mt-1">{errors?.errors?.email?.[0]}</p>
                    </div>
                    
                    <div className="mb-3">
                        <input type="password" className="w-full border border-(--input-border) rounded-md p-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-(--medium) transition-all duration-300" onChange={(e) => setPassword(e.target.value)} placeholder="Password..." />
                    </div>

                    <div className="mb-2">
                        <input type="password" className="w-full border border-(--input-border) rounded-md p-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-(--medium) transition-all duration-300" onChange={(e) => setPasswordConfirmation(e.target.value)} placeholder="confirm password..." />
                        <p className="text-(--danger) font-bold text-sm mt-1">{errors?.errors?.password?.[0]}</p>
                    </div>

                    {/* <input type="submit" value="Register" className="bg-(--light) text-(--darkest) w-full p-1 mt-7 rounded-md cursor-pointer hover:bg-white transition-all duration-300 hover:tracking-widest"/> */}
                    <button type="submit" className="flex items-center justify-center gap-2 bg-(--light) text-(--darkest) w-full p-1 mt-7 rounded-md cursor-pointer hover:bg-white transition-all duration-300 hover:tracking-widest">
                        Register
                        {
                            isLoading && <CircleDollarSign size={15} className='animate-spin'/>
                        }
                    </button>
                </form>
                <div className="text-center my-3 hover:underline">
                    <Link to='/login'>Already have an account ? Login</Link>
                </div>
            </div>
        </div>
    )
}
