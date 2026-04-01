import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from './route';

const validPayload = {
  trigger: 'runtime_error',
  task: 'Loop through scores and print a label for each learner.',
  code: "scores = [('Asha', 88)]\nfor name, score in scores:\n    print(label)\n",
  stdout: '',
  stderr:
    'Traceback (most recent call last):\n  File "main.py", line 3, in <module>\n    print(label)\nNameError: name \'label\' is not defined',
  error: {
    type: 'NameError',
    message: "name 'label' is not defined",
    traceback:
      'Traceback (most recent call last):\n  File "main.py", line 3, in <module>\n    print(label)\nNameError: name \'label\' is not defined',
    line: 3,
  },
};

test('POST /api/rooms/python/feedback validates required fields', async () => {
  const response = await POST(
    new Request('http://localhost/api/rooms/python/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'runtime_error' }),
    }),
  );
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 400);
  assert.match(data.error || '', /Invalid Python room feedback payload/i);
});

test('POST /api/rooms/python/feedback returns the proxied reply shape', async () => {
  const originalFetch = global.fetch;

  global.fetch = async (input) => {
    assert.match(String(input), /\/rooms\/python\/feedback$/);

    return new Response(
      JSON.stringify({
        reply: 'Your run stopped on line 3. Check where `label` should be defined before you print it, then run again.',
        provider: 'local-room-feedback',
        model_used: null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  };

  try {
    const response = await POST(
      new Request('http://localhost/api/rooms/python/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          referer: 'http://localhost:3000/dashboard/rooms/python',
        },
        body: JSON.stringify(validPayload),
      }),
    );
    const data = (await response.json()) as { reply?: string; provider?: string; modelUsed?: string | null };

    assert.equal(response.status, 200);
    assert.match(data.reply || '', /line 3/i);
    assert.equal(data.provider, 'local-room-feedback');
    assert.equal(data.modelUsed, null);
  } finally {
    global.fetch = originalFetch;
  }
});
