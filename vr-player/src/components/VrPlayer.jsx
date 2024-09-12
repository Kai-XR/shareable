//@ts-nocheck
import * as THREE from 'three'
import { Text } from 'troika-three-text'
import Play from '../../assets/images/icons/play.png'
import Wall from '../../assets/images/icons/wall.png'
import BarBack from '../../assets/images/icons/bar0001.png'
import Bar from '../../assets/images/icons/bar0002.png'
import PlayHead from '../../assets/images/icons/playHead.png'
import Close from '../../assets/images/icons/close.png'
const BGPlayerWidth = 4

export function addPlayerControls(videoTitle, videoDuration) {
  const playerControls = new THREE.Group()

  // PLAY BUTTON
  const playButton = new THREE.Group()
  playButton.position.set(0, 1, 0)
  const geometry = new THREE.PlaneGeometry(1.15, 1.15)

  const textureButton = new THREE.TextureLoader().load(Play)
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    map: textureButton,
  })
  material.map.encoding = THREE.sRGBEncoding
  material.needsUpdate = true
  const playCollider = new THREE.Mesh(geometry, material)
  playCollider.renderOrder = 1
  playCollider.name = 'playButton'
  playButton.add(playCollider)

  playerControls.add(playButton)

  // VIDEO TITLE
  const title = new Text()
  title.fontSize = 0.25
  title.position.y = 0
  title.color = 0xffffff
  title.anchorX = 0.5
  title.anchorY = 0.5
  title.maxWidth = 8
  title.text = videoTitle
  title.renderOrder = 2
  title.sync()

  playerControls.add(title)

  // CLOSE BUTTON
  const closeButton = new THREE.Group()
  closeButton.position.set(-1.5, 1, 0)
  const geometryClose = new THREE.PlaneGeometry(0.75, 0.72)

  const closeButtonTexture = new THREE.TextureLoader().load(Close)
  const materialClose = new THREE.MeshBasicMaterial({
    transparent: true,
    map: closeButtonTexture,
  })
  materialClose.map.encoding = THREE.sRGBEncoding
  materialClose.needsUpdate = true
  const closeCollider = new THREE.Mesh(geometryClose, materialClose)
  closeCollider.renderOrder = 1
  closeCollider.name = 'closeButton'

  closeButton.add(closeCollider)

  playerControls.add(closeButton)

  // PLAYER BAR BACKGROUND
  const barBack = new THREE.Group()
  barBack.position.set(0, -0.4, 0)
  const geometryBarBack = new THREE.PlaneGeometry(4, 0.15)

  const barBackTexture = new THREE.TextureLoader().load(BarBack)
  const materialBarBack = new THREE.MeshBasicMaterial({
    transparent: true,
    map: barBackTexture,
  })
  materialBarBack.map.encoding = THREE.sRGBEncoding
  materialBarBack.needsUpdate = true
  const barBackCollider = new THREE.Mesh(geometryBarBack, materialBarBack)
  barBackCollider.renderOrder = 1
  barBackCollider.name = 'barBack'

  barBack.add(barBackCollider)

  playerControls.add(barBack)

  // PLAYER BAR BACKGROUND COPY
  const barBackCopy = new THREE.Group()
  barBackCopy.position.set(0, -0.4, 0.002)
  const geometryBarBackCopy = new THREE.PlaneGeometry(4, 0.15)

  const barBackCopyTexture = new THREE.TextureLoader().load(BarBack)
  const materialBarBackCopy = new THREE.MeshBasicMaterial({
    transparent: true,
    map: barBackCopyTexture,
  })
  materialBarBackCopy.map.encoding = THREE.sRGBEncoding
  materialBarBackCopy.needsUpdate = true
  const barBackCopyCollider = new THREE.Mesh(
    geometryBarBackCopy,
    materialBarBackCopy
  )
  barBackCopyCollider.renderOrder = 1
  barBackCopyCollider.name = 'barBackCopy'

  barBackCopy.add(barBackCopyCollider)

  playerControls.add(barBackCopy)

  // PLAYER BAR
  let geometryBar = new THREE.PlaneGeometry(BGPlayerWidth, 0.15)
  const playerBarTexture = new THREE.TextureLoader().load(Bar)
  let materialBar = new THREE.MeshBasicMaterial({
    map: playerBarTexture,
    transparent: true,
  })
  materialBar.map.encoding = THREE.sRGBEncoding
  materialBar.needsUpdate = true
  const playedPlayer = new THREE.Mesh(geometryBar, materialBar)
  playedPlayer.position.y = -0.4
  playedPlayer.position.z = 0.001
  playedPlayer.renderOrder = 2
  const playedPlayerRepeatX = playedPlayer.material.map.repeat.x

  playerControls.add(playedPlayer)

  // ACTUAL TIME
  const actualTime = new Text()
  actualTime.fontSize = 0.15
  actualTime.position.x = -1.7
  actualTime.position.y = -0.65
  actualTime.color = 0xffffff
  actualTime.textAlign = 'left'
  actualTime.anchorX = 0.5
  actualTime.anchorY = 0.5
  actualTime.maxWidth = 5
  actualTime.text = '00:00'
  actualTime.name = 'actualTimeVideo'
  actualTime.sync()

  playerControls.add(actualTime)

  // TOTAL DURATION
  const totalDuration = new Text()
  totalDuration.fontSize = 0.15
  totalDuration.position.x = 1.7
  totalDuration.position.y = -0.65
  totalDuration.color = 0xffffff
  totalDuration.textAlign = 'left'
  totalDuration.anchorX = 0.5
  totalDuration.anchorY = 0.5
  totalDuration.maxWidth = 5
  totalDuration.name = 'totalDurationText'
  totalDuration.sync()

  playerControls.add(totalDuration)

  const playerHeadButton = new THREE.Group()
  playerHeadButton.name = 'playerHead'
  playerHeadButton.position.set(-2, -0.4, 0.006)
  const geometryPlayerHead = new THREE.PlaneGeometry(0.35, 0.35)

  const playHeadTexture = new THREE.TextureLoader().load(PlayHead)
  const materialPlayHead = new THREE.MeshBasicMaterial({
    transparent: true,
    map: playHeadTexture,
  })
  materialPlayHead.map.encoding = THREE.sRGBEncoding
  materialPlayHead.needsUpdate = true
  const playerHeadCollider = new THREE.Mesh(
    geometryPlayerHead,
    materialPlayHead
  )
  playerHeadCollider.renderOrder = 3
  playerHeadCollider.name = 'playerHead'
  playerHeadButton.add(playerHeadCollider)

  playerControls.add(playerHeadButton)

  playerControls.visible = false
  return playerControls
}
