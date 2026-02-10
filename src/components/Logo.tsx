import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  variant?: 'dark' | 'light' | 'green';
  animated?: boolean;
}

const sizeConfig = {
  sm: { scale: 0.5, fontSize: 18, gap: 8 },
  md: { scale: 0.7, fontSize: 24, gap: 10 },
  lg: { scale: 1.0, fontSize: 32, gap: 12 },
  xl: { scale: 1.4, fontSize: 48, gap: 16 },
};

const barHeights = [26, 40, 52, 36, 46];
const barWidth = 6;
const barGap = 4;
const barRx = 3;
const totalIconWidth = barWidth * 5 + barGap * 4;
const totalIconHeight = 52;

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  variant,
  animated = false,
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(!animated);

  const resolvedVariant = variant || (theme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    if (animated) {
      setVisible(false);
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  const colors = {
    dark: { bars: 'var(--accent-primary)', you: '#ffffff', lists: 'var(--accent-primary)' },
    light: { bars: 'var(--accent-primary)', you: '#2c2c2c', lists: 'var(--accent-primary)' },
    green: { bars: '#ffffff', you: '#ffffff', lists: '#b8dcc8' },
  };

  const { scale, fontSize, gap } = sizeConfig[size];
  const c = colors[resolvedVariant];

  const isVertical = size === 'xl';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: 'center',
    gap: `${gap}px`,
    textDecoration: 'none',
  };

  return (
    <div style={containerStyle}>
      <svg
        width={totalIconWidth * scale}
        height={totalIconHeight * scale}
        viewBox={`0 0 ${totalIconWidth} ${totalIconHeight}`}
        fill="none"
      >
        {barHeights.map((h, i) => (
          <rect
            key={i}
            x={i * (barWidth + barGap)}
            y={totalIconHeight - h}
            width={barWidth}
            height={animated && visible ? h : animated ? 0 : h}
            rx={barRx}
            fill={c.bars}
            style={{
              transition: animated ? `height 0.4s ease ${i * 100}ms, y 0.4s ease ${i * 100}ms` : undefined,
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: "'Noto Sans Mono', monospace",
            fontWeight: 500,
            fontSize: `${fontSize}px`,
            lineHeight: 1,
            letterSpacing: '-0.5px',
          }}
        >
          <span style={{ color: c.you }}>you</span>
          <span style={{ color: c.lists }}>lists</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
