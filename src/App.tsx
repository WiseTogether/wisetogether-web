import { Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css'
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './pages/Transactions';
import Settings from './components/Settings';
import Register from './auth/Register';
import Login from './auth/Login';
import AuthCallback from './auth/AuthCallback';
import ProtectedRoute from './auth/ProtectedRoute';
import RouteErrorBoundary from './components/error/RouteErrorBoundary';
import { useAuth, UserProfile } from './auth/AuthContext';
import { useEffect } from 'react';
import { createTransactionsApi } from './api/transactionsApi'
import { createSharedAccountApi } from './api/sharedAccountApi'
import { createUserApi } from './api/userApi';
import { Transaction } from './types/transaction';

export interface sharedAccount {
  uuid: string,
  user1Id: string,
  user2Id?: string,
  uniqueCode?: string,
}

interface PartnerDetails {
    name: string;
    avatar: string;
}

// Helper to format date as yyyy-MM-dd
function formatDateToYMD(dateString: string): string {
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

function App() {

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [invitationLink, setInvitationLink] = useState<string>('');
  const [isInvitedByPartner, setIsInvitedByPartner] = useState<boolean>(false);
  const [sharedAccountDetails, setSharedAccountDetails] = useState<sharedAccount|null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile|null>(null)

  const { session } = useAuth();
  const { apiRequest } = useAuth()
  const sharedAccountApi = createSharedAccountApi(apiRequest)
  const transactionsApi = createTransactionsApi(apiRequest)
  const userApi = createUserApi(apiRequest)

  // Fetch transactions and shared account details when the session changes
  useEffect(() => {

    const fetchTransactions = async () => {
      if (session && session.user) {
        try {
          let sharedAccount:sharedAccount|null = null;

          // Attempt to fetch shared account details for the user
          try {
            sharedAccount = await sharedAccountApi.findSharedAccountByUserId(session.user.id);

            // Create an invitation link for the shared account
            const link = `${import.meta.env.VITE_APP_BASE_URL}/invite?code=${sharedAccount.uniqueCode}`
            setInvitationLink(link);

            // Set the shared account details in state
            setSharedAccountDetails({ uuid: sharedAccount.uuid, user1Id: sharedAccount.user1Id })

            // If there is a second user, set shared account details
            if (sharedAccount.user2Id) {
              setSharedAccountDetails({ uuid: sharedAccount.uuid, user1Id: sharedAccount.user1Id, user2Id: sharedAccount.user2Id })
              setIsInvitedByPartner(true);
              
              // Fetch partner profile based on user1Id or user2Id
              try {
                const user = sharedAccount.user1Id === session.user.id ? 'user1' : 'user2'
                if (user === 'user1') {
                  const partnerDetails = await userApi.getUserProfile(sharedAccount.user2Id) as PartnerDetails;
                  setPartnerProfile({
                    name: partnerDetails.name.split(' ')[0],
                    avatarUrl: partnerDetails.avatar
                  });
                } else {
                  try {
                    const partnerDetails = await userApi.getUserProfile(sharedAccount.user1Id) as PartnerDetails;
                    setPartnerProfile({
                      name: partnerDetails.name.split(' ')[0],
                      avatarUrl: partnerDetails.avatar
                    });
                  } catch (error: any) {
                    console.error('Error fetching user1 profile:', error.message);
                  }
                }
              } catch (error: any) {
                console.error('Error fetching partner profile:', error.message);
              }
            }
          } catch (error:any) {
            console.error ('Shared account not found: ', error.message)
          }

          // Fetch transactions for the current user and shared account (if any)
          const transactions = await transactionsApi.fetchAllTransactionsById(session.user.id, sharedAccount ? sharedAccount.uuid : null);
          setAllTransactions(transactions.length > 0 ? transactions.map(t => ({ ...t, date: formatDateToYMD(t.date) })) : []);
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
                  <Dashboard 
                    invitationLink={invitationLink} 
                    setInvitationLink={setInvitationLink} 
                    isInvitedByPartner={isInvitedByPartner} 
                    allTransactions={allTransactions}
                  />
                </ProtectedRoute>
              </RouteErrorBoundary>
            } />
            <Route path="transactions" element={
              <RouteErrorBoundary>
                <ProtectedRoute>
                  <Transactions 
                    allTransactions={allTransactions} 
                    setAllTransactions={(transactions: Transaction[]) => setAllTransactions(transactions)} 
                    sharedAccountDetails={sharedAccountDetails} 
                    partnerProfile={partnerProfile}
                  />
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
          position="bottom-right"
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
