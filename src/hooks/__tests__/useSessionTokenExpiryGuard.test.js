import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import useSessionTokenExpiryGuard from '../useSessionTokenExpiryGuard';

const buildJwt = (exp) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ exp }));
  return `${header}.${body}.signature`;
};

const HookHarness = ({ user, onSessionTokenExpired, onResult }) => {
  const ensureValidSession = useSessionTokenExpiryGuard(user, onSessionTokenExpired);
  return (
    <button onClick={() => onResult(ensureValidSession())}>run</button>
  );
};

test('returns true and does not dispatch when the token is valid', () => {
  const onSessionTokenExpired = jest.fn();
  const onResult = jest.fn();
  const user = {
    emailId: 'student@example.com',
    innerToken: buildJwt(Math.floor(Date.now() / 1000) + 3600)
  };

  const { getByText } = render(
    <HookHarness user={user} onSessionTokenExpired={onSessionTokenExpired} onResult={onResult} />
  );
  fireEvent.click(getByText('run'));

  expect(onResult).toHaveBeenCalledWith(true);
  expect(onSessionTokenExpired).not.toHaveBeenCalled();
});

test('returns false and dispatches onSessionTokenExpired when the token is expired', () => {
  const onSessionTokenExpired = jest.fn();
  const onResult = jest.fn();
  const user = {
    emailId: 'student@example.com',
    innerToken: buildJwt(Math.floor(Date.now() / 1000) - 3600)
  };

  const { getByText } = render(
    <HookHarness user={user} onSessionTokenExpired={onSessionTokenExpired} onResult={onResult} />
  );
  fireEvent.click(getByText('run'));

  expect(onResult).toHaveBeenCalledWith(false);
  expect(onSessionTokenExpired).toHaveBeenCalledWith('student@example.com');
});

test('treats a missing token as expired (fail-closed)', () => {
  const onSessionTokenExpired = jest.fn();
  const onResult = jest.fn();
  const user = { emailId: 'student@example.com', innerToken: null };

  const { getByText } = render(
    <HookHarness user={user} onSessionTokenExpired={onSessionTokenExpired} onResult={onResult} />
  );
  fireEvent.click(getByText('run'));

  expect(onResult).toHaveBeenCalledWith(false);
  expect(onSessionTokenExpired).toHaveBeenCalledWith('student@example.com');
});

test('handles a missing user object gracefully', () => {
  const onSessionTokenExpired = jest.fn();
  const onResult = jest.fn();

  const { getByText } = render(
    <HookHarness user={null} onSessionTokenExpired={onSessionTokenExpired} onResult={onResult} />
  );
  fireEvent.click(getByText('run'));

  expect(onResult).toHaveBeenCalledWith(false);
  expect(onSessionTokenExpired).toHaveBeenCalledWith(undefined);
});
