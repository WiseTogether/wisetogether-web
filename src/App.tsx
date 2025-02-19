import { Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import './styles/App.css'
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Settings from './components/Settings';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { useAuth } from './components/Auth/AuthContext';
import { useEffect } from 'react';
import { fetchAllTransactionsById } from './api/transactionsApi'
import { findSharedAccountByUserId } from './api/sharedAccountApi'

export interface transaction {
  sharedAccountId?: string,
  userId: string,
  date:string,
  amount:string,
  category:string,
  description?:string,
  splitType?:string,
  splitDetails?: { [key:string]:number }
}; 

function App() {

  const [allTransactions, setAllTransactions] = useState<transaction[]>([]);
  const [invitationLink, setInvitationLink] = useState<string>('');
  const [isInvitedByPartner, setIsInvitedByPartner] = useState<boolean>(false)

  const { session } = useAuth();

  useEffect(() => {

    const fetchTransactions = async () => {
      if (session && session.user) {
        try {
          let sharedAccount = null;
          try {
            sharedAccount = await findSharedAccountByUserId(session.user.id);
            const link = `http://localhost:5173/invite?code=${sharedAccount.uniqueCode}`
            setInvitationLink(link);
            if (sharedAccount.user2Id) {
              setIsInvitedByPartner(true);
            }
          } catch (error:any) {
            console.error ('Shared account not found: ', error.message)
          }

          const transactions = await fetchAllTransactionsById(session.user.id, sharedAccount ? sharedAccount.uuid : null);
          setAllTransactions(transactions.length > 0 ? transactions : []);
        } catch (error:any) {
          console.error('Error fetching transactions: ', error.message);
        }
      }
    }

    fetchTransactions();
  }, [session])

  return (
      <div className='h-full'>
        <Routes>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/invite' element={<Register />}></Route>
          <Route path='/' element={<Layout />}>
            <Route index element={<ProtectedRoute><Dashboard invitationLink={invitationLink} setInvitationLink={setInvitationLink} isInvitedByPartner={isInvitedByPartner} allTransactions={allTransactions}/></ProtectedRoute>} /> {/* Default route */}
            <Route path="transactions" element={<ProtectedRoute><Transactions allTransactions={allTransactions} setAllTransactions={setAllTransactions}/></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Route>
        </Routes>
      </div>
  )
}

export default App
