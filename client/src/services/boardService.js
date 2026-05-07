import api from './api';

export const boardService = {
  createBoard: async (title) => {
    const response = await api.post('/boards', { title });
    return response.data;
  },

  getBoards: async () => {
    const response = await api.get('/boards');
    return response.data;
  },

  getBoard: async (id) => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  updateBoard: async (id, data) => {
    const response = await api.put(`/boards/${id}`, data);
    return response.data;
  },

  deleteBoard: async (id) => {
    const response = await api.delete(`/boards/${id}`);
    return response.data;
  },

  joinBoard: async (roomId) => {
    const response = await api.post(`/boards/join/${roomId}`);
    return response.data;
  },
};
