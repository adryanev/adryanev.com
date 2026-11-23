import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

const adminTransition = { duration: 0.2, ease: 'easeOut' } as const

// reducedMotion="user" drops transform and layout animations; the zero
// duration also stops the opacity and height animations it leaves running
export function AdminMotion({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  return (
    <MotionConfig
      reducedMotion="user"
      transition={reduceMotion ? { duration: 0 } : adminTransition}
    >
      {children}
    </MotionConfig>
  )
}

export const rowPresence = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const

export function Reveal({
  open,
  children,
}: {
  open: boolean
  children: ReactNode
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="reveal"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="admin-reveal"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
