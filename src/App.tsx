import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css'
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import Register from './auth/Register';
import Login from './auth/Login';
import AuthCallback from './auth/AuthCallback';
import ProtectedRoute from './auth/ProtectedRoute';
import RouteErrorBoundary from './components/error/RouteErrorBoundary';
import { useAuth } from './auth/AuthContext';
import { FadeLoader } from 'react-spinners';

function App() {
  const { isLoading: isAuthLoading } = useAuth()

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <FadeLoader />
      </div>
    )
  }

  return (
    <div className='h-full'>
      <Routes>
        <Route path='/register' element={
          <RouteErrorBoundary>
            <Register />
          </RouteErrorBoundary>
        } />
        <Route path='/login' element={
          <RouteErrorBoundary>
            <Login />
          </RouteErrorBoundary>
        } />
        <Route path='/auth/callback' element={
          <RouteErrorBoundary>
            <AuthCallback />
          </RouteErrorBoundary>
        } />
        <Route path='/invite' element={
          <RouteErrorBoundary>
            <Register />
          </RouteErrorBoundary>
        } />
        <Route path='/' element={
          <RouteErrorBoundary>
            <Layout />
          </RouteErrorBoundary>
        }>
          <Route index element={
            <RouteErrorBoundary>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </RouteErrorBoundary>
          } />
          <Route path="transactions" element={
            <RouteErrorBoundary>
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            </RouteErrorBoundary>
          } />
          <Route path="settings" element={
            <RouteErrorBoundary>
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            </RouteErrorBoundary>
          } />
        </Route>
        <Route path="*" element={
          <RouteErrorBoundary>
            <Register />
          </RouteErrorBoundary>
        } />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}

export default App
