// useContactFilterState pulls in lob/AudienceMessaging, which imports antd
// component for table column renderers. Mock antd here so Jest doesn't
// attempt to resolve its locale internals.
jest.mock('antd', () => ({
  Button: () => null,
  Tag: () => null,
  Tooltip: () => null,
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import useContactFilterState from '../useContactFilterState';

const getDefaults = () => ({ sex: 'all', searchText: '', offset: 0 });

const HookHarness = ({ onResult }) => {
  const [filters, setFilters, updateField, resetFilters] = useContactFilterState(getDefaults);
  return (
    <div>
      <span data-testid="filters">{JSON.stringify(filters)}</span>
      <button onClick={() => updateField('sex', 'F')}>update-sex</button>
      <button onClick={() => updateField('offset', 40)}>update-offset</button>
      <button onClick={() => setFilters(prev => ({ ...prev, searchText: 'jane' }))}>set-raw</button>
      <button onClick={() => onResult(resetFilters())}>reset</button>
    </div>
  );
};

test('starts from getDefaultFilters()', () => {
  const { getByTestId } = render(<HookHarness onResult={jest.fn()} />);
  expect(JSON.parse(getByTestId('filters').textContent)).toEqual(getDefaults());
});

test('updateField sets the field and resets offset to 0', () => {
  const { getByTestId, getByText } = render(<HookHarness onResult={jest.fn()} />);
  fireEvent.click(getByText('update-offset'));
  fireEvent.click(getByText('update-sex'));
  expect(JSON.parse(getByTestId('filters').textContent)).toEqual({ sex: 'F', searchText: '', offset: 0 });
});

test('updateField with fieldName "offset" does not re-zero the offset', () => {
  const { getByTestId, getByText } = render(<HookHarness onResult={jest.fn()} />);
  fireEvent.click(getByText('update-offset'));
  expect(JSON.parse(getByTestId('filters').textContent)).toEqual({ sex: 'all', searchText: '', offset: 40 });
});

test('setFilters (raw setter) is still exposed for direct updates', () => {
  const { getByTestId, getByText } = render(<HookHarness onResult={jest.fn()} />);
  fireEvent.click(getByText('set-raw'));
  expect(JSON.parse(getByTestId('filters').textContent)).toEqual({ sex: 'all', searchText: 'jane', offset: 0 });
});

test('resetFilters restores defaults and returns the default object', () => {
  const onResult = jest.fn();
  const { getByTestId, getByText } = render(<HookHarness onResult={onResult} />);
  fireEvent.click(getByText('update-sex'));
  fireEvent.click(getByText('reset'));
  expect(JSON.parse(getByTestId('filters').textContent)).toEqual(getDefaults());
  expect(onResult).toHaveBeenCalledWith(getDefaults());
});
