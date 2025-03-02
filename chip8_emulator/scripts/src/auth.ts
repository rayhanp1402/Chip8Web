import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://pdxrwvlgtgjltiwmlcgw.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkeHJ3dmxndGdqbHRpd21sY2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDkyMzYsImV4cCI6MjA1NjQyNTIzNn0.qmVjSbg1mr8Xpa2TsWlDwvhQd9dnziTpKgBzaWCQQdw'
);

async function loginAndGetToken(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        console.error("Login error:", error.message);
        return null;
    }

    return data.session?.access_token; // JWT token
}

async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: "https://your-app.com/callback", // Change this to your app URL
        },
    });

    if (error) {
        console.error("Google login failed:", error);
    } else {
        console.log("Redirecting to Google login...");
    }
}

async function handleAuthRedirect() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Error retrieving session:", error);
    } else {
        console.log("User session:", data.session);
    }
}

async function getUserProfile() {
    const { data: user, error } = await supabase.auth.getUser();

    if (error) {
        console.error("Error fetching user:", error);
        return null;
    }

    console.log("User profile:", user);
    return user;
}
