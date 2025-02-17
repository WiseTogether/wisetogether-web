import { Routes, Route } from 'react-router-dom';
import './styles/App.css'
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Settings from './components/Settings';
import Register from './components/Register';
import Login from './components/Login';

function App() {

  return (
      <div>
        <Routes>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/' element={<Layout />}>
            <Route index element={<Dashboard />} /> {/* Default route */}
            <Route path="transactions" element={<Transactions />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
  )
}

export default App
