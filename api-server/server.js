import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'https://farcaster-stats-frame.vercel.app',
  methods: ['GET']
}));
app.use(limiter);
app.use(express.json());

// Initialize Neynar client with v2 configuration
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
  baseOptions: {
    headers: {
      'x-neynar-experimental': 'true'
    }
  }
});

const neynarClient = new NeynarAPIClient(config);

// Helper functions
async function fetchUserWithScore(fid) {
  const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
    headers: {
      'accept': 'application/json',
      'api_key': process.env.NEYNAR_API_KEY,
      'x-neynar-experimental': 'true'
    }
  });
  
  const data = await response.json();
  return data?.users?.[0];
}

async function fetchUserChannels(fid) {
  try {
    const [createdResponse, memberResponse] = await Promise.all([
      fetch(
        `https://api.neynar.com/v2/farcaster/channel/created_by_user?fid=${fid}`,
        {
          headers: {
            'accept': 'application/json',
            'api_key': process.env.NEYNAR_API_KEY
          }
        }
      ),
      fetch(
        `https://api.neynar.com/v2/farcaster/channel/user_channels?fid=${fid}`,
        {
          headers: {
            'accept': 'application/json',
            'api_key': process.env.NEYNAR_API_KEY
          }
        }
      )
    ]);

    const [createdData, memberData] = await Promise.all([
      createdResponse.json(),
      memberResponse.json()
    ]);
    
    return {
      created: createdData?.result?.channels || [],
      member: memberData?.result?.channels || []
    };
  } catch (error) {
    console.error('Error fetching channels:', error);
    return { created: [], member: [] };
  }
}

async function getAllCasts(fid) {
  let allCasts = [];
  let cursor = undefined;
  let hasMore = true;
  let pageCount = 0;
  const seenHashes = new Set();

  while (hasMore && pageCount < 500) {
    try {
      pageCount++;
      const response = await neynarClient.fetchAllCastsCreatedByUser(fid, cursor);
      
      if (!response?.result?.casts) {
        break;
      }
      
      const newCasts = response.result.casts.filter(cast => {
        if (seenHashes.has(cast.hash)) {
          return false;
        }
        seenHashes.add(cast.hash);
        return true;
      });

      allCasts = [...allCasts, ...newCasts];
      
      if (response.result.next && response.result.next !== cursor) {
        cursor = response.result.next;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error('Error fetching casts:', error);
      break;
    }
  }

  return allCasts;
}

// Routes
app.get('/api/user', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    console.log('Looking up user:', query);
    console.log('Using API Key:', process.env.NEYNAR_API_KEY);
    
    const userResponse = await neynarClient.lookupUserByUsername({ username: query });
    console.log('Raw API Response:', JSON.stringify(userResponse, null, 2));
    
    if (!userResponse?.user) {
      console.log('No user found in response');
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResponse.user;
    console.log('Found user:', user.username);

    // Fetch all data in parallel
    const [userWithScore, allCasts, channels] = await Promise.all([
      fetchUserWithScore(user.fid),
      getAllCasts(user.fid),
      fetchUserChannels(user.fid)
    ]);

    const enrichedUser = {
      username: user.username,
      display_name: user.display_name,
      fid: user.fid,
      bio: user.profile?.bio?.text || '',
      follower_count: user.follower_count,
      following_count: user.following_count,
      pfp_url: user.pfp_url,
      neynar_score: Number(user.experimental?.neynar_user_score || 0),
      metrics: {
        total_casts: allCasts.length
      },
      verifications: {
        ethereum: user.verified_addresses?.eth_addresses || [],
        ens: user.verified_addresses?.ens_names || [],
        solana: user.verified_addresses?.sol_addresses || []
      },
      verified_accounts: user.verified_accounts || [],
      power_badge: user.power_badge || false,
      profile_url: `https://warpcast.com/${user.username}`,
      channels: channels,
      location: user.profile?.location || null
    };

    res.json({ data: { result: { users: [enrichedUser] } } });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user data' });
  }
});

app.get('/api/casts', async (req, res) => {
  const { fid, keyword } = req.query;

  if (!fid) {
    return res.status(400).json({ error: 'FID is required' });
  }

  try {
    const allCasts = await getAllCasts(fid);

    let filteredCasts = allCasts;
    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase();
      filteredCasts = allCasts.filter(cast => {
        const castText = cast.text?.toLowerCase() || '';
        return castText.includes(lowercaseKeyword);
      });
    }

    res.json({ casts: filteredCasts });
  } catch (error) {
    console.error('Error fetching casts:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch casts' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
}); 