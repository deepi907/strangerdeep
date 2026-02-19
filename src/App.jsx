import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import "./index.css";

export default function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const frameRef = useRef(null); // FRAME WRAPPER FOR CAPTURING

  const [nightMode, setNightMode] = useState(false);
  const [showSongBox, setShowSongBox] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
const [audioPlayer, setAudioPlayer] = useState(null);
 const filters = [
    "none",
    "sepia(65%) contrast(90%) brightness(110%) saturate(130%)", // Vintage
    "grayscale(100%)", // B&W
    "contrast(140%) brightness(120%)", // HDR
    "hue-rotate(45deg) saturate(180%)", // Color pop
    "blur(2px) brightness(105%)", // Soft dreamy
  ];
   const [filterIndex, setFilterIndex] = useState(0);

  const applyNextFilter = () => {
    setFilterIndex((prev) => (prev + 1) % filters.length);
  };

  // DRAW RECTANGLES
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const rectW = 450;
    const rectH = 450;
    const outerX = 330;
    const outerY = 70;
    const padding = 30;
    const innerW = rectW - padding * 2;
    const innerH = 160;

    ctx.lineWidth = 4;
    ctx.strokeStyle = "red";

    // Outer Frame
    ctx.strokeRect(outerX, outerY, rectW, rectH);

    // Top inner box
    ctx.strokeRect(outerX + padding, outerY + padding, innerW, innerH);

    // Bottom inner box
    ctx.strokeRect(outerX + padding, outerY + padding + innerH + 80, innerW, innerH);
  }, [nightMode]);

  // SONG AUDIO
  useEffect(() => {
    audioRef.current = new Audio("/strangerthings_remix.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.loop = true;
  }, []);

  const toggleNightMode = () => {
    setNightMode(prev => {
      const newMode = !prev;

      if (newMode) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      return newMode;
    });
  };

  // CAMERA
  useEffect(() => {
    async function startCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.log("Camera Error:", err);
      }
    }
    startCam();
  }, []);
const captureFullFrame = async () => {
  const frame = frameRef.current;
  if (!frame || !videoRef.current) return;

  // First capture UI, background, stickers, frames
  const baseCanvas = await html2canvas(frame, {
    useCORS: true,
    scale: 2,
    logging: false,
  });

  const video = videoRef.current;

  // Now draw webcam manually WITH filter
  const ctx = baseCanvas.getContext("2d");
  ctx.filter = filters[filterIndex];

  // Camera box same as CSS positioning
  const camX = 360;
  const camY = 100;
  const camW = 390;
  const camH = 160;

  ctx.drawImage(video, camX, camY, camW, camH);

  // Download final result
  const image = baseCanvas.toDataURL("image/jpeg", 0.9);
  const link = document.createElement("a");
  link.href = image;
  link.download = "full_frame_capture.jpg";
  link.click();
};

const playSong = (songName, file) => {

  // If same song → toggle play/pause
  if (currentSong === songName) {
    if (audioPlayer) {
      if (audioPlayer.paused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    }
    return;
  }

  // If new song → stop old, play new
  if (audioPlayer) {
    audioPlayer.pause();
  }

  const newAudio = new Audio(file);
  newAudio.play();

  setAudioPlayer(newAudio);
  setCurrentSong(songName);
};


  return (
    <>
      {/* Everything inside this wrapper gets captured EXACTLY */}
      <section className="section-wrapper" ref={frameRef}>

        {/* NAVBAR */}
        <div className="navbar">
          <button>Home</button>
          <button onClick={() => setShowSongBox(!showSongBox)}>Song</button>
          <button>Frames</button>
          <button>Mode</button>
        </div>

{showSongBox && (
  <div className="song-box">
        <video 
      className="song-box-video"
      src="/WhatsApp Video 2025-11-24 at 7.56.20 PM.mp4" 
      autoPlay 
      loop 
      muted 
      playsInline
    />


    <div className="small-box">
      <img src="/max.png" />
    </div>

    {/* SECOND SMALL BOX (SONG LIST) */}
      <div className="song-list-vertical">
     <div
    className={`song-item-box ${currentSong === "Running up that hill" ? "playing" : ""}`}
    onClick={() => playSong("Running up that hill", "/running_up_that_hill (2).mp3")}
  >
    Running up that hill
  </div>
        <div
    className={`song-item-box ${currentSong === "Eddie munson shred" ? "playing" : ""}`}
    onClick={() => playSong("Eddie munson shred", "/eddie_munson_shred.mp3")}
  >
    Eddie munson shred
  </div>
         <div
    className={`song-item-box ${currentSong === "strangerthings remix" ? "playing" : ""}`}
    onClick={() => playSong("strangerthings remix", "/strangerthings_remix.mp3")}
  >
   strangerthings remix
  </div>
      <div className="song-item-box">Song 4</div>
    </div>

  </div>
)}



        {/* DAY/NIGHT BUTTON */}
        <button
          className="day-night-btn"
          style={{
            background: nightMode ? "black" : "white",
            color: nightMode ? "white" : "black",
          }}
          onClick={toggleNightMode}
        >
          {nightMode ? "🌞 Day" : "🌙 Night"}
        </button>

        {/* BACKGROUND GIF */}
        <img src={nightMode ? "/night.gif" : "/bg.gif"} className="background-gif" />

        {/* CANVAS FRAME DRAW */}
        <canvas ref={canvasRef} className="canvas"></canvas>



        {/* CAMERA PREVIEW */}
        <div className="photobooth-box">
          <video ref={videoRef} autoPlay muted playsInline className="camera-preview" style={{ filter: filters[filterIndex] }} />
        </div>
        
 {/* FILTER BUTTON */}
        <button className="filter-btn" onClick={applyNextFilter}>
          Change Filter
        </button>
        
        {/* CAPTURE BUTTON */}
        <div className="photobooth-controls">
          <button className="capture-btn" onClick={captureFullFrame}>
            Capture
          </button>
        </div>

        {/* STICKER */}
        <img src="./sticker.jpg" className="sticker" />
      </section>

      {/* FOOTER (NOT CAPTURED) */}
      <footer className="footer-section">
        <div className="footer-cards">
          <div className="footer-card">
            <img src="./card1.jpg" className="footer-img" />
            <div className="footer-content">
              <p className="footer-date">SUNDAY, 6 OCTOBER 2024</p>
              <h3 className="footer-title">PERTH RECLINK COMMUNITY CUP</h3>
              <p className="footer-location">LEEDERVILLE OVAL, LEEDERVILLE</p>
            </div>
          </div>

          <div className="footer-card">
            <img src="./card2.jpg" className="footer-img" />
            <div className="footer-content">
              <p className="footer-date">SUNDAY, 13 OCTOBER 2024</p>
              <h3 className="footer-title">45 YEARS OF SPOONFUL OF BLUES</h3>
              <p className="footer-location">CLANCY'S FISH PUB, FREMANTLE</p>
            </div>
          </div>

          <div className="footer-card">
            <img src="./card3.jpg" className="footer-img" />
            <div className="footer-content">
              <h3 className="footer-title">YOUR LOCAL GIG GUIDE</h3>
              <p className="footer-location">IN PARTNERSHIP WITH LOCALISTA</p>
            </div>
          </div>
        </div>

        <p className="footer-credit">Last Made By DEEPIKA © 2025</p>
      </footer>
    </>
  );
}
