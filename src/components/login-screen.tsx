"use client";

import React, { useState } from 'react';
import { useUser } from './user-context';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const { login } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Join Prediction Voting
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Join Session
          </button>
        </form>
      </div>
    </div>
  );
}