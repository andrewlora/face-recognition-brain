import ParticlesBg from 'particles-bg';
import React, { useState } from 'react';
import './App.css';
import { clarifaiApi } from './api/clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/Logo/Logo';
import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';
import Register from './components/Register/Register';
import SignIn from './components/SignIn/SignIn';

const initialUser = {
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
  },
};

function App() {
  const [route, setRoute] = useState('signIn');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [user, setUser] = useState(initialUser);

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

  const onRouteChange = (route) => {
    if (route === 'signOut') {
      setIsSignedIn(false);
      setUser(initialUser);
      setImageUrl('');
      setInput('');
      setBoxes([]);
    } else if (route === 'home') {
      setIsSignedIn(true);
    }
    setRoute(route);
  };

  const loadUser = (data) => {
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined,
    });
  };

  const displayFaceBoxes = (boxes) => {
    setBoxes(boxes);
  };

  const onButtonSubmit = async () => {
    setImageUrl(input);
    const result = await clarifaiApi()(input);
    displayFaceBoxes(await calculateFaceLocation(result));
    fetch('http://localhost:3001/image', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
      }),
    })
      .then((response) => response.json())
      .then((user) => {
        if (user.id) {
          loadUser(user);
        }
      });
  };

  return (
    <div className="App">
      <ParticlesBg color="#ff0000" num={200} type="cobweb" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === 'home' ? (
        <div>
          <Logo />
          <Rank name={user.name} entries={user.entries} />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          />
          <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
        </div>
      ) : route === 'signIn' ? (
        <SignIn loadUser={loadUser} onRouteChange={onRouteChange} />
      ) : (
        <Register loadUser={loadUser} onRouteChange={onRouteChange} />
      )}
    </div>
  );
}

export default App;
