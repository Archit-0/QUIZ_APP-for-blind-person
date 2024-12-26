import React, { useEffect, useRef, useCallback } from "react";
import "../styles/Result.css";
import { Link } from "react-router-dom";
import ResultTable from "./ResultTable";
import { useDispatch, useSelector } from "react-redux";
import {
  attempts_Number,
  earnPoints_Number,
  flagResult,
} from "../helper/helper";

/** import actions */
import { resetAllAction } from "../redux/question_reducer";
import { resetResultAction } from "../redux/result_reducer";
import { usePublishResult } from "../hooks/setResult";

export default function Result() {
  const dispatch = useDispatch();
  const {
    questions: { queue, answers },
    result: { result, userId },
  } = useSelector((state) => state);

  const totalPoints = queue.length * 10;
  const attempts = attempts_Number(result);
  const earnPoints = earnPoints_Number(result, answers, 10);
  const flag = flagResult(totalPoints, earnPoints);

  /** Publish user result */
  usePublishResult({
    result,
    username: userId,
    attempts,
    points: earnPoints,
    achived: flag ? "Passed" : "Failed",
  });

  /** Reference for the Restart button */
  const restartButtonRef = useRef(null);

  /** Text-to-Speech function */
  const speakResult = useCallback(() => {
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }

    // Stop ongoing speech
    speechSynthesis.cancel();

    let textToSpeak = `Quiz Results for ${userId || "User"}: `;
    textToSpeak += `Total Quiz Points: ${totalPoints}. `;
    textToSpeak += `Total Questions: ${queue.length}. `;
    textToSpeak += `Total Attempts: ${attempts}. `;
    textToSpeak += `Total Earned Points: ${earnPoints}. `;
    textToSpeak += `Quiz Result: ${flag ? "Passed" : "Failed"}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.voice = speechSynthesis
      .getVoices()
      .find((voice) => voice.lang === "en-US");
    speechSynthesis.speak(utterance);
  }, [userId, totalPoints, queue.length, attempts, earnPoints, flag]);

  useEffect(() => {
    speakResult(); // Speak results when component mounts

    // Handle Enter key press
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        console.log("Enter key pressed - clicking restart button");
        restartButtonRef.current.click(); // Trigger click on restart button
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [speakResult]);

  useEffect(() => {
    restartButtonRef.current?.focus(); // Set focus on restart button for accessibility
  }, []);

  function onRestart() {
    dispatch(resetAllAction());
    dispatch(resetResultAction());
    console.log("Restart function executed");
  }

  return (
    <div className="container">
      <h1 className="title text-light">Quiz Application</h1>

      <div className="result flex-center">
        <div className="flex">
          <span>Username</span>
          <span className="bold">{userId || ""}</span>
        </div>
        <div className="flex">
          <span>Total Quiz Points: </span>
          <span className="bold">{totalPoints || 0}</span>
        </div>
        <div className="flex">
          <span>Total Questions: </span>
          <span className="bold"> {queue.length || 0}</span>
        </div>
        <div className="flex">
          <span>Total Attempts: </span>
          <span className="bold">{attempts || 0}</span>
        </div>
        <div className="flex">
          <span>Total Earned Points: </span>
          <span className="bold">{earnPoints || 0}</span>
        </div>
        <div className="flex">
          <span>Quiz Result</span>
          <span className="bold">{flag ? "PASS" : "FAIL"}</span>
        </div>
      </div>

      <div className="start">
        <Link
          className="btn"
          to={"/"}
          onClick={onRestart}
          ref={restartButtonRef} // Attach ref to button
        >
          Restart
        </Link>
      </div>

      <div className="container">
        {/* result table */}
        <ResultTable />
      </div>
    </div>
  );
}
