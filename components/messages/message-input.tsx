import { MutableRefObject, useEffect, useState } from "react";
import { buttonOptions } from "../../constants/buttonOptions";
import { useChatsContext } from "../../contexts/chats-context";
import "../../app/css/additional-styles/toolTip.css"

export const MessageInput = ({
  messageInput,
  setMessageInput,
  handleSubmission,
  inputDisabled,
  InputRef,
  messages,
  quotedTexts,
  currentQuestionNumber,
  // audioRef,
  isPlaying,
  analyserRef
}: {
  messageInput: string;
  setMessageInput: (messageInput: string) => void;
  handleSubmission: (messageInput: string) => void;
  inputDisabled: boolean;
  InputRef: React.RefObject<HTMLTextAreaElement>;
  messages: any[];
  quotedTexts: any[];
  currentQuestionNumber: number;
  // audioRef: any,
  isPlaying: boolean,
  analyserRef: MutableRefObject<AnalyserNode | null>
}) => {
  const { activeButtons } = useChatsContext();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [barHeights, setBarHeights] = useState(new Array(38).fill(4));
  // const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  // const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const [style, setStyles] = useState({})

  const adjustTextareaHeight = () => {
    if (InputRef?.current) {
      InputRef.current.style.height = "auto";
      InputRef.current.style.height = `${InputRef.current.scrollHeight}px`;
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (messageInput !== "" && !inputDisabled) {
        handleSubmission(messageInput);
        setMessageInput("");
      }
    }
  };

  // Helper function to get supported MIME type
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/ogg;codecs=opus'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    throw new Error('No supported MIME types found');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in this browser');
      }
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      setMediaRecorder(recorder);
      setIsRecording(true);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: mimeType });
        await handleAudioSubmission(audioBlob);
      };

      recorder.start(1000); // Collect data in 1-second chunks
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert('Unable to access microphone. Please make sure you have granted permission and are using a supported browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setIsRecording(false);
    }
  };

  const handleAudioSubmission = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      const fileName = `audio.${audioBlob.type.split('/')[1]}`;

      formData.append("file", audioBlob, fileName);
      formData.append("model", "whisper-1");

      const response = await fetch("/api/upload-audio", {
        method: "POST",
        headers: {
          'Priority': 'high',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      if (data.text) {
        setMessageInput(data.text)
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert('Failed to process audio. Please try again.');
    }
  };

  useEffect(() => {
    if (messageInput.length <= 0) {
      adjustTextareaHeight();
    }
  }, [messageInput]);

  // useEffect(() => {
  //   if (!audioRef.current) return;

  //   const handlePlay = async () => {
  //     if (!audioContext) {
  //       const newAudioContext = new AudioContext();
  //       const newAnalyser = newAudioContext.createAnalyser();
  //       const source = newAudioContext.createMediaElementSource(audioRef.current!);

  //       source.connect(newAnalyser);
  //       newAnalyser.connect(newAudioContext.destination);
  //       newAnalyser.fftSize = 32;

  //       setAudioContext(newAudioContext);
  //       setAudioAnalyser(newAnalyser);
  //     }
  //   };

  //   audioRef.current.addEventListener('play', handlePlay);

  //   return () => {
  //     if (audioRef.current) {
  //       audioRef.current.removeEventListener('play', handlePlay);
  //     }
  //   };
  // }, [audioRef, audioContext]);

  // To start the sound wave animation when the audio starts
  // useEffect(() => {
  //   if (!audioAnalyser || !isPlaying) return;

  //   const dataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
  //   const updateHeights = () => {
  //     audioAnalyser.getByteFrequencyData(dataArray);
  //     const newHeights = Array(38).fill(0).map((_, i) => {
  //       const dataIndex = Math.floor((i / 38) * (dataArray.length - 8));
  //       if (i < 8) {
  //         return Math.max(4, Math.min(10, (dataArray[dataIndex] / 255) * 20));
  //       }
  //       // Last 8 bars - smaller height changes
  //       else if (i >= 30) {
  //         return Math.max(4, Math.min(10, (dataArray[dataIndex] / 255) * 20));
  //       }
  //       // Middle section - larger height changes
  //       else {
  //         return Math.max(4, (dataArray[dataIndex] / 255) * 38);
  //       }
  //     });
  //     setBarHeights(newHeights);

  //     if (isPlaying) {
  //       requestAnimationFrame(updateHeights);
  //     }
  //   };

  //   updateHeights();

  //   return () => {
  //     if (!isPlaying) {
  //       setBarHeights(new Array(38).fill(4));
  //     }
  //   };
  // }, [audioAnalyser, isPlaying]);

  useEffect(() => {
    if (!analyserRef || !isPlaying) return;

    if (analyserRef.current && isPlaying) {
      const dataArray = new Uint8Array(analyserRef.current?.frequencyBinCount);

      const updateHeights = () => {
        analyserRef.current?.getByteFrequencyData(dataArray);

        const newHeights = Array(38).fill(0).map((_, i) => {
          const dataIndex = Math.floor((i / 38) * (dataArray.length - 8));
          if (i < 8) {
            return Math.max(4, Math.min(10, (dataArray[dataIndex] / 255) * 20));
          }
          // Last 8 bars - smaller height changes
          else if (i >= 30) {
            return Math.max(4, Math.min(10, (dataArray[dataIndex] / 255) * 20));
          }
          // Middle section - larger height changes
          else {
            return Math.max(4, (dataArray[dataIndex] / 255) * 38);
          }
        });
        setBarHeights(newHeights);

        if (isPlaying) {
          requestAnimationFrame(updateHeights);
        }
      };

      updateHeights();
    } else {
      setBarHeights(new Array(38).fill(4));
    }

  }, [isPlaying]);

  // To start the yellow glowing effect behid the microphone icon based on the intexity of the voulume
  useEffect(() => {
    if (!mediaRecorder || !isRecording) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(mediaRecorder.stream);

    source.connect(analyser);
    analyser.fftSize = 32;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateBackgroundLight = () => {
      analyser.getByteFrequencyData(dataArray);
      // Calculate average volume level from frequency data
      const averageVolume = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      const brightness = Math.min(100, (averageVolume / 255) * 100);
      // Set background glow intensity based on volume
      const glowIntensity = Math.max(20, brightness);
      const backgroundColor = `rgba(255, 165, 0, ${brightness / 100})`;
      const boxShadow = `0 0 ${glowIntensity}px rgba(255, 193, 7, ${brightness / 100})`;

      setStyles({
        backgroundColor,
        boxShadow
      });

      if (isRecording) {
        requestAnimationFrame(updateBackgroundLight);
      }
    };

    updateBackgroundLight();

    return () => {
      source.disconnect();
      setStyles({
        backgroundColor: 'transparent',
        boxShadow: 'none'
      });
    };
  }, [isRecording, mediaRecorder]);

  return (
    <div className="sticky bottom-0 w-full ">
      <div className=" bg-[#c0c0c0] m-auto sm:w-[60%] lg:w-[30%] w-[90%] pt-1 pb-2 rounded-[3px] mb-2 ">
        <div className="buttonContainer">
          <div className="button">
            <object data="/svg/info.svg" width='22px' height='22px'></object>
            <div className="tooltip dark:text-indigo-200 bg-indigo-200">
              <small className="text-[#ffa500] flex justify-center">How the Audio Feature and Microphone Input Work</small>
              <ul style={{ margin: 0, paddingLeft: "15px", fontSize: '11.5px', listStyleType: 'lower-alpha' }}>
                <li>
                  To input your response, click on the microphone icon. When you are done speaking,
                  unclick the microphone icon and your response will be displayed in the input box.
                  <ul>
                    <li>Note: You can check to make sure the microphone is working by checking to see if the background of the
                      microphone icon turns to black and a yellow glow behid the icon will be shown when you start recording.
                    </li>
                  </ul>
                </li>
                <li>You can make a change to what you said, or change some or all of what you said,
                  by clicking on the input box and typing in your change.
                </li>
                <li>When you are ok with your response, you can hit the Send button.</li>
                <li>If you are using on a safari ios devices, give the system an access to hear the AI response.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center gap-2">
          {/* Speaker icon */}
          <button className={`btn ${isPlaying ? 'bg-black' : 'bg-[#a0a0a0]'} text-white rounded-full w-10 h-10 flex items-center justify-center mr-2`}>
            <object data="/svg/speaker.svg" width='20px' height='20px'></object>
          </button>
          {/* <audio ref={audioRef} controls style={{ display: "none" }}>
            Your browser does not support the audio element.
          </audio> */}

          {/* Sound wave animation */}
          <div className="flex items-center gap-1 w-48 h-8">
            {isPlaying && (
              <>
                {barHeights.map((height, i) => {
                  return (
                    <div
                      key={i}
                      className=" bg-black w-[1px]"
                      style={{
                        height: `${height}px`,
                        transition: 'height 100ms ease'
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
          <div style={style} className="p-2 rounded-full">
            {/* Microphone button */}
            <button
              className={`btn ${isRecording ? 'bg-black' : 'bg-[#a0a0a0] hover:bg-[#808080]'} text-white rounded-full w-10 h-10 flex items-center justify-center`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={inputDisabled}
            >
              {isRecording ? (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#ffa500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>)}
            </button>
          </div>
        </div>
      </div>
      {messages.length > 2 && (
        <div className="flex flex-wrap gap-2 py-2 px-4 bg-transparent">
          {activeButtons.map((key) => (
            <button
              key={key}
              className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
              onClick={() =>
                handleSubmission(
                  buttonOptions[key as keyof typeof buttonOptions]
                )
              }
              disabled={inputDisabled}
            >
              {buttonOptions[key as keyof typeof buttonOptions]}
            </button>
          ))}
          {((quotedTexts.includes("thought starter") && messages.length > 4) ||
            (currentQuestionNumber <= 14 && currentQuestionNumber >= 1)) && (
              <button
                className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
                onClick={() => handleSubmission("Thought starter")}
                disabled={inputDisabled}
              >
                Thought starter
              </button>
            )}
        </div>
      )}
      <div className="flex min-h-16 items-center justify-between border-t border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900 sm:px-6 md:px-5 py-2">
        {/* Message input */}
        <div className="flex grow">
          <div className="mr-3 grow">
            <label htmlFor="message-input" className="sr-only">
              Type a message
            </label>
            <textarea
              id="message-input"
              className="form-textarea w-full bg-slate-100 dark:bg-slate-800 border-transparent dark:border-transparent focus:bg-white dark:focus:bg-slate-800 placeholder-slate-500 resize-none overflow-y-auto scrollbar-hide"
              placeholder="Ask something"
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              disabled={inputDisabled}
              ref={InputRef}
              rows={1}
              style={{ minHeight: "2.5rem", maxHeight: "10rem" }}
            />
          </div>
          <div className="flex">
            <button
              onClick={() => {
                handleSubmission(messageInput);
                setMessageInput("");
                console.log("messageInput", messageInput);
              }}
              disabled={messageInput === "" || inputDisabled}
              type="submit"
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white whitespace-nowrap h-10"
            >
              Send -&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
