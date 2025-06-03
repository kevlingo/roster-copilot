'use client';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { useState, useEffect } from 'react';
import { GraduationCap, BarChart2, Zap, Clock } from 'lucide-react';
var mockUserProfile = {
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
var archetypeInfo = {
    eager_learner: {
        title: 'Eager Learner',
        description: 'New to fantasy football or still learning the ropes. Values clear guidance and simple explanations.',
        icon: <GraduationCap size={24}/>,
    },
    calculated_strategist: {
        title: 'Calculated Strategist',
        description: 'Experienced player who enjoys planning and optimizing. Appreciates efficiency and data-driven decisions.',
        icon: <BarChart2 size={24}/>,
    },
    bold_playmaker: {
        title: 'Bold Playmaker',
        description: 'Experienced player willing to take risks. Values high-upside opportunities and making bold moves.',
        icon: <Zap size={24}/>,
    },
    busy_optimizer: {
        title: 'Busy Optimizer',
        description: 'Time-constrained player looking for quick, efficient management. Values automation and time-saving features.',
        icon: <Clock size={24}/>,
    },
};
export default function ProfilePage() {
    var _this = this;
    var _a = useState(true), isLoading = _a[0], setIsLoading = _a[1];
    var _b = useState(null), profile = _b[0], setProfile = _b[1];
    var _c = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    }), formData = _c[0], setFormData = _c[1];
    var _d = useState(false), updateSuccess = _d[0], setUpdateSuccess = _d[1];
    var _e = useState(null), updateError = _e[0], setUpdateError = _e[1];
    // Simulate data loading
    useEffect(function () {
        var timer = setTimeout(function () {
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
        return function () { return clearTimeout(timer); };
    }, []);
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setUpdateSuccess(false);
                    setUpdateError(null);
                    // Validate passwords if attempting to change password
                    if (formData.newPassword) {
                        if (formData.newPassword !== formData.confirmPassword) {
                            setUpdateError('New passwords do not match');
                            return [2 /*return*/];
                        }
                        if (!formData.currentPassword) {
                            setUpdateError('Current password is required to set a new password');
                            return [2 /*return*/];
                        }
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // TODO: Call API to /api/users/me
                    // For the PoC, we'll simulate a successful update after a delay
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    // TODO: Call API to /api/users/me
                    // For the PoC, we'll simulate a successful update after a delay
                    _a.sent();
                    setProfile(function (prev) { return prev ? __assign(__assign({}, prev), { username: formData.username, email: formData.email }) : null; });
                    // Clear password fields
                    setFormData(function (prev) { return (__assign(__assign({}, prev), { currentPassword: '', newPassword: '', confirmPassword: '' })); });
                    setUpdateSuccess(true);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Profile update failed:', error_1);
                    setUpdateError('Failed to update profile. Please try again.');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (<div className="page-container space-y-6">
        <h1 className="page-title">Profile - Loading...</h1>
        <div className="loading-pulse h-64"></div>
      </div>);
    }
    return (<div className="page-container space-y-6">
      <h1 className="page-title">Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Update Form */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Account Information</h2>
            
            {updateSuccess && (<div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Profile updated successfully</span>
              </div>)}
            
            {updateError && (<div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>{updateError}</span>
              </div>)}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="input input-bordered" required/>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input input-bordered" required/>
              </div>
              
              <div className="divider">Change Password (Optional)</div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} className="input input-bordered"/>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} className="input input-bordered"/>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="input input-bordered"/>
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
                  {(profile === null || profile === void 0 ? void 0 : profile.selectedArchetype) && archetypeInfo[profile.selectedArchetype].icon}
                </div>
                <h3 className="font-semibold text-lg">
                  {(profile === null || profile === void 0 ? void 0 : profile.selectedArchetype) && archetypeInfo[profile.selectedArchetype].title}
                </h3>
              </div>
              <p className="text-base-content/80">
                {(profile === null || profile === void 0 ? void 0 : profile.selectedArchetype) && archetypeInfo[profile.selectedArchetype].description}
              </p>
            </div>
            
            {/* Onboarding Answers */}
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold">Your Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border border-base-300 rounded-lg p-3">
                  <h4 className="font-medium mb-1">Explanation Depth</h4>
                  <p className="text-sm capitalize">
                    {(profile === null || profile === void 0 ? void 0 : profile.onboardingAnswers.explanationDepth) || 'Not set'}
                  </p>
                </div>
                
                <div className="border border-base-300 rounded-lg p-3">
                  <h4 className="font-medium mb-1">Risk Tolerance</h4>
                  <p className="text-sm capitalize">
                    {(profile === null || profile === void 0 ? void 0 : profile.onboardingAnswers.riskTolerance) || 'Not set'}
                  </p>
                </div>
                
                <div className="border border-base-300 rounded-lg p-3">
                  <h4 className="font-medium mb-1">Time Commitment</h4>
                  <p className="text-sm capitalize">
                    {(profile === null || profile === void 0 ? void 0 : profile.onboardingAnswers.timeCommitment) || 'Not set'}
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
    </div>);
}
