import { Routes, Route } from 'react-router-dom';
import './styles/App.css'
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Settings from './components/Settings';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {

  return (
      <div className='h-full'>
        <Routes>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/invite' element={<Register />}></Route>
          <Route path='/' element={<Layout />}>
            <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> {/* Default route */}
            <Route path="transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Route>
        </Routes>
      </div>
  )
}

export default App
