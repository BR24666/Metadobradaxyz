import { useEffect } from 'react'
export function useAutoStart() {
  useEffect(() => {
    fetch('/api/auto-start', { method: 'POST' });
  }, [])
}
