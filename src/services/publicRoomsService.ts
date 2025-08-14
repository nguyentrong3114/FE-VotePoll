import apiClient from '../api/api';

export interface PublicRoom {
  roomId: string;
  question: string;
  totalVotes: number;
  createdAt: string;
  isActive: boolean;
  hasPassword: boolean;
}

export interface PublicRoomsResponse {
  rooms: PublicRoom[];
  total: number;
}

class PublicRoomsService {
  async getPublicRooms(): Promise<PublicRoom[]> {
    try {
      const response = await apiClient.get<PublicRoomsResponse>('/api/polls/public');
      return response.data.rooms;
    } catch (error) {
      console.error('Error fetching public rooms:', error);
      throw error;
    }
  }
}

export const publicRoomsService = new PublicRoomsService();
