import { NeynarAPIClient } from '@neynar/nodejs-sdk';

const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

console.log('Available SDK Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(neynarClient)));

console.log('SDK Client Details:', {
  methods: Object.getOwnPropertyNames(Object.getPrototypeOf(neynarClient)),
  properties: Object.keys(neynarClient)
});

async function fetchUserWithScore(fid) {
  const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
    headers: {
      'accept': 'application/json',
      'api_key': process.env.NEYNAR_API_KEY,
      'x-neynar-experimental': 'true'
    }
  });
  
  const data = await response.json();
  console.log('Direct API response:', JSON.stringify(data, null, 2));
  return data?.users?.[0];
}

async function getAllCasts(fid) {
  let allCasts = [];
  let cursor = undefined;
  let hasMore = true;
  let pageCount = 0;
  const seenHashes = new Set();
  let totalFound = 0;

  while (hasMore && pageCount < 100) {
    try {
      pageCount++;
      const response = await neynarClient.fetchAllCastsCreatedByUser(fid, cursor);
      
      if (!response?.result?.casts) {
        break;
      }
      
      totalFound += response.result.casts.length;
      
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

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return Response.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Look up user by username
    const userResponse = await neynarClient.lookupUserByUsername(query);
    
    if (!userResponse?.result?.user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResponse.result.user;
    console.log('Initial user data:', JSON.stringify(user, null, 2));

    // Get user data with score using direct API call
    const userWithScore = await fetchUserWithScore(user.fid);
    console.log('User with score:', JSON.stringify(userWithScore, null, 2));

    // Get all casts to count them
    const allCasts = await getAllCasts(user.fid);
    console.log('Total casts found:', allCasts.length);

    const enrichedUser = {
      username: userWithScore.username,
      display_name: userWithScore.display_name,
      fid: userWithScore.fid,
      bio: userWithScore.profile?.bio?.text || '',
      follower_count: userWithScore.follower_count,
      following_count: userWithScore.following_count,
      pfp_url: userWithScore.pfp_url,
      neynar_score: Number(userWithScore.experimental?.neynar_user_score || 0),
      metrics: {
        total_casts: allCasts.length
      },
      verifications: {
        ethereum: userWithScore.verified_addresses?.eth_addresses || [],
        ens: userWithScore.verified_addresses?.ens_names || [],
        solana: userWithScore.verified_addresses?.sol_addresses || []
      },
      verified_accounts: userWithScore.verified_accounts || [],
      power_badge: userWithScore.power_badge || false,
      profile_url: `https://warpcast.com/${userWithScore.username}`
    };

    console.log('Enriched user data:', JSON.stringify(enrichedUser, null, 2));

    return Response.json({ 
      success: true, 
      data: { result: { users: [enrichedUser] } }
    });
  } catch (error) {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to fetch user data'
    }, { status: 500 });
  }
} 