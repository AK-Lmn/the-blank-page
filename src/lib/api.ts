import { supabase } from './supabase';
import type { Entry } from '../types';

export async function submitEntry(title: string, message: string): Promise<Entry> {
  const publicId = crypto.randomUUID().slice(0, 8);

  const { data, error } = await supabase
    .from('entries')
    .insert({
      public_id: publicId,
      title,
      message,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw error;
  }

  return {
    id: data.public_id || data.id,
    title: data.title,
    message: data.message,
    createdAt: data.created_at || new Date().toISOString(),
    local: true,
  };
}

export async function fetchEntries(): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Supabase fetch error:', error);
    throw error;
  }

  return (data ?? []).map((item: any) => ({
    id: item.public_id || item.id,
    title: item.title,
    message: item.message,
    createdAt: item.created_at || new Date().toISOString(),
  }));
}

export async function getPublicEntries(): Promise<Entry[]> {
  return fetchEntries();
}

export async function getPublicEntry(id: string): Promise<Entry | null> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .or(`public_id.eq.${id},id.eq.${id}`)
    .single();

  if (error || !data) return null;

  return {
    id: data.public_id || data.id,
    title: data.title,
    message: data.message,
    createdAt: data.created_at || new Date().toISOString(),
  };
}

export async function searchEntries(query: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .ilike('title', `%${query}%`)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Supabase search error:', error);
    throw error;
  }

  return (data ?? []).map((item: any) => ({
    id: item.public_id || item.id,
    title: item.title ?? '',
    message: item.message,
    createdAt: item.created_at || new Date().toISOString(),
  }));
}