
import React from 'react';
import Navbar from '../components/Navbar';
import Feed from '../components/Feed';
import ChatPanel from '../components/ChatPanel';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-6 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-2">Your Feed</h2>
          <p className="text-muted-foreground">Check out the latest updates from your network</p>
        </div>
        <Feed />
      </main>
      <ChatPanel />
    </div>
  );
};

export default HomePage;
