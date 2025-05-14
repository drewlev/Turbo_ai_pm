"use client";

import { useState, useRef, useEffect } from "react";

type TabItem = {
  label: string;
  value: string;
  content: React.ReactNode;
};

export default function Frame({
  tabs,
  defaultValue,
}: {
  tabs: TabItem[];
  defaultValue?: string;
}) {
  const defaultIndex = tabs.findIndex((t) => t.value === defaultValue);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(defaultIndex >= 0 ? defaultIndex : 0);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (hoveredIndex !== null) {
      const el = tabRefs.current[hoveredIndex];
      if (el) {
        setHoverStyle({
          left: `${el.offsetLeft}px`,
          width: `${el.offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const el = tabRefs.current[activeIndex];
    if (el) {
      setActiveStyle({
        left: `${el.offsetLeft}px`,
        width: `${el.offsetWidth}px`,
      });
    }
  }, [activeIndex]);

  const activeTab = tabs[activeIndex];

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="relative border-b border-[var(--border-dark)]">
        {/* Hover Highlight */}
        <div
          className="absolute top-[20%] h-[30px] transition-all duration-300 ease-out bg-white/20 dark:bg-[#ffffff1a] rounded-[6px]"
          style={{ ...hoverStyle, opacity: hoveredIndex !== null ? 1 : 0 }}
        />

        {/* Active Bottom Border */}
        <div
          className="absolute bottom-[-1px] h-[2px] bg-[var(--text-primary)] transition-all duration-300 ease-out"
          style={activeStyle}
        />

        {/* Tab Triggers */}
        <div className="relative flex space-x-[6px] px-4">
          {tabs.map((tab, index) => (
            <div
              key={tab.value}
              ref={(el) => {
                if (el) {
                  tabRefs.current[index] = el;
                }
              }}
              className={`px-4 py-4 cursor-pointer transition-colors text-sm font-medium ${
                index === activeIndex
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveIndex(index)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-8">{activeTab?.content}</div>
    </div>
  );
}
