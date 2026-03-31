'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  CircleDashed,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// Type definitions
interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tools?: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
}

// Initial task data
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Research Project Requirements',
    description: 'Gather all necessary information about project scope and requirements',
    status: 'in-progress',
    priority: 'high',
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: '1.1',
        title: 'Interview stakeholders',
        description: 'Conduct interviews with key stakeholders to understand needs',
        status: 'completed',
        priority: 'high',
        tools: ['communication-agent', 'meeting-scheduler'],
      },
      {
        id: '1.2',
        title: 'Review existing documentation',
        description: 'Go through all available documentation and extract requirements',
        status: 'in-progress',
        priority: 'medium',
        tools: ['file-system', 'browser'],
      },
      {
        id: '1.3',
        title: 'Compile findings report',
        description: 'Create a comprehensive report of all gathered information',
        status: 'need-help',
        priority: 'medium',
        tools: ['file-system', 'markdown-processor'],
      },
    ],
  },
  {
    id: '2',
    title: 'Design System Architecture',
    description: 'Create the overall system architecture based on requirements',
    status: 'in-progress',
    priority: 'high',
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: '2.1',
        title: 'Define component structure',
        description: 'Map out all required components and their interactions',
        status: 'pending',
        priority: 'high',
        tools: ['architecture-planner', 'diagramming-tool'],
      },
      {
        id: '2.2',
        title: 'Create data flow diagrams',
        description: 'Design diagrams showing how data will flow through the system',
        status: 'pending',
        priority: 'medium',
        tools: ['diagramming-tool', 'file-system'],
      },
      {
        id: '2.3',
        title: 'Document API specifications',
        description: 'Write detailed specifications for all APIs in the system',
        status: 'pending',
        priority: 'high',
        tools: ['api-designer', 'openapi-generator'],
      },
    ],
  },
  {
    id: '3',
    title: 'Implementation Planning',
    description: 'Create a detailed plan for implementing the system',
    status: 'pending',
    priority: 'medium',
    level: 1,
    dependencies: ['1', '2'],
    subtasks: [
      {
        id: '3.1',
        title: 'Resource allocation',
        description: 'Determine required resources and allocate them to tasks',
        status: 'pending',
        priority: 'medium',
        tools: ['project-manager', 'resource-calculator'],
      },
      {
        id: '3.2',
        title: 'Timeline development',
        description: 'Create a timeline with milestones and deadlines',
        status: 'pending',
        priority: 'high',
        tools: ['timeline-generator', 'gantt-chart-creator'],
      },
      {
        id: '3.3',
        title: 'Risk assessment',
        description: 'Identify potential risks and develop mitigation strategies',
        status: 'pending',
        priority: 'medium',
        tools: ['risk-analyzer'],
      },
    ],
  },
];

interface AgentPlanProps {
  tasks?: Task[];
  onTaskUpdate?: (tasks: Task[]) => void;
}

export default function AgentPlan({ tasks: externalTasks, onTaskUpdate }: AgentPlanProps) {
  const [internalTasks, setInternalTasks] = useState<Task[]>(initialTasks);
  const tasks = externalTasks || internalTasks;
  const setTasks = onTaskUpdate || setInternalTasks;
  
  const [expandedTasks, setExpandedTasks] = useState<string[]>(['1']);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  // Toggle subtask expansion
  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle task status
  const toggleTaskStatus = (taskId: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const statuses = ['completed', 'in-progress', 'pending', 'need-help', 'failed'];
        const currentIndex = statuses.indexOf(task.status);
        const newStatus = statuses[(currentIndex + 1) % statuses.length];

        const updatedSubtasks = task.subtasks.map((subtask) => ({
          ...subtask,
          status: newStatus === 'completed' ? 'completed' : subtask.status,
        }));

        return {
          ...task,
          status: newStatus,
          subtasks: updatedSubtasks,
        };
      }
      return task;
    });
    setTasks(newTasks);
  };

  // Toggle subtask status
  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map((subtask) => {
          if (subtask.id === subtaskId) {
            const newStatus =
              subtask.status === 'completed' ? 'pending' : 'completed';
            return { ...subtask, status: newStatus };
          }
          return subtask;
        });

        const allSubtasksCompleted = updatedSubtasks.every(
          (s) => s.status === 'completed',
        );

        return {
          ...task,
          subtasks: updatedSubtasks,
          status: allSubtasksCompleted ? 'completed' : task.status,
        };
      }
      return task;
    });
    setTasks(newTasks);
  };

  const taskVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      transition: { duration: 0.15 },
    },
  };

  const subtaskListVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      overflow: 'hidden',
    },
    visible: {
      height: 'auto',
      opacity: 1,
      overflow: 'visible',
      transition: {
        duration: 0.25,
        staggerChildren: 0.05,
        when: 'beforeChildren',
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      overflow: 'hidden',
      transition: {
        duration: 0.2,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  const subtaskVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: { duration: 0.15 },
    },
  };

  const subtaskDetailsVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      overflow: 'hidden',
    },
    visible: {
      opacity: 1,
      height: 'auto',
      overflow: 'visible',
      transition: {
        duration: 0.25,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  const statusBadgeVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.08, 1],
      transition: {
        duration: 0.35,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  const getStatusIcon = (status: string, size: 'sm' | 'md' = 'md') => {
    const className = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
    switch (status) {
      case 'completed':
        return <CheckCircle2 className={`${className} text-green-500`} />;
      case 'in-progress':
        return <CircleDashed className={`${className} text-blue-500`} />;
      case 'need-help':
        return <AlertCircle className={`${className} text-yellow-500`} />;
      case 'failed':
        return <XCircle className={`${className} text-red-500`} />;
      default:
        return <Circle className={`${className} text-slate-400`} />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'need-help':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900/50 text-slate-200 h-full overflow-auto p-3 rounded-xl border border-white/10">
      <motion.div
        className="bg-slate-900/80 border-white/10 rounded-lg border overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.2, 0.65, 0.3, 0.9],
          },
        }}
      >
        <LayoutGroup>
          <div className="p-3 overflow-hidden">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              AI Agent Plan
            </h3>
            <ul className="space-y-1 overflow-hidden">
              {tasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === 'completed';

                return (
                  <motion.li
                    key={task.id}
                    className={`${index !== 0 ? 'mt-1 pt-2 border-t border-white/5' : ''}`}
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    {/* Task row */}
                    <motion.div
                      className="group flex items-center px-2 py-1.5 rounded-md hover:bg-white/5"
                      whileHover={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        transition: { duration: 0.2 },
                      }}
                    >
                      <motion.div
                        className="mr-2 flex-shrink-0 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskStatus(task.id);
                        }}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={task.status}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            transition={{
                              duration: 0.2,
                              ease: [0.2, 0.65, 0.3, 0.9],
                            }}
                          >
                            {getStatusIcon(task.status)}
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        className="flex min-w-0 flex-grow cursor-pointer items-center justify-between"
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        <div className="mr-2 flex-1 truncate">
                          <span
                            className={`text-sm ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}
                          >
                            {task.title}
                          </span>
                        </div>

                        <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                          {task.dependencies.length > 0 && (
                            <div className="flex items-center mr-2">
                              <div className="flex flex-wrap gap-1">
                                {task.dependencies.map((dep, idx) => (
                                  <motion.span
                                    key={idx}
                                    className="bg-slate-700/50 text-slate-300 rounded px-1.5 py-0.5 text-[10px] font-medium"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                      duration: 0.2,
                                      delay: idx * 0.05,
                                    }}
                                    whileHover={{
                                      y: -1,
                                      backgroundColor: 'rgba(99,102,241,0.3)',
                                    }}
                                  >
                                    {dep}
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                          )}

                          <motion.span
                            className={`rounded px-1.5 py-0.5 text-[10px] ${getStatusBadgeClass(task.status)}`}
                            variants={statusBadgeVariants}
                            initial="initial"
                            animate="animate"
                            key={task.status}
                          >
                            {task.status}
                          </motion.span>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Subtasks */}
                    <AnimatePresence mode="wait">
                      {isExpanded && task.subtasks.length > 0 && (
                        <motion.div
                          className="relative overflow-hidden"
                          variants={subtaskListVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          layout
                        >
                          <div className="absolute top-0 bottom-0 left-[18px] border-l-2 border-dashed border-slate-700/50" />
                          <ul className="mt-1 mr-2 mb-1.5 ml-2 space-y-0.5">
                            {task.subtasks.map((subtask) => {
                              const subtaskKey = `${task.id}-${subtask.id}`;
                              const isSubtaskExpanded = expandedSubtasks[subtaskKey];

                              return (
                                <motion.li
                                  key={subtask.id}
                                  className="group flex flex-col py-0.5 pl-5"
                                  onClick={() =>
                                    toggleSubtaskExpansion(task.id, subtask.id)
                                  }
                                  variants={subtaskVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  layout
                                >
                                  <motion.div
                                    className="flex flex-1 items-center rounded-md p-1 hover:bg-white/5"
                                    layout
                                  >
                                    <motion.div
                                      className="mr-2 flex-shrink-0 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSubtaskStatus(task.id, subtask.id);
                                      }}
                                      whileTap={{ scale: 0.9 }}
                                      whileHover={{ scale: 1.1 }}
                                      layout
                                    >
                                      <AnimatePresence mode="wait">
                                        <motion.div
                                          key={subtask.status}
                                          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                                          transition={{
                                            duration: 0.2,
                                            ease: [0.2, 0.65, 0.3, 0.9],
                                          }}
                                        >
                                          {getStatusIcon(subtask.status, 'sm')}
                                        </motion.div>
                                      </AnimatePresence>
                                    </motion.div>

                                    <span
                                      className={`cursor-pointer text-xs ${subtask.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-300'}`}
                                    >
                                      {subtask.title}
                                    </span>
                                  </motion.div>

                                  <AnimatePresence mode="wait">
                                    {isSubtaskExpanded && (
                                      <motion.div
                                        className="text-slate-400 border-indigo-500/30 mt-1 ml-1 border-l border-dashed pl-4 text-xs overflow-hidden"
                                        variants={subtaskDetailsVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        layout
                                      >
                                        <p className="py-1">{subtask.description}</p>
                                        {subtask.tools && subtask.tools.length > 0 && (
                                          <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1.5">
                                            <span className="text-slate-500 font-medium text-[10px]">
                                              Tools:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                              {subtask.tools.map((tool, idx) => (
                                                <motion.span
                                                  key={idx}
                                                  className="bg-indigo-500/10 text-indigo-300 rounded px-1.5 py-0.5 text-[10px] font-medium"
                                                  initial={{ opacity: 0, y: -5 }}
                                                  animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    transition: {
                                                      duration: 0.2,
                                                      delay: idx * 0.05,
                                                    },
                                                  }}
                                                  whileHover={{
                                                    y: -1,
                                                    backgroundColor: 'rgba(99,102,241,0.3)',
                                                  }}
                                                >
                                                  {tool}
                                                </motion.span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}
