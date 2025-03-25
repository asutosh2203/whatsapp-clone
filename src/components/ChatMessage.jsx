import React, { useState } from 'react';
import { IoDocument, IoCloudDownload } from 'react-icons/io5';

const ChatMessage = ({ message, index, ref, className }) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const formatText = (text) => {
    return text.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
      part.match(/https?:\/\//) ? (
        <a key={index} href={part} target='_blank' rel='noopener noreferrer'>
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  const getFilenameAndFormat = (fileUrl) => {
    const decodedURL = decodeURIComponent(fileUrl);
    const fileName = decodedURL.split('/').pop().split('?')[0];

    // Remove leading numbers and underscore
    const cleanFileName = fileName.replace(/^\d+_/, '');

    const format =
      cleanFileName.split('.')[cleanFileName.split('.').length - 1];

    return [cleanFileName, format];
  };

  const downloadMedia = async (url, filename, setProgress) => {
    try {
      const response = await fetch(url);
      const reader = response.body.getReader();
      const contentLength = +response.headers.get('Content-Length');

      let receivedLength = 0;
      let chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;
        setProgress(Math.round((receivedLength / contentLength) * 100));
      }

      const blob = new Blob(chunks);
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
      setProgress(100); // Completed
    } catch (error) {
      console.error('Download failed', error);
    }
  };
  return (
    <div
      key={index}
      ref={ref}
      className={className}
      style={{ display: message.mediaUrl?.length > 0 && 'block' }}
    >
      {/* <p className='chat_name'>{`${
                  message.senderId === user.uid ? '' : message.name
                }`}</p> */}

      {message.mediaUrl?.length > 0 &&
        (message.mediaType === 'image' ? (
          <div className='message_media'>
            <img src={message.mediaUrl} alt='media' />
          </div>
        ) : message.mediaType === 'video' ? (
          <div className='message_media'>
            <video src={message.mediaUrl} controls />
          </div>
        ) : (
          <div className='other_mediatype'>
            <IoDocument size={40} color='white' />
            <div>
              <p style={{ fontWeight: 'bolder' }}>
                {getFilenameAndFormat(message.mediaUrl)[0]}
              </p>
              <span style={{ textTransform: 'uppercase' }}>
                {getFilenameAndFormat(message.mediaUrl)[1]}{' '}
              </span>
              <span>File</span>
            </div>
          </div>
        ))}
      {message.mediaUrl?.length > 0 && (
        <div>
          <button
            className='download-btn'
            onClick={() => {
              downloadMedia(
                message.mediaUrl,
                getFilenameAndFormat(message.mediaUrl)[0],
                setDownloadProgress
              );
            }}
          >
            Download
            <IoCloudDownload />
          </button>
          {downloadProgress > 0 && (
            <progress max={100} value={downloadProgress} />
          )}
        </div>
      )}
      <div className='message_content'>
        <p>{formatText(message.message)}</p>

        {/* <p>{message.message}</p> */}
        <p className='chat_timeStamp'>
          {message.timeStamp &&
            new Date(message.timeStamp?.toDate())
              .toLocaleTimeString()
              .split(':')[0]}
          :
          {message.timeStamp &&
            new Date(message.timeStamp?.toDate())
              .toLocaleTimeString()
              .split(':')[1]}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
