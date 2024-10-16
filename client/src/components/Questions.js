import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

/** Custom Hook */
import { useFetchQestion } from '../hooks/fetchQuestion'
import { updateResult } from '../hooks/setResult'

export default function Questions({ onChecked }) {

    const [checked, setChecked] = useState(undefined)
    const { trace } = useSelector(state => state.questions);
    const result = useSelector(state => state.result.result);

    const [{ isLoading,  serverError}] = useFetchQestion()
    
    const questions = useSelector(state => state.questions.queue[state.questions.trace])
    const dispatch = useDispatch()

    // Text-to-Speech function
    function speakText(question, options) {
        let textToSpeak = `Question: ${question}. `;
        options.forEach((option, index) => {
            textToSpeak += `Option ${index + 1}: ${option}. `;
        });

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === 'en-US');
        speechSynthesis.speak(utterance);
    }

    useEffect(() => {
        if (questions?.question && questions?.options) {
            // Trigger TTS with question and options when the question changes
            speakText(questions.question, questions.options);
        }
    }, [questions]);

    useEffect(() => {
        dispatch(updateResult({ trace, checked }))
    }, [checked, dispatch, trace])

    useEffect(() => {
        // Listen for keypresses to select an option
        const handleKeyPress = (event) => {
            const key = event.key;

            // Map number keys to options (1 -> 0, 2 -> 1, 3 -> 2, 4 -> 3)
            const optionIndex = parseInt(key) - 1;

            if (optionIndex >= 0 && optionIndex < questions?.options.length) {
                onSelect(optionIndex);
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [questions, onChecked]);

    function onSelect(i) {
        onChecked(i);
        setChecked(i);
    }

    if(isLoading) return <h3 className='text-light'>isLoading</h3>
    if(serverError) return <h3 className='text-light'>{serverError || "Unknown Error"}</h3>

    return (
        <div className='questions'>
            <h2 className='text-light'>{questions?.question}</h2>

            <ul key={questions?.id}>
                {
                    questions?.options.map((q, i) => (
                        <li key={i}>
                            <input 
                                type="radio"
                                value={false}
                                name="options"
                                id={`q${i}-option`}
                                onChange={() => onSelect(i)}
                            />

                            <label className='text-primary' htmlFor={`q${i}-option`}>{q}</label>
                            <div className={`check ${result[trace] === i ? 'checked' : ''}`}></div>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}
