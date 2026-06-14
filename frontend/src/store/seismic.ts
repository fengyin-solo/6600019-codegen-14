import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { WaveformData, PhasePick, Station, SeismicEvent } from '../types'

export interface EventFilter {
  minMagnitude: number | null
  maxMagnitude: number | null
  minDepth: number | null
  maxDepth: number | null
  location: string
}

export const useSeismicStore = defineStore('seismic', () => {
  const waveform = ref<WaveformData | null>(null)
  const picks = ref<PhasePick[]>([])
  const selectedStation = ref<Station | null>(null)
  const staWindow = ref(1.0)
  const ltaWindow = ref(10.0)
  const threshold = ref(3.5)
  const isLoading = ref(false)
  const events = ref<SeismicEvent[]>([
    { id: '1', magnitude: 4.2, depth: 12.5, originTime: '2025-01-15T08:23:41Z', location: '四川雅安' },
    { id: '2', magnitude: 3.8, depth: 8.3, originTime: '2025-01-14T14:12:05Z', location: '云南大理' },
    { id: '3', magnitude: 5.1, depth: 25.0, originTime: '2025-01-13T02:45:33Z', location: '台湾花莲' },
    { id: '4', magnitude: 6.0, depth: 35.0, originTime: '2025-01-12T19:08:17Z', location: '四川康定' },
    { id: '5', magnitude: 2.5, depth: 5.0, originTime: '2025-01-11T11:30:00Z', location: '河北唐山' },
    { id: '6', magnitude: 4.8, depth: 18.6, originTime: '2025-01-10T06:55:22Z', location: '台湾台东' },
    { id: '7', magnitude: 3.1, depth: 10.2, originTime: '2025-01-09T22:14:08Z', location: '云南丽江' },
    { id: '8', magnitude: 5.6, depth: 42.0, originTime: '2025-01-08T15:42:51Z', location: '新疆喀什' },
    { id: '9', magnitude: 2.9, depth: 6.8, originTime: '2025-01-07T09:20:33Z', location: '广东河源' },
    { id: '10', magnitude: 4.5, depth: 15.0, originTime: '2025-01-06T03:11:47Z', location: '四川宜宾' },
    { id: '11', magnitude: 3.6, depth: 22.3, originTime: '2025-01-05T17:38:19Z', location: '甘肃兰州' },
    { id: '12', magnitude: 5.3, depth: 30.0, originTime: '2025-01-04T12:05:55Z', location: '台湾宜兰' },
  ])

  const eventFilter = ref<EventFilter>({
    minMagnitude: null,
    maxMagnitude: null,
    minDepth: null,
    maxDepth: null,
    location: '',
  })

  const filteredEvents = computed(() => {
    return events.value.filter(e => {
      if (eventFilter.value.minMagnitude !== null && e.magnitude < eventFilter.value.minMagnitude) return false
      if (eventFilter.value.maxMagnitude !== null && e.magnitude > eventFilter.value.maxMagnitude) return false
      if (eventFilter.value.minDepth !== null && e.depth < eventFilter.value.minDepth) return false
      if (eventFilter.value.maxDepth !== null && e.depth > eventFilter.value.maxDepth) return false
      if (eventFilter.value.location && !e.location.includes(eventFilter.value.location)) return false
      return true
    })
  })

  const isFilterActive = computed(() => {
    const f = eventFilter.value
    return f.minMagnitude !== null || f.maxMagnitude !== null ||
           f.minDepth !== null || f.maxDepth !== null || f.location !== ''
  })

  function resetFilter() {
    eventFilter.value = {
      minMagnitude: null,
      maxMagnitude: null,
      minDepth: null,
      maxDepth: null,
      location: '',
    }
  }

  const stations = ref<Station[]>([
    { id: 'STA01', name: 'BJI', latitude: 39.9, longitude: 116.4, elevation: 45 },
    { id: 'STA02', name: 'SSE', latitude: 31.2, longitude: 121.5, elevation: 10 },
    { id: 'STA03', name: 'KMI', latitude: 25.0, longitude: 102.7, elevation: 1890 },
    { id: 'STA04', name: 'HIA', latitude: 49.3, longitude: 119.7, elevation: 610 },
  ])

  function generateMockWaveform(): WaveformData {
    const sr = 100  // sampling rate Hz
    const duration = 60  // seconds
    const n = sr * duration
    const time = Array.from({ length: n }, (_, i) => i / sr)
    const bhz: number[] = [], bhn: number[] = [], bhe: number[] = []

    for (let i = 0; i < n; i++) {
      const t = time[i]
      // Background noise
      let vz = (Math.random() - 0.5) * 0.02
      let ns = (Math.random() - 0.5) * 0.02
      let ew = (Math.random() - 0.5) * 0.02

      // P-wave arrival at t=10s
      if (t > 10 && t < 18) {
        const amp = 0.8 * Math.exp(-(t - 12) * (t - 12) / 8)
        vz += amp * Math.sin(2 * Math.PI * 8 * t)
        ns += amp * 0.3 * Math.sin(2 * Math.PI * 8 * t + 0.5)
        ew += amp * 0.3 * Math.sin(2 * Math.PI * 8 * t + 1.0)
      }

      // S-wave arrival at t=22s
      if (t > 22 && t < 40) {
        const amp = 1.5 * Math.exp(-(t - 28) * (t - 28) / 30)
        vz += amp * 0.4 * Math.sin(2 * Math.PI * 4 * t)
        ns += amp * Math.sin(2 * Math.PI * 4 * t + 0.3)
        ew += amp * Math.sin(2 * Math.PI * 4 * t + 0.8)
      }

      // Surface waves at t=35s
      if (t > 35 && t < 55) {
        const amp = 2.0 * Math.exp(-(t - 42) * (t - 42) / 50)
        vz += amp * Math.sin(2 * Math.PI * 1.5 * t)
        ns += amp * Math.sin(2 * Math.PI * 1.5 * t + 0.4)
        ew += amp * Math.sin(2 * Math.PI * 1.5 * t + 0.9)
      }

      bhz.push(vz)
      bhn.push(ns)
      bhe.push(ew)
    }

    return { time, bhz, bhn, bhe, samplingRate: sr }
  }

  function loadMockData() {
    waveform.value = generateMockWaveform()
    picks.value = [
      { id: 'p1', type: 'P', time: 10.2, confidence: 0.92, method: 'STA/LTA' },
      { id: 'p2', type: 'S', time: 22.5, confidence: 0.88, method: 'STA/LTA' },
    ]
  }

  function staLtaPicking(): PhasePick[] {
    if (!waveform.value) return []
    const data = waveform.value.bhz
    const sr = waveform.value.samplingRate
    const staLen = Math.floor(staWindow.value * sr)
    const ltaLen = Math.floor(ltaWindow.value * sr)
    const newPicks: PhasePick[] = []

    let lta = 0
    for (let i = ltaLen; i < data.length - staLen; i++) {
      let sta = 0
      for (let j = 0; j < staLen; j++) sta += data[i + j] * data[i + j]
      sta /= staLen

      lta = 0
      for (let j = 0; j < ltaLen; j++) lta += data[i - j] * data[i - j]
      lta /= ltaLen

      const ratio = lta > 0 ? sta / lta : 0
      if (ratio > threshold.value) {
        const t = waveform.value.time[i]
        const existsNear = newPicks.some(p => Math.abs(p.time - t) < 2)
        if (!existsNear) {
          newPicks.push({
            id: `pick_${Date.now()}_${i}`,
            type: newPicks.length === 0 ? 'P' : 'S',
            time: t,
            confidence: Math.min(1, ratio / 10),
            method: 'STA/LTA'
          })
        }
      }
    }
    return newPicks
  }

  async function uploadAndAnalyze(file: File) {
    isLoading.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)
      const resp = await fetch('/api/waveform/upload', { method: 'POST', body: formData })
      if (resp.ok) {
        const data = await resp.json()
        waveform.value = data.waveform
        picks.value = data.picks || []
      }
    } catch {
      loadMockData()
    } finally {
      isLoading.value = false
    }
  }

  return {
    waveform, picks, selectedStation, staWindow, ltaWindow, threshold,
    isLoading, events, stations, eventFilter, filteredEvents, isFilterActive,
    loadMockData, staLtaPicking, uploadAndAnalyze, generateMockWaveform, resetFilter
  }
})
