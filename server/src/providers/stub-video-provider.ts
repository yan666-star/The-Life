import { randomUUID } from 'node:crypto'
import type { VideoProvider } from './video-provider.js'

export class StubVideoProvider implements VideoProvider {
  name = 'stub'

  async generateFromPacket(input: {
    side: 'left' | 'right'
    packet: { title?: string; story?: string; action?: string; result?: string }
    characterSummary?: string
  }) {
    const title = input.packet.title || '平行时空'
    const scriptText = `【${input.side === 'left' ? '时间线 A' : '时间线 B'}】${title}：${input.packet.story || ''} ${input.packet.result || ''}`.slice(
      0,
      500
    )
    return {
      jobId: randomUUID(),
      scriptText,
      videoUrl: null,
    }
  }
}

export function getVideoProvider(): VideoProvider {
  return new StubVideoProvider()
}
