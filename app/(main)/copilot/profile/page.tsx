'use client';

import React, { useState, useEffect } from 'react';
import { /*Brain*/ GraduationCap, BarChart2, Zap, Clock } from 'lucide-react';

// Mock user data
interface UserProfile {
  username: string;
  email: string;
  selectedArchetype: 'eager_learner' | 'calculated_strategist' | 'bold_playmaker' | 'busy_optimizer';
  onboardingAnswers: {
    explanationDepth: 'basic' | 'detailed' | 'comprehensive';
    riskTolerance: 'conservative' | 'balanced' | 'aggressive';
    timeCommitment: 'minimal' | 'moderate' | 'dedicated';
  };
}

const mockUserProfile: UserProfile = {
  username: 'fantasy_champion',
  email: 'user@example.com',
  selectedArchetype: 'calculated_strategist',
  onboardingAnswers: {
    explanationDepth: 'detailed',
    riskTolerance: 'balanced',
    timeCommitment: 'moderate',
  },
};

// Archetype descriptions
const archetypeInfo = {
  eager_learner: {
    title: 'Eager Learner',
    description: 'New to fantasy football or still learning the ropes. Values clear guidance and simple explanations.',
    icon: <GraduationCap size={24} />,
  },
  calculated_strategist: {
    title: 'Calculated Strategist',
    description: 'Experienced player who enjoys planning and optimizing. Appreciates efficiency and data-driven decisions.',
    icon: <BarChart2 size={24} />,
  },
  bold_playmaker: {
    title: 'Bold Playmaker',
    description: 'Experienced player willing to take risks. Values high-upside opportunities and making bold moves.',
    icon: <Zap size={24} />,
  },
  busy_optimizer: {
    title: 'Busy Optimizer',
    description: 'Time-constrained player looking for quick, efficient management. Values automation and time-saving features.',
    icon: <Clock size={24} />,
  },
};

export default function ProfilePage() {
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
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setProfile(mockUserProfile);
      setFormData({
        username: mockUserProfile.username,
        email: mockUserProfile.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError(null);
    
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
      // TODO: Call API to /api/users/me
      // For the PoC, we'll simulate a successful update after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(prev => prev ? {
        ...prev,
        username: formData.username,
        email: formData.email,
      } : null);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      setUpdateSuccess(true);
    } catch (error) {
      console.error('Profile update failed:', error);
      setUpdateError('Failed to update profile. Please try again.');
    }
  };
  
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
                <span>Profile updated successfully</span>
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
            <div className="border border-base-300 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary text-primary-content">
                  {profile?.selectedArchetype && archetypeInfo[profile.selectedArchetype].icon}
                </div>
                <h3 className="font-semibold text-lg">
                  {profile?.selectedArchetype && archetypeInfo[profile.selectedArchetype].title}
                </h3>
              </div>
              <p className="text-base-content/80">
                {profile?.selectedArchetype && archetypeInfo[profile.selectedArchetype].description}
              </p>
            </div>
            
            {/* Onboarding Answers */}
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold">Your Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border border-base-300 rounded-lg p-3">
                  <h4 className="font-medium mb-1">Explanation Depth</h4>
                  <p className="text-sm capitalize">
                    {profile?.onboardingAnswers.explanationDepth || 'Not set'}
                  </p>
                </div>
                
                <div className="border border-base-300 rounded-lg p-3">
                  <h4 className="font-medium mb-1">Risk Tolerance</h4>
                  <p className="text-sm capitalize">
                    {profile?.onboardingAnswers.riskTolerance || 'Not set'}
                  </p>
                </div>
                
                <div className="border border-base-300 rounded-lg p-3">
                  <h4 className="font-medium mb-1">Time Commitment</h4>
                  <p className="text-sm capitalize">
                    {profile?.onboardingAnswers.timeCommitment || 'Not set'}
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