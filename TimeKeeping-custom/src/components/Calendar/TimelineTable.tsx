import type { Dayjs } from "dayjs";
import { useEffect, type RefObject } from "react";
import type { EventCalendar } from "./type";

const TimelineTable = (props: {
  timeLineTableRef: RefObject<HTMLTableElement | null>;
  month: Dayjs;
  events: EventCalendar[];
}) => {
  const { timeLineTableRef, events, month } = props;
  const endOfMonth = month.endOf("month").get("D");

  useEffect(() => {
    if (timeLineTableRef?.current) {
      events.forEach((event) => {
        const tds = timeLineTableRef.current?.querySelector(
          `td[data-day="${event.day}"]`
        );
        if (tds) {
          const child = document.createElement("div");
          child.textContent = "";
          child.innerHTML = event.title;
          tds.innerHTML = "";
          tds?.appendChild(child);
        }
      });
    }
  }, []);

  return (
    <div className="fc-timeline-table" id="pane2">
      <table ref={timeLineTableRef}>
        <thead>
          <tr>
            {Array.from({ length: endOfMonth }, (_, i) => (
              <th key={i}>{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Array.from({ length: endOfMonth }, (_, i) => (
              <td
                data-resource-id={0}
                data-day={month.set("date", i + 1).format("YYYY-MM-DD")}
                data-row={0}
                data-col={i}
                key={i}
              ></td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TimelineTable;
