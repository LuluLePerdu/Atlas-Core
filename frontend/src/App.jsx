import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Navbar from './components/shared/Navbar'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './pages/Dashboard'
import WeekPlanner from './pages/WeekPlanner'
import Workouts from './pages/Workouts'
import Recipes from './pages/Recipes'
import Templates from './pages/Templates'
import Account from './pages/Account'
import Budget from './pages/Budget'

function App() {
  const { user } = useAuthStore()

  return (
    <Router>
      <div className="min-h-screen bg-olympus-marble">
        {user && <Navbar />}
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/planner" 
            element={user ? <WeekPlanner /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/workouts" 
            element={user ? <Workouts /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/recipes" 
            element={user ? <Recipes /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/templates" 
            element={user ? <Templates /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/account" 
            element={user ? <Account /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/account" 
            element={user ? <Account /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/budget" 
            element={user ? <Budget /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
