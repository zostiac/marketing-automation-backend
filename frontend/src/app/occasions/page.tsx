import { redirect } from 'next/navigation';

/** Kept for old bookmarks after the UI was aligned to the backend's calendar route. */
export default function OccasionsRedirect() {
  redirect('/calendar');
}
