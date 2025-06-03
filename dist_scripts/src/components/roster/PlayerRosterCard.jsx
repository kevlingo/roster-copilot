import React from 'react';
var PlayerRosterCard = function (_a) {
    var player = _a.player, onBench = _a.onBench, onStart = _a.onStart, onDrop = _a.onDrop;
    // Render status with appropriate color/badge
    var renderStatus = function () {
        switch (player.status) {
            case 'Active':
                return <span className="badge badge-sm badge-success">Active</span>;
            case 'Injured_Out':
                return <span className="badge badge-sm badge-error">OUT</span>;
            case 'Injured_IR':
                return <span className="badge badge-sm badge-error">IR</span>;
            case 'Bye_Week':
                return <span className="badge badge-sm badge-warning">BYE</span>;
            default:
                return null;
        }
    };
    return (<div className={"card card-side bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-all ".concat(player.isStarter ? 'border-l-4 border-l-primary' : '')}>
      <div className="card-body p-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">{player.fullName}</h3>
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <span>{player.position}</span>
              <span>•</span>
              <span>{player.nflTeamAbbreviation}</span>
              {renderStatus()}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-lg font-semibold">
              {player.projectedPoints.toFixed(1)}
            </div>
            <div className="text-xs text-base-content/70">Projected</div>
          </div>
        </div>
        
        <div className="card-actions justify-end mt-2 flex-wrap">
          {player.isStarter && onBench && (<button className="btn btn-outline btn-sm" onClick={function () { return onBench(player.playerId); }}>
              Bench
            </button>)}
          
          {!player.isStarter && onStart && (<button className="btn btn-primary btn-sm" onClick={function () { return onStart(player.playerId); }}>
              Start
            </button>)}
          
          {onDrop && (<button className="btn btn-error btn-outline btn-sm" onClick={function () { return onDrop(player.playerId); }}>
              Drop
            </button>)}
        </div>
      </div>
    </div>);
};
export default PlayerRosterCard;
