// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomFinder from '@/components/RoomFinder';
import { ROOMS } from '@/data/rooms';

afterEach(cleanup);

function setup() {
  const user = userEvent.setup();
  render(<RoomFinder />);
  const roomList = () => screen.getByRole('region', { name: /matching rooms/i });
  const roomRadios = () => within(roomList()).queryAllByRole('radio');
  const result = () => screen.getByTestId('result');
  const attendees = () => screen.getByLabelText(/number of attendees/i);

  async function setTimes(start: string, end: string) {
    await user.clear(screen.getByLabelText(/start time/i));
    await user.type(screen.getByLabelText(/start time/i), start);
    await user.clear(screen.getByLabelText(/end time/i));
    await user.type(screen.getByLabelText(/end time/i), end);
  }
  const check = () => user.click(screen.getByRole('button', { name: /check availability/i }));
  const pick = (name: RegExp) => user.click(within(roomList()).getByRole('radio', { name }));

  return { user, roomList, roomRadios, result, attendees, setTimes, check, pick };
}

describe('Room finder UI (integration)', () => {
  it('shows every room initially and disables the check until a room is selected', () => {
    const ui = setup();
    expect(ui.roomRadios()).toHaveLength(ROOMS.length);
    expect(screen.getByRole('button', { name: /check availability/i })).toHaveProperty('disabled', true);
  });

  it('F1/F2 in the UI: successful filtering shows only matching rooms', async () => {
    const ui = setup();
    await ui.user.clear(ui.attendees());
    await ui.user.type(ui.attendees(), '10');
    await ui.user.click(screen.getByRole('checkbox', { name: 'Video conferencing' }));
    const names = ui.roomRadios().map((r) => r.closest('label')?.textContent ?? '');
    expect(names).toHaveLength(2);
    expect(names[0]).toMatch(/Room D/);
    expect(names[1]).toMatch(/Hall E/);
  });

  it('F4: unsuccessful filtering shows a clear empty state', async () => {
    const ui = setup();
    await ui.user.clear(ui.attendees());
    await ui.user.type(ui.attendees(), '500');
    expect(ui.roomRadios()).toHaveLength(0);
    expect(within(ui.roomList()).getByText(/no rooms match your requirements/i)).toBeTruthy();
  });

  it('successful and unsuccessful availability checks for the selected room', async () => {
    const ui = setup();
    await ui.pick(/Room A/);
    await ui.setTimes('660', '720');
    await ui.check();
    expect(ui.result().textContent).toMatch(/^Available/);
    await ui.setTimes('630', '690');
    await ui.check();
    expect(ui.result().textContent).toMatch(/Unavailable.*overlaps/);
  });

  it('F3 in the UI: a blocked room is labelled and checks as Unavailable', async () => {
    const ui = setup();
    const roomBLabel = within(ui.roomList()).getByRole('radio', { name: /Room B/ }).closest('label')!;
    expect(roomBLabel.textContent).toMatch(/Blocked/);
    await ui.pick(/Room B/);
    await ui.setTimes('660', '720');
    await ui.check();
    expect(ui.result().textContent).toMatch(/Unavailable.*blocked/);
  });

  it('F5: switching rooms clears the old result and the new check uses the new room’s bookings', async () => {
    const ui = setup();
    await ui.pick(/Room A/);
    await ui.setTimes('660', '720');
    await ui.check();
    expect(ui.result().textContent).toMatch(/^Available.*Room A/);

    await ui.pick(/Lab C/);
    expect(ui.result().textContent).toBe(''); // stale Room A result removed
    expect(screen.getByTestId('selected-room').textContent).toMatch(/Lab C/);

    await ui.check();
    expect(ui.result().textContent).toMatch(/Unavailable.*Lab C.*overlaps/);
  });

  it('F5: if a filter change hides the selected room, the selection and result are cleared', async () => {
    const ui = setup();
    await ui.pick(/Room A/);
    await ui.setTimes('660', '720');
    await ui.check();
    expect(ui.result().textContent).toMatch(/Available/);

    await ui.user.click(screen.getByRole('checkbox', { name: 'Computers' })); // Room A has no computers
    expect(ui.result().textContent).toBe('');
    expect(screen.queryByTestId('selected-room')).toBeNull();
    expect(screen.getByRole('button', { name: /check availability/i })).toHaveProperty('disabled', true);
  });
});
