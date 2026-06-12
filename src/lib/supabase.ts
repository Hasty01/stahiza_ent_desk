/**
 * Supabase Connection Module
 * 
 * Configured so that STAHIZA Ent Desk runs immediately in the AI Studio container sandbox
 * using our full-stack Express API fallback, but will automatically connect to your
 * production Supabase backend once you define SUPABASE_URL and SUPABASE_ANON_KEY 
 * in your secrets or .env.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Fallback local API Layer
 * Ensures absolute uptime and compatibility during the review
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("stahiza_auth_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};
