'use client'

import { useRef, useEffect, useCallback } from 'react'

interface VideoPlayerProps {
  url: string
  provider?: string | null
  title?: string | null
  poster?: string | null
  lessonId?: string | null
  subtitleTracks?: Array<{
    src: string
    srcLang: string
    label: string
    default?: boolean
  }>
}

function getYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match?.[1] || url
}

function getVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match?.[1] || url
}

function useVideoTracking(lessonId: string | null | undefined) {
  const reportedRef = useRef<Set<number>>(new Set())
  const completedRef = useRef(false)

  const report = useCallback((currentTime: number, duration: number, completed = false) => {
    if (!lessonId) return
    // Debounce: only report if we've moved >10s since last report
    const bucket = Math.floor(currentTime / 10)
    if (reportedRef.current.has(bucket) && !completed) return
    reportedRef.current.add(bucket)

    fetch('/api/progress/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, currentTime, duration, completed }),
    }).catch(() => {})
  }, [lessonId])

  return { report, completedRef }
}

export function VideoPlayer({ url, provider, title, lessonId, poster, subtitleTracks = [] }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { report, completedRef } = useVideoTracking(lessonId)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !lessonId) return

    const onTimeUpdate = () => {
      if (!video.duration) return
      report(video.currentTime, video.duration)
    }

    const onEnded = () => {
      if (!completedRef.current) {
        completedRef.current = true
        report(video.duration, video.duration, true)
      }
    }

    const onPause = () => {
      if (video.currentTime > 5 && video.duration) {
        report(video.currentTime, video.duration)
      }
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    video.addEventListener('pause', onPause)
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('pause', onPause)
    }
  }, [lessonId, report, completedRef])

  const containerClass = 'relative w-full rounded-xl overflow-hidden bg-black shadow-lg'

  if (provider === 'youtube') {
    const videoId = getYouTubeId(url)
    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
    return (
      <div className={containerClass}>
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={title || 'Video'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    )
  }

  if (provider === 'vimeo') {
    const videoId = getVimeoId(url)
    const embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`
    return (
      <div className={containerClass}>
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={title || 'Video'}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    )
  }

  // Local / direct file
  return (
    <div className={containerClass}>
      <div className="aspect-video">
        <video
          ref={videoRef}
          controls
          playsInline
          className="absolute inset-0 w-full h-full"
          src={url}
          poster={poster || undefined}
          preload="metadata"
        >
          {subtitleTracks.map((track) => (
            <track
              key={`${track.srcLang}-${track.src}`}
              kind="subtitles"
              src={track.src}
              srcLang={track.srcLang}
              label={track.label}
              default={track.default}
            />
          ))}
          Your browser does not support video playback.
        </video>
      </div>
    </div>
  )
}
