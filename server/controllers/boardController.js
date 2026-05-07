const Board = require('../models/Board');
const { v4: uuidv4 } = require('uuid');

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res) => {
  try {
    const { title } = req.body;
    
    // Generate unique room ID
    const roomId = uuidv4().substring(0, 8);

    const board = await Board.create({
      title,
      roomId,
      createdBy: req.user._id,
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('createdBy', 'username email')
      .populate('collaborators.user', 'username email');

    res.status(201).json(populatedBoard);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all boards for user
// @route   GET /api/boards
// @access  Private
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { createdBy: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .populate('createdBy', 'username email')
    .populate('collaborators.user', 'username email')
    .sort({ createdAt: -1 });

    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get board by ID
// @route   GET /api/boards/:id
// @access  Private
const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('collaborators.user', 'username email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to this board
    const hasAccess = board.createdBy._id.toString() === req.user._id.toString() ||
                     board.collaborators.some(c => c.user._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(401).json({ message: 'Not authorized to access this board' });
    }

    res.json(board);
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
const updateBoard = async (req, res) => {
  try {
    const { title, canvasData } = req.body;
    
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to this board
    const hasAccess = board.createdBy.toString() === req.user._id.toString() ||
                     board.collaborators.some(c => c.user.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(401).json({ message: 'Not authorized to update this board' });
    }

    if (title !== undefined) board.title = title;
    if (canvasData !== undefined) board.canvasData = canvasData;

    const updatedBoard = await board.save();
    const populatedBoard = await Board.findById(updatedBoard._id)
      .populate('createdBy', 'username email')
      .populate('collaborators.user', 'username email');

    res.json(populatedBoard);
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Only creator can delete the board
    if (board.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this board' });
    }

    await board.deleteOne();
    res.json({ message: 'Board removed' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join board by room ID
// @route   POST /api/boards/join/:roomId
// @access  Private
const joinBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId })
      .populate('createdBy', 'username email')
      .populate('collaborators.user', 'username email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is already a collaborator
    const isCollaborator = board.collaborators.some(
      c => c.user._id.toString() === req.user._id.toString()
    );

    // Add user to collaborators if not already there and not the creator
    if (!isCollaborator && board.createdBy._id.toString() !== req.user._id.toString()) {
      board.collaborators.push({
        user: req.user._id,
        joinedAt: new Date()
      });
      await board.save();
      
      // Re-populate after saving
      await board.populate('collaborators.user', 'username email');
    }

    res.json(board);
  } catch (error) {
    console.error('Join board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  joinBoard,
};
