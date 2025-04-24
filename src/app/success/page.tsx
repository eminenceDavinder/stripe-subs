'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';

export default function SuccessPage() {
    const {userInfo: {access_token}} = useSelector((store: RootState) => store.user);
  const [status, setStatus] = useState('loading');
  const [customerEmail, setCustomerEmail] = useState('');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetchSessionStatus();
    }
  }, [sessionId]);

  async function fetchSessionStatus() {
    try{

        const {data} = await axios.post('/api/check-session',{ sessionId: sessionId },{headers : { Authorization: `Bearer ${access_token}`}})
        const { session, error } = data;

    if (error) {
        setStatus('failed');
        console.error(error);
        return;
      }
  
      setStatus(session.status);
      setCustomerEmail(session.customer_email);
    }catch(err){
        if(isAxiosError(err)){
            const data : {message: string} = err.response?.data
            console.log(data.message);
        }
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Failed to process subscription. Please try again.</div>;
  }

  return (
    <div>
      <h1>Subscription Successful!</h1>
      <p>Thank you for your subscription. A confirmation email has been sent to {customerEmail}.</p>
    </div>
  );
}