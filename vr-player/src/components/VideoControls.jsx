//@ts-nocheck
import Play from '../../assets/images/icons/play.png'
import Pause from '../../assets/images/icons/pause.png'
import Wall from '../../assets/images/icons/wall.png'
import Close from '../../assets/images/icons/close.png'
import PlayerProgresBar from './PlayerProgressBar'
import React, { useEffect, useRef, useState } from 'react'
import { isIOS, isSafari } from '../utilities/Utils'

const VideoControls = ({
  playVideo,
  pauseVideo,
  videoTitle,
  mediaDuration,
  progress,
  seekAudio,
  callback,
  isFirstPlay,
  isPlaying,
}) => {
  const [isVideoPaused, setIsVideoPaused] = useState(false)
  const timer = useRef(null)

  return (
    <div className="bg-black bg-opacity-60 absolute w-screen h-screen z-10 flex items-center justify-center flex-col top-0">
      <div className="text-white w-full md:w-3/4 lg:w-1/2 flex justify-center items-center relative flex-col px-4">
        {!isPlaying ? (
          <>
            <img
              className={`absolute left-0 top-0 ml-8 mt-8 cursor-pointer`}
              src={Close}
              alt="Back"
              width={75}
              onClick={callback}
            />
            <img
              className="cursor-pointer pb-4"
              src={Play}
              alt="Play video"
              width={120}
              onClick={playVideo}
            />
          </>
        ) : (
          <>
            <img
              className="cursor-pointer pb-4"
              src={Pause}
              alt="Play video"
              width={100}
              onClick={() => {
                setIsVideoPaused(true)
                pauseVideo()
                clearInterval(timer.current)
              }}
            />
          </>
        )}

        <h2 className={`text-center`}>{videoTitle}</h2>
      </div>
      <div className="w-full md:w-3/4 lg:w-1/2 p-8">
        <PlayerProgresBar
          totalDuration={mediaDuration}
          progress={progress}
          seekAudio={seekAudio}
        />
      </div>
    </div>
  )
}

export default VideoControls
