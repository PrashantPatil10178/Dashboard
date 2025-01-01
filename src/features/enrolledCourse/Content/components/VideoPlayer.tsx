import React, { useEffect, useRef } from 'react'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

interface VideoPlayerProps {
  url: string // Video URL
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    if (videoRef.current) {
      const player = new Plyr(videoRef.current, {
        controls: [
          'play',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'settings',
          'fullscreen',
        ],
        settings: ['captions', 'quality', 'speed'],
        autoplay: false,
        disableContextMenu: true,
        blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
      })

      // Remove the download button after initialization
      const downloadButton = videoRef.current.parentElement?.querySelector(
        '.plyr__control--download'
      )
      if (downloadButton) {
        downloadButton.remove()
      }

      return () => {
        player.destroy()
      }
    }
  }, [])

  // Securely construct the video URL
  const fullUrl = url.startsWith('http')
    ? url
    : `http://localhost:4000${url.startsWith('/') ? '' : '/'}${url}`
  console.log('Full video URL:', fullUrl)

  return (
    <div
      className='video-container'
      style={{ maxWidth: '900px', margin: 'auto' }}
    >
      <video
        ref={videoRef}
        className='plyr'
        playsInline
        controls
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        <source src={`${fullUrl}`} type='video/mp4' sizes='720' />
        {/* <source src={`${url}-480p.mp4`} type='video/mp4' sizes='480' />
        <source src={`${url}-360p.mp4`} type='video/mp4' sizes='360' /> */}
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
