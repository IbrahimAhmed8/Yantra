import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');
const schema = readFileSync(schemaPath, 'utf8');

test('schema provisions dashboard practice rooms table with RLS', () => {
  assert.match(schema, /create table if not exists public\.student_practice_rooms \(/i);
  assert.match(schema, /room_key text not null/i);
  assert.match(schema, /cta_label text not null/i);
  assert.match(schema, /texture_key text not null check \(texture_key in \('python-room', 'neural-builder', 'data-explorer', 'prompt-lab'\)\)/i);
  assert.match(schema, /primary key \(user_id, room_key\)/i);
  assert.match(schema, /alter table public\.student_practice_rooms enable row level security;/i);
  assert.match(schema, /create policy "Users can view their own practice rooms"/i);
  assert.match(schema, /create policy "Users can insert their own practice rooms"/i);
  assert.match(schema, /create policy "Users can update their own practice rooms"/i);
});

test('schema provisions personalization profile storage with RLS', () => {
  assert.match(schema, /create table if not exists public\.student_personalization_profiles \(/i);
  assert.match(schema, /source_provider text check \(source_provider is null or source_provider in \('chatgpt', 'gemini', 'other'\)\)/i);
  assert.match(schema, /approved_facts jsonb/i);
  assert.match(schema, /learner_summary text not null default ''/i);
  assert.match(schema, /confidence_summary text not null default ''/i);
  assert.match(schema, /assumptions text\[\] not null default '\{\}'/i);
  assert.match(schema, /last_generated_at timestamptz/i);
  assert.match(schema, /last_model_provider text/i);
  assert.match(schema, /last_model_name text/i);
  assert.match(schema, /alter table public\.student_personalization_profiles enable row level security;/i);
  assert.match(schema, /create policy "Users can view their own personalization profile"/i);
  assert.match(schema, /create policy "Users can insert their own personalization profile"/i);
  assert.match(schema, /create policy "Users can update their own personalization profile"/i);
});
