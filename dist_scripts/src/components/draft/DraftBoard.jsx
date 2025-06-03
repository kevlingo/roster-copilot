var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React from 'react';
var DraftBoard = function (_a) {
    var teams = _a.teams, picks = _a.picks, currentPick = _a.currentPick, userTeamId = _a.userTeamId;
    var maxRounds = Math.max.apply(Math, picks.map(function (pick) { return pick.round; }));
    // Group picks by round
    var picksByRound = Array.from({ length: maxRounds }, function (_, i) {
        var round = i + 1;
        // For odd rounds, picks go in order; for even rounds, picks go in reverse (snake draft)
        var roundPicks = picks.filter(function (pick) { return pick.round === round; });
        return round % 2 === 1 ? roundPicks : __spreadArray([], roundPicks, true).reverse();
    });
    return (<div className="overflow-x-auto">
      <table className="table table-xs w-full">
        <thead>
          <tr>
            <th className="bg-base-200">Round</th>
            {teams.map(function (team) { return (<th key={team.teamId} className={"text-center ".concat(team.teamId === userTeamId ? 'bg-primary/10' : 'bg-base-200')}>
                {team.name}
              </th>); })}
          </tr>
        </thead>
        <tbody>
          {picksByRound.map(function (roundPicks, roundIndex) { return (<tr key={"round-".concat(roundIndex + 1)}>
              <td className="font-semibold bg-base-200">{roundIndex + 1}</td>
              {roundPicks.map(function (pick) {
                var isCurrentPick = pick.pickNumber === currentPick;
                return (<td key={pick.pickNumber} className={"\n                      text-center text-xs p-1\n                      ".concat(pick.teamId === userTeamId ? 'bg-primary/10' : '', "\n                      ").concat(isCurrentPick ? 'ring-2 ring-primary' : '', "\n                      ").concat(!pick.playerId ? 'opacity-50' : '', "\n                    ")}>
                    <div className="p-1">
                      {pick.playerId ? (<>
                          <div className="font-medium">{pick.playerName}</div>
                          <div className="text-xs text-base-content/70">{pick.position}</div>
                        </>) : (isCurrentPick ? (<div className="font-medium text-primary">On the clock</div>) : (<div className="text-base-content/50">-</div>))}
                    </div>
                  </td>);
            })}
            </tr>); })}
        </tbody>
      </table>
    </div>);
};
export default DraftBoard;
