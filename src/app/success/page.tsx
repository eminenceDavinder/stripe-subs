'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { handleFetchSessionStatus } from '@lib/utils/axios.services';
import toast, { Toaster } from 'react-hot-toast';

export default function SuccessPage() {
  const [status, setStatus] = useState('loading');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const fetchSessionStatus = useCallback(async () => {
    const data = await handleFetchSessionStatus(sessionId as string);
    if (!data.success) {
        setStatus('failed');
        return toast.error(data.message);
      }
      setStatus('success');  
      return toast.success(data.message);  
  },[sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchSessionStatus();
    }
  }, [sessionId, fetchSessionStatus]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Failed to process subscription. Please try again.</div>;
  }

  return (
    <div>
      <Toaster/>
      <h1>Subscription Successful!</h1>
      <p>Thank you for your subscription. A confirmation email has been sent to .</p>
    </div>
  );
}