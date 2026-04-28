import { useMemo } from 'react';

const StarBackground = () => {
  const starLayers = useMemo(() => {
    return Array.from({ length: 3 }).map(() =>
      Array.from({ length: 200 }).map((_, i) => ({
        id: i,
        cx: `${(Math.random() * 100).toFixed(2)}%`,
        cy: `${(Math.random() * 100).toFixed(2)}%`,
        r: Math.round((Math.random() + 0.5) * 10) / 10,
        opacity:
          i % 19 === 0
            ? 0.2
            : i % 13 === 0
              ? 0.4
              : i % 7 === 0
                ? 0.6
                : i % 3 === 0
                  ? 0.8
                  : 1,
      })),
    );
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-gradient-to-b from-[#16161d] via-[#1f1f3a] to-[#3b2f4a]">
      {starLayers.map((stars, index) => (
        <svg
          key={index}
          className="absolute inset-0 w-full h-full animate-twinkle"
          style={{
            animationDelay:
              index === 1 ? '-1.32s' : index === 2 ? '-2.64s' : '0s',
          }}
        >
          {stars.map((star) => (
            <circle
              key={star.id}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill="white"
              style={{ opacity: star.opacity }}
            />
          ))}
        </svg>
      ))}

      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="comet-gradient" cx="0" cy=".5" r="0.5">
            <stop offset="0%" stopColor="rgba(255,255,255,.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <g transform="rotate(-135)">
          <ellipse
            className="animate-comet"
            fill="url(#comet-gradient)"
            cx="0"
            cy="0"
            rx="150"
            ry="2"
          />
        </g>

        <g transform="rotate(20)">
          <ellipse
            className="animate-comet"
            style={{ animationDelay: '-3.3s' }}
            fill="url(#comet-gradient)"
            cx="100%"
            cy="0"
            rx="150"
            ry="2"
          />
        </g>

        <g transform="rotate(300)">
          <ellipse
            className="animate-comet"
            style={{ animationDelay: '-5s' }}
            fill="url(#comet-gradient)"
            cx="40%"
            cy="100%"
            rx="150"
            ry="2"
          />
        </g>
      </svg>
    </div>
  );
};

export default StarBackground;
