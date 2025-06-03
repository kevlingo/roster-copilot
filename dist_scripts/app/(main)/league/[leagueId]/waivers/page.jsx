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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DraftPlayerCard from '@/src/components/draft/DraftPlayerCard';
import PlayerRosterCard from '@/src/components/roster/PlayerRosterCard';
// Mock data
var mockAvailablePlayers = [
    { playerId: 'p101', fullName: 'Michael Pittman', position: 'WR', nflTeamAbbreviation: 'IND', status: 'Active', projectedPoints: 14.2 },
    { playerId: 'p102', fullName: 'Kenneth Walker', position: 'RB', nflTeamAbbreviation: 'SEA', status: 'Active', projectedPoints: 13.7 },
    { playerId: 'p103', fullName: 'George Kittle', position: 'TE', nflTeamAbbreviation: 'SF', status: 'Active', projectedPoints: 12.5 },
    { playerId: 'p104', fullName: 'Jared Goff', position: 'QB', nflTeamAbbreviation: 'DET', status: 'Active', projectedPoints: 18.9 },
    { playerId: 'p105', fullName: 'Tee Higgins', position: 'WR', nflTeamAbbreviation: 'CIN', status: 'Injured_Out', projectedPoints: 0 },
    { playerId: 'p106', fullName: 'Rhamondre Stevenson', position: 'RB', nflTeamAbbreviation: 'NE', status: 'Active', projectedPoints: 11.8 },
    { playerId: 'p107', fullName: 'DeVonta Smith', position: 'WR', nflTeamAbbreviation: 'PHI', status: 'Active', projectedPoints: 13.4 },
    { playerId: 'p108', fullName: 'Jordan Love', position: 'QB', nflTeamAbbreviation: 'GB', status: 'Active', projectedPoints: 16.7 },
];
var mockRoster = [
    { playerId: 'p1', fullName: 'Patrick Mahomes', position: 'QB', nflTeamAbbreviation: 'KC', status: 'Active', projectedPoints: 24.7, isStarter: true },
    { playerId: 'p2', fullName: 'Christian McCaffrey', position: 'RB', nflTeamAbbreviation: 'SF', status: 'Active', projectedPoints: 22.3, isStarter: true },
    { playerId: 'p3', fullName: 'Justin Jefferson', position: 'WR', nflTeamAbbreviation: 'MIN', status: 'Active', projectedPoints: 19.8, isStarter: true },
    { playerId: 'p4', fullName: 'Travis Kelce', position: 'TE', nflTeamAbbreviation: 'KC', status: 'Active', projectedPoints: 15.2, isStarter: true },
    { playerId: 'p5', fullName: 'Saquon Barkley', position: 'RB', nflTeamAbbreviation: 'PHI', status: 'Active', projectedPoints: 18.5, isStarter: true },
    { playerId: 'p6', fullName: 'Tyreek Hill', position: 'WR', nflTeamAbbreviation: 'MIA', status: 'Active', projectedPoints: 18.9, isStarter: true },
    { playerId: 'p7', fullName: 'Ja\'Marr Chase', position: 'WR', nflTeamAbbreviation: 'CIN', status: 'Bye_Week', projectedPoints: 17.6, isStarter: false },
    { playerId: 'p8', fullName: 'Josh Allen', position: 'QB', nflTeamAbbreviation: 'BUF', status: 'Active', projectedPoints: 23.1, isStarter: false },
];
export default function WaiversPage(_a) {
    var _this = this;
    var params = _a.params;
    var leagueId = params.leagueId;
    var router = useRouter();
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState([]), availablePlayers = _c[0], setAvailablePlayers = _c[1];
    var _d = useState([]), roster = _d[0], setRoster = _d[1];
    var _e = useState('ALL'), positionFilter = _e[0], setPositionFilter = _e[1];
    var _f = useState(''), searchQuery = _f[0], setSearchQuery = _f[1];
    var _g = useState({}), pendingClaim = _g[0], setPendingClaim = _g[1];
    // Simulate data loading
    useEffect(function () {
        var timer = setTimeout(function () {
            setAvailablePlayers(mockAvailablePlayers);
            setRoster(mockRoster);
            setIsLoading(false);
        }, 1000);
        return function () { return clearTimeout(timer); };
    }, [leagueId]);
    // Filter players by position and search query
    var filteredPlayers = availablePlayers.filter(function (player) {
        var matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
        var matchesSearch = player.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesPosition && matchesSearch;
    });
    // Handle player add/drop
    var handleAddPlayer = function (playerId) {
        var player = availablePlayers.find(function (p) { return p.playerId === playerId; });
        if (player) {
            setPendingClaim(__assign(__assign({}, pendingClaim), { addPlayer: player }));
        }
    };
    var handleDropPlayer = function (playerId) {
        var player = roster.find(function (p) { return p.playerId === playerId; });
        if (player) {
            setPendingClaim(__assign(__assign({}, pendingClaim), { dropPlayer: player }));
        }
    };
    var handleSubmitClaim = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pendingClaim.addPlayer || !pendingClaim.dropPlayer)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // TODO: Call API to /api/leagues/:leagueId/waivers/claim
                    // For the PoC, we'll simulate a successful claim after a delay
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    // TODO: Call API to /api/leagues/:leagueId/waivers/claim
                    // For the PoC, we'll simulate a successful claim after a delay
                    _a.sent();
                    // Update local state
                    setRoster(function (prev) { return __spreadArray(__spreadArray([], prev.filter(function (p) { var _a; return p.playerId !== ((_a = pendingClaim.dropPlayer) === null || _a === void 0 ? void 0 : _a.playerId); }), true), [
                        __assign(__assign({}, pendingClaim.addPlayer), { isStarter: false })
                    ], false); });
                    setAvailablePlayers(function (prev) { return __spreadArray(__spreadArray([], prev.filter(function (p) { var _a; return p.playerId !== ((_a = pendingClaim.addPlayer) === null || _a === void 0 ? void 0 : _a.playerId); }), true), [
                        pendingClaim.dropPlayer
                    ], false); });
                    // Clear pending claim
                    setPendingClaim({});
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Waiver claim failed:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (<div className="page-container space-y-6">
        <h1 className="page-title">Waiver Wire - Loading...</h1>
        <div className="loading-pulse h-64"></div>
      </div>);
    }
    return (<div className="page-container space-y-6">
      <h1 className="page-title">Waiver Wire</h1>
      
      {/* Pending Add/Drop Modal */}
      {(pendingClaim.addPlayer || pendingClaim.dropPlayer) && (<div className="card bg-base-100 shadow-lg border border-primary">
          <div className="card-body">
            <h2 className="card-title">Pending Waiver Claim</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Adding:</h3>
                {pendingClaim.addPlayer ? (<DraftPlayerCard player={pendingClaim.addPlayer} onDraft={function () { }} // No action needed here
            />) : (<div className="p-4 border border-dashed border-base-300 rounded-lg text-center">
                    <p className="text-base-content/70">Select a player to add</p>
                  </div>)}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Dropping:</h3>
                {pendingClaim.dropPlayer ? (<PlayerRosterCard player={pendingClaim.dropPlayer} onDrop={function () { return setPendingClaim(__assign(__assign({}, pendingClaim), { dropPlayer: undefined })); }}/>) : (<div className="p-4 border border-dashed border-base-300 rounded-lg text-center">
                    <p className="text-base-content/70">Select a player to drop</p>
                  </div>)}
              </div>
            </div>
            
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-outline" onClick={function () { return setPendingClaim({}); }}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={!pendingClaim.addPlayer || !pendingClaim.dropPlayer} onClick={handleSubmitClaim}>
                Submit Claim
              </button>
            </div>
          </div>
        </div>)}
      
      {/* Available Players */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="card-title">Available Players</h2>
            
            <div className="flex flex-wrap gap-2">
              {/* Position filter */}
              <div className="join">
                <button className={"join-item btn btn-sm ".concat(positionFilter === 'ALL' ? 'btn-primary' : 'btn-outline')} onClick={function () { return setPositionFilter('ALL'); }}>
                  ALL
                </button>
                <button className={"join-item btn btn-sm ".concat(positionFilter === 'QB' ? 'btn-primary' : 'btn-outline')} onClick={function () { return setPositionFilter('QB'); }}>
                  QB
                </button>
                <button className={"join-item btn btn-sm ".concat(positionFilter === 'RB' ? 'btn-primary' : 'btn-outline')} onClick={function () { return setPositionFilter('RB'); }}>
                  RB
                </button>
                <button className={"join-item btn btn-sm ".concat(positionFilter === 'WR' ? 'btn-primary' : 'btn-outline')} onClick={function () { return setPositionFilter('WR'); }}>
                  WR
                </button>
                <button className={"join-item btn btn-sm ".concat(positionFilter === 'TE' ? 'btn-primary' : 'btn-outline')} onClick={function () { return setPositionFilter('TE'); }}>
                  TE
                </button>
              </div>
              
              {/* Search */}
              <div className="form-control">
                <input type="text" placeholder="Search players..." className="input input-bordered input-sm w-full max-w-xs" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
              </div>
            </div>
          </div>
          
          <div className="divider my-2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlayers.map(function (player) { return (<DraftPlayerCard key={player.playerId} player={player} onDraft={handleAddPlayer}/>); })}
            
            {filteredPlayers.length === 0 && (<div className="md:col-span-2 lg:col-span-3 text-center py-8 text-base-content/70">
                <p>No players match your filters.</p>
              </div>)}
          </div>
        </div>
      </div>
      
      {/* My Roster */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">My Roster</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roster.map(function (player) { return (<PlayerRosterCard key={player.playerId} player={player} onDrop={handleDropPlayer}/>); })}
          </div>
        </div>
      </div>
      
      {/* AI Copilot Suggestion */}
      <div className="card bg-primary text-primary-content">
        <div className="card-body">
          <h2 className="card-title">AI Copilot Suggestion</h2>
          <p>Consider adding Kenneth Walker (RB, SEA) and dropping Ja'Marr Chase (WR, CIN).</p>
          <p className="text-sm">Walker has a favorable schedule coming up, while Chase is on bye this week and you have good WR depth.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-outline" onClick={function () {
            var addPlayer = availablePlayers.find(function (p) { return p.playerId === 'p102'; });
            var dropPlayer = roster.find(function (p) { return p.playerId === 'p7'; });
            if (addPlayer && dropPlayer) {
                setPendingClaim({ addPlayer: addPlayer, dropPlayer: dropPlayer });
            }
        }}>
              Apply Suggestion
            </button>
          </div>
        </div>
      </div>
    </div>);
}
