import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
var OUTPUT_DIR = path.join(__dirname, '../../data/static-nfl-data');
var NFL_TEAMS = ["LIO", "BEA", "PAC", "VIK", "EAG", "COW", "GIA", "COM", "RAM", "49E"];
var POSITIONS = ["QB", "RB", "WR", "TE", "K", "DEF"];
var PLAYER_STATUSES = ["Active", "Injured_Out", "Injured_Questionable", "Bye Week"];
var KEY_RATINGS = ["High", "Medium", "Low"];
var GAME_STATUSES = ["Scheduled", "InProgress", "Final"];
var generatePlayers = function (count) {
    var players = [];
    for (var i = 0; i < count; i++) {
        var position = faker.helpers.arrayElement(POSITIONS);
        var player = {
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
var generateGames = function (weeks, teamsPerWeek) {
    var games = [];
    for (var w = 1; w <= weeks; w++) {
        var weekTeams = faker.helpers.shuffle(NFL_TEAMS); // Shuffle teams for variety
        for (var i = 0; i < teamsPerWeek / 2; i++) { // teamsPerWeek should be even
            var homeTeam = weekTeams[i * 2];
            var awayTeam = weekTeams[i * 2 + 1];
            if (!homeTeam || !awayTeam)
                continue; // Should not happen with enough teams
            var gameDate = faker.date.future({ years: 0.1 }); // Games in near future for PoC
            gameDate.setHours(faker.number.int({ min: 13, max: 20 })); // Afternoon/Evening games
            gameDate.setMinutes(faker.helpers.arrayElement([0, 15, 30, 45]));
            gameDate.setSeconds(0);
            gameDate.setMilliseconds(0);
            var game = {
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
var main = function () {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    var playersData = generatePlayers(75); // Generate 75 players
    fs.writeFileSync(path.join(OUTPUT_DIR, 'nfl-players.json'), JSON.stringify(playersData, null, 2));
    console.log("Generated ".concat(playersData.length, " players in nfl-players.json"));
    var gamesData = generateGames(2, 8); // 2 weeks of games, 8 teams play (4 games per week)
    fs.writeFileSync(path.join(OUTPUT_DIR, 'nfl-games.json'), JSON.stringify(gamesData, null, 2));
    console.log("Generated ".concat(gamesData.length, " games in nfl-games.json"));
};
main();
