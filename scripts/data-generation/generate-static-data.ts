import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Define interfaces based on Architecture.md
interface NFLPlayer {
  playerId: string;
  fullName: string;
  position: "QB" | "RB" | "WR" | "TE" | "K" | "DEF";
  nflTeamAbbreviation: string;
  status?: "Active" | "Injured_Out" | "Injured_Questionable" | "Bye Week";
  projectedPoints?: number;
  keyAttributes?: {
    consistencyRating?: "High" | "Medium" | "Low";
    upsidePotential?: "High" | "Medium" | "Low";
    role?: string;
  };
  notes?: string;
}

interface NFLGame {
  gameId: string;
  weekNumber: number;
  homeTeamAbbreviation: string;
  awayTeamAbbreviation: string;
  gameDateTime_ISO?: string;
  matchupContextNotes?: string[];
  homeScore?: number;
  awayScore?: number;
  gameStatus?: "Scheduled" | "InProgress" | "Final";
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../../data/static-nfl-data');
const NFL_TEAMS = ["LIO", "BEA", "PAC", "VIK", "EAG", "COW", "GIA", "COM", "RAM", "49E"];
const POSITIONS: NFLPlayer['position'][] = ["QB", "RB", "WR", "TE", "K", "DEF"];
const PLAYER_STATUSES: NFLPlayer['status'][] = ["Active", "Injured_Out", "Injured_Questionable", "Bye Week"];
const KEY_RATINGS: NonNullable<NFLPlayer['keyAttributes']>['consistencyRating'][] = ["High", "Medium", "Low"];
const GAME_STATUSES: NFLGame['gameStatus'][] = ["Scheduled", "InProgress", "Final"];

const generatePlayers = (count: number): NFLPlayer[] => {
  const players: NFLPlayer[] = [];
  for (let i = 0; i < count; i++) {
    const position = faker.helpers.arrayElement(POSITIONS);
    const player: NFLPlayer = {
      playerId: faker.string.uuid(),
      fullName: faker.person.fullName(),
      position: position,
      nflTeamAbbreviation: faker.helpers.arrayElement(NFL_TEAMS),
      status: faker.helpers.arrayElement(PLAYER_STATUSES),
      projectedPoints: faker.number.float({ min: 0, max: position === 'DEF' || position === 'K' ? 15 : 30, fractionDigits: 1 }),
      keyAttributes: {
        consistencyRating: faker.helpers.arrayElement(KEY_RATINGS),
        upsidePotential: faker.helpers.arrayElement(KEY_RATINGS),
        role: faker.lorem.words(3),
      },
      notes: faker.lorem.sentence(),
    };
    players.push(player);
  }
  return players;
};

const generateGames = (weeks: number, teamsPerWeek: number): NFLGame[] => {
  const games: NFLGame[] = [];
  for (let w = 1; w <= weeks; w++) {
    const weekTeams = faker.helpers.shuffle(NFL_TEAMS); // Shuffle teams for variety
    for (let i = 0; i < teamsPerWeek / 2; i++) { // teamsPerWeek should be even
      const homeTeam = weekTeams[i * 2];
      const awayTeam = weekTeams[i * 2 + 1];
      if (!homeTeam || !awayTeam) continue; // Should not happen with enough teams

      const gameDate = faker.date.future({ years: 0.1 }); // Games in near future for PoC
      gameDate.setHours(faker.number.int({ min: 13, max: 20 })); // Afternoon/Evening games
      gameDate.setMinutes(faker.helpers.arrayElement([0, 15, 30, 45]));
      gameDate.setSeconds(0);
      gameDate.setMilliseconds(0);

      const game: NFLGame = {
        gameId: faker.string.uuid(),
        weekNumber: w,
        homeTeamAbbreviation: homeTeam,
        awayTeamAbbreviation: awayTeam,
        gameDateTime_ISO: gameDate.toISOString(),
        matchupContextNotes: [faker.lorem.sentence(), faker.lorem.sentence()],
        homeScore: faker.number.int({ min: 0, max: 45 }),
        awayScore: faker.number.int({ min: 0, max: 45 }),
        gameStatus: faker.helpers.arrayElement(GAME_STATUSES),
      };
      games.push(game);
    }
  }
  return games;
};

const main = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const playersData = generatePlayers(75); // Generate 75 players
  fs.writeFileSync(path.join(OUTPUT_DIR, 'nfl-players.json'), JSON.stringify(playersData, null, 2));
  console.log(`Generated ${playersData.length} players in nfl-players.json`);

  const gamesData = generateGames(2, 8); // 2 weeks of games, 8 teams play (4 games per week)
  fs.writeFileSync(path.join(OUTPUT_DIR, 'nfl-games.json'), JSON.stringify(gamesData, null, 2));
  console.log(`Generated ${gamesData.length} games in nfl-games.json`);
};

main();