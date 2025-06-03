'use client';
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
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
export default function SignupPage() {
    var _this = this;
    var router = useRouter();
    var _a = useState(false), isLoading = _a[0], setIsLoading = _a[1];
    var _b = useState(null), formError = _b[0], setFormError = _b[1];
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var formData, username, email, password, confirmPassword, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    formData = new FormData(event.currentTarget);
                    username = formData.get('username');
                    email = formData.get('email');
                    password = formData.get('password');
                    confirmPassword = formData.get('confirmPassword');
                    // Basic validation
                    if (!username || !email || !password) {
                        setFormError('Please fill in all required fields');
                        return [2 /*return*/];
                    }
                    if (password !== confirmPassword) {
                        setFormError('Passwords do not match');
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    setFormError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // TODO: Call API to /api/auth/signup with { username, email, password }
                    // For the PoC, we'll simulate a successful signup after a delay
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    // TODO: Call API to /api/auth/signup with { username, email, password }
                    // For the PoC, we'll simulate a successful signup after a delay
                    _a.sent();
                    // Redirect to onboarding
                    router.push('/onboarding');
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Signup failed:', error_1);
                    setFormError('Failed to create account. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Create Account</h2>
      
      {formError && (<div className="alert alert-error text-sm">{formError}</div>)}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Username</span>
          </label>
          <input type="text" name="username" placeholder="fantasy_champion" className="input input-bordered w-full" required/>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input type="email" name="email" placeholder="your@email.com" className="input input-bordered w-full" required/>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input type="password" name="password" placeholder="••••••••" className="input input-bordered w-full" required/>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Confirm Password</span>
          </label>
          <input type="password" name="confirmPassword" placeholder="••••••••" className="input input-bordered w-full" required/>
        </div>
        
        <div className="form-control">
          <label className="label cursor-pointer">
            <input type="checkbox" className="checkbox checkbox-sm" required/>
            <span className="label-text ml-2">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </span>
          </label>
        </div>
        
        <button type="submit" className={"btn btn-primary w-full ".concat(isLoading ? 'loading' : '')} disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="text-center">
        <p className="text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>);
}
