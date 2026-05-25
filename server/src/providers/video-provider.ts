export interface ComparisonPacket {
  title?: string
  story?: string
  action?: string
  result?: string
  [key: string]: unknown
}

export interface VideoJobStatus {
  status: 'pending' | 'processing' | 'ready' | 'failed'
  videoUrl?: string | null
  posterUrl?: string | null
  scriptText?: string | null
  error?: string | null
}

export interface VideoProvider {
  name: string
  generateFromPacket(input: {
    side: 'left' | 'right'
    packet: ComparisonPacket
    characterSummary?: string
  }): Promise<{ jobId: string; scriptText?: string; videoUrl?: string }>
}
