import { LeaderboardData } from './leaderboard-types';

export const MOCK_LEADERBOARD: LeaderboardData = {
  title: 'November Leaderboard',
  subtitle: 'Top learners this month',
  period: 'month',
  scope: 'class',
  entries: [


    { id: '1', name: 'Aarav Sharma',      score: 20687, scoreUnit: 'XP', streak: 30 },
    { id: '2', name: 'Priya Rai',         score: 20035, scoreUnit: 'XP', streak: 28 },
    { id: '3', name: 'Bikash Thapa',      score: 18459, scoreUnit: 'XP', streak: 25 },
    { id: '4', name: 'Ritika Karki',      score: 16835, scoreUnit: 'XP', streak: 20 },
    { id: '5', name: 'Sagar Gurung',      score: 15297, scoreUnit: 'XP', streak: 18 },
    { id: '6', name: 'Aayush Poudel',     score: 12784, scoreUnit: 'XP', streak: 15 },
    { id: '7', name: 'Sushmita Basnet',   score: 11634, scoreUnit: 'XP', streak: 12 },
    { id: '8', name: 'Rishab Thapa',     score: 19240, scoreUnit: 'XP', streak: 7, isCurrentUser: true },
    { id: '9', name: 'Nisha Adhikari',    score: 9820,  scoreUnit: 'XP', streak: 10 },
    { id: '10', name: 'Prakash Shrestha', score: 8945,  scoreUnit: 'XP', streak: 8 },
  ],
};