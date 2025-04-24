'use client'
import { useSearchParams } from 'next/navigation';

export default function AccountPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Account</h1>
      {status === 'success' && <p className="text-green-600">Subscription successful! 🎉</p>}
      {status === 'cancel' && <p className="text-red-600">Checkout was canceled.</p>}
    </div>
  );
}
