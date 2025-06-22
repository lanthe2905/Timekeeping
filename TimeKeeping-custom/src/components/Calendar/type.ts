export type EventCalendar = {
  id: number;
  title: string;
  day: string; //ex: YYYY-MM-DD
  className?: string;
};

export type S2 = {
  resourceID: number;
  day: string;
  events?: EventCalendar[] | undefined;
};
