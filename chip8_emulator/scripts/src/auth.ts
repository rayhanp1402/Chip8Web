import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export async function signInWithGoogle() {
    console.log("Sign in attempted");
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });

    if (error) console.error("Login failed:", error.message);
}

export async function signOut() {
    console.log("Sign out attempted");

    const { error } = await supabase.auth.signOut();
    if (error) { 
        console.error("Logout failed:", error.message);
    } else {
        window.location.reload();
    }
  }
  