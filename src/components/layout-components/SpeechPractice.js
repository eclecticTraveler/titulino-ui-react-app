import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Button, Spin, Row, Col, Alert } from 'antd';
import {
  AudioOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import IntlMessage from "components/util-components/IntlMessage";

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

// Normalize a string for comparison: lowercase, trim, collapse whitespace, strip punctuation
const normalize = (str) =>
  (str || '')
    .toLowerCase()
    .trim()
    .replace(/['']/g, "'")          // smart quotes → straight
    .replace(/[^\w\s']/g, '')       // strip punctuation except apostrophes
    .replace(/\s+/g, ' ');          // collapse whitespace

// Simple word-level similarity: fraction of target words found in transcript (0–1)
const wordSimilarity = (transcript, target) => {
  const tWords = normalize(transcript).split(' ');
  const gWords = normalize(target).split(' ');
  if (gWords.length === 0) return 0;
  const matches = gWords.filter((w) => tWords.includes(w)).length;
  return matches / gWords.length;
};

export const SpeechPractice = ({ wordData, imageUri }) => {
  // result per word: { correct: bool, close: bool, transcript: string, confidence: number }
  const [recognitionResults, setRecognitionResults] = useState({});
  const [listeningState, setListeningState] = useState({});
  const [recognitionError, setRecognitionError] = useState(null);

  const listeningWordRef = useRef(null);
  const recognitionRef = useRef(null);

  const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  // Lazy-init the SpeechRecognition instance once
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const rec = new SpeechRecognitionAPI();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    recognitionRef.current = rec;

    return () => {
      try { rec.abort(); } catch (_) { /* noop */ }
    };
  }, []);

  // Wire up recognition event handlers (no stale closure — uses functional updaters + refs)
  useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;

    rec.onstart = () => {
      setRecognitionError(null);
      setListeningState((prev) => ({ ...prev, [listeningWordRef.current]: true }));
    };

    rec.onresult = (event) => {
      const targetWord = listeningWordRef.current;
      if (!targetWord) return;

      // Check all alternatives for the best match
      const alternatives = event.results[0];
      let bestMatch = { correct: false, close: false, transcript: '', confidence: 0 };

      for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i];
        const transcript = alt.transcript;
        const confidence = alt.confidence;

        if (normalize(transcript) === normalize(targetWord)) {
          bestMatch = { correct: true, close: false, transcript, confidence };
          break; // exact match — no need to check further
        }

        const similarity = wordSimilarity(transcript, targetWord);
        if (similarity >= 0.7 && !bestMatch.correct) {
          bestMatch = { correct: false, close: true, transcript, confidence };
        }

        // Keep the first alternative as fallback
        if (i === 0 && !bestMatch.close) {
          bestMatch = { ...bestMatch, transcript, confidence };
        }
      }

      setRecognitionResults((prev) => ({ ...prev, [targetWord]: bestMatch }));
    };

    rec.onerror = (event) => {
      const word = listeningWordRef.current;
      if (event.error === 'no-speech') {
        setRecognitionError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setRecognitionError('Microphone access denied. Please allow mic permissions.');
      } else if (event.error !== 'aborted') {
        setRecognitionError(`Recognition error: ${event.error}`);
      }
      setListeningState((prev) => ({ ...prev, [word]: false }));
      listeningWordRef.current = null;
    };

    rec.onend = () => {
      const word = listeningWordRef.current;
      if (word) {
        setListeningState((prev) => ({ ...prev, [word]: false }));
      }
      listeningWordRef.current = null;
    };
  }, []);

  const startListening = useCallback((word) => {
    const rec = recognitionRef.current;
    if (!rec) return;

    if (listeningState[word]) {
      try { rec.stop(); } catch (_) { /* noop */ }
      setListeningState((prev) => ({ ...prev, [word]: false }));
      listeningWordRef.current = null;
    } else {
      // Abort any in-flight recognition before starting a new one
      try { rec.abort(); } catch (_) { /* noop */ }
      listeningWordRef.current = word;
      setListeningState((prev) => ({ ...prev, [word]: true }));
      try {
        rec.start();
      } catch (err) {
        // InvalidStateError if already running — retry after short delay
        setTimeout(() => {
          try { rec.start(); } catch (_) {
            setListeningState((prev) => ({ ...prev, [word]: false }));
            listeningWordRef.current = null;
          }
        }, 100);
      }
    }
  }, [listeningState]);

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    window.speechSynthesis.speak(utterance);
  };

  const capitalizeFirstLetter = (word) => {
    return word
      ?.toLowerCase()
      ?.split(' ')
      ?.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      ?.join(' ');
  };

  const getIconStatusForCard = (isCurrentWord, isListening, result) => {
    if (isCurrentWord && isListening) {
      return <Spin size="large" style={{ marginRight: '10px' }} />;
    }
    if (result?.correct) {
      return <CheckCircleOutlined style={{ color: 'green', fontSize: '25px' }} />;
    }
    if (result?.close) {
      return <WarningOutlined style={{ color: '#b8860b', fontSize: '25px' }} />;
    }
    if (result && !result.correct) {
      return <CloseCircleOutlined style={{ color: '#b8860b', fontSize: '25px' }}/>;
    }
    return <MessageOutlined style={{ color: 'gray', fontSize: '25px' }} />;
  };

  const getResultFeedback = (result) => {
    if (!result) return null;
    if (result.correct) {
      return (
        <h3 className="speech-result">
          {setLocale(locale, "speech.correct")}
          {result.confidence > 0 && <span style={{ fontSize: '14px', marginLeft: 8, color: 'gray' }}>({Math.round(result.confidence * 100)}%)</span>}
        </h3>
      );
    }
    if (result.close) {
      return (
        <h3 className="speech-result" style={{ color: '#b8860b' }}>
          Almost! You said: "<em>{result.transcript}</em>"
          {result.confidence > 0 && <span style={{ fontSize: '14px', marginLeft: 8, color: 'gray' }}>({Math.round(result.confidence * 100)}%)</span>}
        </h3>
      );
    }
    return (
      <h3 className="speech-result">
        {setLocale(locale, "speech.tryAgain")} — You said: "<em>{result.transcript}</em>"
      </h3>
    );
  };

  // Browser support check
  if (!SpeechRecognitionAPI) {
    return (
      <div className="container customerName wordBreak">
        <Card>
          <Alert
            title="Speech Recognition Not Supported"
            description="Your browser does not support the Web Speech API. Please use Google Chrome or Microsoft Edge for the best experience."
            type="warning"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="container customerName wordBreak">
      <Card key={"titule-speech"} title={`Chapter: ${wordData?.chapter}`}>
        <h1>{`${capitalizeFirstLetter(wordData?.title)}`}</h1>
      </Card>

      {recognitionError && (
        <Alert
          title={recognitionError}
          type="error"
          closable
          onClose={() => setRecognitionError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {wordData?.words?.filter((d) => d?.word).map((data, index) => {
        const result = recognitionResults[data?.word];
        const isCurrentWord = listeningWordRef.current === data?.word;
        const isCorrect = result?.correct === true;

        return (
          <Card
            key={index}
            title={`${index + 1}.- ${capitalizeFirstLetter(data?.word)}`}
            className={`speech ${isCorrect ? 'is-correct' : (result && !result.correct && !result.close) ? 'is-not-correct' : result?.close ? 'is-not-correct' : ''}`}
            extra={getIconStatusForCard(isCurrentWord, listeningState[data?.word] || false, result)}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} lg={12}>
                {data?.image && (
                  <img
                    src={`${imageUri}${data?.image}.jpg`}
                    alt={data?.word}
                    onClick={() => startListening(data?.word)}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxWidth: '250px',
                      maxHeight: '250px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      margin: '10px',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                )}
              </Col>

              <Col xs={24} sm={24} lg={12}>
                <div>
                  <Button
                    onClick={() => startListening(data?.word)}
                    style={{ marginBottom: '10px', marginRight: '10px' }}
                    size='large'
                    type='primary'
                    loading={listeningState[data?.word] || false}
                  >
                    <AudioOutlined style={{ marginRight: '2px' }} />
                    {setLocale(locale, "speech.practice")}                    
                  </Button>
                  
                  <Button
                    onClick={() => speakWord(data?.word)}
                    style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}
                    size='large'
                  >
                    <PlayCircleOutlined style={{ marginRight: '2px' }} />
                    {setLocale(locale, "speech.playWord")}
                  </Button>
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: '10px' }}>
              {getResultFeedback(result)}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default SpeechPractice;
