const express = require('express');
const {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  joinBoard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All board routes are protected

router.route('/')
  .post(createBoard)
  .get(getBoards);

router.route('/:id')
  .get(getBoard)
  .put(updateBoard)
  .delete(deleteBoard);

router.post('/join/:roomId', joinBoard);

module.exports = router;
