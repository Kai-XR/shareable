import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { VRButton } from './src/utilities/three/VRButton'
import {
  isIOS as isIOSFunction,
  isMobile,
  isMobileVRBrowser,
  isSafari,
} from './src/utilities/Utils'
import { DeviceOrientationControls } from './src/components/DeviceOrientationControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import VideoControls from './src/components/VideoControls'
import Pause from './assets/images/icons/pause.png'
import VolumeOn from './assets/images/icons/volume-on.png'
import VolumeOff from './assets/images/icons/volume-off.png'
import { isIOS, isMobileSafari } from 'react-device-detect'

import EnterFullScreenIcon from './src/components/VideoIcons/EnterFullScreenIcon'
import Enter360Icon from './src/components/VideoIcons/Enter360Icon'

import { addPlayerControls } from './src/components/VrPlayer'
import TWEEN from './src/utilities/three/Tween'
import Gaze from './assets/images/icons/gaze.png'

function secondsToHms(d) {
  d = Number(d)
  // var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60)
  var s = Math.floor((d % 3600) % 60)

  var mDisplay = m < 10 ? '0' + m : m
  var sDisplay = s < 10 ? '0' + s : s

  return mDisplay + ':' + sDisplay
}

let camera,
  scene,
  renderer,
  pauseButton,
  pauseButtonMesh,
  raycaster,
  playerControls,
  material1,
  material2,
  cursor,
  gaze,
  tweenIn,
  tweenOut,
  firstRun = true,
  updatePlayerControls = true,
  orbitControls,
  orientationControls

let clickableObjects = []
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const VRPlayer = ({ callback, videoData, showPlayer }) => {
  let width = 0
  let height = 0
  const windowWidth = useRef(null)
  const windowHeight = useRef(null)
  const windowOrientation = useRef(null)
  const volumeRange = useRef(null)
  // const [volume, setVolume] = useState(100 * videoRef.current.volume)
  // const [muted, setMuted] = useState(videoRef.current.muted)
  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)
  const firstResize = useRef(true)

  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [is360, setIs360] = useState(false)
  const [isInteracted, setIsInteracted] = useState(false)
  const [currentAction, setCurrentAction] = useState('')
  const [percentajeBarClick, setPercentajeBarClick] = useState('')
  const [isFirstPlay, setIsFirtsPlay] = useState(true)
  const [isFullScreenMode, setIsFullScreenMode] = useState(false)
  const [showControlsOnClick] = useState(true)

  const mount = useRef(null)
  const videoRef = useRef(null)
  const intervalRef = useRef()
  const intervalVolumeRef = useRef()
  const videoContainer = useRef(null)
  const actionRef = useRef(null)
  const percentajeBarClickRef = useRef(null)
  const vrSessionRef = useRef(null)
  const vrButtonRef = useRef(null)
  const isInteractedRef = useRef(null)
  const showControlsOnClickRef = useRef(null)
  const is360ModeRef = useRef(null)
  const [storeVrSession, setStoreVrSession] = useState(false)
  const [storeIsVrSupported, setStoreIsVrSupported] = useState(false)

  useEffect(() => {
    if (!scene) return

    vrSessionRef.current = storeVrSession
    const pauseButton = scene.getObjectByName('pauseButton')
    const cursorButton = scene.getObjectByName('cursorButton')
    if (storeVrSession) {
      mount.current = null
      pauseButton.visible = true
      cursorButton.visible = true
    } else {
      //videoRef.current.pause();
      pauseButton.visible = false
      cursorButton.visible = false
      material1.opacity = 1
      material2.opacity = 1
      playerControls.visible = false
      setShowControls(true)
    }
  }, [storeVrSession])

  useEffect(() => {
    if (!vrButtonRef.current || !storeIsVrSupported) return
    if (showControls) {
      vrButtonRef.current.style.display = 'none'
    } else {
      vrButtonRef.current.style.display = 'block'
    }
  }, [showControls])

  const startTimer = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setVideoProgress(videoRef.current.currentTime)
    }, 1000)
  }

  const startVolumeInterval = () => {
    clearInterval(intervalVolumeRef.current)
    intervalVolumeRef.current = null
    intervalVolumeRef.current = setInterval(() => {
      if (!intervalVolumeRef.current) return
      volumeRange.current.classList.toggle('hidden')
      clearInterval(intervalVolumeRef.current)
      intervalVolumeRef.current = null
    }, 2000)
  }

  useEffect(() => {
    scrollToTop()
    // setShowControls(false)
    // if (isIOS() || isSafari()) {
    //   setShowControls(true);
    // } else {
    // }
    // playVideo()

    return () => {
      clearInterval(intervalRef.current)
      // setShowControls(false)
    }
  }, [])

  useEffect(() => {
    if (showPlayer) {
      isInteractedRef.current = isInteracted
      if (firstRun) {
        firstRun = false
        return
      }
      if (!isInteracted) tweenOut.start()
      else tweenIn.start()
    }
  }, [isInteracted, showPlayer])

  useEffect(() => {
    showControlsOnClickRef.current = showControlsOnClick
  }, [showControlsOnClick])

  useEffect(() => {
    is360ModeRef.current = is360
  }, [is360])

  useEffect(() => {
    if (showPlayer && videoData) {
      videoRef.current.src = videoData.video_source
      videoRef.current.currentTime = 0
      if (videoData.autoplay) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
      setShowControls(!videoData.autoplay)

      if (window.innerWidth > window.innerHeight) {
        windowOrientation.current = 'landscape'
        windowWidth.current = window.innerHeight
        windowHeight.current = window.innerWidth
      } else {
        windowOrientation.current = 'portrait'
        windowWidth.current = window.innerWidth
        windowHeight.current = window.innerHeight
      }
      updatePlayerControls = true
      // width = mount.current.clientWidth;
      // height = mount.current.clientHeight;

      //RAYCASTER
      raycaster = new THREE.Raycaster()

      // scene
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x101010)

      // camera
      camera = new THREE.PerspectiveCamera(
        80,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.layers.enable(1) // render left view when no stereo available

      // video
      const video = videoRef.current
      const texture = new THREE.VideoTexture(video)

      // left
      const geometry1 = new THREE.SphereGeometry(500, 60, 40)

      // invert the geometry on the x-axis so that all of the faces point inward
      geometry1.scale(-1, 1, 1)

      geometry1.rotateY(-Math.PI / 2)

      material1 = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      })

      const mesh1 = new THREE.Mesh(geometry1, material1)
      //mesh1.rotation.y = -Math.PI / 2;
      mesh1.layers.set(1) // display in left eye only
      scene.add(mesh1)

      // right

      const geometry2 = new THREE.SphereGeometry(500, 60, 40)
      geometry2.scale(-1, 1, 1)
      geometry2.rotateY(-Math.PI / 2)
      material2 = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      })

      const mesh2 = new THREE.Mesh(geometry2, material2)
      //mesh2.rotation.y = -Math.PI / 2;
      mesh2.layers.set(2) // display in right eye only
      scene.add(mesh2)

      // renderer

      renderer = new THREE.WebGLRenderer({ alpha: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.xr.enabled = true
      renderer.xr.setReferenceSpaceType('local')
      renderer.autoClear = true
      mount.current.appendChild(renderer.domElement)

      pauseButton = new THREE.Group()
      pauseButton.position.set(0, 0, -1)
      const geometry = new THREE.PlaneGeometry(0.75, 0.75)

      const textureButton = new THREE.TextureLoader().load(Pause)

      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        map: textureButton,
      })
      material.map.encoding = THREE.sRGBEncoding
      material.needsUpdate = true
      pauseButtonMesh = new THREE.Mesh(geometry, material)
      pauseButtonMesh.renderOrder = 1
      pauseButtonMesh.name = 'pauseButton'
      pauseButtonMesh.visible = false

      pauseButton.add(pauseButtonMesh)

      scene.add(pauseButton)

      playerControls = addPlayerControls(
        videoData?.title,
        videoRef.current.duration
      )
      scene.add(playerControls)

      clickableObjects.push(pauseButtonMesh, playerControls)

      const cursorGeometry = new THREE.RingGeometry(
        0.01,
        0.05,
        32,
        0,
        Math.PI * 0.5,
        Math.PI * 2
      )
      const cursorMaterial = new THREE.MeshBasicMaterial({ color: 0xff55ff })
      cursor = new THREE.Mesh(cursorGeometry, cursorMaterial)
      cursor.name = 'cursorButton'
      cursor.position.z = 0.1
      cursor.visible = false

      scene.add(cursor)
      let materialGaze = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(Gaze),
        transparent: true,
        depthTest: false,
        depthWrite: true,
      })

      let geometryGaze = new THREE.PlaneGeometry(1, 1, 16)
      gaze = new THREE.Mesh(geometryGaze, materialGaze)
      gaze.renderOrder = 5
      gaze.position.z = -1
      gaze.position.y = 0
      gaze.visible = false

      scene.add(gaze)

      tweenIn = new TWEEN.Tween(gaze.scale)
        .to({ x: 0, y: 0 }, 2500)
        .easing(TWEEN.Easing.Cubic.Out)
        .onUpdate(() => {
          if (gaze.scale.x < 0.3) {
            handleClickVrVideo()
            gaze.scale.x = 0
            gaze.scale.y = 0
            TWEEN.remove(tweenIn)
          }
        })
        .onStart(() => {
          TWEEN.remove(tweenOut)
        })

      tweenOut = new TWEEN.Tween(gaze.scale).onStart(() => {
        TWEEN.remove(tweenIn)
      })

      orientationControls = new DeviceOrientationControls(camera)
      //controls.connect();
      //enterFullscreen();

      //if (document.fullscreenElement) closeFullscreen();
      orbitControls = new OrbitControls(camera, renderer.domElement)

      orbitControls.target.set(0, 0, -1)
      orbitControls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
      orbitControls.enablePan = false
      orbitControls.dampingFactor = 0.05
      orbitControls.screenSpacePanning = false
      orbitControls.minDistance = 0.9
      orbitControls.maxDistance = 0.9
      orbitControls.minAzimuthAngle = -Infinity
      orbitControls.maxAzimuthAngle = Infinity
      orbitControls.minPolarAngle = 0
      orbitControls.maxPolarAngle = Math.PI

      if (!is360) {
        const vrB = VRButton.createButton(
          renderer,
          setStoreVrSession,
          setStoreIsVrSupported
        )
        vrButtonRef.current = vrB
        videoContainer.current.appendChild(vrB)
      }

      window.addEventListener('resize', handleResize)
      mount.current.addEventListener('click', handleClick)
      videoRef.current.addEventListener('loadedmetadata', () => {
        const object = scene.getObjectByName('totalDurationText')
        object.text = secondsToHms(videoRef.current.duration)
      })

      videoRef.current.addEventListener('ended', () => {
        videoRef.current?.pause()
        videoRef.current.src = ''
        videoRef.current.load()
        videoRef.current.remove()
        callback()
      })

      animate()
      return () => {
        if (vrButtonRef.current && videoContainer.current) {
          videoContainer.current.removeChild(vrButtonRef.current)
          vrButtonRef.current = null
        }

        window.removeEventListener('resize', handleResize)
        if (mount.current) {
          mount.current.removeChild(renderer.domElement)
          mount.current.removeEventListener('click', handleClick)
        }
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', () => {})
          videoRef.current.removeEventListener('ended', () => {})
        }
        orientationControls.dispose()
        orbitControls.dispose()
        renderer.dispose()

        scene.traverse((object) => {
          if (!object.isMesh) return

          object.geometry.dispose()

          if (object.material.isMaterial) {
            cleanMaterial(object.material)
          } else {
            // an array of materials
            for (const material of object.material) cleanMaterial(material)
          }
        })
      }
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [showPlayer, videoData])

  const cleanMaterial = (material) => {
    material.dispose()
    // dispose textures
    for (const key of Object.keys(material)) {
      const value = material[key]
      if (value && typeof value === 'object' && 'minFilter' in value) {
        value.dispose()
      }
    }
  }

  const handleResize = () => {
    if (isIOS && !isMobileSafari) {
      if (firstResize.current) {
        firstResize.current = false
        return
      }
      if (windowOrientation.current === 'portrait') {
        width = windowHeight.current
        height = windowWidth.current
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        windowOrientation.current = 'landscape'
      } else {
        width = windowWidth.current
        height = windowHeight.current
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        windowOrientation.current = 'portrait'
      }
      return
    }

    width = mount.current.clientWidth
    height = mount.current.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  const handleClick = () => {
    if (!isMobile()) return
    pauseVideo()
    //setShowControls(true);
  }

  const animate = () => {
    //controls.update();
    renderer.setAnimationLoop(render)
  }

  const render = () => {
    var dist = 8
    var cwd = new THREE.Vector3()

    camera.getWorldDirection(cwd)

    cwd.multiplyScalar(dist)
    cwd.add(camera.position)

    pauseButton.position.set(cwd.x, -6, cwd.z)
    pauseButton.setRotationFromQuaternion(camera.quaternion)

    dist = 10
    cwd = new THREE.Vector3()

    camera.getWorldDirection(cwd)

    cwd.multiplyScalar(dist)
    cwd.add(camera.position)
    cursor.position.set(cwd.x, cwd.y, cwd.z)
    cursor.setRotationFromQuaternion(camera.quaternion)
    gaze.position.set(cwd.x, cwd.y, cwd.z)
    gaze.setRotationFromQuaternion(camera.quaternion)

    if (updatePlayerControls) {
      positionPlayerControls()
    }
    playerControls.setRotationFromQuaternion(camera.quaternion)
    //pauseButton.visible = true;

    if (!vrSessionRef.current) {
      pauseButton.visible = true

      setCurrentAction(null)
    }

    if (vrSessionRef.current) {
      const pointer = new THREE.Vector2()
      raycaster.setFromCamera(pointer, camera)

      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children)

      let cont = 0
      if (!isInteracted.current) {
        for (let i = 0; i < intersects.length; i++) {
          if (
            intersects[i].object.name === 'pauseButton' &&
            pauseButton.visible
          ) {
            cont++
            setCurrentAction('pause')
          }
          if (
            intersects[i].object.name === 'playButton' &&
            !pauseButton.visible
          ) {
            cont++
            setCurrentAction('play')
          }
          if (
            intersects[i].object.name === 'closeButton' &&
            !pauseButton.visible
          ) {
            cont++
            setCurrentAction('exitVideo')
          }
          if (intersects[i].object.name === 'barBack' && !pauseButton.visible) {
            cont++
            setPercentajeBarClick(intersects[i].uv.x)
            setCurrentAction('seekVideo')
          }
        }
      }

      if (cont === 0) {
        gaze.visible = false
        setIsInteracted(false)
      } else {
        gaze.visible = true
        setIsInteracted(true)
      }
    }

    if (is360ModeRef.current) {
      orbitControls.enable = false
      orientationControls.connect()
      orientationControls.update()
    } else {
      orientationControls.disconnect()
      orbitControls.enable = true
      orbitControls.update()
    }

    TWEEN.update()
    renderer.render(scene, camera)
  }

  const pauseVideo = () => {
    videoRef.current.pause()
    setShowControls(true)
    setIsPlaying(false)
  }

  const toggleAudioVideo = () => {
    videoRef.current.muted = !muted
    if (videoRef.current.muted) {
      // videoRef.current.volume = 0;
      // setVolume(0);
    } else {
      // videoRef.current.volume = 1;
      // setVolume(100);
    }
    setMuted(videoRef.current.muted)
  }

  const positionPlayerControls = () => {
    var dist = 6
    var cwd = new THREE.Vector3()

    camera.getWorldDirection(cwd)

    cwd.multiplyScalar(dist)
    cwd.add(camera.position)

    playerControls.position.set(cwd.x, -1, cwd.z)
    //playerControls.setRotationFromQuaternion(camera.quaternion);
  }

  const playVideo = () => {
    startTimer()
    setShowControls(false)
    setIsFirtsPlay(false)
    setIsPlaying(true)
    if (videoRef.current.paused) videoRef.current.play()
    // setTimeout(() => {
    //   videoRef.current.play();
    // }, 500);
  }

  async function enterFullscreen() {
    if (!isIOSFunction()) {
      if (document.fullscreenElement) closeFullscreen()
      else {
        videoContainer.current
          .requestFullscreen()
          .then(() => {
            setIsFullScreenMode(true)
            const newOrientation = 'landscape-primary'
            window.screen.orientation
              .lock(newOrientation)
              .catch((err) => console.error(err))
          })
          .catch((err) => console.error(err))
      }
    }
  }

  /* Close fullscreen */
  function closeFullscreen() {
    document
      .exitFullscreen()
      .then(() => {
        setIsFullScreenMode(false)
        // const newOrientation = "portrait";
        // window.screen.orientation
        //   .lock(newOrientation)
        //   .catch((err) => console.error(err));
      })
      .catch(function (error) {
        console.error(error)
      })
  }

  const seekAudio = (value) => {
    if (value === 0) {
      videoRef.current.currentTime = 0
      return
    }
    videoRef.current.currentTime = (value * videoRef.current.duration) / 100
    setVideoProgress(videoRef.current.currentTime)
  }

  /** PLAYER VR FUNCTIONS */

  useEffect(() => {
    actionRef.current = currentAction
  }, [currentAction])

  useEffect(() => {
    percentajeBarClickRef.current = percentajeBarClick
  }, [percentajeBarClick])

  function handleClickVrVideo() {
    const action = actionRef.current

    switch (action) {
      case 'pause':
        updatePlayerControls = false
        videoRef.current.pause()
        material1.opacity = 0.05
        material1.needsUpdate = true
        material2.opacity = 0.05
        material2.needsUpdate = true
        // eslint-disable-next-line no-case-declarations
        const object = scene.getObjectByName('actualTimeVideo')
        object.text = secondsToHms(videoRef.current.currentTime)

        // eslint-disable-next-line no-case-declarations
        const playerHead = scene.getObjectByName('playerHead')
        playerHead.position.x =
          -2 + 4 * (videoRef.current.currentTime / videoRef.current.duration)

        // eslint-disable-next-line no-case-declarations
        const barBack = scene.getObjectByName('barBackCopy')
        barBack.scale.x =
          1 - videoRef.current.currentTime / videoRef.current.duration
        barBack.position.x =
          (4 * videoRef.current.currentTime) / videoRef.current.duration / 2 -
          0.07

        pauseButton.visible = false
        playerControls.visible = true
        break

      case 'play':
        updatePlayerControls = true
        material1.opacity = 1
        material1.needsUpdate = true
        material2.opacity = 1
        material2.needsUpdate = true
        playerControls.visible = false
        pauseButton.visible = true
        videoRef.current.play()
        break

      case 'exitVideo':
        videoRef.current.currentTime = 0
        vrButtonRef.current.click()
        callback()
        break
      case 'seekVideo':
        // eslint-disable-next-line no-case-declarations
        const percent = percentajeBarClickRef.current
        // eslint-disable-next-line no-case-declarations
        const ob = scene.getObjectByName('actualTimeVideo')
        ob.text = secondsToHms(videoRef.current.duration * percent)

        // eslint-disable-next-line no-case-declarations
        const playerH = scene.getObjectByName('playerHead')
        playerH.position.x = -2 + 4 * percent

        // eslint-disable-next-line no-case-declarations
        const barBack2 = scene.getObjectByName('barBackCopy')
        barBack2.scale.x = 1 - percent
        barBack2.position.x = (4 * percent) / 2 - 0.07

        videoRef.current.currentTime = videoRef.current.duration * percent

        break
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        id="video"
        crossOrigin="anonymous"
        playsInline
        style={{ display: 'none' }}
      >
        <source />
      </video>
      {showPlayer && (
        <div
          ref={videoContainer}
          className="bg-black h-screen"
          //className="absolute"
          // style={{
          //   backgroundColor: "#000000",
          //   width: windowDimensions.width,
          //   height: windowDimensions.height,
          // }}
        >
          {showControls && (
            <VideoControls
              playVideo={playVideo}
              pauseVideo={pauseVideo}
              videoTitle={videoData?.title}
              mediaDuration={videoRef.current.duration}
              progress={videoProgress}
              seekAudio={seekAudio}
              callback={callback}
              isFirstPlay={isFirstPlay}
              isPlaying={isPlaying}
            />
          )}
          <div
            className="vis cursor-grab"
            ref={mount}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
          />
          {!showControls && (
            <>
              {!isMobile() && (
                <>
                  <button
                    className="absolute bottom-0 left-0 p-2"
                    onClick={() => {
                      pauseVideo()
                    }}
                  >
                    <img src={Pause} alt="Pause video" width="50" />
                  </button>
                  <button
                    className="absolute bottom-0 left-[55px] p-2"
                    onClick={(event) => {
                      if (event.target.type === 'range') return
                      toggleAudioVideo()
                    }}
                    onMouseEnter={() => {
                      // if (event.target.type === 'range') return;
                      volumeRange.current.classList.remove('hidden')
                      clearInterval(intervalVolumeRef.current)
                      intervalVolumeRef.current = null
                    }}
                    onMouseLeave={() => {
                      //   // if (event.target.type === 'range') return;
                      volumeRange.current.classList.add('hidden')
                      // clearInterval(intervalVolumeRef.current);
                      //   intervalVolumeRef.current = null;
                    }}
                  >
                    <img
                      src={volume !== 0 && !muted ? VolumeOn : VolumeOff}
                      alt="Mute video"
                      width="50"
                    />
                    <div
                      className="bg-black/50 rounded-full py-3 px-3 items-center justify-center absolute bottom-[120px] left-[-43px] -rotate-90 hidden"
                      ref={volumeRange}
                    >
                      <div className="absolute top-[23px] left-[16px] w-[80%] h-1 bg-white/30 z-0"></div>
                      <input
                        type="range"
                        min="0"
                        max="99"
                        className="relative z-1 cursor-pointer appearance-none rounded-full bg-white/0 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                        // className="appearance-none [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/25 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[50px] [&::-webkit-slider-thumb]:w-[50px] [&::-webkit-slider-thumb]:rounded-full "
                        value={muted ? 0 : volume}
                        onChange={(event) => {
                          let vol = Number(event.target.value)
                          setVolume(vol)
                          event.target.value = volume
                          videoRef.current.volume = volume / 100
                          startVolumeInterval()

                          if (volume < 3) {
                            setMuted(true)
                            videoRef.current.volue = 0
                            videoRef.current.muted = true
                          } else {
                            setMuted(false)
                            videoRef.current.muted = false
                          }
                        }}
                      />
                    </div>
                  </button>
                </>
              )}
              <div className="absolute bottom-0 right-2 p-2 bg-black bg-opacity-20 rounded-lg">
                {isMobile() && !isMobileVRBrowser() && (
                  <button
                    className="m-4"
                    onClick={() => {
                      if (
                        isIOSFunction() &&
                        typeof window.DeviceMotionEvent.requestPermission ===
                          'function'
                      ) {
                        window.DeviceMotionEvent.requestPermission()
                          .then((permissionState) => {
                            if (permissionState === 'granted') {
                              console.log('Granted reload')
                              //window.location.reload(false);
                            }
                          })
                          .catch(console.error)
                      }

                      setIs360(!is360)
                    }}
                    //setIs360(!is360);
                  >
                    {/* <img src={Enter360Icon} alt="Pause video" width="30" /> */}
                    <Enter360Icon is360Mode={is360} />
                  </button>
                )}

                {!isIOSFunction() && !isSafari() && (
                  <button
                    onClick={() => {
                      enterFullscreen()
                    }}
                  >
                    {/* <img src={EnterFullScreen} alt="Pause video" width="30" /> */}
                    <EnterFullScreenIcon isFullScreenMode={isFullScreenMode} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default VRPlayer
