import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, boxes }) => {
  const listItems = boxes.map((box) => {
    return (
      <div
        key={box.id}
        className="bounding-box"
        style={{
          top: box.topRow,
          right: box.rightCol,
          bottom: box.bottomRow,
          left: box.leftCol,
        }}
      ></div>
    );
  });
  return (
    <div className="center ma">
      <div className="absolute mt2">
        <img
          id="inputImage"
          alt=""
          src={imageUrl}
          width="500px"
          height="auto"
        />
        {listItems}
      </div>
    </div>
  );
};

export default FaceRecognition;
