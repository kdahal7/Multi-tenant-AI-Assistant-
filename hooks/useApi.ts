'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CreateConversationInput, CreateMessageInput } from '@/lib/validation';

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

/**
 * Auth hooks
 */

export function useLogin() {
  return useMutation({
    mutationFn: async (data: { email: string; projectSlug: string }) => {
      const response = await client.post('/auth/login', data);
      return response.data;
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await client.post('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

/**
 * Project hooks
 */

export function useProjectBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const response = await client.get('/projects', { params: { slug } });
      return response.data;
    },
    enabled,
  });
}

export function useProductInstances(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ['product-instances', projectId],
    queryFn: async () => {
      const response = await client.get('/product-instances', { params: { projectId } });
      return response.data;
    },
    enabled,
  });
}

/**
 * Conversation hooks
 */

export function useConversations(
  projectId: string,
  productInstanceId: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['conversations', projectId, productInstanceId],
    queryFn: async () => {
      const response = await client.get('/conversations', {
        params: { projectId, productInstanceId },
      });
      return response.data;
    },
    enabled,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateConversationInput) => {
      const response = await client.post('/conversations', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['conversations', variables.projectId, variables.productInstanceId],
      });
    },
  });
}

/**
 * Message hooks
 */

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMessageInput) => {
      const response = await client.post('/messages', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.conversationId],
      });
    },
  });
}

/**
 * Dashboard hooks
 */

export function useDashboardConfig(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ['dashboard', projectId],
    queryFn: async () => {
      const response = await client.get('/admin/dashboard', {
        params: { projectId },
      });
      return response.data;
    },
    enabled,
  });
}

export function useUpdateDashboardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { projectId: string; sections: any[] }) => {
      const response = await client.put('/admin/dashboard', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['dashboard', data.projectId],
      });
    },
  });
}
