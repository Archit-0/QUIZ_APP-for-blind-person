import React, { useRef, useEffect, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserId } from "../redux/result_reducer";
import "../styles/Main.css";

export default function Main() {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const [confirming, setConfirming] = useState(false);
  const [username, setUsername] = useState("");

  // Speak text function for speech synthesis
  const speakText = useCallback((text) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1; // Adjust the speaking rate if needed
      utterance.onstart = () => console.log("Speech started");
      utterance.onend = () => console.log("Speech ended");
      synthRef.current.speak(utterance);
    } else {
      console.error("Speech synthesis not supported or initialized.");
    }
  }, []);

  // Stop speaking function
  const stopSpeaking = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
  }, []);

  // Confirm username function
  const confirmUsername = useCallback(
    (username) => {
      setConfirming(true);
      stopSpeaking();
      speakText(
        `You entered ${username}. Do you want to use this username? Press Enter to confirm or any other key to cancel.`
      );
    },
    [speakText, stopSpeaking]
  );

  // Initialize speech recognition and speak welcome message
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = function (event) {
        const transcript = event.results[0][0].transcript.trim();
        inputRef.current.value = transcript;
        setUsername(transcript);
        confirmUsername(transcript); // Now confirmUsername is available
      };

      recognitionRef.current.onerror = function (event) {
        console.error("Speech recognition error", event);
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }

    // Welcome message speech
    speakText(`Welcome to the Quiz Application. You will be asked 10 questions one after another. Press Enter to start the quiz.`);

    return () => {
      stopSpeaking();
    };
  }, [speakText, stopSpeaking, confirmUsername]);

  // Start the quiz by dispatching the userId and navigating
  const startQuiz = useCallback(() => {
    if (confirming && username) {
      dispatch(setUserId(username));
      stopSpeaking();
      navigate("/quiz");
    }
  }, [confirming, username, dispatch, navigate, stopSpeaking]);

  // Start speech recognition
  const startTalking = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    } else {
      console.error("Speech recognition not initialized.");
    }
  }, []);

  // Handle keydown events for input and actions
  const handleKeyDown = useCallback(
    (event) => {
      if (confirming) {
        if (event.key === "Enter") {
          startQuiz();
        } else {
          setConfirming(false);
          inputRef.current.value = "";
          speakText("Username confirmation canceled. Please enter your username again.");
        }
      } else {
        if (event.key === " ") {
          speakText("Please enter your username and press Enter to confirm.");
        } else if (event.key === "/") {
          startTalking();
        } else if (event.key === "Enter") {
          const enteredUsername = inputRef.current.value.trim();
          if (enteredUsername) {
            setUsername(enteredUsername);
            confirmUsername(enteredUsername);
          } else {
            speakText("Please enter a valid username before starting the quiz.");
          }
        }
      }
    },
    [confirming, confirmUsername, startQuiz, speakText, startTalking]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      stopSpeaking();
    };
  }, [handleKeyDown, stopSpeaking]);

  return (
    <div className="container">
      <h1 className="title text-light">Quiz Application</h1>
      <ol>
        <li>You will be asked 10 questions one after another.</li>
        <li>10 points is awarded for the correct answer.</li>
        <li>Each question has three options. You can choose only one option.</li>
        <li>You can review and change answers before the quiz finishes.</li>
        <li>The result will be declared at the end of the quiz.</li>
        <li>Enter / for voice input</li>
        <li>Press Enter twice to submit your username</li>
      </ol>

      <form id="form">
        <input
          ref={inputRef}
          className="userid"
          type="text"
          placeholder="Username*"
          disabled={confirming}
        />
      </form>

      <div className="start">
        <button className="btn" onClick={startQuiz}>
          Start Quiz
        </button>
      </div>
    </div>
  );
}