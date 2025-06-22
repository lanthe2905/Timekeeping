class EventStore {
  id: number;
  events: Array<EventStore>;

  constructor() {
    this.id = 0;
    this.events = [];
  }
}

export EventStore