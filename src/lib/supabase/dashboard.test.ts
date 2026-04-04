import test from 'node:test';
import assert from 'node:assert/strict';
import { isMissingDashboardSchemaError, isRecoverableDashboardError } from './dashboard';

test('dashboard schema helper treats missing columns as recoverable', () => {
  const error = {
    code: '42703',
    message: 'column student_dashboard_paths.learning_track_title does not exist',
  };

  assert.equal(isMissingDashboardSchemaError(error), true);
  assert.equal(isRecoverableDashboardError(error), true);
});

test('dashboard schema helper treats schema-cache column errors as recoverable', () => {
  const error = {
    code: 'PGRST204',
    message: "Could not find the 'recommended_action_title' column of 'student_dashboard_paths' in the schema cache",
  };

  assert.equal(isMissingDashboardSchemaError(error), true);
  assert.equal(isRecoverableDashboardError(error), true);
});

test('dashboard schema helper does not hide unrelated errors', () => {
  const error = {
    code: 'XX000',
    message: 'unexpected internal error',
  };

  assert.equal(isMissingDashboardSchemaError(error), false);
  assert.equal(isRecoverableDashboardError(error), false);
});
