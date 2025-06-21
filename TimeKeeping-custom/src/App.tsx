import "./App.css";
import TimelineTable from "./components/TimelineTable";
import ResourceTable from "./components/ResourceTable";
import SplitView from "splitview.js";
import "splitview.js/dist/splitview.css";

import { useEffect } from "react";

function App() {
  // useEffect(() => {
  //   const hanleResize = (event) => {
  //     console.log(event);
  //     const resourceTable = document.querySelector(".fc-resource-table");
  //     // if (resourceTable) {
  //     //   const width = window.innerWidth;
  //     //   resourceTable.style.width = `${width - 300}px`; // Adjust the width as needed
  //     // }
  //   };

  //   // window.addEventListener('resize', hanleResize)
  //   document
  //     .querySelector(".resize")
  //     ?.addEventListener("mousedown", hanleResize);

  //   return () => {
  //     document
  //       .querySelector(".resize")
  //       ?.removeEventListener("mousedown", hanleResize);
  //   };
  // }, []);

  const panes = [
    document.getElementById("pane1"),
    document.getElementById("pane2"),
  ];

  const splitview = SplitView(panes);
  // Distribute sizes on window resize

  return (
    <div className="container">
      <h4>Custom calendar Timeline</h4>
      <div className="timeline-wrapper">
        <ResourceTable />
        <div className="resize"></div>
        <TimelineTable />
      </div>
    </div>
  );
}

export default App;
