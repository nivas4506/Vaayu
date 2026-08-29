import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Node { x: number; y: number; r: number }

export default function NetworkBackdrop({ className = '' }: { className?: string }) {
  const nodes: Node[] = useMemo(() => [
    { x: 60, y: 80, r: 5 }, { x: 220, y: 40, r: 4 }, { x: 340, y: 110, r: 6 },
    { x: 150, y: 190, r: 4 }, { x: 420, y: 60, r: 4 }, { x: 470, y: 170, r: 5 },
    { x: 300, y: 210, r: 4 }, { x: 90, y: 220, r: 3 },
  ], []);

  const edges = [[0,1],[1,2],[1,3],[2,4],[2,5],[2,6],[3,6],[0,3],[4,5],[6,7]];

  return (
    <svg className={className} viewBox="0 0 520 260" fill="none" aria-hidden="true">
      {edges.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="#4a9c7a" strokeWidth="1" strokeOpacity="0.35"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: i * 0.08, ease: 'easeInOut' }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.circle
          key={i} cx={n.x} cy={n.y} r={n.r} fill="#3E9C6F"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.85 }}
          transition={{ duration: 0.5, delay: 0.4 + i * 0.07 }}
        />
      ))}
    </svg>
  );
}
