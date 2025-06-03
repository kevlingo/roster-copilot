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
import { useRouter } from 'next/navigation';
import PlayerRosterCard from '@/src/components/roster/PlayerRosterCard';
// Mock data
var mockRoster = [
    { playerId: 'p1', fullName: 'Patrick Mahomes', position: 'QB', nflTeamAbbreviation: 'KC', status: 'Active', projectedPoints: 24.7, isStarter: true },
    { playerId: 'p2', fullName: 'Christian McCaffrey', position: 'RB', nflTeamAbbreviation: 'SF', status: 'Active', projectedPoints: 22.3, isStarter: true },
    { playerId: 'p3', fullName: 'Justin Jefferson', position: 'WR', nflTeamAbbreviation: 'MIN', status: 'Active', projectedPoints: 19.8, isStarter: true },
    { playerId: 'p4', fullName: 'Travis Kelce', position: 'TE', nflTeamAbbreviation: 'KC', status: 'Active', projectedPoints: 15.2, isStarter: true },
    { playerId: 'p5', fullName: 'Saquon Barkley', position: 'RB', nflTeamAbbreviation: 'PHI', status: 'Active', projectedPoints: 18.5, isStarter: true },
    { playerId: 'p6', fullName: 'Tyreek Hill', position: 'WR', nflTeamAbbreviation: 'MIA', status: 'Active', projectedPoints: 18.9, isStarter: true },
    { playerId: 'p7', fullName: 'Ja\'Marr Chase', position: 'WR', nflTeamAbbreviation: 'CIN', status: 'Bye_Week', projectedPoints: 17.6, isStarter: false },
    { playerId: 'p8', fullName: 'Josh Allen', position: 'QB', nflTeamAbbreviation: 'BUF', status: 'Active', projectedPoints: 23.1, isStarter: false },
    { playerId: 'p9', fullName: 'Raheem Mostert', position: 'RB', nflTeamAbbreviation: 'MIA', status: 'Active', projectedPoints: 14.2, isStarter: false },
    { playerId: 'p10', fullName: 'Dallas Cowboys', position: 'DST', nflTeamAbbreviation: 'DAL', status: 'Active', projectedPoints: 8.7, isStarter: true },
    { playerId: 'p11', fullName: 'Justin Tucker', position: 'K', nflTeamAbbreviation: 'BAL', status: 'Active', projectedPoints: 9.3, isStarter: true },
];
// League settings
var lineupSlots = {
    QB: 1,
    RB: 2,
    WR: 2,
    TE: 1,
    FLEX: 1, // RB/WR/TE
    K: 1,
    DST: 1,
};
export default function LineupPage(_a) {
    var _this = this;
    var params = _a.params;
    var leagueId = params.leagueId;
    var router = useRouter();
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState([]), roster = _c[0], setRoster = _c[1];
    var _d = useState(false), saveLoading = _d[0], setSaveLoading = _d[1];
    // Simulate data loading
    useEffect(function () {
        var timer = setTimeout(function () {
            setRoster(mockRoster);
            setIsLoading(false);
        }, 1000);
        return function () { return clearTimeout(timer); };
    }, [leagueId]);
    // Group players by position
    var playersByPosition = roster.reduce(function (acc, player) {
        if (!acc[player.position]) {
            acc[player.position] = [];
        }
        acc[player.position].push(player);
        return acc;
    }, {});
    // Toggle player starter status
    var togglePlayerStatus = function (playerId) {
        setRoster(function (prev) { return prev.map(function (player) {
            return player.playerId === playerId
                ? __assign(__assign({}, player), { isStarter: !player.isStarter }) : player;
        }); });
    };
    // Save lineup
    var saveLineup = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSaveLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // TODO: Call API to /api/leagues/:leagueId/lineup
                    // For the PoC, we'll simulate a successful save after a delay
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    // TODO: Call API to /api/leagues/:leagueId/lineup
                    // For the PoC, we'll simulate a successful save after a delay
                    _a.sent();
                    // Redirect back to roster page
                    router.push("/league/".concat(leagueId, "/roster"));
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Save lineup failed:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setSaveLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Calculate roster issues
    var getStarterCount = function (position) {
        return roster.filter(function (p) { return p.isStarter && p.position === position; }).length;
    };
    var rosterIssues = function () {
        var issues = [];
        if (getStarterCount('QB') !== lineupSlots.QB) {
            issues.push("You must start ".concat(lineupSlots.QB, " QB"));
        }
        if (getStarterCount('RB') !== lineupSlots.RB) {
            issues.push("You must start ".concat(lineupSlots.RB, " RBs"));
        }
        if (getStarterCount('WR') !== lineupSlots.WR) {
            issues.push("You must start ".concat(lineupSlots.WR, " WRs"));
        }
        if (getStarterCount('TE') !== lineupSlots.TE) {
            issues.push("You must start ".concat(lineupSlots.TE, " TE"));
        }
        if (getStarterCount('K') !== lineupSlots.K) {
            issues.push("You must start ".concat(lineupSlots.K, " K"));
        }
        if (getStarterCount('DST') !== lineupSlots.DST) {
            issues.push("You must start ".concat(lineupSlots.DST, " DST"));
        }
        // TODO: FLEX position calculation
        return issues;
    };
    var issues = rosterIssues();
    var hasIssues = issues.length > 0;
    if (isLoading) {
        return (<div className="page-container space-y-6">
        <h1 className="page-title">Edit Lineup - Loading...</h1>
        <div className="loading-pulse h-64"></div>
      </div>);
    }
    return (<div className="page-container space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="page-title">Edit Lineup</h1>
        
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={function () { return router.push("/league/".concat(leagueId, "/roster")); }}>
            Cancel
          </button>
          <button className={"btn btn-primary btn-sm ".concat(saveLoading ? 'loading' : '')} disabled={hasIssues || saveLoading} onClick={saveLineup}>
            {saveLoading ? 'Saving...' : 'Save Lineup'}
          </button>
        </div>
      </div>
      
      {/* Roster Issues */}
      {hasIssues && (<div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <div>
            <h3 className="font-bold">Invalid Lineup</h3>
            <ul className="list-disc list-inside">
              {issues.map(function (issue, index) { return (<li key={index}>{issue}</li>); })}
            </ul>
          </div>
        </div>)}
      
      {/* AI Copilot Suggestion */}
      <div className="card bg-primary text-primary-content">
        <div className="card-body">
          <h2 className="card-title">AI Copilot Suggestion</h2>
          <p>Start Josh Allen (QB, BUF) over Patrick Mahomes (QB, KC) this week.</p>
          <p className="text-sm">Allen has a favorable matchup against the Jets secondary and is projected for more rushing yards.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-outline" onClick={function () {
            // Toggle both QBs
            setRoster(function (prev) { return prev.map(function (p) {
                return p.playerId === 'p1' || p.playerId === 'p8'
                    ? __assign(__assign({}, p), { isStarter: p.playerId === 'p8' }) : p;
            }); });
        }}>
              Apply Suggestion
            </button>
          </div>
        </div>
      </div>
      
      {/* Position Sections */}
      {Object.entries(lineupSlots).map(function (_a) {
            var _b;
            var position = _a[0], count = _a[1];
            return (<div key={position} className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title">{position} ({getStarterCount(position)}/{count})</h2>
              {getStarterCount(position) !== count && (<span className="text-error">Incorrect number of starters</span>)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {((_b = playersByPosition[position]) === null || _b === void 0 ? void 0 : _b.map(function (player) { return (<PlayerRosterCard key={player.playerId} player={player} onBench={player.isStarter ? function () { return togglePlayerStatus(player.playerId); } : undefined} onStart={!player.isStarter ? function () { return togglePlayerStatus(player.playerId); } : undefined}/>); })) || (<div className="md:col-span-2 text-center py-8 text-base-content/70">
                  <p>No {position} players on your roster.</p>
                </div>)}
            </div>
          </div>
        </div>);
        })}
    </div>);
}
