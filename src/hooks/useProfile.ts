import { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  organization: string | null;
  phoneNumber: string | null;
  address: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  phoneNumber: string;
  address: string;
}

const API_BASE_URL = '/api';

export const useProfile = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получаем ID пользователя из сессии или используем email как уникальный идентификатор
  const getUserId = () => {
    console.log('=== DEBUG SESSION ===');
    console.log('Full session:', session);
    console.log('Session user:', session?.user);
    console.log('Session email:', session?.user?.email);
    console.log('Session name:', session?.user?.name);
    console.log('===================');

    if (session?.user?.email) {
      const userId = session.user.email.replace('@', '_at_').replace(/\./g, '_');
      console.log('✅ Generated user ID:', userId, 'from email:', session.user.email);
      return userId;
    }
    console.log('❌ No session email, using default-user');
    return 'default-user';
  };

  // Загрузить профиль
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/user/profile/${getUserId()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

    // Обновить профиль
  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Updating profile with data:', data);

      const response = await fetch(`${API_BASE_URL}/user/profile/${getUserId()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update failed:', errorText);
        throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
      }

      const updatedProfile = await response.json();
      console.log('Profile updated successfully:', updatedProfile);
      setProfile(updatedProfile);

      // Имя будет обновлено автоматически через useProfile в UserDropdown
      console.log('Profile updated successfully, header will update automatically');

      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

    // Загрузить аватар
  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Uploading avatar:', file.name, file.size);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/user/profile/${getUserId()}/avatar`, {
        method: 'POST',
        body: formData,
      });

      console.log('Avatar upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Avatar upload failed:', errorText);
        throw new Error(`Failed to upload avatar: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Avatar uploaded successfully:', data);
      setProfile(data.user);
      return data.avatarUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error uploading avatar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

    // Сбросить аватар
  const resetAvatar = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Making DELETE request to reset avatar...');

      const response = await fetch(`${API_BASE_URL}/user/profile/${getUserId()}/avatar`, {
        method: 'DELETE',
      });

      console.log('Reset avatar response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reset avatar failed:', errorText);
        throw new Error(`Failed to reset avatar: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Avatar reset successfully:', data);
      setProfile(data.user);
      return data.avatarUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error resetting avatar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Загрузить профиль при монтировании компонента
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    resetAvatar,
  };
};
