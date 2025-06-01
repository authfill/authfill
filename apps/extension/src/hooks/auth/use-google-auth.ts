import { useCallback } from "react";

console.log(import.meta.env);

export function useGoogleAuth() {
  const authenticateGoogle = useCallback(() => {
    window.open(`${import.meta.env.PUBLIC_WEB_URL}/auth/google`);
  }, []);

  return { authenticateGoogle };
}
