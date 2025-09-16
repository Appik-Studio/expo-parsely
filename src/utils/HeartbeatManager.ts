// Standalone heartbeat manager that operates outside React lifecycle
import type { HeartbeatConfig } from '../ExpoParsely.types'

class HeartbeatManager {
  private timer: ReturnType<typeof setTimeout> | null = null
  private isActive = false
  private config: Required<HeartbeatConfig> = {
    enableHeartbeats: true,
    secondsBetweenHeartbeats: 150,
    activeTimeout: 5,
    onHeartbeat: () => {},
    videoPlaying: false
  }
  private lastHeartbeat = 0
  private totalEngagedTime = 0
  private sessionStart = 0
  private lastActivity = 0
  private heartbeatCount = 0

  updateConfig(config: Partial<HeartbeatConfig>) {
    this.config = { ...this.config, ...config }
  }

  start() {
    if (this.isActive || !this.config.enableHeartbeats) return
    const now = Date.now()
    this.isActive = true
    this.sessionStart = now
    this.lastHeartbeat = now
    this.lastActivity = now
    this.totalEngagedTime = 0
    this.heartbeatCount = 0
    this.scheduleNextHeartbeat()
  }

  stop() {
    if (!this.isActive) return
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.isActive = false
  }

  recordActivity() {
    this.lastActivity = Date.now()
  }

  private scheduleNextHeartbeat() {
    if (!this.isActive) return

    const intervalMs = this.config.secondsBetweenHeartbeats * 1000

    this.timer = setTimeout(() => {
      this.sendHeartbeat()
    }, intervalMs)
  }

  private sendHeartbeat() {
    if (!this.isActive) return

    const now = Date.now()
    const timeSinceActivity = now - this.lastActivity
    const activeTimeoutMs = this.config.activeTimeout * 1000
    const isEngaged = this.config.videoPlaying || timeSinceActivity <= activeTimeoutMs

    // Optimized calculation - avoid repeated Math.floor
    const timeSinceLastHeartbeat = now - this.lastHeartbeat
    const engagedTimeIncrement = isEngaged ? (timeSinceLastHeartbeat / 1000) | 0 : 0

    // Batch state updates
    this.totalEngagedTime += engagedTimeIncrement
    this.lastHeartbeat = now
    this.heartbeatCount++

    // Async callback to prevent blocking main thread
    if (this.config.onHeartbeat) {
      queueMicrotask(() => this.config.onHeartbeat!(engagedTimeIncrement))
    }

    this.scheduleNextHeartbeat()
  }

  getStats() {
    return {
      isActive: this.isActive,
      heartbeatCount: this.heartbeatCount,
      totalEngagedTime: this.totalEngagedTime,
      lastActivity: this.lastActivity,
      sessionStart: this.sessionStart
    }
  }

  reset() {
    this.heartbeatCount = 0
    this.totalEngagedTime = 0
    const now = Date.now()
    this.sessionStart = now
    this.lastActivity = now
    this.lastHeartbeat = now
  }
}

// Export singleton instance
export const heartbeatManager = new HeartbeatManager()
