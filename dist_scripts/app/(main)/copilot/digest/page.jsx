'use client';
import React, { useState, useEffect } from 'react';
import InsightCard from '@/src/components/copilot/InsightCard';
// Mock data
var mockInsights = [
    {
        id: 'insight-1',
        title: 'Start Cooper Kupp this week',
        description: 'Kupp has a favorable matchup against the Packers secondary that ranks 28th against WRs. He should see 10+ targets and has multi-TD upside in what could be a high-scoring game.',
        category: 'lineup',
        actionLabel: 'View Lineup',
        actionPath: '/league/league-123/lineup',
    },
    {
        id: 'insight-2',
        title: 'Target RB Austin Ekeler on waivers',
        description: 'Ekeler is returning from injury and is available in your league. He could provide RB1 value for the rest of the season and is worth a significant FAAB bid (30-40%).',
        category: 'waiver',
        actionLabel: 'View Waivers',
        actionPath: '/league/league-123/waivers',
    },
    {
        id: 'insight-3',
        title: 'ALERT: QB Dak Prescott questionable',
        description: 'Prescott is listed as questionable for Sunday\'s game. Have a backup plan ready. Consider starting Josh Allen who has a great matchup against the Jets.',
        category: 'alert',
        actionLabel: 'Check Alternatives',
        actionPath: '/league/league-123/lineup',
    },
    {
        id: 'insight-4',
        title: 'Potential Trade Target: Davante Adams',
        description: 'The owner of Davante Adams is 1-4 and may be willing to sell. Your depth at RB could be leveraged to acquire this elite WR for the playoff push.',
        category: 'trade',
        actionLabel: 'Explore Trade',
        actionPath: '/league/league-123/roster',
    },
    {
        id: 'insight-5',
        title: 'Matchup Analysis: You vs. Fantasy Kings',
        description: 'You\'re projected to lose by 5 points this week. Their team is strong at WR but vulnerable at RB. Your RB advantage could be key to winning.',
        category: 'matchup',
        actionLabel: 'Optimize Lineup',
        actionPath: '/league/league-123/lineup',
    },
    {
        id: 'insight-6',
        title: 'Consider benching Ja\'Marr Chase',
        description: 'Chase is on bye this week. Make sure to bench him and find a replacement in your lineup. DeVonta Smith could be a good alternative.',
        category: 'lineup',
        actionLabel: 'Update Lineup',
        actionPath: '/league/league-123/lineup',
    },
];
export default function DigestPage() {
    var _a = useState(true), isLoading = _a[0], setIsLoading = _a[1];
    var _b = useState([]), insights = _b[0], setInsights = _b[1];
    var _c = useState('all'), activeTab = _c[0], setActiveTab = _c[1];
    // Simulate data loading
    useEffect(function () {
        var timer = setTimeout(function () {
            setInsights(mockInsights);
            setIsLoading(false);
        }, 1000);
        return function () { return clearTimeout(timer); };
    }, []);
    // Filter insights by category
    var filteredInsights = activeTab === 'all'
        ? insights
        : insights.filter(function (insight) { return insight.category === activeTab; });
    if (isLoading) {
        return (<div className="page-container space-y-6">
        <h1 className="page-title">Weekly Strategy Digest - Loading...</h1>
        <div className="space-y-3">
          <div className="loading-pulse h-24"></div>
          <div className="loading-pulse h-24"></div>
          <div className="loading-pulse h-24"></div>
        </div>
      </div>);
    }
    return (<div className="page-container space-y-6">
      <h1 className="page-title">Weekly Strategy Digest</h1>
      
      {/* Tabs for filtering */}
      <div className="tabs tabs-boxed bg-base-200">
        <button className={"tab ".concat(activeTab === 'all' ? 'tab-active' : '')} onClick={function () { return setActiveTab('all'); }}>
          All
        </button>
        <button className={"tab ".concat(activeTab === 'lineup' ? 'tab-active' : '')} onClick={function () { return setActiveTab('lineup'); }}>
          Lineup
        </button>
        <button className={"tab ".concat(activeTab === 'waiver' ? 'tab-active' : '')} onClick={function () { return setActiveTab('waiver'); }}>
          Waivers
        </button>
        <button className={"tab ".concat(activeTab === 'trade' ? 'tab-active' : '')} onClick={function () { return setActiveTab('trade'); }}>
          Trades
        </button>
        <button className={"tab ".concat(activeTab === 'matchup' ? 'tab-active' : '')} onClick={function () { return setActiveTab('matchup'); }}>
          Matchup
        </button>
        <button className={"tab ".concat(activeTab === 'alert' ? 'tab-active' : '')} onClick={function () { return setActiveTab('alert'); }}>
          Alerts
        </button>
      </div>
      
      {/* Overview Card */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Week 5 Overview</h2>
          <p>Your team is projected to score 112.3 points this week, facing Fantasy Kings (projected 117.8 points).</p>
          <p className="mt-2">
            <span className="font-medium">Key Focus Areas:</span> QB decision between Mahomes and Allen, monitoring Prescott's injury status, and finding a replacement for Chase who is on bye.
          </p>
        </div>
      </div>
      
      {/* Insights */}
      <div className="space-y-4">
        {filteredInsights.length > 0 ? (filteredInsights.map(function (insight) { return (<InsightCard key={insight.id} title={insight.title} description={insight.description} category={insight.category} actionLabel={insight.actionLabel} onAction={function () { return window.location.href = insight.actionPath; }} onThumbsUp={function () { return console.log('Thumbs up for', insight.id); }} onThumbsDown={function () { return console.log('Thumbs down for', insight.id); }}/>); })) : (<div className="text-center py-8 text-base-content/70">
            <p>No insights available for this category.</p>
          </div>)}
      </div>
      
      {/* Explanation Section */}
      <div className="card bg-primary text-primary-content">
        <div className="card-body">
          <h2 className="card-title">How These Insights Are Generated</h2>
          <p>Your AI Copilot analyzes player data, matchups, injuries, and league trends to provide personalized recommendations based on your team composition and preferences.</p>
          <p className="text-sm mt-2">Your archetype profile (Calculated Strategist) means these insights focus on statistical advantages and optimal decision-making.</p>
        </div>
      </div>
    </div>);
}
