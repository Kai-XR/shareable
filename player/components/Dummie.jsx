import React, { useContext } from 'react'
import { AwesomeButton } from 'react-awesome-button'
import 'react-awesome-button/dist/styles.css'
// import { DataContext } from "../contexts/DataContext";

const Dummie = ({ callback, title, reference }) => {
  //   const data = useContext(DataContext);
  //   console.log("data", data.dummie);
  return (
    <>
      <div className="absolute text-white text-lg">Hello, Barrrrrrrrr!</div>
      <AwesomeButton type="primary">Button</AwesomeButton>
    </>
  )
}

export default Dummie
