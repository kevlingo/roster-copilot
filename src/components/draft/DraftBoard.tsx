import React from 'react';

interface Team {
  teamId: string;
  name: string;
  owner: string;
}

interface DraftPick {
  pickNumber: number;
  round: number;
  teamId: string;
  playerId?: string;
  playerName?: string;
  position?: string;
}

interface DraftBoardProps {
  teams: Team[];
  picks: DraftPick[];
  currentPick?: number;
  userTeamId?: string;
}

const DraftBoard: React.FC<DraftBoardProps> = ({
  teams,
  picks,
  currentPick,
  userTeamId,
}) => {
  const maxRounds = Math.max(...picks.map(pick => pick.round));
  
  // Group picks by round
  const picksByRound = Array.from({ length: maxRounds }, (_, i) => {
    const round = i + 1;
    // For odd rounds, picks go in order; for even rounds, picks go in reverse (snake draft)
    const roundPicks = picks.filter(pick => pick.round === round);
    return round % 2 === 1 ? roundPicks : [...roundPicks].reverse();
  });

  return (
    <div className="overflow-x-auto">
      <table className="table table-xs w-full">
        <thead>
          <tr>
            <th className="bg-base-200">Round</th>
            {teams.map((team) => (
              <th 
                key={team.teamId}
                className={`text-center ${team.teamId === userTeamId ? 'bg-primary/10' : 'bg-base-200'}`}
              >
                {team.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {picksByRound.map((roundPicks, roundIndex) => (
            <tr key={`round-${roundIndex + 1}`}>
              <td className="font-semibold bg-base-200">{roundIndex + 1}</td>
              {roundPicks.map((pick) => {
                const isCurrentPick = pick.pickNumber === currentPick;
                
                return (
                  <td 
                    key={pick.pickNumber}
                    className={`
                      text-center text-xs p-1
                      ${pick.teamId === userTeamId ? 'bg-primary/10' : ''}
                      ${isCurrentPick ? 'ring-2 ring-primary' : ''}
                      ${!pick.playerId ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="p-1">
                      {pick.playerId ? (
                        <>
                          <div className="font-medium">{pick.playerName}</div>
                          <div className="text-xs text-base-content/70">{pick.position}</div>
                        </>
                      ) : (
                        isCurrentPick ? (
                          <div className="font-medium text-primary">On the clock</div>
                        ) : (
                          <div className="text-base-content/50">-</div>
                        )
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DraftBoard;