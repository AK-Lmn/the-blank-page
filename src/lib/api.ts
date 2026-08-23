import { supabase } from './supabase';
import type { Entry, PublicEntryRow } from '../types';

const publicEntryColumns = 'public_id, title, message, created_at';

function toEntry(row: PublicEntryRow, local = false): Entry {
  return {
    id: row.public_id,
    title: row.title,
    message: row.message,
    createdAt: row.created_at,
    ...(local ? { local: true } : {}),
  };
}

export async function submitEntry(title: string, message: string): Promise<Entry> {
  const { data, error } = await supabase
    .from('entries')
    .insert({ title, message })
    .select(publicEntryColumns)
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw error;
  }

  return toEntry(data as PublicEntryRow, true);
}

export async function fetchEntries(): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select(publicEntryColumns)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Supabase fetch error:', error);
    throw error;
  }

  return ((data ?? []) as PublicEntryRow[]).map((row) => toEntry(row));
}

export async function getPublicEntries(): Promise<Entry[]> {
  return fetchEntries();
}

export async function getPublicEntry(publicId: string): Promise<Entry | null> {
  const { data, error } = await supabase
    .from('entries')
    .select(publicEntryColumns)
    .eq('public_id', publicId)
    .maybeSingle();

  if (error) {
    console.error('Supabase entry fetch error:', error);
    throw error;
  }
  if (!data) return null;

  return toEntry(data as PublicEntryRow);
}

export async function searchEntries(query: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select(publicEntryColumns)
    .ilike('title', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Supabase search error:', error);
    throw error;
  }

  return ((data ?? []) as PublicEntryRow[]).map((row) => toEntry(row));
}
