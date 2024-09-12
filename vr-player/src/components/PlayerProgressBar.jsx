import React, { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'

const containerStyles = {
  height: 20,
  backgroundColor: '#e0e0de',
  borderRadius: 50,
}

const fillerStyles = {
  height: 20,
  //backgroundColor: "#E5007D",
  backgroundColor: 'rgb(244,104,82)',
  background:
    'linear-gradient(90deg, rgba(244,104,82,1) 0%, rgba(215,49,165,1) 20%, rgba(92,149,218,1) 40%, rgba(10,203,222,1) 60%, rgba(4,156,188,1) 80%)',
  borderRadius: 'inherit',
  top: '50%',
  transform: 'translate(0, -50%)',
}

const buttonStyles = {
  marginTop: 0,
  width: 24,
  height: 24,
}

function secondsToHms(d) {
  d = Number(d)
  var h = Math.floor(d / 3600)
  var m = Math.floor((d % 3600) / 60)
  var s = Math.floor((d % 3600) % 60)

  var mDisplay = m < 10 ? '0' + m : m
  var sDisplay = s < 10 ? '0' + s : s

  return mDisplay + ':' + sDisplay
}

const PlayerProgresBar = ({ seekAudio, totalDuration = 0, progress }) => {
  const [isDragging, setIsDraggin] = useState(false)
  const progressBarRef = useRef(null)
  const [currentProgress, setCurrentProgress] = useState(0)
  const startX = useRef(0)
  const endX = useRef(0)
  const drag = useRef(true)

  useEffect(() => {
    secondsToHms(totalDuration)
  }, [totalDuration])

  useEffect(() => {
    if (isDragging) return
    const totalWidth = progressBarRef.current.getBoundingClientRect().width - 24
    const positionX = (((progress * 100) / totalDuration) * totalWidth) / 100
    if (positionX === progressBarRef.current.getBoundingClientRect().width) {
      seekAudio(0)
      return
    }
    setCurrentProgress(positionX + 4)
  }, [progress, isDragging, totalDuration, seekAudio])

  const getWidthPercentaje = (currentWidth) => {
    const totalWidth = progressBarRef.current.getBoundingClientRect().width - 24

    if ((currentWidth * 100) / totalWidth === 100) {
      setTimeout(() => {
        setCurrentProgress(0)
        seekAudio(0)
      }, 500)

      return
    }
    seekAudio((currentWidth * 100) / totalWidth)
  }

  const barClick = (e) => {
    let rect = e.target.getBoundingClientRect()
    let x = e.clientX - rect.left
    setCurrentProgress(x)
    getWidthPercentaje(x)
  }

  return (
    <div className="relative" style={{ marginBottom: 15 }}>
      <div
        className="w-full flex items-center"
        style={{
          height: 24,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        <div onClick={barClick} className="w-full " style={containerStyles}>
          <div
            className="absolute top-0"
            style={{
              ...fillerStyles,
              width: isNaN(currentProgress) ? 0 : currentProgress + 4,
            }}
          ></div>
        </div>
      </div>
      <div
        ref={progressBarRef}
        className="absolute top-0"
        style={{ width: '100%' }}
      >
        <Draggable
          allowAnyClick={true}
          // onStart={(event, data) => console.log("START", data.x)}
          onDrag={(event, data) => {
            setIsDraggin(true)
            setCurrentProgress(data.x)
            getWidthPercentaje(data.x)
          }}
          onStop={(event, data) => {
            setIsDraggin(false)
            getWidthPercentaje(data.x)
          }}
          position={{ x: currentProgress | 0, y: 0 }}
          axis="x"
          bounds="parent"
        >
          <div
            className="absolute z-50 audioPlayerCircle bg-white rounded-full cursor-grab"
            style={buttonStyles}
          ></div>
        </Draggable>
      </div>
      <div className="absolute px-1 text-white text-xs w-full mt-2">
        <span>{secondsToHms(progress)}</span>
        <span className="float-right">
          {isNaN(totalDuration) ? '00:00' : secondsToHms(totalDuration)}
        </span>
      </div>
    </div>
  )
}

export default PlayerProgresBar
