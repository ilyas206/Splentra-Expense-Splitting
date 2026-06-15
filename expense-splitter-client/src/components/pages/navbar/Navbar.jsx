import { CircleDollarSign, LayoutDashboard, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '/logo.png'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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
        <nav className='bg-(--dark) flex items-center justify-between px-6 md:px-10 py-3'>
            <div className='flex items-center gap-2'>
                <img src={Logo} alt="Logo" className="size-8 md:size-10" />
                <p className='app-name text-2xl md:text-4xl text-(--light) mt-3'>Splentra</p>
            </div>

            <div className="hidden md:flex items-center gap-10">
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

            <div className="block md:hidden">
                <DropdownMenu> 
                <DropdownMenuTrigger asChild>
                    <Menu className='text-(--light)' />
                </DropdownMenuTrigger>
                <DropdownMenuContent className='bg-(--dark)'>
                    <DropdownMenuItem>
                        <Link to={'/dashboard'} 
                            className='flex items-center justify-center w-full text-(--light) gap-2 cursor-pointer p-2'
                        >
                            Dashboard 
                            <LayoutDashboard />
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                        <button onClick={handleLogout} 
                        className='flex items-center justify-center w-full gap-2 transition-all duration-300 cursor-pointer p-2 rounded-md'
                        >
                            Logout
                            {
                                isLoading ? <CircleDollarSign className='animate-spin'/> : <LogOut />
                            }
                        </button>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>

        </nav>
    )
}