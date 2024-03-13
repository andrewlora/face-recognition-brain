import ParticlesBg from 'particles-bg';
import React, { useState } from 'react';
import './App.css';
import { clarifaiApi } from './api/clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/Logo/Logo';
import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';

function App() {
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [boxes, setBoxes] = useState([]);

  const onInputChange = (event) => {
    setInput(event.target.value);
  };

  const calculateFaceLocation = (data) => {
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    const boxes = [];
    data.forEach((box, index) => {
      boxes.push({
        id: box.id,
        leftCol: box.BBox.leftCol * width,
        topRow: box.BBox.topRow * height,
        rightCol: width - box.BBox.rightCol * width,
        bottomRow: height - box.BBox.bottomRow * height,
      });
    });
    return boxes;
  };

  const displayFaceBoxes = (boxes) => {
    setBoxes(boxes);
  };

  const onButtonSubmit = async () => {
    setImageUrl(input);
    const result = await clarifaiApi()(input);
    displayFaceBoxes(await calculateFaceLocation(result));
  };

  return (
    <div className="App">
      <ParticlesBg color="#ff0000" num={200} type="cobweb" bg={true} />
      <Navigation />
      <Logo />
      <Rank />
      <ImageLinkForm
        onInputChange={onInputChange}
        onButtonSubmit={onButtonSubmit}
      />
      <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
    </div>
  );
}

export default App;
