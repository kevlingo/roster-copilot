import { redirect } from 'next/navigation';

export default function Home() {
  // In a real app, we would check authentication status here
  // For the PoC, we'll redirect to the login page
  redirect('/login');
  
  // This code won't be reached due to the redirect
  return null;
}