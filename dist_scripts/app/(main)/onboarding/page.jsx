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
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
var questionnaireByArchetype = {
    eager_learner: [
        {
            id: 'explanationDepth',
            text: 'How detailed would you like explanations to be?',
            options: [
                { value: 'basic', label: 'Basic - Just the essentials' },
                { value: 'detailed', label: 'Detailed - Include reasoning' },
                { value: 'comprehensive', label: 'Comprehensive - Teach me everything' },
            ],
        },
        {
            id: 'timeCommitment',
            text: 'How much time do you want to spend on fantasy football each week?',
            options: [
                { value: 'minimal', label: 'Minimal - Just the essentials' },
                { value: 'moderate', label: 'Moderate - A few hours per week' },
                { value: 'dedicated', label: 'Dedicated - As much as needed' },
            ],
        },
    ],
    calculated_strategist: [
        {
            id: 'riskTolerance',
            text: 'What\'s your approach to risk in fantasy decisions?',
            options: [
                { value: 'conservative', label: 'Conservative - Prefer safer, reliable options' },
                { value: 'balanced', label: 'Balanced - Mix of safe and high-upside picks' },
                { value: 'aggressive', label: 'Aggressive - Willing to take big risks for big rewards' },
            ],
        },
        {
            id: 'explanationDepth',
            text: 'How much data do you want to see with recommendations?',
            options: [
                { value: 'basic', label: 'Basic - Just the key stats' },
                { value: 'detailed', label: 'Detailed - Include relevant metrics' },
                { value: 'comprehensive', label: 'Comprehensive - Full statistical breakdown' },
            ],
        },
    ],
    bold_playmaker: [
        {
            id: 'riskTolerance',
            text: 'How aggressive should your AI Copilot be with recommendations?',
            options: [
                { value: 'balanced', label: 'Balanced - Some risks, but not too wild' },
                { value: 'aggressive', label: 'Aggressive - High upside focus' },
                { value: 'very_aggressive', label: 'Very Aggressive - Maximum upside, regardless of floor' },
            ],
        },
        {
            id: 'explanationDepth',
            text: 'What kind of analysis do you prefer?',
            options: [
                { value: 'basic', label: 'Basic - Just the recommendation' },
                { value: 'detailed', label: 'Detailed - Include reasoning' },
                { value: 'comprehensive', label: 'Comprehensive - Full breakdown' },
            ],
        },
    ],
    busy_optimizer: [
        {
            id: 'timeCommitment',
            text: 'How much time do you have for fantasy football each week?',
            options: [
                { value: 'minimal', label: 'Minimal - 15 minutes or less' },
                { value: 'moderate', label: 'Moderate - Up to an hour' },
                { value: 'dedicated', label: 'Dedicated - Several hours' },
            ],
        },
        {
            id: 'explanationDepth',
            text: 'How concise should AI Copilot explanations be?',
            options: [
                { value: 'basic', label: 'Basic - Just the essentials' },
                { value: 'detailed', label: 'Detailed - Some context, but keep it brief' },
                { value: 'comprehensive', label: 'Comprehensive - Full details when I have time' },
            ],
        },
    ],
};
export default function OnboardingPage() {
    var _this = this;
    var router = useRouter();
    var _a = useState(1), step = _a[0], setStep = _a[1];
    var _b = useState(null), selectedArchetype = _b[0], setSelectedArchetype = _b[1];
    var _c = useState({}), answers = _c[0], setAnswers = _c[1];
    var _d = useState(false), isLoading = _d[0], setIsLoading = _d[1];
    // Questions based on selected archetype
    var questions = selectedArchetype ? questionnaireByArchetype[selectedArchetype] : [];
    // Handle questionnaire answer
    var handleAnswer = function (questionId, value) {
        setAnswers(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[questionId] = value, _a)));
        });
    };
    // Submit onboarding data
    var handleCompleteOnboarding = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // TODO: Call API to /api/users/me with { selectedArchetype, onboardingAnswers: answers }
                    // For the PoC, we'll simulate a successful update after a delay
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    // TODO: Call API to /api/users/me with { selectedArchetype, onboardingAnswers: answers }
                    // For the PoC, we'll simulate a successful update after a delay
                    _a.sent();
                    // Redirect to dashboard
                    router.push('/dashboard');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Onboarding submission failed:', error_1);
                    // Handle error
                    setIsLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Check if current question is answered
    var isCurrentQuestionAnswered = function () {
        if (step === 1)
            return selectedArchetype !== null;
        if (step > 1 && step - 2 < questions.length) {
            var currentQuestion = questions[step - 2];
            return !!answers[currentQuestion.id];
        }
        return true;
    };
    // Navigate to next question or complete
    var handleNext = function () {
        if (step < questions.length + 1) {
            setStep(step + 1);
        }
        else {
            handleCompleteOnboarding();
        }
    };
    // Progress percentage
    var calculateProgress = function () {
        var totalSteps = questions.length + 1;
        return (step / totalSteps) * 100;
    };
    return (<div className="page-container max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="w-full bg-base-200 rounded-full h-2.5 mb-6">
        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: "".concat(calculateProgress(), "%") }}></div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Please select your fantasy manager style in the AI Copilot chat</h1>
        <p className="text-base-content/70 mt-2">
          The AI Copilot will guide you through the onboarding process
        </p>
      </div>
    </div>);
}
