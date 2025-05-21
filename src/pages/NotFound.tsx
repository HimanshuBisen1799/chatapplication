
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-6">
        Oops! Page not found.
      </p>
      <Button asChild>
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Return Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
