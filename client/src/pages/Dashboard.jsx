import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boardService } from '../services/boardService';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await boardService.getBoards();
      setBoards(data);
    } catch (error) {
      console.error('Load boards error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const board = await boardService.createBoard(newBoardTitle);
      setShowCreateModal(false);
      setNewBoardTitle('');
      navigate(`/board/${board._id}`, { state: { roomId: board.roomId } });
    } catch (error) {
      console.error('Create board error:', error);
      setError('Failed to create board');
    }
  };

  const joinBoard = async (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;

    try {
      const board = await boardService.joinBoard(joinRoomId);
      setShowJoinModal(false);
      setJoinRoomId('');
      navigate(`/board/${board._id}`, { state: { roomId: board.roomId } });
    } catch (error) {
      console.error('Join board error:', error);
      setError('Board not found');
    }
  };

  const deleteBoard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this board?')) return;

    try {
      await boardService.deleteBoard(id);
      setBoards(boards.filter(b => b._id !== id));
    } catch (error) {
      console.error('Delete board error:', error);
    }
  };

  const copyInviteLink = (roomId) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${roomId}`);
    setCopiedId(roomId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Boards</h1>
            <p className="text-dark-400">Collaborate and create together</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Join Board</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/30 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Board</span>
            </button>
          </div>
        </div>

        {/* Boards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-8 h-8 text-primary-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16 bg-dark-800/50 rounded-2xl border border-dark-700">
            <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No boards yet</h3>
            <p className="text-dark-400 mb-6">Create your first board to start collaborating</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            >
              Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board._id}
                className="bg-dark-800/80 backdrop-blur-md border border-dark-700 rounded-2xl p-6 hover:border-primary-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-700/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyInviteLink(board.roomId)}
                      className={`p-2 transition-colors ${
                        copiedId === board.roomId
                          ? 'text-green-400'
                          : 'text-dark-400 hover:text-primary-400'
                      }`}
                      title={copiedId === board.roomId ? 'Copied!' : 'Copy invite link'}
                    >
                      {copiedId === board.roomId ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => deleteBoard(board._id)}
                      className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                      title="Delete board"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">{board.title}</h3>
                <p className="text-dark-400 text-sm mb-4">Room ID: <span className="text-primary-400 font-mono">{board.roomId}</span></p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-dark-500">
                    <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link
                    to={`/board/${board._id}`}
                    state={{ roomId: board.roomId }}
                    className="bg-primary-600/20 hover:bg-primary-600 text-primary-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Board</h2>
            {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
            <form onSubmit={createBoard}>
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Board name"
                className="w-full bg-dark-900 border border-dark-600 text-white px-4 py-3 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none mb-4"
                required
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setError(''); }}
                  className="flex-1 bg-dark-700 text-white py-2.5 rounded-xl font-medium transition-all hover:bg-dark-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-medium transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Board Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Join Board</h2>
            {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
            <form onSubmit={joinBoard}>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="w-full bg-dark-900 border border-dark-600 text-white px-4 py-3 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none mb-4"
                required
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowJoinModal(false); setError(''); }}
                  className="flex-1 bg-dark-700 text-white py-2.5 rounded-xl font-medium transition-all hover:bg-dark-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-medium transition-all"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
