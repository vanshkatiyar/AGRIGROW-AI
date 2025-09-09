import api from '@/api/axios';

export interface CallHistoryItem {
  _id: string;
  callId: string;
  participants: {
    caller: string;
    callee: string;
  };
  callerInfo: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  calleeInfo: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  type: 'audio' | 'video';
  status: 'completed' | 'missed' | 'rejected' | 'failed';
  duration?: number;
  startTime: string;
  endTime?: string;
  createdAt: string;
}

export interface CallHistoryResponse {
  calls: CallHistoryItem[];
  totalCount: number;
  hasMore: boolean;
}

export const getCallHistory = async (
  conversationId?: string,
  page: number = 1,
  limit: number = 20
): Promise<CallHistoryResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (conversationId) {
      params.append('conversationId', conversationId);
    }

    const response = await api.get(`/calls/history?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching call history:', error);
    throw error;
  }
};

export const getConversationCallHistory = async (
  conversationId: string,
  page: number = 1,
  limit: number = 10
): Promise<CallHistoryResponse> => {
  return getCallHistory(conversationId, page, limit);
};