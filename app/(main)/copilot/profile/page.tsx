'use client';

import React, { useState, useEffect } from 'react';
import { /*Brain*/ GraduationCap, BarChart2, Zap, Clock } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';

// Frontend interface for user profile display
interface UserProfile {
  username: string;
  email: string;
  emailVerified: boolean;
  selectedArchetype: 'Eager Learner' | 'Calculated Strategist' | 'Bold Playmaker' | 'Busy Optimizer' | null;
  onboardingAnswers?: {
    preferredExplanationDepth?: 'simple' | 'standard' | 'detailed';
    riskComfortLevel?: 'low' | 'medium' | 'high';
  };
}

// Archetype descriptions
const archetypeInfo = {
  'Eager Learner': {
    title: 'Eager Learner',
    description: 'New to fantasy football or still learning the ropes. Values clear guidance and simple explanations.',
    icon: <GraduationCap size={24} />,
  },
  'Calculated Strategist': {
    title: 'Calculated Strategist',
    description: 'Experienced player who enjoys planning and optimizing. Appreciates efficiency and data-driven decisions.',
    icon: <BarChart2 size={24} />,
  },
  'Bold Playmaker': {
    title: 'Bold Playmaker',
    description: 'Experienced player willing to take risks. Values high-upside opportunities and making bold moves.',
    icon: <Zap size={24} />,
  },
  'Busy Optimizer': {
    title: 'Busy Optimizer',
    description: 'Time-constrained player looking for quick, efficient management. Values automation and time-saving features.',
    icon: <Clock size={24} />,
  },
};

export default function ProfilePage() {
  const { token, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userProfile: UserProfile = {
            username: data.user.username,
            email: data.user.email,
            emailVerified: data.user.emailVerified,
            selectedArchetype: data.user.selectedArchetype,
            onboardingAnswers: data.user.onboardingAnswers,
          };

          setProfile(userProfile);
          setFormData({
            username: userProfile.username,
            email: userProfile.email,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        } else {
          console.error('Failed to fetch profile:', response.statusText);
          setUpdateError('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUpdateError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, token]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError(null);
    setSuccessMessage(null);

    if (!isAuthenticated || !token) {
      setUpdateError('You must be logged in to update your profile');
      return;
    }

    // Validate passwords if attempting to change password
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setUpdateError('New passwords do not match');
        return;
      }

      if (!formData.currentPassword) {
        setUpdateError('Current password is required to set a new password');
        return;
      }
    }

    try {
      const requestBody: Record<string, string> = {};

      // Determine what type of update this is
      if (formData.newPassword) {
        // Password change
        requestBody.currentPassword = formData.currentPassword;
        requestBody.newPassword = formData.newPassword;
        requestBody.confirmPassword = formData.confirmPassword;
      } else {
        // Profile update
        requestBody.username = formData.username;
        requestBody.email = formData.email;
      }

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateSuccess(true);
        setSuccessMessage(data.message);

        // Update local profile state if username/email changed
        if (!formData.newPassword) {
          setProfile(prev => prev ? {
            ...prev,
            username: formData.username,
            email: formData.email,
            emailVerified: formData.email !== prev.email ? false : prev.emailVerified,
          } : null);
        }

        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = data.errors.map((err: { constraints?: Record<string, string> }) =>
            Object.values(err.constraints || {}).join(', ')
          ).join('; ');
          setUpdateError(errorMessages);
        } else {
          setUpdateError(data.error || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      setUpdateError('Failed to update profile. Please try again.');
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">Profile</h1>
        <div className="alert alert-warning">
          <span>You must be logged in to view your profile.</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <h1 className="page-title">Profile - Loading...</h1>
        <div className="loading-pulse h-64"></div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <h1 className="page-title">Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Update Form */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Account Information</h2>
            
            {updateSuccess && (
              <div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{successMessage || 'Profile updated successfully'}</span>
              </div>
            )}

            {!profile?.emailVerified && (
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                <span>Your email address is not verified. Please check your inbox for a verification link.</span>
              </div>
            )}
            
            {updateError && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{updateError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input input-bordered" 
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input input-bordered" 
                  required
                />
              </div>
              
              <div className="divider">Change Password (Optional)</div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="input input-bordered" 
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="input input-bordered" 
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input input-bordered" 
                />
              </div>
              
              <div className="card-actions justify-end">
                <button type="submit" className="btn btn-primary">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* AI Copilot Preferences */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">AI Copilot Preferences</h2>
            
            {/* Selected Archetype */}
            {profile?.selectedArchetype ? (
              <div className="border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-primary text-primary-content">
                    {archetypeInfo[profile.selectedArchetype].icon}
                  </div>
                  <h3 className="font-semibold text-lg">
                    {archetypeInfo[profile.selectedArchetype].title}
                  </h3>
                </div>
                <p className="text-base-content/80">
                  {archetypeInfo[profile.selectedArchetype].description}
                </p>
              </div>
            ) : (
              <div className="border border-base-300 rounded-lg p-4">
                <p className="text-base-content/60">No archetype selected yet. Complete the onboarding process to personalize your AI Copilot experience.</p>
              </div>
            )}
            
            {/* Onboarding Answers */}
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold">Your Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-base-300 rounded-lg p-3">
                  <h4 className="font-medium mb-1">Explanation Depth</h4>
                  <p className="text-sm capitalize">
                    {profile?.onboardingAnswers?.preferredExplanationDepth || 'Not set'}
                  </p>
                </div>

                <div className="border border-base-300 rounded-lg p-3">
                  <h4 className="font-medium mb-1">Risk Comfort Level</h4>
                  <p className="text-sm capitalize">
                    {profile?.onboardingAnswers?.riskComfortLevel || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-base-content/70">
                These preferences are used to personalize your AI Copilot experience. To update them, you can restart the onboarding process.
              </p>
              <div className="card-actions justify-end mt-2">
                <button className="btn btn-outline btn-sm">
                  Restart Onboarding
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}