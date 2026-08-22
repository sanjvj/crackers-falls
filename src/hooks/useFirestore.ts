import { useState, useEffect } from 'react';
import { subscribeCollection, subscribeSiteContentDoc } from '../lib/firestore';

export function useFirestoreCollection<T>(collectionName: string, fallback: T[] = []) {
  const [data, setData] = useState<T[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(`cf_override_${collectionName}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {}
    return fallback;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: max 1.2s loader display then unblock UI with fallback
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1200);

    const unsub = subscribeCollection<T>(collectionName, (items) => {
      if (isMounted) {
        if (items && items.length > 0) {
          setData(items);
        } else if (fallback && fallback.length > 0) {
          setData(fallback);
        } else {
          setData([]);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      unsub();
    };
  }, [collectionName]);

  return { data, setData, loading };
}

export function useSiteContent<T>(docId: string, fallback: T) {
  const [content, setContent] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: max 1.2s loader display
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1200);

    const unsub = subscribeSiteContentDoc<T>(docId, fallback, (data) => {
      if (isMounted) {
        if (data) setContent(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      unsub();
    };
  }, [docId, fallback]);

  return { content, setContent, loading };
}
