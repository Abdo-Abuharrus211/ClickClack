'use client';

import { SERVER_BASE_URL } from '@/utils/api';
import '../../../styles/test-page.css'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

function splitIntoRows(text, length) {
  const words = text.split(' ');
  const rows = [];

  for (let i = 0; i < words.length; i += length) {
    const rowWords = words.slice(i, i + length);
    rows.push(`${i !== 0 ? ' ' : ''}${rowWords.join(' ')}`);
  }
  return rows;
}

function splitBasedOnPromptRows(displayKeys, promptRows) {
  const rows = [];
  for (let i = 0; i < promptRows.length; i++) {
    if (displayKeys.length <= 0) {
      return rows;
    }
    rows.push(displayKeys.slice(0, promptRows[i].length));
    displayKeys = displayKeys.slice(promptRows[i].length);
  }
  return rows;
}

function Timer({ duration, onFinish, onCancel, onTick }) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (onTick) {
          onTick(next);
        }
        if (next <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return next;
      });
    }, 1000);
  
    return () => {
      clearInterval(timerRef.current);
    };
  }, [onTick]);
  
  useEffect(() => {
    if (secondsLeft <= 0 && onFinish) {
      onFinish();
    }
  }, [secondsLeft, onFinish]);
  return <div className='timer'>{secondsLeft}</div>;
}

function TestPageComponent() {
  const router = useRouter();
  const data = useSearchParams().get('data');
  const params = JSON.parse(decodeURIComponent(atob(data)));
  const prompt = params.prompt.replaceAll('\n', ' ').replaceAll('  ', ' ');
  const promptid = params.promptid;
  const testDurationSeconds = params.testDuration;

  const keysRef = useRef([]);
  const finishedRef = useRef(false);
  const [displayKeys, setDisplayKeys] = useState([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [testActive, setTestActive] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [wordsPerRow, setWordsPerRow] = useState(5);
  
  const pHeight = 40; // height of each p (adjust as needed)
  const maxVisibleRows = 3;
  const containerHeight = pHeight * maxVisibleRows;
  const centerOffset = containerHeight / 2 - pHeight / 2;
  const translateY = centerOffset - currentRow * pHeight;
  
  const promptRows = useMemo(() => {
    return splitIntoRows(prompt, wordsPerRow);
  }, [prompt, wordsPerRow]);
  
  const displayRows = useMemo(() => {
    return splitBasedOnPromptRows(displayKeys, promptRows);
  }, [displayKeys, promptRows]);

  const handleKeyDown = useCallback((e) => {
    if (!testActive && testStarted) return;
  
    if (e.key === 'Backspace') {
      let length = displayKeys.length;
      for (let i = 0; i < promptRows.length; i++) {
        const newLength = length - promptRows[i].length;
        if (newLength == 1) {
          setCurrentRow(prev => prev - 1);
          break;
        }
        if (newLength < 0) {
          break;
        }
        length = newLength;
      }
  
      setDisplayKeys(prev => prev.slice(0, -1));
      keysRef.current.push(e.key);
      return;
    }
  
    const regex = /^[a-zA-Z0-9.,!?;:''(){}\[\]<>@#%^&*\-_=+\/\\|~`$\s]$/;
    if (!regex.test(e.key)) return;
  
    if (!testStarted && !testActive) {
      setTestActive(true);
      setTestStarted(true);
    }
  
    let length = displayKeys.length;
    for (let i = 0; i < promptRows.length; i++) {
      const newLength = length - promptRows[i].length;
      if (newLength == 0) {
        setCurrentRow(prev => prev + 1);
        break;
      }
      if (newLength < 0) {
        break;
      }
      length = newLength;
    }
  
    setDisplayKeys(prev => [...prev, e.key]);
    keysRef.current.push(e.key);
  }, [displayKeys, promptRows, testActive, testStarted]);
  

  useEffect(() => {
    setWordsPerRow(Math.max(2, Math.floor(window.innerWidth / 180)));
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const onFinish = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    
    setTestActive(false);

    const payload = {
      keyStrokes: keysRef.current,
      prompt,
      promptid,
      duration: testDurationSeconds
    }
    try {
      const res = await fetch(`https://api.clickclack.aabuharrus.dev/api/v1/tests/save-test/`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save test");
      }
  } catch (error) {
    console.log(error.message);
  } finally {
    router.push('/profile');
  }
  }, [prompt, promptid, router, testDurationSeconds]);
  
  const onCancel = useCallback(() => {
    console.log("Test cancelled.");
  }, []);

  return (
    <div className='screen-container'>
      <div className='typing-frame' style={{height: `${containerHeight}px`}}>
        <div
          className='typing-container'
          style={{transform: `translateY(${translateY}px)`}}
        >
          {/* Previously typed rows */}
          {displayRows.slice(0, currentRow).map((row, rowIndex) => 
            <p
              key={rowIndex}
              className='typing-row'
              style={{height: `${pHeight}px`}}
            >
              {row.map((char, index) => {
                if (char === promptRows[rowIndex][index]) {
                  return <span key={char + index} className='typed typed-correct'>{char}</span>
                } 
                return <span key={char + index} className='typed typed-error'>
                  {promptRows[rowIndex][index] === ' ' ? '•' : promptRows[rowIndex][index]}
                </span>
              })}
            </p>
          )}

          {/* Row currently being typed */}
          <p
            className='typing-row'
            style={{height: `${pHeight}px`}}
          >
            {/* Typed words in current line */}
            {displayRows.at(currentRow) && displayRows.at(currentRow).map((char, index) => {
              const promptRow = promptRows[currentRow];
              if (char === promptRow[index]) {
                return <span key={char + index} className='typed typed-correct'>{char}</span>
              } 
              return <span key={char + index} className='typed typed-error'>
                {promptRow[index] === ' ' ? '•' : promptRow[index]}
              </span>
            })}
            {/* Cursor */}
            <span className="cursor"/>
            {/* Next words in current line to type */}
            {promptRows.at(currentRow).slice(displayRows.at(currentRow)?.length || 0).split('').map((char, index) => 
              <span key={index} className='prompt'>{char}</span>
            )}
          </p>

          {/* Next rows to type */}
          {promptRows.slice(currentRow + 1, currentRow + 2).map((row, index) => 
            <p
              key={index}
              className='typing-row'
              style={{height: `${pHeight}px`}}
            >
              {row.split('').map((char, index) => 
                <span key={index} className='prompt'>{char}</span>
              )}
            </p>
          )}
        </div>
      </div>
      {testStarted ? 
        <Timer duration={testDurationSeconds} onFinish={onFinish} onCancel={onCancel} />
        : <div className='typing-instructions'>The timer will start when you start typing.</div>
      }
    </div>
  )
}

export default function TestPageWrapper() {
  return (
    <Suspense fallback={<div>Loading test...</div>}>
      <TestPageComponent />
    </Suspense>
  );
}
