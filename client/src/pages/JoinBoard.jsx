import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boardService } from '../services/boardService';

const JoinBoard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('joining');
  const [error, setError] = useState('');

  useEffect(() => {
    const join = async () => {
      if (!user) return;

      try {
        const board = await boardService.joinBoard(roomId);
        setStatus('success');
        // Small delay so the user sees the success message
        setTimeout(() => {
          navigate(`/board/${board._id}`, { state: { roomId: board.roomId } });
        }, 800);
      } catch (err) {
        console.error('Join board error:', err);
        setStatus('error');
        setError(err.response?.data?.message || 'Failed to join board. It may not exist.');
      }
    };

    if (user && roomId) {
      join();
    }
  }, [user, roomId, navigate]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center">
        {status === 'joining' && (
          <div className="flex flex-col items-center space-y-4">
            <svg className="animate-spin w-10 h-10 text-primary-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-dark-300 text-lg">Joining board...</p>
            <p className="text-dark-500 text-sm font-mono">Room ID: {roomId}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white text-lg">Joined successfully!</p>
            <p className="text-dark-400 text-sm">Redirecting to board...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-white text-lg">Could not join board</p>
            <p className="text-dark-400 text-sm max-w-md">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinBoard;
