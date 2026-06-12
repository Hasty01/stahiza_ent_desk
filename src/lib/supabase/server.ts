import { createServerClient } from "@supabase/ssr";

export function createClient(cookieStore?: any) {
  const url = 
    (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_SUPABASE_URL : "") || 
    (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : "") ||
    ((import.meta as any).env?.VITE_SUPABASE_URL) || 
    "";

  const anonKey = 
    (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : "") || 
    (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : "") ||
    ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
    "";

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        if (!cookieStore) return [];
        if (typeof cookieStore.getAll === "function") {
          return cookieStore.getAll();
        }
        return Object.entries(cookieStore).map(([name, value]: [string, any]) => ({
          name,
          value: typeof value === "string" ? value : String(value),
        }));
      },
      setAll(cookiesToSet) {
        if (!cookieStore) return;
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (typeof cookieStore.set === "function") {
              cookieStore.set(name, value, options);
            } else {
              cookieStore[name] = value;
            }
          });
        } catch (error) {
          // Ignore Server Component read-only exceptions
        }
      },
    },
  });
}
