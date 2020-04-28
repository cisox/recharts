import EventEmitter from 'events';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
const eventCenter: any = new EventEmitter();

if (eventCenter.setMaxListeners) {
  eventCenter.setMaxListeners(10);
}

export { eventCenter };
export const SYNC_EVENT = 'recharts.syncMouseEvents';
