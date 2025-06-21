const TimelineTable = () => {
  return (
    <div className="fc-timeline-table" id='pane2'>
      <table>
        <thead>
          <tr>
            {Array.from({ length: 31 }, (_, i) => (
              <th key={i}>{i}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Array.from({ length: 31 }, (_, i) => (
              <td key={i}></td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TimelineTable;
