import apiClient from '../api/api';

export interface CreatePollRequest {
  question: string;
  options: string[];
  password?: string;
}

export interface CreatePollResponse {
  roomId: string;
  question: string;
  options: string[];
}

export const pollService = {
  async createPoll(pollData: CreatePollRequest): Promise<CreatePollResponse> {
    const response = await apiClient.post('/api/polls', pollData);
    return response.data;
  }
};
