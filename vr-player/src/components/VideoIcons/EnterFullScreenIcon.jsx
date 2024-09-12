import { useEffect } from 'react'

const EnterFullScreenIcon = ({ isFullScreenMode }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      fill="none"
      viewBox="0 0 27 27"
    >
      <path
        fill={isFullScreenMode ? '#00F0C4' : '#ffffff'}
        d="M3.857 17.357H0V27h9.643v-3.857H3.857v-5.786zM0 9.643h3.857V3.857h5.786V0H0v9.643zm23.143 13.5h-5.786V27H27v-9.643h-3.857v5.786zM17.357 0v3.857h5.786v5.786H27V0h-9.643z"
      ></path>
    </svg>
  )
}

export default EnterFullScreenIcon
