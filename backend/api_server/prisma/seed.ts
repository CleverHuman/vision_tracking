import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Clean up existing data in reverse-dependency order ───────────────────────
  console.log('Cleaning existing data...');
  await prisma.notification.deleteMany();
  await prisma.annotation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.highlight.deleteMany();
  await prisma.event.deleteMany();
  await prisma.playerTracking.deleteMany();
  await prisma.analysisJob.deleteMany();
  await prisma.video.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.organization.deleteMany();
  console.log('Existing data cleaned.');

  // ─── Organizations ────────────────────────────────────────────────────────────
  console.log('Creating organizations...');

  const eliteSportsOrg = await prisma.organization.create({
    data: {
      name: 'Elite Sports Analytics',
      plan: 'PRO',
      logoUrl: 'https://cdn.example.com/logos/elite-sports-analytics.png',
    },
  });

  const championPerfOrg = await prisma.organization.create({
    data: {
      name: 'Champion Performance Group',
      plan: 'ENTERPRISE',
      logoUrl: 'https://cdn.example.com/logos/champion-performance-group.png',
    },
  });

  console.log(`Created organizations: ${eliteSportsOrg.id}, ${championPerfOrg.id}`);

  // ─── Teams ────────────────────────────────────────────────────────────────────
  console.log('Creating teams...');

  const fcBarcelonaAcademy = await prisma.team.create({
    data: {
      name: 'FC Barcelona Academy',
      sport: 'soccer',
      primaryColor: '#A50044',
      secondaryColor: '#004D98',
      logoUrl: 'https://cdn.example.com/logos/fc-barcelona-academy.png',
      organizationId: eliteSportsOrg.id,
    },
  });

  const laLakersYouth = await prisma.team.create({
    data: {
      name: 'LA Lakers Youth',
      sport: 'basketball',
      primaryColor: '#552583',
      secondaryColor: '#FDB927',
      logoUrl: 'https://cdn.example.com/logos/la-lakers-youth.png',
      organizationId: championPerfOrg.id,
    },
  });

  const nyYankeesProspects = await prisma.team.create({
    data: {
      name: 'NY Yankees Prospects',
      sport: 'baseball',
      primaryColor: '#003087',
      secondaryColor: '#E4002C',
      logoUrl: 'https://cdn.example.com/logos/ny-yankees-prospects.png',
      organizationId: championPerfOrg.id,
    },
  });

  console.log(`Created teams: ${fcBarcelonaAcademy.id}, ${laLakersYouth.id}, ${nyYankeesProspects.id}`);

  // ─── Users ────────────────────────────────────────────────────────────────────
  console.log('Creating users...');

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // COACH - Soccer
  const coachSoccer = await prisma.user.create({
    data: {
      email: 'carlos.mendez@elitesports.com',
      username: 'carlos.mendez',
      passwordHash: hashedPassword,
      fullName: 'Carlos Mendez',
      role: 'COACH',
      sport: 'soccer',
      teamId: fcBarcelonaAcademy.id,
      avatarUrl: 'https://cdn.example.com/avatars/carlos-mendez.jpg',
    },
  });

  // COACH - Basketball
  const coachBasketball = await prisma.user.create({
    data: {
      email: 'james.harrison@championperf.com',
      username: 'james.harrison',
      passwordHash: hashedPassword,
      fullName: 'James Harrison',
      role: 'COACH',
      sport: 'basketball',
      teamId: laLakersYouth.id,
      avatarUrl: 'https://cdn.example.com/avatars/james-harrison.jpg',
    },
  });

  // COACH - Baseball
  const coachBaseball = await prisma.user.create({
    data: {
      email: 'mike.tanaka@championperf.com',
      username: 'mike.tanaka',
      passwordHash: hashedPassword,
      fullName: 'Mike Tanaka',
      role: 'COACH',
      sport: 'baseball',
      teamId: nyYankeesProspects.id,
      avatarUrl: 'https://cdn.example.com/avatars/mike-tanaka.jpg',
    },
  });

  // ANALYST 1
  const analyst1 = await prisma.user.create({
    data: {
      email: 'sophia.chen@elitesports.com',
      username: 'sophia.chen',
      passwordHash: hashedPassword,
      fullName: 'Sophia Chen',
      role: 'ANALYST',
      sport: 'soccer',
      teamId: fcBarcelonaAcademy.id,
      avatarUrl: 'https://cdn.example.com/avatars/sophia-chen.jpg',
    },
  });

  // ANALYST 2
  const analyst2 = await prisma.user.create({
    data: {
      email: 'david.okafor@championperf.com',
      username: 'david.okafor',
      passwordHash: hashedPassword,
      fullName: 'David Okafor',
      role: 'ANALYST',
      sport: 'basketball',
      teamId: laLakersYouth.id,
      avatarUrl: 'https://cdn.example.com/avatars/david-okafor.jpg',
    },
  });

  // ATHLETE 1
  const athlete1 = await prisma.user.create({
    data: {
      email: 'marco.rossi@elitesports.com',
      username: 'marco.rossi',
      passwordHash: hashedPassword,
      fullName: 'Marco Rossi',
      role: 'ATHLETE',
      sport: 'soccer',
      teamId: fcBarcelonaAcademy.id,
      avatarUrl: 'https://cdn.example.com/avatars/marco-rossi.jpg',
    },
  });

  // ATHLETE 2
  const athlete2 = await prisma.user.create({
    data: {
      email: 'tyrone.jackson@championperf.com',
      username: 'tyrone.jackson',
      passwordHash: hashedPassword,
      fullName: 'Tyrone Jackson',
      role: 'ATHLETE',
      sport: 'basketball',
      teamId: laLakersYouth.id,
      avatarUrl: 'https://cdn.example.com/avatars/tyrone-jackson.jpg',
    },
  });

  // ATHLETE 3
  const athlete3 = await prisma.user.create({
    data: {
      email: 'derek.martinez@championperf.com',
      username: 'derek.martinez',
      passwordHash: hashedPassword,
      fullName: 'Derek Martinez',
      role: 'ATHLETE',
      sport: 'baseball',
      teamId: nyYankeesProspects.id,
      avatarUrl: 'https://cdn.example.com/avatars/derek-martinez.jpg',
    },
  });

  // SCOUT
  const scout = await prisma.user.create({
    data: {
      email: 'elena.volkov@championperf.com',
      username: 'elena.volkov',
      passwordHash: hashedPassword,
      fullName: 'Elena Volkov',
      role: 'SCOUT',
      sport: 'soccer',
      teamId: fcBarcelonaAcademy.id,
      avatarUrl: 'https://cdn.example.com/avatars/elena-volkov.jpg',
    },
  });

  // MANAGER
  const manager = await prisma.user.create({
    data: {
      email: 'robert.williams@championperf.com',
      username: 'robert.williams',
      passwordHash: hashedPassword,
      fullName: 'Robert Williams',
      role: 'MANAGER',
      teamId: laLakersYouth.id,
      avatarUrl: 'https://cdn.example.com/avatars/robert-williams.jpg',
    },
  });

  console.log('Created 10 users.');

  // ─── Players ──────────────────────────────────────────────────────────────────
  console.log('Creating players...');

  // ── FC Barcelona Academy (Soccer) ─────────────────────────────────────────────
  const soccerPlayersData = [
    { name: 'Alejandro Ruiz', jerseyNumber: 1, position: 'GK', nationality: 'Spain', dob: '2005-03-14' },
    { name: 'Marc Puig', jerseyNumber: 2, position: 'RB', nationality: 'Spain', dob: '2004-07-22' },
    { name: 'Lucas Ferreira', jerseyNumber: 3, position: 'CB', nationality: 'Brazil', dob: '2005-01-09' },
    { name: 'Antoine Dupont', jerseyNumber: 4, position: 'CB', nationality: 'France', dob: '2004-11-30' },
    { name: 'Jordi Moreno', jerseyNumber: 5, position: 'LB', nationality: 'Spain', dob: '2005-05-18' },
    { name: 'Kenji Yamamoto', jerseyNumber: 6, position: 'CDM', nationality: 'Japan', dob: '2004-09-02' },
    { name: 'Pablo Gutierrez', jerseyNumber: 7, position: 'RW', nationality: 'Argentina', dob: '2005-02-25' },
    { name: 'Luka Petrovic', jerseyNumber: 8, position: 'CM', nationality: 'Croatia', dob: '2004-06-11' },
    { name: 'Gabriel Santos', jerseyNumber: 9, position: 'ST', nationality: 'Brazil', dob: '2004-12-04' },
    { name: 'Emiliano Costa', jerseyNumber: 10, position: 'CAM', nationality: 'Argentina', dob: '2005-08-19' },
    { name: 'Ousmane Diallo', jerseyNumber: 11, position: 'LW', nationality: 'Senegal', dob: '2004-04-07' },
    { name: 'Adrian Vidal', jerseyNumber: 12, position: 'GK', nationality: 'Spain', dob: '2005-10-16' },
    { name: 'Tomas Alvarez', jerseyNumber: 13, position: 'CB', nationality: 'Spain', dob: '2004-08-23' },
    { name: 'Nico Hartmann', jerseyNumber: 14, position: 'CM', nationality: 'Germany', dob: '2005-06-01' },
    { name: 'Rafael Oliveira', jerseyNumber: 15, position: 'RB', nationality: 'Portugal', dob: '2004-03-28' },
    { name: 'Ibrahim Kone', jerseyNumber: 16, position: 'CDM', nationality: 'Mali', dob: '2005-11-12' },
    { name: 'Diego Ramirez', jerseyNumber: 17, position: 'LW', nationality: 'Mexico', dob: '2004-01-15' },
    { name: 'Sandro Messi', jerseyNumber: 18, position: 'CAM', nationality: 'Spain', dob: '2005-04-30' },
    { name: 'Victor Romero', jerseyNumber: 19, position: 'ST', nationality: 'Spain', dob: '2004-10-08' },
    { name: 'Hugo Navarro', jerseyNumber: 20, position: 'RW', nationality: 'Spain', dob: '2005-07-14' },
  ];

  const soccerPlayers = [];
  for (const pd of soccerPlayersData) {
    const player = await prisma.player.create({
      data: {
        name: pd.name,
        jerseyNumber: pd.jerseyNumber,
        position: pd.position,
        teamId: fcBarcelonaAcademy.id,
        nationality: pd.nationality,
        dateOfBirth: new Date(pd.dob),
        isActive: true,
        stats: {
          gamesPlayed: Math.floor(Math.random() * 20) + 10,
          goals: pd.position === 'ST' ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 5),
          assists: Math.floor(Math.random() * 8),
          minutesPlayed: Math.floor(Math.random() * 1500) + 500,
          passAccuracy: +(Math.random() * 20 + 70).toFixed(1),
        },
      },
    });
    soccerPlayers.push(player);
  }

  // ── LA Lakers Youth (Basketball) ──────────────────────────────────────────────
  const basketballPlayersData = [
    { name: 'Jaylen Brooks', jerseyNumber: 0, position: 'PG', nationality: 'USA', dob: '2005-02-10' },
    { name: 'DeAndre Washington', jerseyNumber: 1, position: 'SG', nationality: 'USA', dob: '2004-09-15' },
    { name: 'Marcus Thompson', jerseyNumber: 2, position: 'SF', nationality: 'USA', dob: '2005-05-22' },
    { name: 'Terrence Davis', jerseyNumber: 3, position: 'PF', nationality: 'USA', dob: '2004-11-08' },
    { name: 'Kwame Asante', jerseyNumber: 4, position: 'C', nationality: 'Ghana', dob: '2004-06-30' },
    { name: 'Carlos Rivera', jerseyNumber: 5, position: 'PG', nationality: 'Puerto Rico', dob: '2005-01-17' },
    { name: 'Darius Mitchell', jerseyNumber: 10, position: 'SG', nationality: 'USA', dob: '2004-08-04' },
    { name: 'Andre Foster', jerseyNumber: 11, position: 'SF', nationality: 'USA', dob: '2005-03-29' },
    { name: 'Jamal Henderson', jerseyNumber: 12, position: 'PF', nationality: 'USA', dob: '2004-12-18' },
    { name: 'Nikola Jovanovic', jerseyNumber: 13, position: 'C', nationality: 'Serbia', dob: '2005-07-06' },
    { name: 'Isaiah Coleman', jerseyNumber: 14, position: 'PG', nationality: 'USA', dob: '2004-04-21' },
    { name: 'Trevon Harris', jerseyNumber: 15, position: 'SG', nationality: 'USA', dob: '2005-10-03' },
    { name: 'Brandon Liu', jerseyNumber: 20, position: 'SF', nationality: 'USA', dob: '2004-02-14' },
    { name: 'Malik Robinson', jerseyNumber: 21, position: 'PF', nationality: 'USA', dob: '2005-09-27' },
    { name: 'Emeka Obi', jerseyNumber: 22, position: 'C', nationality: 'Nigeria', dob: '2004-05-11' },
    { name: 'Tyler Chen', jerseyNumber: 23, position: 'SG', nationality: 'USA', dob: '2005-08-08' },
    { name: 'Xavier Morales', jerseyNumber: 24, position: 'PG', nationality: 'Dominican Republic', dob: '2004-10-25' },
    { name: 'Rashid Brown', jerseyNumber: 30, position: 'SF', nationality: 'USA', dob: '2005-06-13' },
    { name: 'Dominic White', jerseyNumber: 32, position: 'PF', nationality: 'USA', dob: '2004-01-02' },
    { name: 'Liam OConnor', jerseyNumber: 33, position: 'C', nationality: 'Australia', dob: '2005-11-19' },
  ];

  const basketballPlayers = [];
  for (const pd of basketballPlayersData) {
    const player = await prisma.player.create({
      data: {
        name: pd.name,
        jerseyNumber: pd.jerseyNumber,
        position: pd.position,
        teamId: laLakersYouth.id,
        nationality: pd.nationality,
        dateOfBirth: new Date(pd.dob),
        isActive: true,
        stats: {
          gamesPlayed: Math.floor(Math.random() * 25) + 10,
          points: Math.floor(Math.random() * 300) + 50,
          rebounds: Math.floor(Math.random() * 150) + 20,
          assists: Math.floor(Math.random() * 120) + 10,
          steals: Math.floor(Math.random() * 40) + 5,
          blocks: Math.floor(Math.random() * 30) + 2,
          fieldGoalPct: +(Math.random() * 20 + 35).toFixed(1),
        },
      },
    });
    basketballPlayers.push(player);
  }

  // ── NY Yankees Prospects (Baseball) ───────────────────────────────────────────
  const baseballPlayersData = [
    { name: 'Ryan Cooper', jerseyNumber: 1, position: 'P', nationality: 'USA', dob: '2004-03-05' },
    { name: 'Miguel Hernandez', jerseyNumber: 2, position: 'C', nationality: 'Dominican Republic', dob: '2005-06-18' },
    { name: 'Jake Sullivan', jerseyNumber: 3, position: '1B', nationality: 'USA', dob: '2004-09-22' },
    { name: 'Tomohiro Sato', jerseyNumber: 4, position: '2B', nationality: 'Japan', dob: '2005-01-30' },
    { name: 'Brandon Mitchell', jerseyNumber: 5, position: '3B', nationality: 'USA', dob: '2004-07-14' },
    { name: 'Luis Castillo', jerseyNumber: 6, position: 'SS', nationality: 'Venezuela', dob: '2005-04-09' },
    { name: 'Chris Peterson', jerseyNumber: 7, position: 'LF', nationality: 'USA', dob: '2004-11-26' },
    { name: 'Antonio Reyes', jerseyNumber: 8, position: 'CF', nationality: 'Cuba', dob: '2005-08-12' },
    { name: 'Dylan Turner', jerseyNumber: 9, position: 'RF', nationality: 'USA', dob: '2004-02-03' },
    { name: 'Hector Ramirez', jerseyNumber: 10, position: 'DH', nationality: 'Puerto Rico', dob: '2005-10-07' },
    { name: 'Steven Kim', jerseyNumber: 11, position: 'P', nationality: 'South Korea', dob: '2004-05-21' },
    { name: 'Trevor Barnes', jerseyNumber: 12, position: 'P', nationality: 'USA', dob: '2005-12-15' },
    { name: 'Juan Delgado', jerseyNumber: 13, position: 'C', nationality: 'Colombia', dob: '2004-08-30' },
    { name: 'Ethan Moore', jerseyNumber: 14, position: '1B', nationality: 'USA', dob: '2005-03-17' },
    { name: 'Carlos Vega', jerseyNumber: 15, position: 'SS', nationality: 'Mexico', dob: '2004-06-04' },
    { name: 'Nathan Wells', jerseyNumber: 16, position: 'LF', nationality: 'USA', dob: '2005-09-23' },
    { name: 'Omar Alvarez', jerseyNumber: 17, position: 'CF', nationality: 'Panama', dob: '2004-12-11' },
    { name: 'Dustin Reed', jerseyNumber: 18, position: 'RF', nationality: 'USA', dob: '2005-02-28' },
    { name: 'Kenji Watanabe', jerseyNumber: 19, position: '2B', nationality: 'Japan', dob: '2004-04-16' },
    { name: 'Aaron Phillips', jerseyNumber: 20, position: '3B', nationality: 'USA', dob: '2005-07-09' },
  ];

  const baseballPlayers = [];
  for (const pd of baseballPlayersData) {
    const player = await prisma.player.create({
      data: {
        name: pd.name,
        jerseyNumber: pd.jerseyNumber,
        position: pd.position,
        teamId: nyYankeesProspects.id,
        nationality: pd.nationality,
        dateOfBirth: new Date(pd.dob),
        isActive: true,
        stats: {
          gamesPlayed: Math.floor(Math.random() * 30) + 10,
          atBats: pd.position === 'P' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 200) + 80,
          hits: Math.floor(Math.random() * 60) + 10,
          homeRuns: Math.floor(Math.random() * 10),
          rbi: Math.floor(Math.random() * 40) + 5,
          battingAvg: +(Math.random() * 0.15 + 0.20).toFixed(3),
          era: pd.position === 'P' ? +(Math.random() * 3 + 2).toFixed(2) : undefined,
          strikeouts: pd.position === 'P' ? Math.floor(Math.random() * 80) + 30 : undefined,
        },
      },
    });
    baseballPlayers.push(player);
  }

  console.log('Created 60 players (20 per team).');

  // ─── Matches ──────────────────────────────────────────────────────────────────
  console.log('Creating matches...');

  // ── Soccer Matches ────────────────────────────────────────────────────────────
  const soccerMatchesData = [
    {
      homeTeam: 'FC Barcelona Academy',
      awayTeam: 'Real Madrid Juvenil',
      homeScore: 3,
      awayScore: 1,
      date: '2024-02-10T18:00:00Z',
      venue: 'Estadi Johan Cruyff',
      competition: 'La Liga Juvenil',
      season: '2023-2024',
      result: 'WIN' as const,
      weather: 'Clear, 18C',
    },
    {
      homeTeam: 'Atletico Madrid Youth',
      awayTeam: 'FC Barcelona Academy',
      homeScore: 0,
      awayScore: 2,
      date: '2024-03-15T17:30:00Z',
      venue: 'Ciudad Deportiva Wanda',
      competition: 'La Liga Juvenil',
      season: '2023-2024',
      result: 'WIN' as const,
      weather: 'Overcast, 14C',
    },
    {
      homeTeam: 'FC Barcelona Academy',
      awayTeam: 'Valencia CF Academy',
      homeScore: 1,
      awayScore: 1,
      date: '2024-04-20T16:00:00Z',
      venue: 'Estadi Johan Cruyff',
      competition: 'La Liga Juvenil',
      season: '2023-2024',
      result: 'DRAW' as const,
      weather: 'Partly Cloudy, 20C',
    },
    {
      homeTeam: 'Sevilla FC Youth',
      awayTeam: 'FC Barcelona Academy',
      homeScore: 2,
      awayScore: 1,
      date: '2024-05-11T19:00:00Z',
      venue: 'Ciudad Deportiva Jose Ramon Cisneros',
      competition: 'La Liga Juvenil',
      season: '2023-2024',
      result: 'LOSS' as const,
      weather: 'Hot, 30C',
    },
    {
      homeTeam: 'FC Barcelona Academy',
      awayTeam: 'Bayern Munich Youth',
      homeScore: 2,
      awayScore: 0,
      date: '2024-09-18T20:00:00Z',
      venue: 'Estadi Johan Cruyff',
      competition: 'UEFA Youth League',
      season: '2024-2025',
      result: 'WIN' as const,
      weather: 'Clear, 22C',
    },
  ];

  const soccerMatches = [];
  for (const md of soccerMatchesData) {
    const match = await prisma.match.create({
      data: {
        homeTeam: md.homeTeam,
        awayTeam: md.awayTeam,
        homeScore: md.homeScore,
        awayScore: md.awayScore,
        date: new Date(md.date),
        venue: md.venue,
        competition: md.competition,
        season: md.season,
        sport: 'soccer',
        weather: md.weather,
        result: md.result,
        teamId: fcBarcelonaAcademy.id,
        analysisStatus: md === soccerMatchesData[0] ? 'COMPLETED' : 'PENDING',
      },
    });
    soccerMatches.push(match);
  }

  // ── Basketball Matches ────────────────────────────────────────────────────────
  const basketballMatchesData = [
    {
      homeTeam: 'LA Lakers Youth',
      awayTeam: 'Boston Celtics Jr.',
      homeScore: 98,
      awayScore: 87,
      date: '2024-01-12T19:30:00Z',
      venue: 'UCLA Pauley Pavilion',
      competition: 'EYBL Spring',
      season: '2023-2024',
      result: 'WIN' as const,
      weather: null,
    },
    {
      homeTeam: 'Chicago Bulls Academy',
      awayTeam: 'LA Lakers Youth',
      homeScore: 102,
      awayScore: 95,
      date: '2024-02-24T18:00:00Z',
      venue: 'United Center Training Facility',
      competition: 'EYBL Spring',
      season: '2023-2024',
      result: 'LOSS' as const,
      weather: null,
    },
    {
      homeTeam: 'LA Lakers Youth',
      awayTeam: 'Miami Heat Jr.',
      homeScore: 110,
      awayScore: 104,
      date: '2024-04-06T20:00:00Z',
      venue: 'UCLA Pauley Pavilion',
      competition: 'EYBL Spring',
      season: '2023-2024',
      result: 'WIN' as const,
      weather: null,
    },
    {
      homeTeam: 'Golden State Warriors Youth',
      awayTeam: 'LA Lakers Youth',
      homeScore: 89,
      awayScore: 91,
      date: '2024-06-15T17:00:00Z',
      venue: 'Chase Center Training Facility',
      competition: 'Summer League Prep',
      season: '2023-2024',
      result: 'WIN' as const,
      weather: null,
    },
    {
      homeTeam: 'LA Lakers Youth',
      awayTeam: 'Phoenix Suns Academy',
      homeScore: 85,
      awayScore: 92,
      date: '2024-08-22T19:00:00Z',
      venue: 'UCLA Pauley Pavilion',
      competition: 'Summer Invitational',
      season: '2024-2025',
      result: 'LOSS' as const,
      weather: null,
    },
  ];

  const basketballMatches = [];
  for (const md of basketballMatchesData) {
    const match = await prisma.match.create({
      data: {
        homeTeam: md.homeTeam,
        awayTeam: md.awayTeam,
        homeScore: md.homeScore,
        awayScore: md.awayScore,
        date: new Date(md.date),
        venue: md.venue,
        competition: md.competition,
        season: md.season,
        sport: 'basketball',
        weather: md.weather,
        result: md.result,
        teamId: laLakersYouth.id,
        analysisStatus: 'PENDING',
      },
    });
    basketballMatches.push(match);
  }

  // ── Baseball Matches ──────────────────────────────────────────────────────────
  const baseballMatchesData = [
    {
      homeTeam: 'NY Yankees Prospects',
      awayTeam: 'Boston Red Sox Rookies',
      homeScore: 7,
      awayScore: 3,
      date: '2024-03-20T13:00:00Z',
      venue: 'George M. Steinbrenner Field',
      competition: 'Florida Instructional League',
      season: '2024',
      result: 'WIN' as const,
      weather: 'Sunny, 28C',
    },
    {
      homeTeam: 'Houston Astros Prospects',
      awayTeam: 'NY Yankees Prospects',
      homeScore: 5,
      awayScore: 4,
      date: '2024-04-14T18:00:00Z',
      venue: 'FITTEAM Ballpark',
      competition: 'Florida Instructional League',
      season: '2024',
      result: 'LOSS' as const,
      weather: 'Humid, 31C',
    },
    {
      homeTeam: 'NY Yankees Prospects',
      awayTeam: 'LA Dodgers Farmhands',
      homeScore: 6,
      awayScore: 2,
      date: '2024-05-28T19:00:00Z',
      venue: 'George M. Steinbrenner Field',
      competition: 'Florida Instructional League',
      season: '2024',
      result: 'WIN' as const,
      weather: 'Clear, 27C',
    },
    {
      homeTeam: 'Tampa Bay Rays Juniors',
      awayTeam: 'NY Yankees Prospects',
      homeScore: 3,
      awayScore: 3,
      date: '2024-07-04T14:00:00Z',
      venue: 'Charlotte Sports Park',
      competition: 'Gulf Coast League',
      season: '2024',
      result: 'DRAW' as const,
      weather: 'Overcast, 29C',
    },
    {
      homeTeam: 'NY Yankees Prospects',
      awayTeam: 'Atlanta Braves Prospects',
      homeScore: 8,
      awayScore: 5,
      date: '2024-08-10T18:30:00Z',
      venue: 'George M. Steinbrenner Field',
      competition: 'Gulf Coast League',
      season: '2024',
      result: 'WIN' as const,
      weather: 'Partly Cloudy, 32C',
    },
  ];

  const baseballMatches = [];
  for (const md of baseballMatchesData) {
    const match = await prisma.match.create({
      data: {
        homeTeam: md.homeTeam,
        awayTeam: md.awayTeam,
        homeScore: md.homeScore,
        awayScore: md.awayScore,
        date: new Date(md.date),
        venue: md.venue,
        competition: md.competition,
        season: md.season,
        sport: 'baseball',
        weather: md.weather,
        result: md.result,
        teamId: nyYankeesProspects.id,
        analysisStatus: 'PENDING',
      },
    });
    baseballMatches.push(match);
  }

  console.log('Created 15 matches (5 per team).');

  // ─── Videos ───────────────────────────────────────────────────────────────────
  console.log('Creating videos...');

  // Soccer videos (4 videos for first 4 matches)
  const soccerVideo1 = await prisma.video.create({
    data: {
      title: 'FC Barcelona Academy vs Real Madrid Juvenil - Full Match',
      description: 'La Liga Juvenil matchday 22. Dominant performance with 3-1 victory.',
      s3Key: `videos/${coachSoccer.id}/a1b2c3d4-e5f6-7890-abcd-ef1234567890/barca-vs-real-madrid.mp4`,
      s3Url: `https://vision-tracking-prod.s3.eu-west-1.amazonaws.com/videos/${coachSoccer.id}/a1b2c3d4-e5f6-7890-abcd-ef1234567890/barca-vs-real-madrid.mp4`,
      thumbnailUrl: 'https://cdn.example.com/thumbnails/barca-vs-real-madrid.jpg',
      duration: 5640,
      fileSize: BigInt(2_147_483_648),
      mimeType: 'video/mp4',
      status: 'COMPLETED',
      uploadedById: coachSoccer.id,
      teamId: fcBarcelonaAcademy.id,
      matchId: soccerMatches[0].id,
      category: 'MATCH',
      sport: 'soccer',
      tags: ['la-liga-juvenil', 'el-clasico', 'full-match'],
      viewCount: 47,
    },
  });

  const soccerVideo2 = await prisma.video.create({
    data: {
      title: 'Atletico Madrid Youth vs FC Barcelona Academy',
      description: 'Away victory 2-0 against Atletico Madrid Youth.',
      s3Key: `videos/${analyst1.id}/b2c3d4e5-f6a7-8901-bcde-f12345678901/atletico-vs-barca.mp4`,
      s3Url: `https://vision-tracking-prod.s3.eu-west-1.amazonaws.com/videos/${analyst1.id}/b2c3d4e5-f6a7-8901-bcde-f12345678901/atletico-vs-barca.mp4`,
      thumbnailUrl: 'https://cdn.example.com/thumbnails/atletico-vs-barca.jpg',
      duration: 5580,
      fileSize: BigInt(1_986_000_000),
      mimeType: 'video/mp4',
      status: 'COMPLETED',
      uploadedById: analyst1.id,
      teamId: fcBarcelonaAcademy.id,
      matchId: soccerMatches[1].id,
      category: 'MATCH',
      sport: 'soccer',
      tags: ['la-liga-juvenil', 'away', 'full-match'],
      viewCount: 32,
    },
  });

  const soccerVideo3 = await prisma.video.create({
    data: {
      title: 'FC Barcelona Academy vs Valencia CF Academy',
      description: '1-1 draw at home. Defensive analysis needed.',
      s3Key: `videos/${coachSoccer.id}/c3d4e5f6-a7b8-9012-cdef-123456789012/barca-vs-valencia.mp4`,
      s3Url: `https://vision-tracking-prod.s3.eu-west-1.amazonaws.com/videos/${coachSoccer.id}/c3d4e5f6-a7b8-9012-cdef-123456789012/barca-vs-valencia.mp4`,
      thumbnailUrl: 'https://cdn.example.com/thumbnails/barca-vs-valencia.jpg',
      duration: 5700,
      fileSize: BigInt(2_034_000_000),
      mimeType: 'video/mp4',
      status: 'COMPLETED',
      uploadedById: coachSoccer.id,
      teamId: fcBarcelonaAcademy.id,
      matchId: soccerMatches[2].id,
      category: 'MATCH',
      sport: 'soccer',
      tags: ['la-liga-juvenil', 'draw', 'full-match'],
      viewCount: 18,
    },
  });

  // Basketball videos (3 videos)
  const basketballVideo1 = await prisma.video.create({
    data: {
      title: 'LA Lakers Youth vs Boston Celtics Jr. - Game Film',
      description: 'EYBL Spring game. 98-87 win with strong third quarter.',
      s3Key: `videos/${coachBasketball.id}/d4e5f6a7-b8c9-0123-defa-234567890123/lakers-vs-celtics.mp4`,
      s3Url: `https://vision-tracking-prod.s3.us-west-2.amazonaws.com/videos/${coachBasketball.id}/d4e5f6a7-b8c9-0123-defa-234567890123/lakers-vs-celtics.mp4`,
      thumbnailUrl: 'https://cdn.example.com/thumbnails/lakers-vs-celtics.jpg',
      duration: 7200,
      fileSize: BigInt(2_500_000_000),
      mimeType: 'video/mp4',
      status: 'COMPLETED',
      uploadedById: coachBasketball.id,
      teamId: laLakersYouth.id,
      matchId: basketballMatches[0].id,
      category: 'MATCH',
      sport: 'basketball',
      tags: ['eybl', 'full-game', 'win'],
      viewCount: 55,
    },
  });

  const basketballVideo2 = await prisma.video.create({
    data: {
      title: 'LA Lakers Youth vs Miami Heat Jr.',
      description: 'Competitive 110-104 victory. Excellent offensive execution.',
      s3Key: `videos/${analyst2.id}/e5f6a7b8-c9d0-1234-efab-345678901234/lakers-vs-heat.mp4`,
      s3Url: `https://vision-tracking-prod.s3.us-west-2.amazonaws.com/videos/${analyst2.id}/e5f6a7b8-c9d0-1234-efab-345678901234/lakers-vs-heat.mp4`,
      thumbnailUrl: 'https://cdn.example.com/thumbnails/lakers-vs-heat.jpg',
      duration: 6900,
      fileSize: BigInt(2_350_000_000),
      mimeType: 'video/mp4',
      status: 'COMPLETED',
      uploadedById: analyst2.id,
      teamId: laLakersYouth.id,
      matchId: basketballMatches[2].id,
      category: 'MATCH',
      sport: 'basketball',
      tags: ['eybl', 'full-game', 'offensive-highlight'],
      viewCount: 38,
    },
  });

  // Baseball videos (3 videos)
  const baseballVideo1 = await prisma.video.create({
    data: {
      title: 'NY Yankees Prospects vs Red Sox Rookies',
      description: 'Spring training game. 7-3 win with strong pitching.',
      s3Key: `videos/${coachBaseball.id}/f6a7b8c9-d0e1-2345-fabc-456789012345/yankees-vs-redsox.mp4`,
      s3Url: `https://vision-tracking-prod.s3.us-east-1.amazonaws.com/videos/${coachBaseball.id}/f6a7b8c9-d0e1-2345-fabc-456789012345/yankees-vs-redsox.mp4`,
      thumbnailUrl: 'https://cdn.example.com/thumbnails/yankees-vs-redsox.jpg',
      duration: 10800,
      fileSize: BigInt(3_200_000_000),
      mimeType: 'video/mp4',
      status: 'COMPLETED',
      uploadedById: coachBaseball.id,
      teamId: nyYankeesProspects.id,
      matchId: baseballMatches[0].id,
      category: 'MATCH',
      sport: 'baseball',
      tags: ['florida-instructional', 'full-game', 'pitching'],
      viewCount: 22,
    },
  });

  const baseballVideo2 = await prisma.video.create({
    data: {
      title: 'NY Yankees Prospects vs LA Dodgers Farmhands',
      description: 'Solid 6-2 win against Dodgers farm team.',
      s3Key: `videos/${coachBaseball.id}/a7b8c9d0-e1f2-3456-abcd-567890123456/yankees-vs-dodgers.mp4`,
      s3Url: `https://vision-tracking-prod.s3.us-east-1.amazonaws.com/videos/${coachBaseball.id}/a7b8c9d0-e1f2-3456-abcd-567890123456/yankees-vs-dodgers.mp4`,
      thumbnailUrl: 'https://cdn.example.com/thumbnails/yankees-vs-dodgers.jpg',
      duration: 9600,
      fileSize: BigInt(2_900_000_000),
      mimeType: 'video/mp4',
      status: 'COMPLETED',
      uploadedById: coachBaseball.id,
      teamId: nyYankeesProspects.id,
      matchId: baseballMatches[2].id,
      category: 'MATCH',
      sport: 'baseball',
      tags: ['florida-instructional', 'full-game'],
      viewCount: 15,
    },
  });

  console.log('Created 8 videos.');

  // ─── Analysis Job ─────────────────────────────────────────────────────────────
  console.log('Creating analysis job...');

  const analysisJob = await prisma.analysisJob.create({
    data: {
      videoId: soccerVideo1.id,
      matchId: soccerMatches[0].id,
      type: 'FULL_MATCH',
      status: 'COMPLETED',
      modelConfig: {
        model: 'yolov8-pose-soccer',
        confidence: 0.75,
        trackingAlgorithm: 'DeepSORT',
        fps: 30,
        resolution: '1920x1080',
      },
      resultData: {
        summary: {
          totalPossessionHome: 58.3,
          totalPossessionAway: 41.7,
          totalShotsHome: 14,
          totalShotsAway: 7,
          shotsOnTargetHome: 8,
          shotsOnTargetAway: 3,
          cornersHome: 6,
          cornersAway: 3,
          foulsHome: 12,
          foulsAway: 15,
          passAccuracyHome: 87.2,
          passAccuracyAway: 79.8,
          totalDistanceHome: 112.4,
          totalDistanceAway: 108.7,
          avgSpeedHome: 7.2,
          avgSpeedAway: 6.9,
          sprintsHome: 287,
          sprintsAway: 253,
        },
        formationHome: '4-3-3',
        formationAway: '4-4-2',
        xG: { home: 2.7, away: 0.9 },
      },
      startedAt: new Date('2024-02-11T08:00:00Z'),
      completedAt: new Date('2024-02-11T08:47:00Z'),
      createdById: analyst1.id,
    },
  });

  console.log(`Created analysis job: ${analysisJob.id}`);

  // ─── Player Tracking ──────────────────────────────────────────────────────────
  console.log('Creating player tracking records...');

  // Helper to generate a mock heat map grid (10x7 zones)
  function generateHeatMap(): number[][] {
    const grid: number[][] = [];
    for (let row = 0; row < 7; row++) {
      const rowData: number[] = [];
      for (let col = 0; col < 10; col++) {
        rowData.push(Math.floor(Math.random() * 100));
      }
      grid.push(rowData);
    }
    return grid;
  }

  // Home team tracking (first 11 soccer players = starting XI)
  for (let i = 0; i < 11; i++) {
    const player = soccerPlayers[i];
    const isGK = player.position === 'GK';
    const distance = isGK
      ? +(Math.random() * 2 + 5).toFixed(2)
      : +(Math.random() * 5 + 8).toFixed(2);
    const topSpeed = isGK
      ? +(Math.random() * 5 + 20).toFixed(1)
      : +(Math.random() * 10 + 25).toFixed(1);
    const sprintCount = isGK
      ? Math.floor(Math.random() * 5 + 3)
      : Math.floor(Math.random() * 25 + 15);

    await prisma.playerTracking.create({
      data: {
        analysisJobId: analysisJob.id,
        playerId: player.id,
        jerseyNumber: player.jerseyNumber,
        frameData: {
          totalFrames: 2700,
          fps: 30,
          trackingConfidence: +(Math.random() * 0.1 + 0.88).toFixed(3),
          detectedFrames: Math.floor(Math.random() * 200 + 2500),
        },
        distanceCovered: distance,
        topSpeed: topSpeed,
        sprintCount: sprintCount,
        heatMapData: {
          grid: generateHeatMap(),
          gridRows: 7,
          gridCols: 10,
          unit: 'percentage',
        },
      },
    });
  }

  // Away team tracking (simulated opponent players, no linked playerId)
  const awayJerseyNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  for (const jerseyNum of awayJerseyNumbers) {
    const isGK = jerseyNum === 1;
    const distance = isGK
      ? +(Math.random() * 2 + 5).toFixed(2)
      : +(Math.random() * 5 + 8).toFixed(2);
    const topSpeed = isGK
      ? +(Math.random() * 5 + 20).toFixed(1)
      : +(Math.random() * 10 + 25).toFixed(1);
    const sprintCount = isGK
      ? Math.floor(Math.random() * 5 + 3)
      : Math.floor(Math.random() * 25 + 15);

    await prisma.playerTracking.create({
      data: {
        analysisJobId: analysisJob.id,
        playerId: null,
        jerseyNumber: jerseyNum,
        frameData: {
          totalFrames: 2700,
          fps: 30,
          trackingConfidence: +(Math.random() * 0.1 + 0.85).toFixed(3),
          detectedFrames: Math.floor(Math.random() * 300 + 2400),
        },
        distanceCovered: distance,
        topSpeed: topSpeed,
        sprintCount: sprintCount,
        heatMapData: {
          grid: generateHeatMap(),
          gridRows: 7,
          gridCols: 10,
          unit: 'percentage',
        },
      },
    });
  }

  console.log('Created 22 player tracking records.');

  // ─── Events ───────────────────────────────────────────────────────────────────
  console.log('Creating events...');

  // GOAL events at 23', 45', 67'
  // 23' = 1380 seconds, home team goal (Gabriel Santos, #9)
  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'GOAL',
      timestamp: 1380,
      playerId: soccerPlayers[8].id, // Gabriel Santos, ST, #9
      metadata: {
        minute: 23,
        team: 'home',
        assist: soccerPlayers[9].name, // Emiliano Costa
        bodyPart: 'right_foot',
        xG: 0.42,
        situation: 'open_play',
        description: 'Clinical finish from the edge of the box after a through ball.',
      },
    },
  });

  // 45' = 2700 seconds, home team goal (Emiliano Costa, #10)
  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'GOAL',
      timestamp: 2700,
      playerId: soccerPlayers[9].id, // Emiliano Costa, CAM, #10
      metadata: {
        minute: 45,
        team: 'home',
        assist: soccerPlayers[6].name, // Pablo Gutierrez
        bodyPart: 'left_foot',
        xG: 0.68,
        situation: 'counter_attack',
        description: 'Brilliant curling shot into the far corner on the stroke of halftime.',
      },
    },
  });

  // 67' = 4020 seconds, home team goal (Ousmane Diallo, #11)
  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'GOAL',
      timestamp: 4020,
      playerId: soccerPlayers[10].id, // Ousmane Diallo, LW, #11
      metadata: {
        minute: 67,
        team: 'home',
        assist: soccerPlayers[7].name, // Luka Petrovic
        bodyPart: 'head',
        xG: 0.55,
        situation: 'set_piece',
        description: 'Towering header from a corner kick delivery.',
      },
    },
  });

  // Away team goal at 78' = 4680 seconds (no linked player)
  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'GOAL',
      timestamp: 4680,
      playerId: null,
      metadata: {
        minute: 78,
        team: 'away',
        scorer: 'Opponent #9',
        bodyPart: 'right_foot',
        xG: 0.31,
        situation: 'open_play',
        description: 'Consolation goal from close range after defensive lapse.',
      },
    },
  });

  // SHOT events
  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'SHOT',
      timestamp: 540, // 9'
      playerId: soccerPlayers[8].id, // Gabriel Santos
      metadata: {
        minute: 9,
        team: 'home',
        onTarget: false,
        bodyPart: 'right_foot',
        xG: 0.12,
        outcome: 'over_bar',
      },
    },
  });

  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'SHOT',
      timestamp: 1920, // 32'
      playerId: soccerPlayers[6].id, // Pablo Gutierrez
      metadata: {
        minute: 32,
        team: 'home',
        onTarget: true,
        bodyPart: 'left_foot',
        xG: 0.18,
        outcome: 'saved',
      },
    },
  });

  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'SHOT',
      timestamp: 3300, // 55'
      playerId: null, // Opponent shot
      metadata: {
        minute: 55,
        team: 'away',
        onTarget: true,
        bodyPart: 'right_foot',
        xG: 0.22,
        outcome: 'saved',
      },
    },
  });

  // PASS events
  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'PASS',
      timestamp: 720, // 12'
      playerId: soccerPlayers[7].id, // Luka Petrovic
      metadata: {
        minute: 12,
        team: 'home',
        passType: 'through_ball',
        success: true,
        distance: 28.5,
        recipient: soccerPlayers[8].name,
      },
    },
  });

  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'PASS',
      timestamp: 2160, // 36'
      playerId: soccerPlayers[9].id, // Emiliano Costa
      metadata: {
        minute: 36,
        team: 'home',
        passType: 'key_pass',
        success: true,
        distance: 22.0,
        recipient: soccerPlayers[10].name,
      },
    },
  });

  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'PASS',
      timestamp: 3660, // 61'
      playerId: soccerPlayers[5].id, // Kenji Yamamoto
      metadata: {
        minute: 61,
        team: 'home',
        passType: 'long_ball',
        success: false,
        distance: 45.3,
        outcome: 'intercepted',
      },
    },
  });

  // TACKLE events
  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'TACKLE',
      timestamp: 1080, // 18'
      playerId: soccerPlayers[5].id, // Kenji Yamamoto, CDM
      metadata: {
        minute: 18,
        team: 'home',
        success: true,
        tackleType: 'standing',
        region: 'midfield',
      },
    },
  });

  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'TACKLE',
      timestamp: 2460, // 41'
      playerId: soccerPlayers[3].id, // Antoine Dupont, CB
      metadata: {
        minute: 41,
        team: 'home',
        success: true,
        tackleType: 'sliding',
        region: 'defensive_third',
      },
    },
  });

  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'TACKLE',
      timestamp: 4440, // 74'
      playerId: soccerPlayers[2].id, // Lucas Ferreira, CB
      metadata: {
        minute: 74,
        team: 'home',
        success: false,
        tackleType: 'standing',
        region: 'defensive_third',
      },
    },
  });

  // FOUL events
  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'FOUL',
      timestamp: 1680, // 28'
      playerId: null, // Opponent foul
      metadata: {
        minute: 28,
        team: 'away',
        foulType: 'tripping',
        region: 'attacking_third',
        card: null,
        fouledPlayer: soccerPlayers[6].name,
      },
    },
  });

  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'FOUL',
      timestamp: 3060, // 51'
      playerId: soccerPlayers[5].id, // Kenji Yamamoto
      metadata: {
        minute: 51,
        team: 'home',
        foulType: 'holding',
        region: 'midfield',
        card: 'yellow',
      },
    },
  });

  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'FOUL',
      timestamp: 4860, // 81'
      playerId: null,
      metadata: {
        minute: 81,
        team: 'away',
        foulType: 'pushing',
        region: 'midfield',
        card: 'yellow',
      },
    },
  });

  // SAVE event
  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'SAVE',
      timestamp: 3300, // 55'
      playerId: soccerPlayers[0].id, // Alejandro Ruiz, GK
      metadata: {
        minute: 55,
        team: 'home',
        saveType: 'diving',
        shotDirection: 'bottom_left',
        description: 'Excellent diving save to deny the equalizer.',
      },
    },
  });

  // SUBSTITUTION events
  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'SUBSTITUTION',
      timestamp: 4200, // 70'
      playerId: soccerPlayers[8].id, // Gabriel Santos comes off
      metadata: {
        minute: 70,
        team: 'home',
        playerOut: soccerPlayers[8].name,
        playerIn: soccerPlayers[18].name, // Victor Romero
        reason: 'tactical',
      },
    },
  });

  await prisma.event.create({
    data: {
      analysisJobId: analysisJob.id,
      matchId: soccerMatches[0].id,
      type: 'SUBSTITUTION',
      timestamp: 4800, // 80'
      playerId: soccerPlayers[6].id, // Pablo Gutierrez comes off
      metadata: {
        minute: 80,
        team: 'home',
        playerOut: soccerPlayers[6].name,
        playerIn: soccerPlayers[19].name, // Hugo Navarro
        reason: 'fatigue',
      },
    },
  });

  console.log('Created 20 events.');

  // ─── Summary ──────────────────────────────────────────────────────────────────
  console.log('');
  console.log('=== Seed Complete ===');
  console.log('Organizations: 2');
  console.log('Teams:         3');
  console.log('Users:         10');
  console.log('Players:       60');
  console.log('Matches:       15');
  console.log('Videos:        8');
  console.log('Analysis Jobs: 1');
  console.log('Player Tracks: 22');
  console.log('Events:        20');
  console.log('====================');
}

main()
  .then(() => {
    console.log('Seeding finished successfully.');
  })
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
