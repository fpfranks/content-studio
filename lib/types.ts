export interface Scene {
  id: string
  narration: string
  imagePrompt: string
  duration: number
  imageUrl?: string
  audioUrl?: string
}

export type Category = 'history' | 'science' | 'military' | 'nature' | 'truecrime'
export type Tone = 'dramatic' | 'shocking' | 'dark' | 'educational'
export type StepId = 'topic' | 'script' | 'images' | 'voice' | 'assemble' | 'upload'

export interface Project {
  topic: string
  category: Category
  tone: Tone
  title: string
  description: string
  hashtags: string[]
  scenes: Scene[]
  videoPath?: string
}
