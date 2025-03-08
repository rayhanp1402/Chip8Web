import { createClient } from '@supabase/supabase-js';

export const SUPABASE = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export async function signInWithGoogle() {
    const { data, error } = await SUPABASE.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });

    if (error) console.error("Login failed:", error.message);
}

export async function signOut() {
    const { error } = await SUPABASE.auth.signOut();
    if (error) { 
        console.error("Logout failed:", error.message);
    } else {
        window.location.reload();
    }
  }
  