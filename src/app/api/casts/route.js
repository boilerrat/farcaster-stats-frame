import { NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  const keyword = searchParams.get('keyword');

  if (!fid) {
    return NextResponse.json({ error: 'FID is required' }, { status: 400 });
  }

  try {
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    if (!neynarApiKey) {
      throw new Error('Neynar API key is not configured');
    }

    // Initialize Neynar client
    const neynarClient = new NeynarAPIClient(neynarApiKey);

    // Fetch all casts using pagination
    let allCasts = [];
    let cursor = null;
    
    do {
      const response = await neynarClient.fetchAllCastsCreatedByUser(fid, cursor ? { cursor } : undefined);
      console.log('Raw API Response:', JSON.stringify(response, null, 2));
      
      const casts = response.result?.casts || [];
      allCasts = [...allCasts, ...casts];
      
      cursor = response.result?.next?.cursor;
      // Break if no more pages or we have a good number of casts
      if (!cursor || allCasts.length >= 500) break;
    } while (cursor);

    console.log('Total number of casts fetched:', allCasts.length);

    // Filter casts by keyword if provided
    let filteredCasts = allCasts;
    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase();
      console.log('Searching for keyword:', lowercaseKeyword);
      filteredCasts = allCasts.filter(cast => {
        const castText = cast.text?.toLowerCase() || '';
        const includes = castText.includes(lowercaseKeyword);
        if (includes) {
          console.log('Found matching cast:', cast.text);
        }
        return includes;
      });
      console.log('Number of casts after filtering:', filteredCasts.length);
    }

    return NextResponse.json({ casts: filteredCasts });
  } catch (error) {
    console.error('Error fetching casts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch casts' },
      { status: 500 }
    );
  }
} 