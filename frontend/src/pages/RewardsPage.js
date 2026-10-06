import React, { useState } from 'react';
import { 
  GiftIcon, 
  SparklesIcon, 
  TrophyIcon, 
  ShoppingBagIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const RewardsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock rewards data - Replace with actual API data
  const rewardsData = {
    points: 2450,
    level: 'Gold',
    nextLevelPoints: 5000,
    pointsToNextLevel: 2550,
    totalEarned: 12500,
    totalRedeemed: 10050,
  };

  const rewardsHistory = [
    {
      id: 1,
      type: 'earned',
      title: 'Purchase Reward',
      description: 'Earned 500 points for order #ORD123456',
      points: 500,
      date: '2024-01-15',
      status: 'completed',
    },
    {
      id: 2,
      type: 'redeemed',
      title: 'Discount Coupon',
      description: 'Redeemed 1000 points for 10% off coupon',
      points: -1000,
      date: '2024-01-10',
      status: 'completed',
    },
    {
      id: 3,
      type: 'earned',
      title: 'Referral Bonus',
      description: 'Earned 250 points for referring a friend',
      points: 250,
      date: '2024-01-05',
      status: 'completed',
    },
  ];

  const availableRewards = [
    {
      id: 1,
      title: '10% Off Coupon',
      description: 'Get 10% discount on your next purchase',
      points: 1000,
      image: '🎟️',
      category: 'discount',
    },
    {
      id: 2,
      title: 'Free Shipping',
      description: 'Free shipping on orders above ₹5000',
      points: 500,
      image: '🚚',
      category: 'shipping',
    },
    {
      id: 3,
      title: 'Premium Watch Box',
      description: 'Luxury watch box with premium packaging',
      points: 5000,
      image: '📦',
      category: 'product',
    },
    {
      id: 4,
      title: '20% Off Coupon',
      description: 'Get 20% discount on your next purchase',
      points: 2000,
      image: '🎁',
      category: 'discount',
    },
    {
      id: 5,
      title: 'VIP Membership',
      description: 'Exclusive VIP membership for 1 year',
      points: 10000,
      image: '👑',
      category: 'membership',
    },
    {
      id: 6,
      title: 'Gift Card ₹500',
      description: 'Redeemable gift card worth ₹500',
      points: 2500,
      image: '💳',
      category: 'giftcard',
    },
  ];

  const waysToEarn = [
    {
      icon: ShoppingBagIcon,
      title: 'Make a Purchase',
      description: 'Earn 1 point for every ₹10 spent',
      points: '1 point / ₹10',
      color: 'bg-blue-500',
    },
    {
      icon: StarIcon,
      title: 'Write a Review',
      description: 'Get 50 points for each product review',
      points: '50 points',
      color: 'bg-yellow-500',
    },
    {
      icon: GiftIcon,
      title: 'Refer a Friend',
      description: 'Earn 250 points when your friend makes first purchase',
      points: '250 points',
      color: 'bg-green-500',
    },
    {
      icon: SparklesIcon,
      title: 'Birthday Bonus',
      description: 'Get 500 points on your birthday',
      points: '500 points',
      color: 'bg-pink-500',
    },
  ];

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'bronze':
        return 'from-amber-600 to-amber-800';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getLevelIcon = (level) => {
    switch (level.toLowerCase()) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      default:
        return '⭐';
    }
  };

  const handleRedeem = (reward) => {
    if (rewardsData.points < reward.points) {
      toast.error(`You need ${reward.points - rewardsData.points} more points to redeem this reward`);
      return;
    }
    toast.success(`Successfully redeemed ${reward.title}!`);
    // TODO: Implement actual redemption API call
  };

  const progressPercentage = ((rewardsData.points / rewardsData.nextLevelPoints) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Rewards</h1>
          <p className="text-gray-600">Earn points, redeem rewards, and unlock exclusive benefits</p>
        </div>

        {/* Points Card */}
        <div className={`bg-gradient-to-r ${getLevelColor(rewardsData.level)} rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{getLevelIcon(rewardsData.level)}</span>
                  <div>
                    <p className="text-sm opacity-90">Current Level</p>
                    <p className="text-2xl font-bold">{rewardsData.level} Member</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Available Points</p>
                <p className="text-5xl font-bold">{rewardsData.points.toLocaleString()}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="opacity-90">Progress to Next Level</span>
                <span className="font-semibold">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 opacity-90">
                {rewardsData.pointsToNextLevel.toLocaleString()} points to {rewardsData.level === 'Gold' ? 'Platinum' : 'Gold'} Level
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">{rewardsData.totalEarned.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">All time points</p>
              </div>
              <TrophyIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Redeemed</p>
                <p className="text-2xl font-bold text-gray-900">{rewardsData.totalRedeemed.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Points used</p>
              </div>
              <GiftIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rewards Redeemed</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500 mt-1">Total rewards</p>
              </div>
              <SparklesIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: StarIcon },
                { id: 'rewards', label: 'Available Rewards', icon: GiftIcon },
                { id: 'history', label: 'History', icon: ClockIcon },
                { id: 'earn', label: 'Ways to Earn', icon: FireIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {rewardsHistory.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            item.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {item.type === 'earned' ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <GiftIcon className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${item.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'earned' ? '+' : ''}
                        {item.points.toLocaleString()} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Available Rewards Tab */}
          {activeTab === 'rewards' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200"
                  >
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 text-center">
                      <div className="text-6xl mb-4">{reward.image}</div>
                      <h3 className="text-xl font-bold text-gray-900">{reward.title}</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{reward.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StarIconSolid className="h-5 w-5 text-yellow-500" />
                          <span className="text-lg font-bold text-gray-900">{reward.points.toLocaleString()} pts</span>
                        </div>
                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={rewardsData.points < reward.points}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            rewardsData.points >= reward.points
                              ? 'bg-primary-600 text-white hover:bg-primary-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {rewardsData.points >= reward.points ? 'Redeem' : 'Insufficient Points'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Rewards History</h2>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {rewardsHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              item.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                            }`}
                          >
                            {item.type === 'earned' ? (
                              <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            ) : (
                              <GiftIcon className="h-6 w-6 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(item.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-xl font-bold ${
                              item.type === 'earned' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {item.type === 'earned' ? '+' : '-'}
                            {Math.abs(item.points).toLocaleString()} pts
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ways to Earn Tab */}
          {activeTab === 'earn' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ways to Earn Points</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {waysToEarn.map((way, index) => {
                  const Icon = way.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`${way.color} p-4 rounded-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{way.title}</h3>
                          <p className="text-gray-600 mb-3">{way.description}</p>
                          <div className="flex items-center gap-2">
                            <StarIconSolid className="h-5 w-5 text-yellow-500" />
                            <span className="font-semibold text-gray-900">{way.points}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
