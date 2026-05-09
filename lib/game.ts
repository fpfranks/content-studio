export interface GameState {
  xp: number
  streak: number
  lastPostDate: string
  completedMissions: string[]   // "missionId-YYYY-MM-DD"
  achievements: string[]
  totalIdeas: number
  totalScripts: number
  totalGenerations: number
  totalHookTests: number
}

export const LEVELS = [
  { min: 0,    max: 99,   title: 'Hobbit of the Shire',  color: '#4a7c59' },
  { min: 100,  max: 299,  title: 'Wandering Ranger',      color: '#c9a227' },
  { min: 300,  max: 699,  title: 'Rider of Rohan',        color: '#e07b10' },
  { min: 700,  max: 1499, title: 'Knight of Gondor',      color: '#c9a227' },
  { min: 1500, max: 2999, title: 'Elf-Lord of Content',   color: '#f0c040' },
  { min: 3000, max: Infinity, title: 'Bearer of the Ring', color: '#ff8c20' },
]

export const ACHIEVEMENTS = [
  { id: 'first-idea',    label: 'First Idea',         desc: 'Add your first idea',            icon: '💡', xp: 10 },
  { id: 'idea-machine',  label: 'Idea Machine',        desc: 'Save 10 ideas',                  icon: '🧠', xp: 30 },
  { id: 'first-script',  label: 'Scriptwriter',        desc: 'Write your first script',        icon: '📝', xp: 25 },
  { id: 'hook-master',   label: 'Hook Master',         desc: 'Get a 90+ viral score',          icon: '🎣', xp: 50 },
  { id: 'ai-powered',    label: 'AI Powered',          desc: 'Generate content 5 times',       icon: '🤖', xp: 40 },
  { id: 'streak-3',      label: '3-Day Streak',        desc: 'Complete missions 3 days in a row', icon: '🔥', xp: 75 },
  { id: 'streak-7',      label: 'Week Warrior',        desc: '7-day mission streak',           icon: '⚡', xp: 200 },
  { id: 'viral-machine', label: 'Viral Machine',       desc: 'Test 20 hooks',                  icon: '🚀', xp: 100 },
  { id: 'level-2',       label: 'Level Up',            desc: 'Reach Creator level',            icon: '⬆', xp: 0 },
  { id: 'level-3',       label: 'Going Viral',         desc: 'Reach Going Viral level',        icon: '🌊', xp: 0 },
]

export const DAILY_MISSIONS = [
  { id: 'write-script',  label: 'Write a video script',            xp: 30, icon: '📝' },
  { id: 'gen-content',   label: 'Generate AI titles & captions',   xp: 20, icon: '🤖' },
  { id: 'add-3-ideas',   label: 'Add 3 ideas to your bank',        xp: 25, icon: '💡' },
  { id: 'test-hook',     label: 'Test a hook in Viral Scorer',     xp: 20, icon: '🎣' },
  { id: 'plan-short',    label: 'Script a YouTube Short',          xp: 30, icon: '⚡' },
  { id: 'post-short',    label: 'Post a YouTube Short today',      xp: 75, icon: '🚀' },
  { id: 'post-long',     label: 'Post a long-form YouTube video',  xp: 100,icon: '▶' },
  { id: 'batch-titles',  label: 'Generate titles for 3 videos',    xp: 35, icon: '✏' },
]

function today() { return new Date().toISOString().split('T')[0] }

export function getState(): GameState {
  if (typeof window === 'undefined') return defaultState()
  const raw = localStorage.getItem('game-state')
  return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState()
}

function defaultState(): GameState {
  return { xp: 0, streak: 0, lastPostDate: '', completedMissions: [], achievements: [], totalIdeas: 0, totalScripts: 0, totalGenerations: 0, totalHookTests: 0 }
}

function save(state: GameState) {
  localStorage.setItem('game-state', JSON.stringify(state))
}

export function getLevel(xp: number) {
  return LEVELS.findLast(l => xp >= l.min) ?? LEVELS[0]
}

export function xpToNextLevel(xp: number): { current: number; needed: number; pct: number } {
  const lvl = LEVELS.findIndex(l => xp >= l.min && xp <= l.max)
  if (lvl === LEVELS.length - 1) return { current: xp - LEVELS[lvl].min, needed: 9999, pct: 100 }
  const needed = LEVELS[lvl + 1].min - LEVELS[lvl].min
  const current = xp - LEVELS[lvl].min
  return { current, needed, pct: Math.round((current / needed) * 100) }
}

export function addXP(amount: number, reason: string, stateUpdate?: Partial<GameState>): GameState {
  const state = getState()
  const prevLevel = getLevel(state.xp)
  state.xp += amount
  if (stateUpdate) Object.assign(state, stateUpdate)
  const newLevel = getLevel(state.xp)
  save(state)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('xp-gained', { detail: { amount, reason, levelUp: prevLevel.title !== newLevel.title, newLevel: newLevel.title } }))
  }
  return state
}

export function completeMission(missionId: string): { xp: number; alreadyDone: boolean } {
  const state = getState()
  const key = `${missionId}-${today()}`
  if (state.completedMissions.includes(key)) return { xp: 0, alreadyDone: true }
  const mission = DAILY_MISSIONS.find(m => m.id === missionId)
  if (!mission) return { xp: 0, alreadyDone: false }
  state.completedMissions.push(key)
  addXP(mission.xp, `Mission: ${mission.label}`)
  return { xp: mission.xp, alreadyDone: false }
}

export function unlockAchievement(id: string): boolean {
  const state = getState()
  if (state.achievements.includes(id)) return false
  const ach = ACHIEVEMENTS.find(a => a.id === id)
  if (!ach) return false
  state.achievements.push(id)
  addXP(ach.xp, `Achievement: ${ach.label}`)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: ach }))
  }
  return true
}

export function getTodayMissions(): typeof DAILY_MISSIONS {
  const seed = today().split('-').reduce((a, b) => a + parseInt(b), 0)
  const shuffled = [...DAILY_MISSIONS].sort((a, b) => {
    const hashA = (seed * a.id.length) % 100
    const hashB = (seed * b.id.length) % 100
    return hashA - hashB
  })
  return shuffled.slice(0, 4)
}

export function isMissionDone(missionId: string): boolean {
  return getState().completedMissions.includes(`${missionId}-${today()}`)
}
