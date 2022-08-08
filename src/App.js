import React,{useRef, useEffect, useState} from "react";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import './App.css';
// facemesh- displaying all the detected points
//import { drawMesh } from "./utilities";
import spectacles from './glasses.png'
import Spinner from "./Component/Spinner";



function App(){

  const [isLoading, setIsLoading] = useState(false);
  const videoRef= useRef(null);
  const photoRef = useRef(null);

  const [hasPhoto, setHasPhoto] = useState(false);

  //running the face landmark detection
  const runFacemesh = async () => {

    const net = await facemesh.load(facemesh.SupportedPackages.mediapipeFacemesh);

      //running the model on the picture
      
      takePhoto(net);
  
  };

  //getting camera input
  const getVideo = () => {
    navigator.mediaDevices.getUserMedia({video : {
      width: 640 , height:480
    }})
    .then(stream =>{
      //displaying the live camera feed on the screen
      let video = videoRef.current;
      video.srcObject = stream;
      video.play();
    })
    .catch(err => {
      console.error(err);
    })
  }

  //take picture, set dimensions and run face landmark detection
  const takePhoto =async(net)=>{
  setIsLoading(true);
    const width = 640;
    const height = 480;

    let video = videoRef.current;
    let photo = photoRef.current;

    photo.width = width;
    photo.height = height;

    //displaying photo taken on screen
    let ctx = photo.getContext('2d');
    ctx.drawImage(video,0,0,width, height);
    setHasPhoto(true);

    //running facemesh
    const face = await net.estimateFaces({input:photo});
    console.log(face);
    
    //For displaying the landmark points, uncomment the below line
    // requestAnimationFrame(()=>{drawMesh(face,ctx)});
    
    //Overlaying the spectacles image on the photo
    requestAnimationFrame(()=>{displayGlasses(face,ctx)});

    function displayGlasses(face,ctx){

      var xc = face[0].annotations.midwayBetweenEyes[0][0];
      var yc = face[0].annotations.midwayBetweenEyes[0][1];

      const image = new Image()
      image.src = spectacles

      image.onload = (()=>{

        var owidth = image.width
        var oheight = image.height

        var gwidth = 1.4*(face[0].annotations.rightEyebrowLower[0][0] - face[0].annotations.leftEyebrowLower[0][0]) // choosing span of eyes as width
        var gheight = gwidth/owidth*oheight // maintaining aspect ratio
        
        var angle = Math.atan((face[0].annotations.rightEyebrowLower[0][1] - face[0].annotations.leftEyebrowLower[0][1])/(face[0].annotations.rightEyebrowLower[0][0] - face[0].annotations.leftEyebrowLower[0][0]))
        // angle by which head is turned w.r.t x axis
        
        var diffWidth = gwidth/2; // approxiamtely half teh width and length of overlaid glasses
        var diffHeight = gheight/2; // ""
        
        ctx.translate(xc,yc) // translate the canvas to point between eyes
        ctx.rotate(angle) // rotate it to align with face angle
        ctx.translate(-diffWidth,-diffHeight) // translate the canvas such that w.r.t origin, center of spectacles lies at diffWidth,dissHeight
        ctx.drawImage(image,0,0,gwidth,gheight) // draw image 
        setIsLoading(false);
      })
  }
}
  

  useEffect(()=>{
    getVideo();
   
  },[videoRef])

  return (
    <div className="App">
      <div className="camera">
        <video ref={videoRef}></video>
        <button onClick={runFacemesh} disabled={isLoading}>Take a picture!</button>
      </div>
      <div className={"result" + (hasPhoto ? 'hasPhoto': '')} id='res'>
      {/* <div className='loader-container'> {isLoading ? <Spinner /> : null}</div> */}
        <canvas id='try_on' ref={photoRef}></canvas>

      </div>
      
    </div>
  )

};

export default App;