import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";

import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import { experienceTimeline } from "../data/experience";
import { defaultSkills, getSkillIcon } from "../data/skills";
import { useTheme } from "../hooks/useTheme";
import type { Theme } from "../providers/theme-context";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";

export function ExperienceSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { theme } = useTheme();

  const variants = useMemo(
    () => ({
      enter: { opacity: 0, y: 16 },
      center: { opacity: 1, y: 0 },
    }),
    [],
  );

  const handleIndexChange = useCallback((next: number) => {
    if (!Number.isNaN(next)) {
      setActiveIndex(next);
    }
  }, []);

  return (
    <SectionContainer id="experience" className="pb-20">
      <ExperienceCard
        options={experienceTimeline}
        activeIndex={activeIndex}
        onChange={handleIndexChange}
        prefersReducedMotion={prefersReducedMotion}
        variants={variants}
        theme={theme}
      />
    </SectionContainer>
  );
}

type ExperienceCardProps = {
  options: typeof experienceTimeline;
  activeIndex: number;
  onChange: (index: number) => void;
  prefersReducedMotion: boolean;
  variants: {
    enter: { opacity: number; y: number };
    center: { opacity: number; y: number };
  };
  theme: Theme;
};
function ExperienceCard({
  options,
  activeIndex,
  onChange,
  prefersReducedMotion,
  variants,
  theme,
}: Readonly<ExperienceCardProps>) {
  const activeItem = options[activeIndex];

  return (
    <div className="card-surface space-y-8">
      <SectionHeader
        id="experience"
        icon="material-symbols:work-rounded"
        label="Experience"
        eyebrow="Timeline"
      />

      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <TimelineColumn
          options={options}
          activeIndex={activeIndex}
          onChange={onChange}
          theme={theme}
        />
        <DetailsCard
          entry={activeItem}
          prefersReducedMotion={prefersReducedMotion}
          variants={variants}
          theme={theme}
        />
      </div>
    </div>
  );
}

type TimelineColumnProps = {
  options: typeof experienceTimeline;
  activeIndex: number;
  onChange: (index: number) => void;
  theme: Theme;
};

function TimelineColumn({
  options,
  activeIndex,
  onChange,
  theme,
}: Readonly<TimelineColumnProps>) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>): void => {
      const idx = Number(event.currentTarget.getAttribute("data-idx"));
      if (!Number.isNaN(idx)) {
        onChange(idx);
      }
    },
    [onChange],
  );

  const handleSelectChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      const idx = Number(event.target.value);
      if (!Number.isNaN(idx)) {
        onChange(idx);
      }
    },
    [onChange],
  );
  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      <select
        className={cn(
          "rounded-xl border bg-transparent px-3 py-2 text-base font-semibold focus:outline-accent",
          themedClass(theme, "border-slate-200", "border-slate-700"),
        )}
        value={activeIndex}
        onChange={handleSelectChange}
        aria-label="Select experience entry"
      >
        {options.map((entry, idx) => (
          <option key={entry.company + entry.role} value={idx}>
            {entry.company}
          </option>
        ))}
      </select>
      <ol
        className={cn(
          "relative ml-4 mt-2 border-l",
          themedClass(theme, "border-slate-200", "border-slate-700"),
        )}
      >
        {options.map((entry, idx) => {
          const isActive = idx === activeIndex;

          return (
            <li key={entry.company + entry.role} className="mb-6 ml-2">
              <span
                className={cn(
                  "absolute -left-4 flex h-4 w-4 items-center justify-center rounded-full border-2",
                  isActive
                    ? "border-accent bg-accent"
                    : themedClass(
                        theme,
                        "border-slate-300 bg-slate-100",
                        "border-slate-600 bg-slate-800",
                      ),
                )}
                aria-current={isActive ? "step" : undefined}
              ></span>
              <button
                className={cn(
                  "mt-1 block text-left font-semibold transition-colors",
                  isActive
                    ? "text-accent"
                    : themedClass(theme, "text-slate-700", "text-slate-300"),
                  "hover:text-accent",
                )}
                data-idx={idx}
                onClick={handleClick}
                aria-label={`View experience at ${entry.company}`}
              >
                {entry.company}
              </button>
              <div
                className={themedClass(
                  theme,
                  "text-xs text-slate-500",
                  "text-xs text-slate-400",
                )}
              >
                {entry.dates}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type DetailsCardProps = {
  entry: (typeof experienceTimeline)[number];
  prefersReducedMotion: boolean;
  variants: {
    enter: { opacity: number; y: number };
    center: { opacity: number; y: number };
  };
  theme: Theme;
};

function DetailsCard({
  entry,
  prefersReducedMotion,
  variants,
  theme,
}: Readonly<DetailsCardProps>) {
  const chipBaseClass =
    "chip flex items-center gap-2 !px-3 !py-1 text-xs font-medium";
  const linkedChipClass = cn(
    chipBaseClass,
    "text-accent underline-offset-2 hover:underline",
    themedClass(theme, "!bg-accent/20", "!bg-accent/30"),
  );
  const neutralChipClass = cn(
    chipBaseClass,
    themedClass(
      theme,
      "!bg-slate-100/80 text-slate-600",
      "!bg-slate-800/80 text-slate-200",
    ),
  );
  const mainSkills = defaultSkills;
  return (
    <motion.div
      key={entry.company + entry.role}
      initial={prefersReducedMotion ? false : "enter"}
      animate="center"
      variants={variants}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 min-w-0"
    >
      <div className="mb-2 text-lg font-bold text-accent">{entry.role}</div>
      <div
        className={themedClass(
          theme,
          "mb-1 text-base font-semibold text-slate-800",
          "mb-1 text-base font-semibold text-slate-100",
        )}
      >
        {entry.company}
      </div>
      <div
        className={themedClass(
          theme,
          "mb-2 text-sm text-slate-500",
          "mb-2 text-sm text-slate-400",
        )}
      >
        {entry.dates}
      </div>
      {entry.tech && entry.tech.length > 0 && (
        <div className="mb-2">
          <div
            className={themedClass(
              theme,
              "mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500",
              "mb-1 text-xs font-semibold uppercase tracking-wide text-slate-300",
            )}
          >
            Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.tech.map((item) => {
              const normalized = item.toLowerCase();
              const match = mainSkills.find(
                (skill) =>
                  skill.toLowerCase().includes(normalized) ||
                  normalized.includes(skill.toLowerCase()),
              );
              const iconName =
                getSkillIcon(item) ?? (match ? getSkillIcon(match) : undefined);

              if (match) {
                return (
                  <a
                    key={item}
                    href="#skills"
                    className={linkedChipClass}
                    title={`See more about ${match}`}
                  >
                    {iconName ? (
                      <Icon
                        icon={iconName}
                        className="text-sm"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span>{item}</span>
                  </a>
                );
              }

              return (
                <span key={item} className={neutralChipClass}>
                  {iconName ? (
                    <Icon
                      icon={iconName}
                      className="text-sm"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span>{item}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
      {entry.description && (
        <div
          className={themedClass(
            theme,
            "text-base text-slate-700",
            "text-base text-slate-300",
          )}
        >
          {entry.description}
        </div>
      )}
    </motion.div>
  );
}
