"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Socket } from 'socket.io-client';
import { useUser } from './user-context';
import LoginScreen from './login-screen';
import { connectSocket } from '@/lib/socket';
import { Question } from '@/lib/types';

const initialQuestions: Question[] = [
    {
      id: 1,
      title: "2024 Tech Trends",
      description: "What will be the most impactful technology in 2024?",
      options: ["AI", "Quantum Computing", "AR/VR", "Blockchain"],
      votes: {
        "AI": 0,
        "Quantum Computing": 0,
        "AR/VR": 0,
        "Blockchain": 0
      },
      order: 0
    },
    {
      id: 2,
      title: "Future of Work",
      description: "How will most people work in 2025?",
      options: ["Remote", "Hybrid", "Office", "AI-Assisted"],
      votes: {
        "Remote": 0,
        "Hybrid": 0,
        "Office": 0,
        "AI-Assisted": 0
      },
      order: 1
    }
  ];

export default function VotingPlatform() {
  const { user, logout } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<number, string>>({});

  const updateQuestionVotes = async (question: Question) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update votes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating votes:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;
    let socketInstance: Socket | null = null;
  
    const initialize = async () => {
      try {
        socketInstance = await connectSocket();
        if (!mounted) return;
  
        setSocket(socketInstance);
  
        socketInstance.on('show-results-update', (data) => {
          console.log('Received show results update:', data);
          if (mounted) {
            setShowResults(true);
            if (data?.questions) {
              setQuestions(data.questions);
            }
            if (typeof data?.currentQuestionIndex !== 'undefined') {
              setCurrentQuestionIndex(data.currentQuestionIndex);
            }
          }
        });
  
        socketInstance.on('vote-update', (data) => {
          console.log('Received vote update:', data);
          if (mounted && data?.questions) {
            setQuestions(data.questions);
          }
        });
  
        socketInstance.on('next-question-update', (index) => {
          console.log('Received next question update:', index);
          if (mounted) {
            setCurrentQuestionIndex(index);
            setShowResults(false);
          }
        });
  
        socketInstance.on('reset-session-update', (data) => {
          console.log('Received reset session update:', data);
          if (mounted) {
            setQuestions(data.questions);
            setCurrentQuestionIndex(0);
            setShowResults(false);
            setUserVotes({});
          }
        });
  
        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
        });
  
        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });
  
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    };
  
    initialize();
  
    return () => {
        mounted = false;
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    }, []);

  const handleVote = async (option: string) => {
    if (!currentQuestion || userVotes[currentQuestion.id] || !socket) return;
  
    try {
      const updatedQuestions = questions.map(q => {
        if (q.id === currentQuestion.id) {
          return {
            ...q,
            votes: {
              ...q.votes,
              [option]: (q.votes[option] || 0) + 1
            }
          };
        }
        return q;
      });
  
      console.log('Sending vote update:', {
        questions: updatedQuestions,
        currentQuestionIndex,
        option
      });
  
      await updateQuestionVotes(updatedQuestions[currentQuestionIndex]);
      setQuestions(updatedQuestions);
      setUserVotes({ ...userVotes, [currentQuestion.id]: option });
  
      socket.emit('vote', {
        questions: updatedQuestions,
        currentQuestionIndex,
        votedOption: option
      });
    } catch (error) {
      console.error('Failed to save vote:', error);
      alert('Failed to save your vote. Please try again.');
    }
  };

  const handleShowResults = () => {
    if (!socket) return;
    
    // First update local state
    setShowResults(true);
    
    // Then emit to all clients with the current state
    socket.emit('show-results', {
      showResults: true,
      questions,
      currentQuestionIndex
    });
    
    console.log('Admin showing results, emitting state:', {
      showResults: true,
      questions,
      currentQuestionIndex
    });
  };

  const handleNextQuestion = () => {
    if (!socket) return;
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      setShowResults(false);
      socket.emit('next-question', newIndex);
    }
  };

  const handleReset = async () => {
    if (!socket) return;
    if (window.confirm('Are you sure you want to reset all votes and start over?')) {
      const resetQuestions = questions.map(q => ({
        ...q,
        votes: Object.fromEntries(q.options.map(opt => [opt, 0]))
      }));

      try {
        await Promise.all(resetQuestions.map(updateQuestionVotes));
        setQuestions(resetQuestions);
        setUserVotes({});
        setCurrentQuestionIndex(0);
        setShowResults(false);
        
        socket.emit('reset-session', {
          questions: resetQuestions
        });
      } catch (error) {
        console.error('Failed to reset session:', error);
        alert('Failed to reset session. Please try again.');
      }
    }
  };

  if (!user) {
    return <LoginScreen />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prediction Voting Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {user.name}
            </span>
            <button
              onClick={logout}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>

        {user.isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Admin Controls</h2>
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleShowResults}
                disabled={showResults}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 flex-1 font-medium"
              >
                Show Results
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex >= questions.length - 1 || !showResults}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400 flex-1 font-medium"
              >
                Next Question
              </button>
            </div>

            <div className="border-t mt-6 pt-6">
              <button
                onClick={handleReset}
                className="bg-red-600 text-white px-4 py-2 rounded font-medium"
              >
                Reset Session
              </button>
            </div>
          </div>
        )}

        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {showResults ? (
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900">{currentQuestion.title}</h2>
                <p className="text-gray-700 mb-6">{currentQuestion.description}</p>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: 'Votes', ...currentQuestion.votes }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#374151" />
                      <YAxis stroke="#374151" />
                      <Tooltip />
                      <Legend />
                      {Object.keys(currentQuestion.votes).map((key, index) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          fill={`hsl(${index * 45}, 70%, 50%)`}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900">{currentQuestion.title}</h2>
                <p className="text-gray-700 mb-6">{currentQuestion.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleVote(option)}
                      disabled={Boolean(userVotes[currentQuestion.id]) || showResults}
                      className={`p-4 rounded text-center transition-colors font-medium ${
                        userVotes[currentQuestion.id] === option
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
