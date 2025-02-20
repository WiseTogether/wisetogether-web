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

  // Fetch transactions and shared account details when the session changes
  useEffect(() => {

    const fetchTransactions = async () => {
      if (session && session.user) {
        try {
          let sharedAccount = null;

          // Attempt to fetch shared account details for the user
          try {
            sharedAccount = await findSharedAccountByUserId(session.user.id);

            // Create an invitation link for the shared account
            const link = `${import.meta.env.VITE_APP_BASE_URL}/invite?code=${sharedAccount.uniqueCode}`
            setInvitationLink(link);

            // Set the shared account details in state
            setSharedAccountDetails({ id: sharedAccount.uuid, user1Id: sharedAccount.user1Id })

            // If there is a second user, set shared account details
            if (sharedAccount.user2Id) {
              setSharedAccountDetails({ id: sharedAccount.uuid, user1Id: sharedAccount.user1Id, user2Id: sharedAccount.user2Id })
              setIsInvitedByPartner(true);
              
              // Fetch partner profile based on user1Id or user2Id
              try {
                const user = sharedAccount.user1Id === session.user.id ? 'user1' : 'user2'
                if (user === 'user1') {
                  const partnerDetails = await findProfileByUserId(sharedAccount.user2Id);
                  setPartnerProfile({
                    name: partnerDetails.name.split(' ')[0], // Get first name of partner
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

          // Fetch transactions for the current user and shared account (if any)
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
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/invite' element={<Register />} />
          <Route path='/' element={<Layout />}>
            <Route index element={<ProtectedRoute><Dashboard invitationLink={invitationLink} setInvitationLink={setInvitationLink} isInvitedByPartner={isInvitedByPartner} allTransactions={allTransactions}/></ProtectedRoute>} /> {/* Default route */}
            <Route path="transactions" element={<ProtectedRoute><Transactions allTransactions={allTransactions} setAllTransactions={setAllTransactions} sharedAccountDetails={sharedAccountDetails} partnerProfile={partnerProfile}/></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Register />} />
        </Routes>
      </div>
  )
}

export default App
