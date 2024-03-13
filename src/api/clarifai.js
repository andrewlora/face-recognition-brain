function clarifaiApi() {
  // /////////////////////////////////////////////////////////////////////////////////////////////////
  // In this section, we set the user authentication, user and app ID, model details, and the URL
  // of the image we want as an input. Change these strings to run your own example.
  // ////////////////////////////////////////////////////////////////////////////////////////////////

  // Your PAT (Personal Access Token) can be found in the portal under Authentification
  const PAT = 'd82cc7d163f84e968c11a75a7084a440';
  // Specify the correct user_id/app_id pairings
  // Since you're making inferences outside your app's scope
  const USER_ID = 'andreslora';
  const APP_ID = 'my-first-application-v4rhco';
  // Change these to whatever model and image URL you want to use
  const MODEL_ID = 'face-detection';
  const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
  // const IMAGE_URL = 'https://samples.clarifai.com/face-det.jpg';

  // /////////////////////////////////////////////////////////////////////////////////
  // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
  // /////////////////////////////////////////////////////////////////////////////////

  const getRequestOptions = function (imageUrl) {
    const raw = JSON.stringify({
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      inputs: [
        {
          data: {
            image: {
              url: imageUrl,
              // "base64": IMAGE_BYTES_STRING
            },
          },
        },
      ],
    });
    return {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Key ' + PAT,
      },
      body: raw,
    };
  };

  const predictImageByUrl = function (imageUrl) {
    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    const requestOptions = getRequestOptions(imageUrl);
    const image = fetch(
      'https://api.clarifai.com/v2/models/' +
        MODEL_ID +
        '/versions/' +
        MODEL_VERSION_ID +
        '/outputs',
      requestOptions,
    )
      .then((response) => response.json())
      .then((result) => {
        const regions = result.outputs[0].data.regions;
        const data = [];
        regions.forEach((region) => {
          // Accessing and rounding the bounding box values
          const boundingBox = region.region_info.bounding_box;
          const topRow = boundingBox.top_row.toFixed(3);
          const leftCol = boundingBox.left_col.toFixed(3);
          const bottomRow = boundingBox.bottom_row.toFixed(3);
          const rightCol = boundingBox.right_col.toFixed(3);
          region.data.concepts.forEach((concept) => {
            // Accessing and rounding the concept value
            const name = concept.name;
            const value = concept.value.toFixed(4);
            data.push({
              id: region.id,
              [name]: value,
              BBox: {
                topRow,
                leftCol,
                bottomRow,
                rightCol,
              },
            });
          });
        });
        return data;
      })
      .catch((error) => console.log('error', error));
    return image;
  };
  return predictImageByUrl;
}

module.exports = {
  clarifaiApi,
};
