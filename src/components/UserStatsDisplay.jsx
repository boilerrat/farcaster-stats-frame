"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
const BASE_URL = "https://api.neynar.com/v2";

export default function UserStatsDisplay() {
  const [searchInput, setSearchInput] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserData = async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);

      // Get user info
      const userResponse = await fetch(
        `${BASE_URL}/farcaster/user/search?q=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'accept': 'application/json',
            'api_key': API_KEY
          }
        }
      );
      
      const userData = await userResponse.json();
      if (!userData?.result?.users?.[0]) {
        throw new Error('User not found');
      }

      const user = userData.result.users[0];
      console.log('Found user:', user);

      const processedData = {
        username: user.username,
        display_name: user.display_name || user.username,
        fid: user.fid,
        neynarScore: 0.5,
        follower_count: user.follower_count || 0,
        following_count: user.following_count || 0,
        pfp_url: user.pfp_url
      };

      console.log('Setting user data:', processedData);
      setUserData(processedData);

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    await fetchUserData(searchInput.trim());
    setSearchInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-purple-100"
      >
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-purple-600 mb-2">
            Farcaster Stats
          </h1>
          <p className="text-purple-500 text-sm">
            Search for any Farcaster user
          </p>
        </div>

        {/* User Data Section */}
        {userData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={userData.pfp_url || 'https://placeholder.co/400'} 
                alt={`${userData.username}'s profile`}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-purple-600">@{userData.username}</h2>
                <p className="text-sm text-purple-500">{userData.display_name}</p>
              </div>
              <div className="bg-purple-500 rounded-full px-3 py-1">
                <span className="text-sm font-medium text-white">
                  FID: {userData.fid}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-500 rounded-xl p-4">
                <div className="text-3xl font-bold text-white">
                  {userData.follower_count?.toLocaleString()}
                </div>
                <div className="text-sm text-purple-100">Followers</div>
              </div>
              
              <div className="bg-pink-500 rounded-xl p-4">
                <div className="text-3xl font-bold text-white">
                  {userData.following_count?.toLocaleString()}
                </div>
                <div className="text-sm text-purple-100">Following</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Form */}
        <div className={`${userData ? 'border-t border-purple-100 pt-6' : ''}`}>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by username or FID"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg border border-purple-200 
                focus:outline-none focus:border-purple-500
                text-sm bg-white/90 text-purple-900 placeholder-purple-400
                disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg 
                hover:bg-purple-700 transition-colors text-sm font-medium
                disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {error && (
            <div className="mt-3 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-purple-500">
          Powered by Neynar
        </div>
      </motion.div>
    </div>
  );
}