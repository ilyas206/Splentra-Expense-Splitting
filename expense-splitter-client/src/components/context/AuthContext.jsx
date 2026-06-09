import { createContext, useContext, useState, useEffect } from "react";
import { axiosClient } from "../../api/axios.js";

const AuthContext = createContext();

const savedToken = localStorage.getItem('token')
if(savedToken){
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
}

export function AuthProvider({ children }){
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Restore user data when app loads if token exists
    useEffect(() => {
        const restoreUser = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken && !user) {
                try {
                    const { data } = await axiosClient.get('/api/user');
                    setUser(data.user);
                } catch (error) {
                    console.error('Failed to restore user:', error);
                    // Clear invalid token
                    localStorage.removeItem('token');
                    delete axiosClient.defaults.headers.common['Authorization'];
                }
            }
        };
        restoreUser();
    }, []);

    const login = async (credentials) => {
        // 1. call POST /api/login
        await axiosClient.post('/api/login', credentials)
        .then(({data}) => {
            // 2. save token to localStorage
            localStorage.setItem('token', data.token)
            // 3. set axios default header for all subsequent requests automatically
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
            // 4. set user and token state
            setUser(data.user)
            setToken(data.token)
        }).catch((error) => {
            throw error
        })
    }

    const logout = async () => {
        // 1. call POST /api/logout
        await axiosClient.post('/api/logout')
        .then(() => {
            // 2. remove token from localStorage
            localStorage.removeItem('token')
            // 3. remove axios default header
            delete axiosClient.defaults.headers.common['Authorization']
            // 4. clear user and token state
            setUser(null)
            setToken(null)
        }).catch((error) => {
            throw error
        })
    }

    const register = async (data) => {
        // 1. call POST /api/register
        await axiosClient.post('/api/register', data)
        .then(({data}) => {
            // 2. save token to localStorage
            localStorage.setItem('token', data.token)
            // 3. set axios default header for all subsequent requests automatically
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
            // 4. set user and token state
            setUser(data.user)
            setToken(data.token)
        }).catch((error) => {
            throw error
        })
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext);
}