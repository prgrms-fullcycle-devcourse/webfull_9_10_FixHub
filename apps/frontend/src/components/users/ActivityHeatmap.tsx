import CalendarHeatmap from 'react-calendar-heatmap';

import 'react-calendar-heatmap/dist/styles.css';

interface HeatmapValue {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  values: HeatmapValue[];
}

function getOneYearAgo() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d;
}

export default function ActivityHeatmap({ values }: ActivityHeatmapProps) {
  const maxCount =
    values.length > 0 ? Math.max(...values.map((v) => v.count)) : 1;

  return (
    <div className="w-full">
      <style>{`
        .react-calendar-heatmap .color-empty { fill: rgba(255,255,255,0.06); }
        .react-calendar-heatmap .color-scale-1 { fill: #78450a; }
        .react-calendar-heatmap .color-scale-2 { fill: #c97d1a; }
        .react-calendar-heatmap .color-scale-3 { fill: #f5b800; }
        .react-calendar-heatmap .color-scale-4 { fill: #fff835; }
        .react-calendar-heatmap text { fill: rgba(255,255,255,0.4); font-size: 9px; }
        .react-calendar-heatmap rect { rx: 2; }
      `}</style>

      <CalendarHeatmap
        startDate={getOneYearAgo()}
        endDate={new Date()}
        values={values}
        classForValue={(value) => {
          if (!value || value.count === 0) return 'color-empty';

          // 2. 최댓값 대비 비율 계산 (0 ~ 1 사이)
          const percentage = value.count / maxCount;

          // 3. 비율에 따른 클래스 부여 (25%, 50%, 75%, 100%)
          if (percentage <= 0.25) return 'color-scale-1';
          if (percentage <= 0.5) return 'color-scale-2';
          if (percentage <= 0.75) return 'color-scale-3';
          return 'color-scale-4';
        }}
        showWeekdayLabels
      />

      {/* 범례 */}
      <div className="flex items-center justify-end gap-2 mt-2">
        <span className="text-xs text-white/40">적음</span>
        {['#78450a', '#c97d1a', '#f5b800', '#fff835'].map((color) => (
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
