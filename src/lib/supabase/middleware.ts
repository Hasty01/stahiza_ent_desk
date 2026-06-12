import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: any, responseObj?: any) {
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

  if (!url || !anonKey) return responseObj;

  const supabaseServer = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies?.getAll?.() || [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies?.set?.(name, value);
          responseObj?.cookies?.set?.(name, value, options);
        });
      },
    },
  });

  // Refreshes session if needed securely
  await supabaseServer.auth.getUser();

  return responseObj;
}
