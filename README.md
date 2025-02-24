# Farcaster Stats

A simple web app to view Farcaster user statistics. Built with Next.js and the Neynar SDK.

## Features
- Search for Farcaster users by username or FID
- View follower and following counts
- Display user profile information
- Responsive design with smooth animations

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file and add your Neynar API key:
```bash
NEXT_PUBLIC_NEYNAR_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Built With
- [Next.js](https://nextjs.org/) - React framework
- [Neynar SDK](https://docs.neynar.com/reference/neynar-sdk) - Farcaster API client
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_NEYNAR_API_KEY` - Your Neynar API key

## License
MIT
