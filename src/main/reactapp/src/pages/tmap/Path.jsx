import React, { useState } from 'react';
import TmapPath from './TmapPath'; // TmapPath 컴포넌트 임포트
import ApiPlaces from '../place/ApiPlaces'; // ApiPlaces 컴포넌트 임포트

const Path = () => {
  const [activeStep, setActiveStep] = useState('route'); // 'route' 또는 'places'

  return (
    <div className="d-flex w-1/5">
      {/* 왼쪽 스텝 버튼 */}
      <div className="flex-column p-3" style={{ width: '100px' }}>
        <button
          className={`btn btn-outline-primary mb-2 w-100 ${activeStep === 'route' ? 'active' : ''}`}
          onClick={() => setActiveStep('route')}
        >
          STEP 1: 길찾기
        </button>
        <button
          className={`btn btn-outline-primary w-100 ${activeStep === 'places' ? 'active' : ''}`}
          onClick={() => setActiveStep('places')}
        >
          STEP 2: 장소 선택
        </button>
      </div>

      {/* 오른쪽 컴포넌트 영역 */}
      <div className="flex-grow">
        {activeStep === 'route' && <TmapPath />}
        {activeStep === 'places' && <ApiPlaces />}
      </div>
    </div>
  );
};

export default Path;