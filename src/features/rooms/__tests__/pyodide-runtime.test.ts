import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPythonRunError } from '../pyodide-runtime';

test('extractPythonRunError parses SyntaxError line numbers', () => {
  const error = extractPythonRunError(`Traceback (most recent call last):
  File "main.py", line 3
    print("hello"
         ^
SyntaxError: '(' was never closed`);

  assert.equal(error.type, 'SyntaxError');
  assert.equal(error.line, 3);
  assert.match(error.message, /never closed/i);
});

test('extractPythonRunError picks the deepest main.py traceback frame', () => {
  const error = extractPythonRunError(`Traceback (most recent call last):
  File "<exec>", line 1, in <module>
  File "main.py", line 7, in <module>
    print(total / count)
ZeroDivisionError: division by zero`);

  assert.equal(error.type, 'ZeroDivisionError');
  assert.equal(error.line, 7);
  assert.equal(error.message, 'division by zero');
});

test('extractPythonRunError falls back when no line number exists', () => {
  const error = extractPythonRunError('NameError: name "label" is not defined');

  assert.equal(error.type, 'NameError');
  assert.equal(error.line, null);
  assert.match(error.message, /not defined/i);
});

