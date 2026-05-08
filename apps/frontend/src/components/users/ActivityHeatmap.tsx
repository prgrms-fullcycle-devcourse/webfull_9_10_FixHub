import CalendarHeatmap from 'react-calendar-heatmap';

import 'react-calendar-heatmap/dist/styles.css';

interface HeatmapValue {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  values: HeatmapValue[];
}

// 오늘 기준 1년 전
function getOneYearAgo() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d;
}

export default function ActivityHeatmap({ values }: ActivityHeatmapProps) {
  return (
    <div className="w-full">
      {/* 커스텀 히트맵 색상 오버라이드 */}
      <style>{`
        .react-calendar-heatmap .color-empty { fill: rgba(255,255,255,0.06); }
        .react-calendar-heatmap .color-scale-1 { fill: #2d1f5e; }
        .react-calendar-heatmap .color-scale-2 { fill: #4b2fa0; }
        .react-calendar-heatmap .color-scale-3 { fill: #7c4dde; }
        .react-calendar-heatmap .color-scale-4 { fill: #a78bfa; }
        .react-calendar-heatmap text { fill: rgba(255,255,255,0.4); font-size: 9px; }
        .react-calendar-heatmap rect { rx: 2; }
      `}</style>

      <CalendarHeatmap
        startDate={getOneYearAgo()}
        endDate={new Date()}
        values={values}
        classForValue={(value) => {
          if (!value || value.count === 0) return 'color-empty';
          if (value.count <= 2) return 'color-scale-1';
          if (value.count <= 4) return 'color-scale-2';
          if (value.count <= 7) return 'color-scale-3';
          return 'color-scale-4';
        }}
        showWeekdayLabels
      />

      {/* 범례 */}
      <div className="flex items-center justify-end gap-2 mt-2">
        <span className="text-xs text-white/40">적음</span>
        {['#2d1f5e', '#4b2fa0', '#7c4dde', '#a78bfa'].map((color) => (
          <span
            key={color}
            className="w-3 h-3 rounded-sm inline-block"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-xs text-white/40">많음</span>
      </div>
    </div>
  );
}
