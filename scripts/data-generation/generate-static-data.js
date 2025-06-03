"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var faker_1 = require("@faker-js/faker");
var fs = require("fs");
var path = require("path");
var OUTPUT_DIR = path.join(__dirname, '../../data/static-nfl-data');
var NFL_TEAMS = ["LIO", "BEA", "PAC", "VIK", "EAG", "COW", "GIA", "COM", "RAM", "49E"];
var POSITIONS = ["QB", "RB", "WR", "TE", "K", "DEF"];
var PLAYER_STATUSES = ["Active", "Injured_Out", "Injured_Questionable", "Bye Week"];
var KEY_RATINGS = ["High", "Medium", "Low"];
var GAME_STATUSES = ["Scheduled", "InProgress", "Final"];
var generatePlayers = function (count) {
    var players = [];
    for (var i = 0; i < count; i++) {
        var position = faker_1.faker.helpers.arrayElement(POSITIONS);
        var player = {
            playerId: faker_1.faker.string.uuid(),
            fullName: faker_1.faker.person.fullName(),
            position: position,
            nflTeamAbbreviation: faker_1.faker.helpers.arrayElement(NFL_TEAMS),
            status: faker_1.faker.helpers.arrayElement(PLAYER_STATUSES),
            projectedPoints: faker_1.faker.number.float({ min: 0, max: position === 'DEF' || position === 'K' ? 15 : 30, fractionDigits: 1 }),
            keyAttributes: {
                consistencyRating: faker_1.faker.helpers.arrayElement(KEY_RATINGS),
                upsidePotential: faker_1.faker.helpers.arrayElement(KEY_RATINGS),
                role: faker_1.faker.lorem.words(3),
            },
            notes: faker_1.faker.lorem.sentence(),
        };
        players.push(player);
    }
    return players;
};
var generateGames = function (weeks, teamsPerWeek) {
    var games = [];
    for (var w = 1; w <= weeks; w++) {
        var weekTeams = faker_1.faker.helpers.shuffle(NFL_TEAMS); // Shuffle teams for variety
        for (var i = 0; i < teamsPerWeek / 2; i++) { // teamsPerWeek should be even
            var homeTeam = weekTeams[i * 2];
            var awayTeam = weekTeams[i * 2 + 1];
            if (!homeTeam || !awayTeam)
                continue; // Should not happen with enough teams
            var gameDate = faker_1.faker.date.future({ years: 0.1 }); // Games in near future for PoC
            gameDate.setHours(faker_1.faker.number.int({ min: 13, max: 20 })); // Afternoon/Evening games
            gameDate.setMinutes(faker_1.faker.helpers.arrayElement([0, 15, 30, 45]));
            gameDate.setSeconds(0);
            gameDate.setMilliseconds(0);
            var game = {
                gameId: faker_1.faker.string.uuid(),
                weekNumber: w,
                homeTeamAbbreviation: homeTeam,
                awayTeamAbbreviation: awayTeam,
                gameDateTime_ISO: gameDate.toISOString(),
                matchupContextNotes: [faker_1.faker.lorem.sentence(), faker_1.faker.lorem.sentence()],
                homeScore: faker_1.faker.number.int({ min: 0, max: 45 }),
                awayScore: faker_1.faker.number.int({ min: 0, max: 45 }),
                gameStatus: faker_1.faker.helpers.arrayElement(GAME_STATUSES),
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
