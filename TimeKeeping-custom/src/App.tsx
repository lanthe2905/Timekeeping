import dayjs from "dayjs";
import "./App.css";
import Calendar, { type EventCalendar, type S2 } from "./components/Calendar";
const events = [
  {
    id: 1,
    title: "L",
    day: "2025-06-10",
    className: "",
  },
  {
    id: 2,
    title: "K",
    day: "2025-06-11",
    className: "",
  },
] as EventCalendar[];

function App() {
  const handleSelect = (cell: S2[]) => {
    console.debug(cell)
    console.dir("s2: " + cell);
  };

  return (
    <div
      className="container"
      style={{
        userSelect: "none",
      }}
    >
      <Calendar events={events} month={dayjs()} onSelect={handleSelect} />
    </div>
  );
}

export default App;
