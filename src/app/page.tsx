import { redirect } from 'next/navigation'

/**
 * Root route — redirects authenticated users to the dashboard.
 * Auth middleware (task 2.2) will intercept unauthenticated requests
 * and redirect to /login before this ever runs.
 */
export default function RootPage() {
  redirect('/dashboard')
}
