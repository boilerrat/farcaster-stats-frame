export async function GET() {
  try {
    const response = await fetch('https://api.neynar.com/v2/farcaster/user/bulk?fids=5650', {
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY
      }
    });
    
    const data = await response.json();
    console.log('Test API response:', data);
    
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Test API error:', error);
    return Response.json({ success: false, error: error.message });
  }
} 