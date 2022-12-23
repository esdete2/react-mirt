import React, { useEffect, useRef, useState } from 'react';
import { MirtOptions } from '../Mirt';
import { debounce, getRawData, getWaveformData } from './utils';
export interface MirtWaveformProps {
  file: File | null;
  fineTuning: number;
  fineTuningResolution: number;
  duration: number;
  config: MirtOptions;
  handleWaveformLoaded: () => void;
}

const Waveform = ({
  file,
  fineTuning,
  fineTuningResolution,
  duration,
  config,
  handleWaveformLoaded,
}: MirtWaveformProps) => {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<Float32Array>();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [waveformData, setWaveformData] = useState<Array<number>>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateCanvas = (data: number[]) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / data.length;
    const barSpacing = barWidth * -(config.waveformBarWidth - 1);

    if (!context) return;

    context.clearRect(0, 0, width, height);
    context.fillStyle = config.waveformColor;

    for (let i = 0; i < data.length; i++) {
      const barHeight = data[i] * height;
      const x = i * barWidth + barSpacing;
      const y = height / 2 - barHeight / 2;

      context.fillRect(x, y, barWidth - barSpacing, barHeight);
    }
  };

  useEffect(() => {
    if (!rawData && file && file.type.startsWith('audio')) {
      getRawData(file).then((data) => {
        setRawData(data);
      });
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      new ResizeObserver(debounce(handleResize, 50)).observe(canvasRef.current);
    }
  }, [canvasRef]);

  useEffect(() => {
    if (canvasRef.current && size.width > 0 && rawData) {
      getWaveformData(rawData, canvasRef.current, fineTuning, fineTuningResolution, duration, config).then((data) => {
        setWaveformData(data);
      });
    } else {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [file, canvasRef, size.width, fineTuning, fineTuningResolution, rawData]);

  useEffect(() => {
    if (config.waveformLoading && !waveformData) {
      let data = Array.from({ length: 100 }, (_, i) => Math.sin((i / 100) * Math.PI * 6) * 0.3 + 0.5);

      const interval = setInterval(() => {
        if (waveformData) {
          clearInterval(interval);
          return;
        }

        updateCanvas(data);
        data.push(data.shift() as number);
      }, 30);

      return () => {
        clearInterval(interval);
      };
    }

    if (canvasRef.current && waveformData && waveformData.length > 0) {
      updateCanvas(waveformData);
      handleWaveformLoaded();
    }
  }, [waveformData]);

  const handleResize = () => {
    if (canvasRef.current) {
      setSize({
        width: canvasRef.current.offsetWidth,
        height: canvasRef.current.offsetHeight,
      });
    }
  };

  return <canvas className="mirt__waveform-canvas" ref={canvasRef} width={size.width * 4} height={size.height * 4} />;
};

export default Waveform;
