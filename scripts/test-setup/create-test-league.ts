/**
 * Test Setup Script for Story 1.12
 * Creates a test league with teams and lineups to test the scores page
 */

import { initializeDatabase } from '../../lib/dal/db';
import { createLeague, createFantasyTeam, saveWeeklyLineup } from '../../lib/dal/league.dal';
import { createUserProfile, findUserByEmail } from '../../lib/dal/user.dal';
import { getAllNFLPlayers } from '../../lib/dal/player.dal';
import { v4 as uuidv4 } from 'uuid';

async function createTestLeague() {
  console.log('🏈 Setting up test league for Story 1.12...');
  
  try {
    await initializeDatabase();
    
    // Get the default user (Kevin)
    const kevinUser = await findUserByEmail('kevlingo@gmail.com');
    if (!kevinUser) {
      throw new Error('Default user Kevin not found. Make sure to run the seeding script first.');
    }
    console.log(`✅ Found default user: ${kevinUser.username}`);

    // Create additional test users (only 3 more since Kevin will be the 4th)
    const testUsers = [kevinUser]; // Start with Kevin
    const timestamp = Date.now();
    for (let i = 1; i <= 3; i++) {
      const user = await createUserProfile({
        username: `TestUser${i}_${timestamp}`,
        email: `testuser${i}_${timestamp}@example.com`,
        passwordHash: 'hashedpassword123'
      });
      testUsers.push(user);
      console.log(`✅ Created test user: ${user.username}`);
    }
    
    // Create a test league
    const league = await createLeague(
      'Test League for Scores',
      testUsers[0].userId, // First test user as commissioner
      8, // 8 teams (minimum allowed)
      'PPR'
    );
    console.log(`✅ Created test league: ${league.leagueName} (${league.leagueId})`);
    
    // Create fantasy teams (only create 4 teams for testing, even though league allows 8)
    const teams = [];
    const teamNames = ['Kevin\'s Team', 'Team Beta', 'Team Gamma', 'Team Delta'];

    for (let i = 0; i < 4; i++) {
      const userId = testUsers[i].userId;
      const team = await createFantasyTeam(
        league.leagueId,
        userId,
        teamNames[i]
      );
      teams.push(team);
      console.log(`✅ Created fantasy team: ${team.teamName} (${team.teamId})`);
    }
    
    // Get available players
    const allPlayers = await getAllNFLPlayers();
    console.log(`📋 Found ${allPlayers.length} available players`);
    
    // Create lineups for each team
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      
      // Simple lineup: take 7 players starting from different positions
      const startIndex = i * 7;
      const starters = allPlayers.slice(startIndex, startIndex + 7).map(p => p.playerId);
      const bench = allPlayers.slice(startIndex + 7, startIndex + 10).map(p => p.playerId);
      
      // Save lineup for week 1
      await saveWeeklyLineup(
        team.teamId,
        league.leagueId,
        1,
        starters,
        bench
      );
      
      // Save lineup for week 2 (slightly different)
      const week2Starters = allPlayers.slice(startIndex + 1, startIndex + 8).map(p => p.playerId);
      const week2Bench = allPlayers.slice(startIndex + 8, startIndex + 11).map(p => p.playerId);
      
      await saveWeeklyLineup(
        team.teamId,
        league.leagueId,
        2,
        week2Starters,
        week2Bench
      );
      
      console.log(`✅ Created lineups for ${team.teamName} (weeks 1-2)`);
    }
    
    console.log('\n🎉 Test setup complete!');
    console.log(`\n📝 Test Information:`);
    console.log(`League ID: ${league.leagueId}`);
    console.log(`League Name: ${league.leagueName}`);
    console.log(`Teams: ${teams.length}`);
    console.log(`\n🌐 Test the scores page at:`);
    console.log(`http://localhost:3000/league/${league.leagueId}/scores`);
    console.log(`\n👤 Login with any of these test users:`);
    testUsers.forEach((user, index) => {
      console.log(`  - ${user.username} (${user.email}) - Team: ${teamNames[index]}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up test league:', error);
  }
}

// Run the setup
createTestLeague();
