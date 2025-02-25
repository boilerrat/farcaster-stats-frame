"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VerifiedAddresses from './VerifiedAddresses';
import ReactCountryFlag from 'react-country-flag';
import CastsCarousel from './CastsCarousel';

export default function UserStatsDisplay() {
  const [searchInput, setSearchInput] = useState('');
  const [castSearchInput, setCastSearchInput] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [casts, setCasts] = useState([]);
  const [castsLoading, setCastsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setError(null);
    setCasts([]);
    setCastSearchInput('');

    try {
      const response = await fetch(`/api/user?q=${encodeURIComponent(searchInput)}`);
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      const user = result.data.result.users[0];
      if (!user) throw new Error('User not found');

      console.log('API Response:', JSON.stringify(result.data.result.users[0], null, 2));

      const processedData = {
        username: user.username,
        display_name: user.display_name || user.username,
        fid: user.fid,
        bio: user.bio || '',
        follower_count: user.follower_count || 0,
        following_count: user.following_count || 0,
        pfp_url: user.pfp_url,
        neynar_score: Number(user.neynar_score || 0),
        metrics: {
          total_casts: user.metrics?.total_casts || 0
        },
        verifications: {
          ethereum: user.verified_addresses?.eth_addresses || [],
          ens: user.verified_addresses?.ens_names || [],
          solana: user.verified_addresses?.sol_addresses || []
        },
        verified_accounts: user.verified_accounts || [],
        power_badge: user.power_badge || false,
        profile_url: `https://warpcast.com/${user.username}`,
        channels: user.channels || {},
        location: user.location || null
      };

      setUserData(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCastSearch = async (e) => {
    e.preventDefault();
    if (!userData?.fid) return;

    setCastsLoading(true);
    try {
      const response = await fetch(
        `/api/casts?fid=${userData.fid}&keyword=${encodeURIComponent(castSearchInput)}`
      );
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setCasts(data.casts);
    } catch (err) {
      setError(err.message);
    } finally {
      setCastsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-[#1a1b1e] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#25262b] backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-md border border-[#373A40] max-h-[85vh] overflow-y-auto"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#C1C2C5] mb-2 font-[Cinzel]">
            Farcaster Stats
          </h1>
          <p className="text-[#909296] text-sm font-[Inter]">
            Search for any Farcaster user
          </p>
        </div>

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
                className="w-16 h-16 rounded-lg object-cover border border-[#373A40]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#C1C2C5] font-[Cinzel]">@{userData.username}</h2>
                  {userData.power_badge && (
                    <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">Power User</span>
                  )}
                </div>
                <p className="text-sm text-[#909296] font-[Inter]">{userData.display_name}</p>
                <div className="flex items-center gap-2">
                  <a 
                    href={userData.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-[Inter]"
                  >
                    View on Warpcast
                  </a>
                </div>
              </div>
              <div className="bg-[#373A40] rounded-full px-3 py-1">
                <span className="text-sm font-medium text-[#C1C2C5] font-[Inter]">
                  FID: {userData.fid}
                </span>
              </div>
            </div>
            
            {userData.bio && (
              <div className="mb-6 text-[#909296] text-sm font-[Inter] bg-[#373A40] rounded-lg p-4 whitespace-pre-wrap">
                {userData.bio}
              </div>
            )}

            <div className="mb-6 text-[#909296] text-sm font-[Inter] bg-[#373A40] rounded-lg p-4 flex items-center gap-2">
              {userData.location?.address?.country_code ? (
                <>
                  <ReactCountryFlag
                    countryCode={userData.location.address.country_code.toUpperCase()}
                    svg
                    style={{
                      width: '1.5em',
                      height: '1.5em',
                    }}
                    title={userData.location.address.country}
                  />
                  <span>
                    {userData.location.address.country}
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>Location not set</span>
                </>
              )}
            </div>

            {userData.verified_accounts?.length > 0 && (
              <div className="mb-6 text-[#909296] text-sm font-[Inter] bg-[#373A40] rounded-lg p-4">
                <div className="font-medium mb-2">Verified Accounts</div>
                <div className="space-y-2">
                  {userData.verified_accounts.map((account, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="capitalize">{account.platform}:</span>
                      <a
                        href={`https://${account.platform}.com/${account.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        @{account.username}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#373A40] rounded-lg p-4">
                <div className="text-3xl font-bold text-[#C1C2C5] font-[Cinzel]">
                  {userData.follower_count?.toLocaleString()}
                </div>
                <div className="text-sm text-[#909296] font-[Inter]">Followers</div>
              </div>
              
              <div className="bg-[#373A40] rounded-lg p-4">
                <div className="text-3xl font-bold text-[#C1C2C5] font-[Cinzel]">
                  {userData.following_count?.toLocaleString()}
                </div>
                <div className="text-sm text-[#909296] font-[Inter]">Following</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#373A40] rounded-lg p-4">
                <div className="text-3xl font-bold text-[#C1C2C5] font-[Cinzel]">
                  {userData.metrics.total_casts?.toLocaleString()}
                </div>
                <div className="text-sm text-[#909296] font-[Inter]">Total Casts</div>
              </div>
              <div className="bg-[#373A40] rounded-lg p-4">
                <div className="text-3xl font-bold text-[#C1C2C5] font-[Cinzel]">
                  {Number(userData.neynar_score).toFixed(2)}
                </div>
                <div className="text-sm text-[#909296] font-[Inter]">Neynar Score</div>
              </div>
            </div>

            {/* Channels Section */}
            {(userData.channels?.created?.length > 0 || userData.channels?.member?.length > 0) && (
              <div className="mt-6">
                {userData.channels.created?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-[#C1C2C5] font-medium mb-2 font-[Inter]">Created Channels</h3>
                    <div className="space-y-2">
                      {userData.channels.created.map((channel) => (
                        <div key={channel.id || channel.name} className="bg-[#373A40] rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            {channel.image_url && (
                              <img 
                                src={channel.image_url} 
                                alt={channel.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="text-[#C1C2C5] font-medium">{channel.name}</div>
                              {channel.description && (
                                <div className="text-xs text-[#909296] line-clamp-2">{channel.description}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userData.channels.member?.length > 0 && (
                  <div>
                    <h3 className="text-[#C1C2C5] font-medium mb-2 font-[Inter]">Member of Channels</h3>
                    <div className="space-y-2">
                      {userData.channels.member.map((channel) => (
                        <div key={channel.id || channel.name} className="bg-[#373A40] rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            {channel.image_url && (
                              <img 
                                src={channel.image_url} 
                                alt={channel.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="text-[#C1C2C5] font-medium">{channel.name}</div>
                              {channel.description && (
                                <div className="text-xs text-[#909296] line-clamp-2">{channel.description}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {userData.verifications.ethereum.length > 0 && (
              <VerifiedAddresses 
                addresses={userData.verifications.ethereum}
                ensNames={userData.verifications.ens}
                solanaAddresses={userData.verifications.solana}
              />
            )}

            {/* Cast Search Section */}
            <div className="mt-6">
              <form onSubmit={handleCastSearch} className="flex gap-2">
                <input
                  type="text"
                  value={castSearchInput}
                  onChange={(e) => setCastSearchInput(e.target.value)}
                  placeholder="Search casts by keyword..."
                  disabled={castsLoading}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#373A40] 
                    focus:outline-none focus:border-[#4A5568] focus:ring-2 
                    focus:ring-[#2D3748] text-sm bg-[#25262b] text-[#C1C2C5] 
                    placeholder-[#909296] disabled:opacity-50 font-[Inter]"
                />
                <button 
                  type="submit"
                  disabled={castsLoading}
                  className="px-4 py-2 bg-[#373A40] text-[#C1C2C5] rounded-lg 
                    hover:bg-[#4A4D53] transition-colors text-sm font-medium
                    disabled:opacity-50 font-[Inter]"
                >
                  {castsLoading ? 'Searching...' : 'Search Casts'}
                </button>
              </form>

              <div className="mt-4">
                <CastsCarousel casts={casts} loading={castsLoading} />
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username or FID"
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border border-[#373A40] 
              focus:outline-none focus:border-[#4A5568] focus:ring-2 
              focus:ring-[#2D3748] text-sm bg-[#25262b] text-[#C1C2C5] 
              placeholder-[#909296] disabled:opacity-50 font-[Inter]"
          />
          <button 
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#373A40] text-[#C1C2C5] rounded-lg 
              hover:bg-[#4A4D53] transition-colors text-sm font-medium
              disabled:opacity-50 font-[Inter]"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-red-500 text-sm text-center bg-[#373A40] rounded-lg p-2 font-[Inter]"
          >
            {error}
          </motion.div>
        )}

        <div className="mt-6 text-center text-sm text-[#909296] font-[Inter]">
          Made by <a href="https://warpcast.com/boiler" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Boiler</a>
        </div>
      </motion.div>
    </div>
  );
}