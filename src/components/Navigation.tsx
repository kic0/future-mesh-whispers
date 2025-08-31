import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="font-bold">Home</Link>
        <Link to="/stats">Stats</Link>
      </div>
    </nav>
  );
};

export default Navigation;
