import { CircleDollarSign, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '/logo.png'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar(){
    const [isLoading, setIsLoading] = useState(false)
    const { logout } = useAuth()

    const handleLogout = async () => {
        try {   
            setIsLoading(true)
            await logout()
        } catch (error) {
            console.log(error.response.data)
        } finally {
            setIsLoading(false)
        }
    }

    return(
        <nav className='bg-(--dark) flex items-center justify-between px-10 py-3'>
            <div className='flex items-center gap-2'>
                <img src={Logo} alt="Logo" className="size-10" />
                <p className='app-name text-4xl text-(--light) mt-3'>Splentra</p>
            </div>

            <div className="flex items-center gap-10">
                <Link to={'/dashboard'} className='flex items-center gap-2 text-(--light) hover:bg-(--darkest) transition-all duration-300 cursor-pointer p-2 rounded-md'>
                    Dashboard 
                    <LayoutDashboard size={15} />
                </Link>
                <button onClick={handleLogout} className='flex items-center gap-2 text-(--light) hover:bg-(--darkest) transition-all duration-300 cursor-pointer p-2 rounded-md'>
                    Logout
                    {
                        isLoading ? <CircleDollarSign size={15} className='animate-spin'/> : <LogOut size={15} />
                    }
                </button>
            </div>
        </nav>
    )
}