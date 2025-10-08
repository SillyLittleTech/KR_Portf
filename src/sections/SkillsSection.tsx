import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import React, { useCallback } from "react";
import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import {
  SKILLS_RESOURCE,
  skillsFallback,
  skillsPlaceholder,
} from "../data/skills";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useRemoteData } from "../hooks/useRemoteData";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";
import { themedClass } from "../utils/themeClass";
import { skillIcons } from "../utils/icons";

function SortableSkill({
  id,
  label,
  isDeveloping,
}: {
  id: string;
  label: string;
  isDeveloping?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const { theme } = useTheme();
  const surfaceClass = themedClass(
    theme,
    "bg-white/80 text-slate-700",
    "bg-slate-800/70 text-slate-200",
  );
  const developingClass = themedClass(
    theme,
    "border-2 border-dashed border-accent/60 bg-accent/10 text-accent",
    "border-2 border-dashed border-accent/60 bg-accent/20 text-accent",
  );
  const stableBorderClass = themedClass(
    theme,
    "border border-slate-200/60",
    "border border-slate-700/60",
  );

  const skillIcon = skillIcons[label];

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      {...attributes}
      {...listeners}
      className={cn(
        "select-none rounded-full px-5 py-2 text-sm font-medium shadow-md transition-colors",
        surfaceClass,
        isDeveloping ? developingClass : stableBorderClass,
        "select-none rounded-full px-5 py-2 text-sm font-medium shadow-md transition-colors flex items-center gap-2",
        "bg-white/80 text-slate-700 dark:bg-slate-800/70 dark:text-slate-200",
        isDeveloping
          ? "border-2 border-dashed border-accent/60 bg-accent/10 text-accent dark:border-accent/60 dark:bg-accent/20 dark:text-accent"
          : "border border-slate-200/60 dark:border-slate-700/60",
        isDragging && "ring-2 ring-accent",
      )}
    >
      {skillIcon && (
        <Icon
          icon={skillIcon}
          className="text-base flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {label}
    </motion.li>
  );
}

type SkillsBoardProps = {
  skills: string[];
  prefersReducedMotion: boolean;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
  debugAttributes?: Record<string, string>;
};

function SkillsBoard({
  skills,
  prefersReducedMotion,
  sensors,
  onDragEnd,
  debugAttributes,
}: SkillsBoardProps) {
  // Default set of developing/in-progress skills. Edit or remove in your fork.
  const developingSkills = new Set(["GraphQL"]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={skills} strategy={horizontalListSortingStrategy}>
        <motion.ul
          layout
          className="flex flex-wrap gap-3"
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.05 }}
          {...(debugAttributes ?? {})}
        >
          {skills.map((skill) => (
            <SortableSkill
              key={skill}
              id={skill}
              label={skill}
              isDeveloping={developingSkills.has(skill)}
            />
          ))}
        </motion.ul>
      </SortableContext>
    </DndContext>
  );
}

export function SkillsSection() {
  const { data: remoteSkills, debugAttributes: skillsDebugAttributes } =
    useRemoteData<string[]>({
      resource: SKILLS_RESOURCE,
      fallbackData: skillsFallback,
      placeholderData: skillsPlaceholder,
    });
  // LocalStorage key for skills order. Rename if you fork the repo to avoid
  // collisions with other installs in the same browser profile.
  const [skills, setSkills] = useLocalStorage<string[]>(
    "template-skills-order",
    skillsFallback,
  );
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Migrate skills: ensure all default skills are included
  React.useEffect(() => {
    setSkills((current) => {
      const currentSet = new Set(remoteSkills);
      const preserved = current.filter((skill) => currentSet.has(skill));
      const missing = remoteSkills.filter(
        (skill) => !preserved.includes(skill),
      );
      const next = [...preserved, ...missing];

      if (
        next.length === current.length &&
        next.every((value, index) => value === current[index])
      ) {
        return current;
      }

      if (next.length === 0) {
        // Prevent infinite loops when both sources are empty or remote data drops out.
        return current;
      }

      return next;
    });
  }, [remoteSkills, setSkills]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setSkills((current) => {
        const oldIndex = current.indexOf(active.id as string);
        const newIndex = current.indexOf(over.id as string);
        if (oldIndex === -1 || newIndex === -1) return current;
        return arrayMove(current, oldIndex, newIndex);
      });
    },
    [setSkills],
  );

  return (
    <SectionContainer
      id="skills"
      className="pb-20"
      debugAttributes={skillsDebugAttributes}
    >
      <div className="card-surface space-y-8">
        <SectionHeader
          id="skills"
          icon="material-symbols:auto-awesome-rounded"
          label="Skills"
          eyebrow="Strengths"
        />
        <SkillsBoard
          skills={skills}
          prefersReducedMotion={prefersReducedMotion}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          debugAttributes={skillsDebugAttributes}
        />
      </div>
    </SectionContainer>
  );
}
