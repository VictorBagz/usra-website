// Supabase Client Initialization
// Replace the placeholders below with your Supabase project credentials.
// Get them from: https://app.supabase.com/project/_/settings/api

const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://ycdsyaenakevtozcomgk.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZHN5YWVuYWtldnRvemNvbWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzczMjAsImV4cCI6MjA3MjA1MzMyMH0.BxT4n22lnBEDL0TA7LNqIyti0LJ4dxGMgx5tOZiqQzE';

// Load via CDN in index.html: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
const supabase = window.supabase && window.supabase.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

async function getCurrentUser() {
	const { data: { user } } = await supabase.auth.getUser();
	return user;
}

async function signInWithEmail(email, password) {
	return supabase.auth.signInWithPassword({ email, password });
}

async function signUpWithEmail(email, password, metadata = {}) {
	return supabase.auth.signUp({ email, password, options: { data: metadata } });
}

async function signOut() {
	return supabase.auth.signOut();
}

window.USRA = {
	supabase,
	getCurrentUser,
	signInWithEmail,
	signUpWithEmail,
	signOut
};
