import TimelineTable from "./TimelineTable";
import ResourceTable from "./ResourceTable";

import { useEffect, useRef, useState } from "react";
import type { EventCalendar, S2 } from "./type";
import type { Dayjs } from "dayjs";

const SELECTING_DEFAULT = {
  dataset: { selectedCell: "true" },
  classes: ["selected-cell"],
};

type Props = {
  events: EventCalendar[];
  onSelect: (event: S2[]) => void;
  month: Dayjs;
};

function Calendar(props: Props) {
  const { events, month } = props;
  const [tableResize, setTableResize] = useState(false);
  const [selected, setSelected] = useState<[number, number] | null>([0, 0]);
  const timeLineTableRef = useRef<HTMLElement | null>(null);
  const eventStore = useRef([])
  
  // document.querySelector("#pane2 table");
  let selecting = false;

  const position = useRef<{
    startCell: number;
    endCell: number;
    row: number;
  }>({
    startCell: 0,
    endCell: 0,
    row: 0,
  });

  const setSelecting = (td: HTMLTableCellElement) => {
    Object.keys(SELECTING_DEFAULT.dataset).forEach((key) => {
      td.dataset[key] = SELECTING_DEFAULT.dataset[key];
    });
    td.classList.add(SELECTING_DEFAULT.classes);
  };

  const getEventInCell = (cell: HTMLTableCellElement) => {
    const day = cell.getAttribute("data-day");
    return events.filter((event) => event.day == day);
  };

  const getEventSelecting = () => {
    const cells = timeLineTableRef.current?.querySelectorAll(
      "td[data-selected-cell]"
    );
    const events = [] as S2[];

    cells?.forEach((cell: Element) => {
      const resourceId = cell.getAttribute("data-resource-id");
      const day = cell.getAttribute("data-day");
      events.push({
        day: String(day),
        resourceID: Number(resourceId),
        events: getEventInCell(cell as HTMLTableCellElement) ?? [],
      });
    });

    return events;
  };

  useEffect(() => {
    const barResize = document.querySelector(".bar-resize");
    const pane1: HTMLElement | null = document.querySelector("#pane1");

    const handleMouseDown = (e) => {
      setTableResize(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      if (tableResize && pane1) {
        const x1 = pane1?.offsetLeft ?? 0;
        const x2 = e.x;
        const currentWidth = x1 + x2;
        pane1.style.width = `${currentWidth}px`;
      }
    };

    const handleMouseUp = (e) => {
      setTableResize(false);
    };

    barResize?.addEventListener("mousedown", handleMouseDown);
    document?.addEventListener("mousemove", handleMouseMove);
    document?.addEventListener("mouseup", handleMouseUp);

    return () => {
      barResize?.removeEventListener("mousedown", handleMouseDown);
      document?.removeEventListener("mousemove", handleMouseMove);
      document?.removeEventListener("mouseup", handleMouseUp);
    };
  }, [tableResize]);

  const handleClick = (e) => {
    const target = e.target as HTMLTableCellElement;
    selecting = true;

    // Remove all cell has selected
    const tds = timeLineTableRef.current?.querySelectorAll(
      "td[data-selected-cell]"
    );

    tds?.forEach((td: HTMLTableCellElement) => {
      td.classList.remove("selected-cell");
      td.removeAttribute("data-selected-cell");
    });
    // Current selecting cell
    if (target.tagName == "TD") {
      const col = Number(target.getAttribute("data-col"));
      const row = Number(target.getAttribute("data-row"));
      setSelecting(target);
      setSelected([row, col]);

      position.current = {
        startCell: col,
        endCell: col,
        row: row,
      };
    }
  };

  const handleMouseMove = (e: Event) => {
    const target = e.target as HTMLTableCellElement;

    if (target.tagName == "TD" && selecting == true && target) {
      const col = Number(target.getAttribute("data-col"));
      setSelecting(target);

      position.current = {
        startCell: position.current.startCell,
        endCell: col,
        row: position.current.row,
      };
    }
  };

  const handleMouseUp = () => {
    selecting = false;
    const S2 = getEventSelecting();
    props.onSelect(S2);
  };

  useEffect(() => {
    timeLineTableRef?.current?.addEventListener("mousedown", handleClick);
    timeLineTableRef?.current?.addEventListener("mousemove", handleMouseMove);
    timeLineTableRef?.current?.addEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <>
      <h4>Custom calendar Timeline</h4>
      <div className="timeline-wrapper">
        <ResourceTable />
        <div className="bar-resize"></div>
        <TimelineTable
          timeLineTableRef={timeLineTableRef}
          selected={selected}
          month={month}
          events={events}
        />
      </div>
    </>
  );
}

export default Calendar;
