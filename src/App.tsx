import React, { useRef, useState } from "react";
import "./App.css";

const days = Array.from({ length: 30 }, (_, i) => i + 1);
const SYMBOLS = ["+", "-", "L", "M"];

// Danh sách nhân viên mẫu
const EMPLOYEES = [
  { id: 1, name: "Nguyễn Văn A" },
  { id: 2, name: "Trần Thị B" },
  { id: 3, name: "Lê Văn C" },
  { id: 4, name: "Phạm Thị D" },
];

// Data khởi tạo mẫu
const INIT_SYMBOLS = [
  { id_nhan_vien: 1, ki_tu: "+", ngay: "2025/05/22" },
  { id_nhan_vien: 2, ki_tu: "-", ngay: "2025/05/20" },
  { id_nhan_vien: 3, ki_tu: "L", ngay: "2025/05/25" },
  { id_nhan_vien: 1, ki_tu: "M", ngay: "2025/05/28" },
];

// Helper: lấy ngày trong tháng từ chuỗi yyyy/MM/dd
function getDayFromDate(dateStr: string): number {
  return parseInt(dateStr.split("/")[2], 10);
}

// Khởi tạo data dạng 2 chiều: [nhân viên][ngày] = ký hiệu
function buildInitialData(
  employees: { id: number; name: string }[],
  days: number[],
  initSymbols: { id_nhan_vien: number; ki_tu: string; ngay: string }[]
): string[][] {
  const data = employees.map(() => days.map(() => ""));
  for (const item of initSymbols) {
    const empIdx = employees.findIndex((e) => e.id === item.id_nhan_vien);
    const dayIdx = days.findIndex((d) => d === getDayFromDate(item.ngay));
    if (empIdx !== -1 && dayIdx !== -1) {
      data[empIdx][dayIdx] = item.ki_tu;
    }
  }
  return data;
}

const SheetTable: React.FC<{
  data: string[][];
  onChange: (data: string[][]) => void;
  selectedSymbol: string;
  employees: { id: number; name: string }[];
}> = ({ data, onChange, selectedSymbol, employees }) => {
  const [selecting, setSelecting] = useState<null | {
    start: [number, number];
    end: [number, number];
  }>(null);
  const [selected, setSelected] = useState<null | {
    start: [number, number];
    end: [number, number];
  }>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [nameColPx, setNameColPx] = useState(160); // width pixel mặc định
  const resizing = useRef(false);

  function getRect(start: [number, number], end: [number, number]) {
    const [r1, c1] = start;
    const [r2, c2] = end;
    const top = Math.min(r1, r2);
    const bottom = Math.max(r1, r2);
    const left = Math.min(c1, c2);
    const right = Math.max(c1, c2);
    return { top, bottom, left, right };
  }

  // Bắt đầu chọn vùng
  const handleMouseDown =
    (row: number, col: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      setSelecting({ start: [row, col], end: [row, col] });
      const onMouseMove = (moveEvent: MouseEvent) => {
        const cell = (moveEvent.target as HTMLElement).closest("td");
        if (cell && cell.dataset.row && cell.dataset.col) {
          setSelecting(
            (prev) =>
              prev && {
                ...prev,
                end: [parseInt(cell.dataset.row!), parseInt(cell.dataset.col!)],
              }
          );
        }
      };
      const onMouseUp = () => {
        setSelecting((prev) => {
          if (prev) setSelected({ start: prev.start, end: prev.end });
          return null;
        });
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

  // Copy vùng chọn
  const handleCopy = () => {
    if (!selected) return;
    const { top, bottom, left, right } = getRect(selected.start, selected.end);
    const values = [];
    for (let r = top; r <= bottom; r++) {
      const row = [];
      for (let c = left; c <= right; c++) {
        row.push(data[r][c]);
      }
      values.push(row.join("\t"));
    }
    navigator.clipboard.writeText(values.join("\n"));
  };

  // Paste vùng chọn
  const handlePaste = async () => {
    if (!selected) return;
    const text = await navigator.clipboard.readText();
    if (!text) return;
    const rows = text.split(/\r?\n/).map((line) => line.split("\t"));
    const { top, left } = getRect(selected.start, selected.end);
    const newData = data.map((row) => [...row]);
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        const rr = top + r;
        const cc = left + c;
        if (rr < newData.length && cc < newData[0].length) {
          newData[rr][cc] = rows[r][c];
        }
      }
    }
    onChange(newData);
  };

  // Kiểm tra cell có nằm trong vùng chọn không
  const isCellSelected = (row: number, col: number) => {
    const sel = selecting || selected;
    if (!sel) return false;
    const { top, bottom, left, right } = getRect(sel.start, sel.end);
    return row >= top && row <= bottom && col >= left && col <= right;
  };

  // Click vào cell để thêm ký hiệu
  const handleCellClick = (row: number, col: number) => {
    if (!selectedSymbol) return;
    const newData = data.map((r) => [...r]);
    newData[row][col] = selectedSymbol;
    onChange(newData);
    setSelected((prev) => (prev ? { ...prev } : null));
  };

  // Keyboard event: Ctrl+C, Ctrl+V
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "c") {
        handleCopy();
      }
      if (e.ctrlKey && e.key === "v") {
        handlePaste();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Resize cột tên nhân viên (pixel, bảng dãn ngang)
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startWidth = nameColPx;
    const table = tableRef.current;
    const tableRect = table?.getBoundingClientRect();
    const tableWidth = tableRect?.width || 800;
    const minPx = tableWidth * 0.2;
    const maxPx = tableWidth * 0.9;
    const onMouseMove = (moveEvent: MouseEvent) => {
      let newPx = startWidth + (moveEvent.clientX - startX);
      newPx = Math.max(minPx, Math.min(maxPx, newPx));
      setNameColPx(newPx);
    };
    const onMouseUp = () => {
      resizing.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div>
      <button
        onClick={handleCopy}
        disabled={!selected && !selecting}
        style={{ marginBottom: 8, marginRight: 8 }}
      >
        Copy vùng chọn
      </button>
      <button
        onClick={handlePaste}
        disabled={!selected}
        style={{ marginBottom: 8 }}
      >
        Paste vào vùng chọn
      </button>
      <div
        style={{ overflow: "auto", maxHeight: 600, border: "1px solid #ccc" }}
      >
        <table ref={tableRef} className="sheet-table" style={{ width: 'auto', minWidth: 600 }}>
          <thead>
            <tr>
              <th
                style={{
                  position: "sticky",
                  left: 0,
                  background: "#fafafa",
                  zIndex: 2,
                  minWidth: 60,
                  width: nameColPx,
                  maxWidth: '90vw',
                  userSelect: 'none',
                  padding: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <span style={{ flex: 1, paddingLeft: 8 }}>Nhân viên</span>
                  <span
                    style={{
                      width: 6,
                      cursor: 'col-resize',
                      background: '#3399ff',
                      height: 28,
                      marginRight: -3,
                      borderRadius: 2,
                    }}
                    onMouseDown={handleResizeStart}
                    title="Kéo để thay đổi độ rộng cột"
                  />
                </div>
              </th>
              {days.map((day) => (
                <th key={day}> {day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, rowIdx) => (
              <tr key={emp.id}>
                <th
                  style={{
                    position: "sticky",
                    left: 0,
                    background: "#fafafa",
                    zIndex: 1,
                    minWidth: 60,
                    width: nameColPx,
                    maxWidth: '90vw',
                    userSelect: 'none',
                    paddingLeft: 8,
                  }}
                >
                  {emp.name}
                </th>
                {days.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    data-row={rowIdx}
                    data-col={colIdx}
                    className={isCellSelected(rowIdx, colIdx) ? "selected-cell" : ""}
                    onMouseDown={handleMouseDown(rowIdx, colIdx)}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    style={{
                      userSelect: "none",
                      minWidth: 14,
                      height: 14,
                      cursor: "pointer",
                    }}
                  >
                    {data[rowIdx][colIdx]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState(() =>
    buildInitialData(EMPLOYEES, days, INIT_SYMBOLS)
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string>("+");

  return (
    <div>
      <h2>Bảng chấm công nhân viên (Custom Table, Google Sheet style)</h2>
      <SheetTable
        data={data}
        onChange={setData}
        selectedSymbol={selectedSymbol}
        employees={EMPLOYEES}
      />
      <div
        style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}
      >
        <span>Chọn ký hiệu:</span>
        {SYMBOLS.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSymbol(s)}
            style={{
              width: 32,
              height: 32,
              fontWeight: "bold",
              fontSize: 18,
              background: selectedSymbol === s ? "#3399ff" : "#fff",
              color: selectedSymbol === s ? "#fff" : "#333",
              border: "1px solid #3399ff",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
