import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Spin, Row, Col } from 'antd';
import {
  AudioOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import IntlMessage from "components/util-components/IntlMessage";

export const SpeechPractice = ({ wordData, imageUri }) => {
  const [recognitionResults, setRecognitionResults] = useState({});
  const [listeningState, setListeningState] = useState({}); // New state to track individual word's listening state

  const listeningWordRef = useRef(null);
  const recognition = useRef(new (window.SpeechRecognition || window.webkitSpeechRecognition)()).current;
  
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  const locale = true;
    const setLocale = (isLocaleOn, localeKey) => {
      return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
    };


  useEffect(() => {
    recognition.onstart = () => {
      setListeningState((prev) => ({
        ...prev,
        [listeningWordRef.current]: true,
      }));
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const listeningWord = listeningWordRef.current;

      const updatedResults = { ...recognitionResults };

      // Boolean for correctness
      const isCorrect = listeningWord && transcript?.toLowerCase() === listeningWord?.toLowerCase();

      updatedResults[listeningWord] = isCorrect;

      setRecognitionResults(updatedResults);
      recognition.stop();
    };

    recognition.onend = () => {
      setListeningState((prev) => ({
        ...prev,
        [listeningWordRef.current]: false,
      }));
      listeningWordRef.current = null;
    };
  }, [recognitionResults]);

  const startListening = (word) => {
    if (listeningState[word]) {
      recognition.stop();
      setListeningState((prev) => ({
        ...prev,
        [word]: false,
      }));
      listeningWordRef.current = null;
    } else {
      listeningWordRef.current = word;
      setListeningState((prev) => ({
        ...prev,
        [word]: true,
      }));
      recognition.start();
    }
  };

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

  const getIconStatusForCard = (isCurrentWord, isListening, isCorrect, result) => {    
    if ((!isCurrentWord && !isListening && !isCorrect) || (!isCurrentWord && isListening)) {
      return <MessageOutlined style={{ color: 'gray', fontSize: '25px' }} />;
    }

    if (isCurrentWord && isListening) {
      return <Spin size="large" style={{ marginRight: '10px' }} />;
    }

    if (result === false) {
      return <CloseCircleOutlined style={{ color: 'darkyellow', fontSize: '25px' }}/>;
    }

    if (result === true) {
      return <CheckCircleOutlined style={{ color: 'green', fontSize: '25px' }} />;
    }
  };

  return (
    <div className="container customerName wordBreak">
      <Card key={"titule-speech"} title={`Chapter: ${wordData?.chapter}`}>
        <h1>{`${capitalizeFirstLetter(wordData?.title)}`}</h1>
      </Card>
      {wordData?.words?.map((data, index) => {
        const result = recognitionResults[data?.word]; // True or False
        const isCurrentWord = listeningWordRef.current === data?.word;
        
        // Check if the word is correct or not
        const isCorrect = result === true;

        return (
          <Card
            key={index}
            title={`${index + 1}.- ${capitalizeFirstLetter(data?.word)}`}
            className={`speech ${isCorrect ? 'is-correct' : result === false ? 'is-not-correct' : ''}`}
            extra={getIconStatusForCard(isCurrentWord, listeningState[data?.word] || false, isCorrect, result)}
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
                      margin: '10px',  // white margin around the image
                      borderRadius: '10px',  // optional: rounded corners for a softer look
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // floating shadow effect
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
            {result !== undefined && (
              <h3 className="speech-result">
                {result ? setLocale(locale, "speech.correct") : setLocale(locale, "speech.tryAgain")}
              </h3>
            )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default SpeechPractice;
