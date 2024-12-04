import React from 'react'
import Lottie from "lottie-react";
import loadingLottie from "./LoadingLottie.json";
import "./LoadingLottie.style.css"

const Loading = () => {
  return (
    <div className="loading-lottie" >

      <Lottie className="lottie-img" animationData={loadingLottie} />
      {/* <strong>불러오는 중입니다..</strong> */}
    </div>
  )
}

export default Loading