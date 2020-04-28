import EventEmitter from 'events'; // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore

var eventCenter = new EventEmitter();

if (eventCenter.setMaxListeners) {
  eventCenter.setMaxListeners(10);
}

export { eventCenter };
export var SYNC_EVENT = 'recharts.syncMouseEvents';