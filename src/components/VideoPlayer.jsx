import { useRef, useState } from 'react';
import './css/VideoPlayer.css';
import { FaPlayCircle, FaPauseCircle } from 'react-icons/fa';

export default function VideoPlayer({ src, className }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      console.log('No video ref');
    }
  };

  return (
    <div className='video_player'>
      <video
        className={className}
        ref={videoRef}
        onClick={togglePlay}
        src={src}
        controls
      />
      {/* {!isPlaying ? (
        <FaPlayCircle className='play_pause' onClick={togglePlay} />
      ) : (
        <FaPauseCircle className='play_pause' onClick={togglePlay} />
      )} */}
    </div>
  );
}
