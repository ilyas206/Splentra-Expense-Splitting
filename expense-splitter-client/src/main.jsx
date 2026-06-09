import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/context/AuthContext'
import './index.css'
import Login from './components/pages/auth/Login.jsx'
import Register from './components/pages/auth/Register.jsx'
import Dashboard from './components/pages/dashboard/Dashboard.jsx'
import GroupDetail from './components/pages/dashboard/GroupDetail.jsx'
import ExpenseDetail from './components/pages/dashboard/ExpenseDetail.jsx'
import { TooltipProvider } from './components/ui/tooltip'

const GuestRoute = ({children}) => {
  const { token } = useAuth()
  return token ? <Navigate to='/dashboard' /> : children
}

const ProtectedRoute = ({children}) => {
  const { token } = useAuth()
  return token ? children : <Navigate to='/login' />
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <TooltipProvider>
      <AuthProvider>
        <Routes>
          <Route path='/register' element={<GuestRoute><Register/></GuestRoute>}/>
          <Route path='/login' element={<GuestRoute><Login/></GuestRoute>}/>
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
          <Route path='/groups/:id' element={<ProtectedRoute><GroupDetail/></ProtectedRoute>}/>
          <Route path='/expenses/:id' element={<ProtectedRoute><ExpenseDetail/></ProtectedRoute>}/>
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
)
