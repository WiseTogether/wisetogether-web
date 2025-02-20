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
import { useAuth, UserProfile } from './components/Auth/AuthContext';
import { useEffect } from 'react';
import { fetchAllTransactionsById } from './api/transactionsApi'
import { findSharedAccountByUserId } from './api/sharedAccountApi'
import { findProfileByUserId } from './api/userApi';

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

export interface sharedAccount {
  id: string,
  user1Id: string,
  user2Id?: string,
}

function App() {

  const [allTransactions, setAllTransactions] = useState<transaction[]>([]);
  const [invitationLink, setInvitationLink] = useState<string>('');
  const [isInvitedByPartner, setIsInvitedByPartner] = useState<boolean>(false);
  const [sharedAccountDetails, setSharedAccountDetails] = useState<sharedAccount|null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile|null>(null)

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

            setSharedAccountDetails({ id: sharedAccount.uuid, user1Id: sharedAccount.user1Id })
            if (sharedAccount.user2Id) {
              setSharedAccountDetails({ id: sharedAccount.uuid, user1Id: sharedAccount.user1Id, user2Id: sharedAccount.user2Id })
              setIsInvitedByPartner(true);

              try {
                const user = sharedAccount.user1Id === session.user.id ? 'user1' : 'user2'
                if (user === 'user1') {
                  const partnerDetails = await findProfileByUserId(sharedAccount.user2Id);
                  setPartnerProfile({
                    name: partnerDetails.name.split(' ')[0],
                    avatarUrl: partnerDetails.avatar
                  });
                } else {
                  const partnerDetails = await findProfileByUserId(sharedAccount.user1Id);
                  setPartnerProfile({
                      name: partnerDetails.name.split(' ')[0],
                      avatarUrl: partnerDetails.avatar
                  });
                }
              } catch (error:any) {
                  console.error('Error fetching partner profile: ', error.message);
              }
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
            <Route path="transactions" element={<ProtectedRoute><Transactions allTransactions={allTransactions} setAllTransactions={setAllTransactions} sharedAccountDetails={sharedAccountDetails} partnerProfile={partnerProfile}/></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Route>
        </Routes>
      </div>
  )
}

export default App
