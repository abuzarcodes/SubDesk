import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';

export function useUserSettings() {
  const [profile, setProfile] = useState<{ username: string; email: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({ username: '', email: '' });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await apiClient.getUserProfile(abortControllerRef.current.signal);
      
      if (response.success) {
        setProfile(response.data);
        setFormData({ username: response.data.username, email: response.data.email });
      } else {
        setError("Failed to load profile.");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'An error occurred fetching profile.');
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.username.trim() || !formData.email.includes('@')) {
        setError('Please provide a valid username and email.');
        return false;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
        const response = await apiClient.updateUserProfile(formData);
        if (response.success) {
            setSuccess(true);
            setProfile(response.data);
            setTimeout(() => setSuccess(false), 3000); // clear success msg after 3s
            return true;
        } else {
            setError('Failed to update profile.');
            return false;
        }
    } catch (err: any) {
        setError(err.message || 'An error occurred saving profile.');
        return false;
    } finally {
        setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    error,
    success,
    formData,
    setFormData,
    handleSubmit,
    refetch: fetchProfile
  };
}
