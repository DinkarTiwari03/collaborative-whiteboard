import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boardService } from '../services/boardService';
import { initSocket, joinRoom, sendDraw, sendCursorMove, sendChatMessage, sendClearBoard, disconnectSocket } from '../socket/socket';
import Toolbar from '../components/Toolbar';
import ChatPanel from '../components/ChatPanel';

const WhiteboardRoom = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [board, setBoard] = useState(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(3);
  const [strokes, setStrokes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [messages, setMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const contextRef = useRef(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef([]);

  // Initialize canvas context
  useEffect(() => {
    if (loading) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      // Save existing content before resize
      let savedData = null;
      if (canvas.width > 0 && canvas.height > 0 && contextRef.current) {
        savedData = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Restore saved content
      if (savedData) {
        ctx.putImageData(savedData, 0, 0);
      }

      contextRef.current = ctx;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [loading]);

  // Load board data
  useEffect(() => {
    const loadBoard = async () => {
      try {
        const data = await boardService.getBoard(id);
        setBoard(data);
        setLoading(false);

        // Initialize socket
        const socket = initSocket();
        joinRoom(data.roomId, user.username, user._id);

        // Setup socket listeners
        socket.on('draw', (drawingData) => {
          if (drawingData.stroke) {
            drawStroke(drawingData.stroke);
          }
        });

        socket.on('user-connected', (userData) => {
          setRoomUsers(prev => [...prev.filter(u => u.userId !== userData.userId), userData]);
        });

        socket.on('user-disconnected', ({ userId }) => {
          setRoomUsers(prev => prev.filter(u => u.userId !== userId));
        });

        socket.on('room-data', ({ users, canvasData }) => {
          setRoomUsers(users || []);
          if (canvasData) {
            loadCanvasData(canvasData);
          }
        });

        socket.on('chat-message', (message) => {
          setMessages(prev => [...prev, message]);
        });

        socket.on('clear-board', () => {
          clearCanvas();
        });

        socket.on('cursor-move', (cursorData) => {
          // Handle cursor movement (optional: show remote cursors)
        });

        socket.on('undo', ({ canvasData }) => {
          if (canvasData) {
            loadCanvasData(canvasData);
          }
        });
      } catch (error) {
        console.error('Load board error:', error);
        setError('Failed to load board');
        setLoading(false);
      }
    };

    if (user && id) {
      loadBoard();
    }

    return () => {
      disconnectSocket();
    };
  }, [id, user]);

  const getCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const drawStroke = useCallback((stroke) => {
    const ctx = contextRef.current;
    if (!ctx || !stroke.points || stroke.points.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    stroke.points.forEach((point, i) => {
      if (i > 0) {
        ctx.lineWidth = point.brushSize;
        ctx.strokeStyle = point.tool === 'eraser' ? '#0f172a' : point.color;
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
      }
    });
  }, []);

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    drawingRef.current = true;
    currentStrokeRef.current = [{ x, y, color, brushSize, tool }];

    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
  }, [color, brushSize, tool, getCoordinates]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!drawingRef.current) {
      const { x, y } = getCoordinates(e);
      sendCursorMove(board?.roomId, x, y);
      return;
    }

    const { x, y } = getCoordinates(e);
    const ctx = contextRef.current;
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
    ctx.lineTo(x, y);
    ctx.stroke();

    currentStrokeRef.current.push({ x, y, color, brushSize, tool });
  }, [color, brushSize, tool, getCoordinates, board]);

  const stopDrawing = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    if (currentStrokeRef.current.length > 1) {
      const newStroke = { points: [...currentStrokeRef.current] };
      setStrokes(prev => [...prev, newStroke]);
      setUndoStack(prev => [...prev, newStroke]);
      setRedoStack([]);

      // Send to socket
      if (board) {
        sendDraw(board.roomId, { stroke: newStroke });
      }
    }

    currentStrokeRef.current = [];
  }, [board]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const loadCanvasData = useCallback((dataUrl) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx || !dataUrl) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }, []);

  const undo = useCallback(() => {
    if (strokes.length === 0) return;

    const lastStroke = strokes[strokes.length - 1];
    setRedoStack(prev => [...prev, lastStroke]);
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);

    // Redraw all strokes
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    newStrokes.forEach(stroke => {
      if (stroke.points && stroke.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach((point, i) => {
          if (i > 0) {
            ctx.lineWidth = point.brushSize;
            ctx.strokeStyle = point.tool === 'eraser' ? '#0f172a' : point.color;
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
          }
        });
      }
    });
  }, [strokes]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextStroke = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setStrokes(prev => [...prev, nextStroke]);
    drawStroke(nextStroke);
  }, [redoStack, drawStroke]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `collabboard-${board?.title || 'untitled'}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [board]);

  const handleSendMessage = useCallback((message) => {
    if (!board) return;
    sendChatMessage(board.roomId, message, user.username, new Date().toISOString());
    setMessages(prev => [...prev, {
      id: Date.now(),
      username: user.username,
      message,
      timestamp: new Date().toISOString()
    }]);
  }, [board, user]);

  const saveBoard = useCallback(async () => {
    if (!board || !canvasRef.current) return;
    try {
      const canvasData = canvasRef.current.toDataURL();
      await boardService.updateBoard(board._id, { canvasData });
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Save board error:', error);
    }
  }, [board]);

  const handleClearBoard = useCallback(() => {
    if (!board) return;
    if (window.confirm('Clear the entire board?')) {
      clearCanvas();
      sendClearBoard(board.roomId);
    }
  }, [board, clearCanvas]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin w-6 h-6 text-primary-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-dark-300">Loading board...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      {/* Top Bar */}
      <div className="bg-dark-800/80 backdrop-blur-md border-b border-dark-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">{board?.title}</h1>
            <p className="text-xs text-dark-400">Room: <span className="text-primary-400 font-mono">{board?.roomId}</span></p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {showSaveSuccess && (
            <span className="text-green-400 text-sm bg-green-500/20 px-3 py-1 rounded-lg">Saved!</span>
          )}
          <button
            onClick={saveBoard}
            className="bg-primary-600/20 hover:bg-primary-600 text-primary-400 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          >
            Save
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onClear={handleClearBoard}
          onUndo={undo}
          onRedo={redo}
          canUndo={strokes.length > 0}
          canRedo={redoStack.length > 0}
          onDownload={downloadCanvas}
        />

        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute inset-0 cursor-crosshair touch-none"
          />
        </div>

        {/* Chat Panel */}
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          roomUsers={roomUsers}
          currentUser={user}
        />
      </div>
    </div>
  );
};

export default WhiteboardRoom;
