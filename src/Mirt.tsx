import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Waveform from './lib/Waveform';
import { getEndHandleValue, getMaxValue, getMinValue, getStartHandleValue, toSeconds } from './lib/utils';

export interface MirtProps {
  className?: string;
  style?: React.CSSProperties;
  file: File | null;
  onChange?: ({ start, current, end }: { start: number; current: number; end: number }) => void;
  onAudioLoaded?: (audio: HTMLAudioElement) => void;
  onWaveformLoaded?: () => void;
  onError?: (error: Error) => void;
  start?: number;
  end?: number;
  options?: MirtOptions;
}

export interface MirtOptions {
  showButton: boolean;
  waveformColor: string;
  waveformBlockWidth: number;
  waveformBarWidth: number;
  fineTuningDelay: number;
  fineTuningScale: number;
}

const defauiltOptions: MirtOptions = {
  showButton: true,
  waveformColor: 'rgba(255, 255, 255, 0.5)',
  waveformBlockWidth: 4,
  waveformBarWidth: 0.5,
  fineTuningDelay: 500,
  fineTuningScale: 5,
};

const Mirt = ({
  className,
  style,
  file,
  onChange,
  onAudioLoaded,
  onWaveformLoaded,
  onError,
  start: startValueOverwrite,
  end: endValueOverwrite,
  options,
}: MirtProps) => {
  const config = { ...defauiltOptions, ...options };

  const start = useRef<HTMLInputElement>(null);
  const playhead = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLInputElement>(null);

  const [initialized, setInitialized] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const [startPosition, setStartPosition] = useState(0);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [endPosition, setEndPosition] = useState(0);

  const [startDragging, setStartDragging] = useState(false);
  const [playheadDragging, setPlayheadDragging] = useState(false);
  const [endDragging, setEndDragging] = useState(false);

  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fineTuning, setFineTuning] = useState(-1);

  const fineTuningResolution = duration / config.fineTuningScale;

  useEffect(() => {
    setInitialized(false);

    if (!file) {
      setAudio(null);
      return;
    }

    if (file && file.type.startsWith('audio')) {
      const source = URL.createObjectURL(file);
      setAudio(new Audio(source));
    } else {
      onError && onError(new Error('Invalid file type'));
    }
  }, [file]);

  useEffect(() => {
    if (!audio) return;

    if (audio?.src) {
      audio.addEventListener('canplaythrough', handleLoadedAudio);
      audio.load();
    }
  }, [audio]);

  useEffect(() => {
    if (onChange && initialized) {
      onChange({ start: startPosition, current: playheadPosition, end: endPosition });
    }
  }, [startPosition, playheadPosition, endPosition]);

  useEffect(() => {
    if (!audio) return;

    let timer: ReturnType<typeof setInterval>;

    if (playing) {
      timer = setInterval(() => {
        if (audio.currentTime < toSeconds(endPosition)) {
          if (audio.currentTime >= toSeconds(playheadPosition)) {
            setPlayheadPosition(audio.currentTime * 1000);
          }
        } else {
          pausePlayback(toSeconds(startPosition));
          setPlayheadPosition(startPosition);
        }
      }, 10);
    }
    return () => {
      clearInterval(timer);
    };
  }, [playing]);

  useEffect(() => {
    if (config.fineTuningDelay <= 0) return;

    const currentPosition = startPosition;
    const timer = setTimeout(() => {
      if (startDragging && currentPosition === startPosition && fineTuning === -1) {
        setFineTuning(startPosition);
      }
    }, config.fineTuningDelay);
    return () => {
      clearTimeout(timer);
    };
  }, [startDragging, startPosition]);

  useEffect(() => {
    if (config.fineTuningDelay <= 0) return;

    const currentPosition = endPosition;
    const timer = setTimeout(() => {
      if (endDragging && currentPosition === endPosition && fineTuning === -1) {
        setFineTuning(endPosition);
      }
    }, config.fineTuningDelay);
    return () => {
      clearTimeout(timer);
    };
  }, [endDragging, endPosition]);

  useEffect(() => {
    if (config.fineTuningDelay <= 0) return;

    const currentPosition = playheadPosition;
    const timer = setTimeout(() => {
      if (playheadDragging && currentPosition === playheadPosition && fineTuning === -1) {
        setFineTuning(playheadPosition);
      }
    }, config.fineTuningDelay);
    return () => {
      clearTimeout(timer);
    };
  }, [playheadDragging, playheadPosition]);

  useEffect(() => {
    if (startValueOverwrite !== undefined) {
      changeStartPosition(startValueOverwrite);
    }
  }, [startValueOverwrite]);

  useEffect(() => {
    if (endValueOverwrite !== undefined) {
      changeEndPosition(endValueOverwrite);
    }
  }, [endValueOverwrite]);

  const handleLoadedAudio = () => {
    if (!audio) return;

    if (onAudioLoaded) {
      onAudioLoaded(audio);
    }

    audio.removeEventListener('canplaythrough', handleLoadedAudio);
    setInitialValues();
  };

  const setInitialValues = () => {
    if (!audio) return;

    const durationInMilliseconds = audio.duration * 1000;

    setStartPosition(0);
    setPlayheadPosition(0);
    setEndPosition(durationInMilliseconds);
    setDuration(durationInMilliseconds);
    setInitialized(true);

    if (onChange) {
      onChange({ start: 0, current: 0, end: durationInMilliseconds });
    }
  };

  const pausePlayback = (currentTime?: number) => {
    if (!audio) return;

    audio.pause();
    if (currentTime) audio.currentTime = currentTime;
    setPlaying(false);
  };

  const dragHandle = (event: React.MouseEvent<HTMLInputElement>, handle: string) => {
    pausePlayback();

    if (event.button != 0) return;

    switch (handle) {
      case 'start':
        setStartDragging(true);
        break;
      case 'playhead':
        setPlayheadDragging(true);
        break;
      case 'end':
        setEndDragging(true);
        break;
    }
  };

  const releaseHandle = (handle: string) => {
    switch (handle) {
      case 'start':
        setStartDragging(false);
        break;
      case 'playhead':
        setPlayheadDragging(false);
        break;
      case 'end':
        setEndDragging(false);
        break;
    }

    setFineTuning(-1);
  };

  const handleStartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audio || !startDragging) return;

    const value = parseInt(event.target.value);

    changeStartPosition(value);
  };

  const changeStartPosition = (value: number) => {
    if (!audio) return;

    if (value > endPosition) {
      audio.currentTime = toSeconds(endPosition);
      setStartPosition(endPosition);
      setPlayheadPosition(endPosition);
      return;
    }

    audio.currentTime = toSeconds(value);
    setStartPosition(value);
    setPlayheadPosition(value);
  };

  const handlePlayheadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audio || !playheadDragging) return;

    const value = parseInt(event.target.value);

    if (value < startPosition) {
      audio.currentTime = toSeconds(startPosition);
      setPlayheadPosition(startPosition);

      return;
    }

    if (value > endPosition) {
      audio.currentTime = toSeconds(endPosition);
      setPlayheadPosition(endPosition);

      return;
    }

    audio.currentTime = toSeconds(value);
    setPlayheadPosition(value);
  };

  const handleEndChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audio || !endDragging) return;

    const value = parseInt(event.target.value);

    changeEndPosition(value);
  };

  const changeEndPosition = (value: number) => {
    if (!audio) return;

    if (value < startPosition) {
      audio.currentTime = toSeconds(startPosition);
      setEndPosition(startPosition);
      setPlayheadPosition(startPosition);
      return;
    }

    audio.currentTime = toSeconds(value);
    setEndPosition(value);
    setPlayheadPosition(value);
  };

  const handleButtonClick = () => {
    if (!audio) return;

    if (playing) {
      pausePlayback();
    } else {
      if (playheadPosition >= endPosition) {
        audio.currentTime = toSeconds(startPosition);
        setPlayheadPosition(startPosition);
      } else {
        audio.currentTime = toSeconds(playheadPosition);
      }

      audio.play();
      setPlaying(true);
    }
  };

  const handleWaveformLoaded = () => {
    if (onWaveformLoaded) onWaveformLoaded();
  };

  return (
    <div
      className={classNames(
        'mirt',
        {
          'mirt--initialized': initialized,
          'mirt--disabled': !initialized,
        },
        className
      )}
      style={style}
    >
      {config.showButton && (
        <button className="mirt__play-button" type="button" onClick={handleButtonClick} disabled={!initialized}>
          {playing ? (
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="mirt__play-button-icon"
            >
              <path d="M12.404 2.364A2.364 2.364 0 0 0 10.041 0H6.134a2.364 2.364 0 0 0-2.363 2.364v27.273A2.364 2.364 0 0 0 6.134 32h3.907a2.364 2.364 0 0 0 2.363-2.363V2.364Zm15.826 0A2.364 2.364 0 0 0 25.866 0H21.96a2.364 2.364 0 0 0-2.364 2.364v27.273A2.364 2.364 0 0 0 21.96 32h3.906a2.364 2.364 0 0 0 2.364-2.363V2.364Z" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="mirt__play-button-icon"
            >
              <path d="M2.919 29.696a2.304 2.304 0 0 0 3.458 1.995l23.765-13.723a2.277 2.277 0 0 0 1.144-1.976c0-.816-.436-1.57-1.144-1.979C24.266 10.623 12.33 3.731 6.409.313a2.325 2.325 0 0 0-3.49 2.014v27.37Z" />
            </svg>
          )}
        </button>
      )}
      <div className="mirt__timeline">
        <div className="mirt__range-handles">
          <div className="mirt__range-handle-frame">
            <input
              ref={start}
              className="mirt__range-handle mirt__range-handle--start"
              type="range"
              min={getMinValue(fineTuning, fineTuningResolution, duration)}
              max={getMaxValue(fineTuning, fineTuningResolution, duration)}
              value={startPosition}
              onChange={handleStartChange}
              onPointerDown={(e) => dragHandle(e, 'start')}
              onPointerUp={() => releaseHandle('start')}
              disabled={!initialized}
            />

            <input
              ref={end}
              className="mirt__range-handle mirt__range-handle--end"
              type="range"
              min={getMinValue(fineTuning, fineTuningResolution, duration)}
              max={getMaxValue(fineTuning, fineTuningResolution, duration)}
              value={endPosition}
              onChange={handleEndChange}
              onPointerDown={(e) => dragHandle(e, 'end')}
              onPointerUp={() => releaseHandle('end')}
              disabled={!initialized}
            />
          </div>
          <div className="mirt__range-handle-playhead-track">
            <input
              ref={playhead}
              className="mirt__range-handle mirt__range-handle--playhead"
              type="range"
              min={getMinValue(fineTuning, fineTuningResolution, duration)}
              max={getMaxValue(fineTuning, fineTuningResolution, duration)}
              value={playheadPosition}
              onChange={handlePlayheadChange}
              onPointerDown={(e) => dragHandle(e, 'playhead')}
              onPointerUp={() => releaseHandle('playhead')}
              disabled={!initialized}
            />
          </div>
        </div>
        <div className="mirt__handles">
          <div
            className={classNames('mirt__handle-frame', {
              'mirt__handle-frame--start-dragging': startDragging,
              'mirt__handle-frame--end-dragging': endDragging,
            })}
            style={{
              left: `${getStartHandleValue(startPosition, fineTuning, fineTuningResolution, duration)}%`,
              right: `${getEndHandleValue(endPosition, fineTuning, fineTuningResolution, duration)}%`,
            }}
          >
            <svg
              viewBox="0 0 16 32"
              xmlns="http://www.w3.org/2000/svg"
              className="mirt__handle-icon mirt__handle-icon--start"
              fill="currentColor"
            >
              <path d="M8.638 1.342 3.714 15.334a2.013 2.013 0 0 0 0 1.332l4.924 13.992a2.008 2.008 0 0 0 3.789-1.333L7.737 16l4.69-13.325a2.008 2.008 0 0 0-3.789-1.333Z" />
            </svg>
            <svg
              viewBox="0 0 16 32"
              xmlns="http://www.w3.org/2000/svg"
              className="mirt__handle-icon mirt__handle-icon--end"
              fill="currentColor"
            >
              <path d="m7.503 1.342 4.924 13.992c.151.43.151.901 0 1.332L7.503 30.658a2.008 2.008 0 0 1-3.788-1.333L8.404 16 3.714 2.675a2.008 2.008 0 0 1 3.789-1.333Z" />
            </svg>
          </div>
          <div className="mirt__playhead-track">
            <div
              className={classNames('mirt__playhead', {
                'mirt__playhead--dragging': playheadDragging || startDragging || endDragging || playing,
              })}
              style={{
                left: `${getStartHandleValue(playheadPosition, fineTuning, fineTuningResolution, duration)}%`,
              }}
            ></div>
          </div>
        </div>
        {initialized && (
          <div className="mirt__waveform">
            <Waveform
              file={file}
              fineTuning={fineTuning}
              fineTuningResolution={fineTuningResolution}
              duration={duration}
              config={config}
              handleWaveformLoaded={handleWaveformLoaded}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Mirt;
