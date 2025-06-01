import { useCallback } from "react";

export function useGoogleAuth() {
  const authenticateGoogle = useCallback(() => {
    window.open(`${import.meta.env.PUBLIC_WEB_URL}/auth/google`);
  }, []);

  return { authenticateGoogle };
}
