import { headers } from 'next/headers';
import UserStatsDisplay from '../components/UserStatsDisplay';

export default function Home() {
  const headersList = headers();
  const host = process.env.NEXT_PUBLIC_HOST;
  
  return (
    <>
      {/* Frame Metadata */}
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content={`https://${host}/api/frame`} />
      <meta property="fc:frame:button:1" content="Search Another User" />
      <meta property="fc:frame:input:text" content="Enter username or FID" />
      
      {/* Main Content */}
      <UserStatsDisplay />
    </>
  );
}