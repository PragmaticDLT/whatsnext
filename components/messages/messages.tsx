"use client";

import { useEffect, useRef, useState } from "react";
import { generateId } from "ai";
import { AssistantStream } from "openai/lib/AssistantStream";
import { useChatsContext } from "../../contexts/chats-context";
import { buttonOptions } from "../../constants/buttonOptions";
import { MessageInput } from "./message-input";
import { MessageBody } from "./message-body";
import TestPanel from "./test-panel";
import { ElevenLabsClient } from 'elevenlabs'

export default function MessagesBody({
  setShowConfetti,
}: {
  setShowConfetti: (show: boolean) => void;
}) {
  const {
    chats,
    setChats,
    chatSelected,
    assistantId,
    setAssistantId,
    currentQuestionNumber,
    setCurrentQuestionNumber,
    quotedTexts,
    setQuotedTexts,
    setActiveButtons,
  } = useChatsContext();

  const [messageInput, setMessageInput] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [threadId, setThreadId] = useState("");

  const [isRefresh, setIsRefresh] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const InputRef = useRef<HTMLTextAreaElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<any>(null);

  // For safari browser to give permission for playing the audio
  const userAgent = typeof window !== 'undefined' ? navigator.userAgent : ''; // To identify users browser
  const [hasUserInteracted, setHasUserInteracted] = useState(() => {
    // Check if user has previously interacted
    return localStorage.getItem('audioPermissionGranted') === 'true'
  });
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const [startMessage, setStartMessage] = useState("");

  const [tempAppendMessage, setTempAppendMessage] = useState<any>([]);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode[] | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  useEffect(() => {
    !chatSelected
      ? setMessages([
        {
          id: generateId(),
          status: "first.bot.message",
          text: "Welcome!!!",
          role: "assistant",
        },
      ])
      : setMessages(chatSelected.messages);
  }, [chatSelected]);

  const setFunctionalities = () => {
    if (chatSelected) {
      setMessages(chatSelected.messages);
      setThreadId(chatSelected.threadId);
      checkForLastQuestionNumber(
        chatSelected.messages[chatSelected.messages.length - 1].text
      );
      extractQuotedTexts(
        chatSelected.messages[chatSelected.messages.length - 1].text
      );
    }
  };

  useEffect(() => {
    setFunctionalities();
  }, [chatSelected]);

  useEffect(() => {
    const newActiveButtons = Object.keys(buttonOptions).filter((key) =>
      quotedTexts.includes(key.toLowerCase())
    );
    setActiveButtons(newActiveButtons);
  }, [quotedTexts]);

  const handleError = async (error: string, type: string) => {
    const response = await fetch(`/api/error`, {
      method: "POST",
      body: JSON.stringify({
        error: error,
        type: type,
      }),
    });
    console.log(response);
  };

  // const client = new ElevenLabsClient({ apiKey: "sk_b54400f5fc18c05b0bf7e5f2fee109f524f0f3d24b922258" });

  // const handleGenerateAudio = async (message: string, userInteraction: boolean) => {
  //   setIsPlaying(false);
  //   // To append AI responde to the chat on safari browser when users give initial permission for the audio
  //   if (userInteraction) {
  //     appendToLastMessage(message)
  //   }
  //   try {
  //     // Start preloading audio while the API call is in progress
  //     const audioElement = audioRef.current as HTMLAudioElement | null;
  //     if (audioElement) {
  //       audioElement.preload = "auto";
  //       audioElement.pause();
  //       audioElement.currentTime = 0;
  //     }

  //     const res = await client.textToSpeech.streamWithTimestamps(
  //       "JBFqnCBsd6RMkjVDRZzb",
  //       {
  //         output_format: "mp3_44100_128",
  //         text: message,
  //         model_id: "eleven_multilingual_v2",
  //       }
  //     )
  //     const audioChunks = [];

  //     for await (const item of res) {
  //       const byteCharacters = atob(item?.audio_base64); // Decode Base64 string to binary data
  //       for (let i = 0; i < byteCharacters.length; i += 1024) {
  //         const slice = byteCharacters.slice(i, i + 1024);
  //         const byteNumbers = new Array(slice.length).fill(null).map((_, idx) => slice.charCodeAt(idx));
  //         audioChunks.push(new Uint8Array(byteNumbers));
  //       }
  //     }
  //     const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
  //     const audioUrl = URL.createObjectURL(audioBlob);

  //     if (audioElement) {
  //       audioElement.src = audioUrl;

  //       // Add event listeners to handle playback state
  //       audioElement.onplay = () => setIsPlaying(true);
  //       audioElement.onpause = () => setIsPlaying(false);
  //       audioElement.onended = () => setIsPlaying(false);

  //       try {
  //         await audioElement.play();
  //       } catch (playError) {
  //         console.error("Error playing audio:", playError);
  //         // Handle autoplay restrictions
  //         if (playError.name === 'NotAllowedError') {
  //           console.log('Audio autoplay was prevented. User interaction required.');
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error generating audio:", error);
  //   }
  // };

  const MAX_CHUNK_LENGTH = 50; // Maximum characters per chunk

  const splitTextIntoChunks = (text: string, maxLength: number): string[] => {
    const chunks: string[] = [];
    let currentChunk = '';

    // Split by sentences to maintain natural breaks
    const sentences = text.split(/(?<=[.!?:]|\n)/).filter(s => s.trim());

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  };

  const generateSingleAudioChunk = async (message: string): Promise<Blob> => {
    const res = await fetch("/api/read-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        response: message
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch audio");
    }

    const reader = res.body?.getReader();
    const audioChunks = [];

    if (!reader) {
      throw new Error("Unable to read audio stream");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      audioChunks.push(value);
    }

    return new Blob(audioChunks, { type: "audio/mpeg" });
  };

  const handleGenerateAudio = async (message: string, userInteraction: boolean) => {
    setIsPlaying(false);

    if (userInteraction) {
      appendToLastMessage(message);
    }

    try {
      const audioElement = audioRef.current as HTMLAudioElement | null;
      if (!audioElement) return;

      // Split the message into chunks
      const textChunks = splitTextIntoChunks(message, MAX_CHUNK_LENGTH);

      // Start generating all audio chunks in parallel
      const audioPromises = textChunks.map(chunk => generateSingleAudioChunk(chunk));

      // Play chunks sequentially while others are being generated
      for (let i = 0; i < textChunks.length; i++) {
        // Reset audio element
        audioElement.preload = "auto";
        audioElement.pause();
        audioElement.currentTime = 0;

        // Wait for the current chunk's audio to be generated
        const audioBlob = await audioPromises[i];
        const audioUrl = URL.createObjectURL(audioBlob);

        // Set up audio element
        audioElement.src = audioUrl;

        // Set up event listeners
        audioElement.onplay = () => setIsPlaying(true);
        audioElement.onpause = () => setIsPlaying(false);
        audioElement.onended = () => setIsPlaying(false);

        // Play current chunk and wait for it to finish
        try {
          await audioElement.play();
          await new Promise(resolve => {
            audioElement.onended = () => {
              URL.revokeObjectURL(audioUrl); // Clean up the URL
              resolve(null);
            };
          });
        } catch (playError) {
          console.error("Error playing audio:", playError);
          if (playError.name === 'NotAllowedError') {
            console.log('Audio autoplay was prevented. User interaction required.');
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error generating audio:", error);
    }
  };


  // const handleGenerateAudio = async (message: string, userInteraction: boolean) => {
  //   setIsPlaying(false);
  //   // To append AI responde to the chat on safari browser when users give initial permission for the audio
  //   if (userInteraction) {
  //     appendToLastMessage(message)
  //   }
  //   try {
  //     // Start preloading audio while the API call is in progress
  //     const audioElement = audioRef.current as HTMLAudioElement | null;
  //     if (audioElement) {
  //       audioElement.preload = "auto";
  //       audioElement.pause();
  //       audioElement.currentTime = 0;
  //     }

  //     const res = await fetch("/api/read-audio", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         response: message
  //       }),
  //     });

  //     if (!res.ok) {
  //       throw new Error("Failed to fetch audio");
  //     }

  //     const reader = res.body?.getReader();
  //     const audioChunks = [];

  //     if (!reader) {
  //       throw new Error("Unable to read audio stream");
  //     }
  //     console.log(reader, "reader")

  //     // Read audio stream chunks
  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) break;
  //       audioChunks.push(value);
  //     }
  //     console.log(audioChunks, "audioChunks")

  //     const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
  //     const audioUrl = URL.createObjectURL(audioBlob);

  //     if (audioElement) {
  //       audioElement.src = audioUrl;

  //       // Add event listeners to handle playback state
  //       audioElement.onplay = () => setIsPlaying(true);
  //       audioElement.onpause = () => setIsPlaying(false);
  //       audioElement.onended = () => setIsPlaying(false);

  //       try {
  //         await audioElement.play();
  //       } catch (playError) {
  //         console.error("Error playing audio:", playError);
  //         // Handle autoplay restrictions
  //         if (playError.name === 'NotAllowedError') {
  //           console.log('Audio autoplay was prevented. User interaction required.');
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error generating audio:", error);
  //   }
  // };

  const handleSpeak = async (message: string) => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        stopAudioVisualization();
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      // if (desiredVoice) {
      //   utterance.voice = desiredVoice;
      // }
      utterance.onstart = () => {
        setIsPlaying(true);
        startAudioVisualization();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        stopAudioVisualization();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  const startAudioVisualization = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current) {
      const audioContext = audioContextRef.current;

      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 32;
      }

      if (!gainNodeRef.current) {
        gainNodeRef.current = audioContext.createGain();
        // Set a lower gain value to prevent loud audio
        gainNodeRef.current.gain.value = 0.1;
      }

      // Create multiple oscillators for a richer wave effect
      const frequencies = [40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140];
      oscillatorRef.current = frequencies.map(freq => {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);

        // Add frequency modulation for wave-like effect
        const modFreq = audioContext.currentTime;
        osc.frequency.setValueCurveAtTime(
          [freq - 10, freq + 10, freq - 10, freq + 10, freq - 10, freq + 10, freq - 10, freq + 10, freq - 10, freq + 10, freq - 10],
          modFreq,
          1
        );

        osc.connect(gainNodeRef.current!);
        osc.start();
        return osc;
      });

      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);

      // Animate the gain for wave effect
      const now = audioContext.currentTime;
      gainNodeRef.current.gain.setValueCurveAtTime(
        [0.1, 0.2, 0.1, 0.15, 0.1],
        now,
        1
      );
    }
  };

  const stopAudioVisualization = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.forEach(osc => {
        osc.stop();
        osc.disconnect();
      });
      oscillatorRef.current = null;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;

  };

  // const sendMessage = async (
  //   text: string,
  //   assistantIdPreview: string | null
  // ) => {
  //   try {
  //     const response = await fetch(
  //       `/api/assistants/threads/${threadId}/messages`,
  //       {
  //         method: "POST",
  //         body: JSON.stringify({
  //           content: text,
  //           assistant_id: assistantIdPreview || assistantId,
  //           isRefresh,
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       setIsRefresh(false);
  //       throw new Error("Failed to send message");
  //     }

  //     setIsRefresh(false);

  //     // Parse the multipart/mixed response
  //     const boundary = response.headers
  //       .get("Content-Type")
  //       ?.split("boundary=")[1];
  //     if (!boundary) throw new Error("Boundary not found in response headers");

  //     const reader = response.body?.getReader();
  //     if (!reader) throw new Error("Failed to read response body");

  //     const decoder = new TextDecoder();
  //     let partialData = "";

  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) break;

  //       // Decode the chunk and process
  //       partialData += decoder.decode(value, { stream: true });

  //       const parts = partialData.split(`--${boundary}`);
  //       partialData = parts.pop() || ""; // Keep incomplete part for next chunk

  //       for (const part of parts) {
  //         if (part.includes("Content-Type: application/json")) {
  //           console.log("parts", part)
  //           // Extract text part
  //           const textMatch = part.match(/{.*}/s);
  //           if (textMatch) {
  //             const json = JSON.parse(textMatch[0]);
  //             // const data = await json.json();

  //             //  console.log("Text response:", data);
  //             // const stream = AssistantStream.fromReadableStream(data);
  //             // handleReadableStream(stream);
  //             // Update messages state with the text response
  //             setMessages((prevMessages) => [
  //               ...prevMessages,
  //               { role: "assistant", text: json.data },
  //             ]);
  //           }
  //         } else if (part.includes("Content-Type: audio/mpeg")) {
  //           const audioElement = audioRef.current as HTMLAudioElement | null;
  //           // Extract audio part
  //           const audioStart = part.indexOf("\r\n\r\n") + 4;
  //           const audioBlob = new Blob([part.slice(audioStart)], {
  //             type: "audio/mpeg",
  //           });

  //           console.log("Audio response received");
  //           const audioUrl = URL.createObjectURL(audioBlob);
  //           console.log("audioURL", audioUrl)
  //           console.log("audioBlob", audioBlob)

  //           if (audioRef.current) {
  //             (audioRef.current as HTMLAudioElement).src = audioUrl;
  //             setIsPlaying(true);
  //             (audioRef.current as HTMLAudioElement).play();
  //           }
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //     handleError(JSON.stringify(error), "failed");
  //     setIsRefresh(false);

  //     setMessages((prevMessages) => {
  //       const newMessages = prevMessages.slice(0, -1);
  //       return [
  //         ...newMessages,
  //         {
  //           role: "assistant",
  //           text: "An error occurred while processing your message. Please try again.",
  //         },
  //       ];
  //     });
  //     setInputDisabled(false);
  //   }
  // };
  const sendMessage = async (
    text: string,
    assistantIdPreview: string | null
  ) => {
    try {
      const response = await fetch(
        `/api/assistants/threads/${threadId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: text,
            assistant_id: assistantIdPreview || assistantId,
            isRefresh,
          }),
        }
      );

      if (!response.ok) {
        setIsRefresh(false);
        throw new Error("Failed to send message");
      }
      setIsRefresh(false);
      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);
    } catch (error) {
      console.error("Error sending message:", error);
      handleError(JSON.stringify(error), "failed");
      setIsRefresh(false);
      setMessages((prevMessages) => {
        // Remove the last assistant message
        const newMessages = prevMessages.slice(0, -1);
        // Add an error message
        return [
          ...newMessages,
          {
            role: "assistant",
            text: "An error occurred while processing your message. Please try again.",
          },
        ];
      });
      setInputDisabled(false);
    }
  };

  const handleRefreshQuestion = (text: string) => {
    setIsRefresh(true);
    setMessageInput(text);

    setMessages((prevMessages) => prevMessages.slice(0, -2));
  };

  const handleSubmission = (question: string) => {
    setQuotedTexts([]);
    if (
      question === "Begin Step 2" ||
      question === "begin step 2" ||
      question === "Begin step 2"
    ) {
      sendMessage(
        question || messageInput,
        process.env.NEXT_PUBLIC_3_ASSISTANT_ID || ""
      );
      changeAssistant3();
    } else if (question.startsWith("i'm the developer") || question.startsWith("i’m the developer")) {
      sendMessage(question || messageInput, null);
      setTestPanelOpen(true);
      localStorage.setItem("testPanel", "true");
    } else {
      sendMessage(question || messageInput, null);
    }
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: question || messageInput },
    ]);
    appendMessage("assistant", "");
    setMessageInput("");
    setInputDisabled(true);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    stream.on("textDelta", handleTextDelta);
    stream.on("event", (event) => {
      if (event.event === "thread.run.failed") {
        console.log("failed:", event);
        if (event.data?.last_error?.code === "rate_limit_exceeded") {
          handleError(JSON.stringify(event), "rate_limit_exceeded");
          setMessages((prevMessages) => {
            // Remove the last assistant message
            const newMessages = prevMessages.slice(0, -1);
            // Add an error message
            return [
              ...newMessages,
              {
                role: "assistant",
                text: 'Give me a minute and type into the message box, "OK Next" or your last message again',
              },
            ];
          });
          setTimeout(() => {
            setInputDisabled(false);
          }, 30000);
        } else {
          handleError(JSON.stringify(event), "failed");
          setMessages((prevMessages) => {
            // Remove the last assistant message
            const newMessages = prevMessages.slice(0, -1);
            // Add an error message
            return [
              ...newMessages,
              {
                role: "assistant",
                text: "An error occurred while processing your message. Please try again later.",
              },
            ];
          });
          setInputDisabled(false);
        }
      }
      if (event.event === "thread.message.completed")
        handleMessageCompleted(event);
      if (event.event === "thread.run.completed") handleRunCompleted(event);
    });
  };

  function changeAssistant1(assistantId: string) {
    setCurrentQuestionNumber(1);
    setAssistantId(process.env.NEXT_PUBLIC_1_ASSISTANT_ID || "");
    localStorage.setItem("currentQuestionNumber", "0");
    localStorage.setItem(
      "assistantId",
      process.env.NEXT_PUBLIC_1_ASSISTANT_ID || ""
    );
  }

  const changeAssistant2 = () => {
    setCurrentQuestionNumber(15);
    setAssistantId(process.env.NEXT_PUBLIC_2_ASSISTANT_ID || "");
    localStorage.setItem("currentQuestionNumber", "15");
    localStorage.setItem(
      "assistantId",
      process.env.NEXT_PUBLIC_2_ASSISTANT_ID || ""
    );
  };

  const changeAssistant3 = () => {
    setAssistantId(process.env.NEXT_PUBLIC_3_ASSISTANT_ID || "");
    localStorage.setItem(
      "assistantId",
      process.env.NEXT_PUBLIC_3_ASSISTANT_ID || ""
    );
  };

  const handleMessageCompleted = async (event) => {
    const messageText = event.data.content[0].text.value;
    if (!(messageText?.startsWith("Hey! Hello! Welcome")
      || messageText?.startsWith("We recommend taking a 15 to 20 minute break")
      || messageText?.includes("Congrats, you’ve completed the What's Next Next Life Coaching part of this Course!")
      // || messageText?.includes("That's all the questions! Great job!")
      // || messageText?.startsWith("That's a tough challenge!")
      || messageText.startsWith("```json"))) {

      if (/safari/i.test(userAgent) && !/chrome|chromium|crios/i.test(userAgent)) {
        if (hasUserInteracted) {
          // If user has already granted permission, play audio
          // handleSpeak(messageText);
          if (messageText?.includes("That's all the questions! Great job!")) {
            const splitMessage = messageText.split("Here are your answers to the questions 1 through 13");
            await handleGenerateAudio(splitMessage[0], false);

          } else if (messageText?.startsWith("I’ve analyzed your answers to the questions and have identified frequently")) {
            const introText = messageText.split('|')[0].trim();

            // Get the conclusion text (after last table)
            const sections = messageText.split('\n|');
            const lastSection = sections[sections.length - 1];
            const conclusionText = lastSection
              .split('\n')
              .filter(line => !line.includes('|'))
              .join('\n')
              .trim();

            const textForAudio = `${introText}\n\n${conclusionText}`;

            
            await handleGenerateAudio(textForAudio, false);
          } else {
            await handleGenerateAudio(messageText, false);
          }
          tempAppendMessage?.map((message: string) => {
            appendToLastMessage(message)
          })
        } else {
          // Show prompt for first-time users 
          setStartMessage(messageText);
          setShowAudioPrompt(true);
        }
      } else {
        if (messageText?.includes("That's all the questions! Great job!")) {
          const splitMessage = messageText.split("Here are your answers to the questions 1 through 13");
          await handleGenerateAudio(splitMessage[0], false);

        } else if (messageText?.startsWith("I’ve analyzed your answers to the questions and have identified frequently")) {
          const parts = messageText.split('|');
          const introText = parts[0].trim();

          const secondPart = parts[1].split('Keyword Table: This table breaks down frequently mentioned keywords within each category/life area.');

          const lastTableIndex = secondPart[1].lastIndexOf('\n|');
          const conclusionText = secondPart[1]
            .substring(lastTableIndex)
            .split('\n')
            .filter(line => !line.includes('|'))
            .join('\n')
            .trim();
          const textForAudio = introText + conclusionText;
          await handleGenerateAudio(textForAudio, false);
        } else {
          await handleGenerateAudio(messageText, false);
        }
        tempAppendMessage?.map((message: string) => {
          appendToLastMessage(message)
        })
        // handleSpeak(messageText)
      }
    }
    else {
      tempAppendMessage?.map((text) => {
        appendToLastMessage(text);
      })
    }
    setInputDisabled(false);
    setTempAppendMessage([]); //Clear the temporary message holder array to hold the next AI response
    currentQuestionNumber < 14
      ? checkForLastQuestionNumber(messageText)
      : currentQuestionNumber == 14
        ? changeAssistant2()
        : null;

    extractQuotedTexts(messageText);

    if (
      messageText.includes(
        "Congrats, you’ve completed the What's Next Next Life Coaching part of this course!"
      )
    ) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  };

  const handleRunCompleted = async (event: any) => {
    setInputDisabled(false);
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta: any) => {
    // console.log("snapShot", snapshot)
    if (delta.value != null) {
      // tempAppendMessage.push(delta.value)
      appendToLastMessage(delta.value);
      // handleGenerateAudio(delta.value, false)
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  const checkForLastQuestionNumber = (text: string) => {
    const matches = text.match(/Question (\d+):/g);
    if (matches) {
      const lastMatch = matches[matches.length - 1];
      const questionNumber = parseInt(lastMatch.match(/(\d+)/)[0], 10);
      setCurrentQuestionNumber(questionNumber);
      localStorage.setItem("currentQuestionNumber", questionNumber.toString());

      // Call changeAssistant2 if there are multiple matches
      if (matches.length > 1) {
        changeAssistant2();
      }
    }
  };

  const removeSpecialCharacters = (text: string) => {
    return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  };

  const extractQuotedTexts = (text: string) => {
    const regex = /"([^"]*)"/g;
    const matches = text.match(regex);
    if (matches) {
      const newQuotedTexts = matches.map((match) =>
        removeSpecialCharacters(match.slice(1, -1).toLowerCase())
      );
      setQuotedTexts((prevTexts) => [...prevTexts, ...newQuotedTexts]);
    }
  };

  useEffect(() => {
    const NewChats = chats.map((chatI) => {
      if (chatI.threadId === threadId) {
        return {
          ...chatI,
          messages: messages,
        };
      } else {
        return chatI;
      }
    });
    localStorage.setItem("chats", JSON.stringify(NewChats));
    setChats(NewChats);
  }, [messages]);

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendToLastMessage = (text: string) => {
    setMessages((prevMessages: any[]) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === "file_path") {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const [testPanelOpen, setTestPanelOpen] = useState(false);

  useEffect(() => {
    localStorage.getItem("testPanel") && setTestPanelOpen(true);
  }, []);

  return (
    <div className="flex h-full grow flex-col transition-transform duration-300 ease-in-out md:translate-x-0 w-full">
      {showAudioPrompt && (
        <div className="fixed bottom-16 right-4 p-4 bg-white shadow-lg rounded-lg z-50">
          <p>Would you like to enable audio responses?</p>
          <div className="flex gap-2 mt-2">
            <button
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => {
                // Direct attempt to play the message audio on iOS
                handleGenerateAudio(startMessage, true)
                  .then(() => {
                    setHasUserInteracted(true);
                    localStorage.setItem('audioPermissionGranted', 'true');
                    setShowAudioPrompt(false);
                  })
                  .catch(error => {
                    console.error('Failed to enable audio:', error);
                    setShowAudioPrompt(false);
                  });
              }}
            >
              Enable Audio
            </button>
            <button
              className="btn bg-gray-500 hover:bg-gray-600 text-white"
              onClick={() => {
                setShowAudioPrompt(false);
                localStorage.setItem('audioPermissionGranted', 'false');
              }}
            >
              No Thanks
            </button>
          </div>
        </div>
      )}
      <MessageBody
        messages={messages}
        messagesEndRef={messagesEndRef}
        handleSubmission={handleSubmission}
        setMessageInput={setMessageInput}
        handleRefreshQuestion={handleRefreshQuestion}
      />
      {testPanelOpen && (
        <TestPanel
          changeAssistant1={changeAssistant1}
          changeAssistant2={changeAssistant2}
          changeAssistant3={changeAssistant3}
          question={currentQuestionNumber}
          setTestPanelOpen={setTestPanelOpen}
          assistantId={assistantId}
        />
      )}

      <MessageInput
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSubmission={handleSubmission}
        inputDisabled={inputDisabled}
        InputRef={InputRef}
        messages={messages}
        quotedTexts={quotedTexts}
        currentQuestionNumber={currentQuestionNumber}
        audioRef={audioRef}
        isPlaying={isPlaying}
        analyserRef={analyserRef}
      />
    </div>
  );
}
