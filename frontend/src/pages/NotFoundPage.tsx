import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ticket, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      {/* Floating icon */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10 ring-1 ring-amber-500/20">
          <Ticket className="h-12 w-12 text-amber-500" />
        </div>
      </motion.div>

      {/* 404 */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-2 bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-8xl font-black tracking-tight text-transparent sm:text-9xl"
      >
        404
      </motion.p>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-3 text-2xl font-bold text-foreground sm:text-3xl"
      >
        Page not found
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-8 max-w-sm text-muted-foreground"
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        <br />
        Let&apos;s get you back on track.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <Button asChild size="lg">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/events">
            <Search className="mr-2 h-4 w-4" />
            Browse Events
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
