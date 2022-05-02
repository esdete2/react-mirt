import React, { useEffect, useRef, useState } from 'react';
import { MirtOptions } from '../Mirt';
import { debounce, getWaveformData } from './utils';
export interface MirtWaveformProps {
  file: File | null;
  fineTuning: number;
  fineTuningResolution: number;
  duration: number;
  config: MirtOptions;
  handleWaveformLoaded: () => void;
}

export const Waveform = ({
  file,
  fineTuning,
  fineTuningResolution,
  duration,
  config,
  handleWaveformLoaded,
}: MirtWaveformProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [waveformData, setWaveformData] = useState<Array<number>>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      new ResizeObserver(debounce(handleResize, 50)).observe(canvasRef.current);
    }
  }, [canvasRef]);

  useEffect(() => {
    if (file && file.type.startsWith('audio') && canvasRef.current && size.width > 0) {
      getWaveformData(file, canvasRef.current, fineTuning, fineTuningResolution, duration, config).then((data) => {
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
  }, [file, canvasRef, size.width, fineTuning, fineTuningResolution]);

  useEffect(() => {
    if (canvasRef.current && waveformData && waveformData.length > 0) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / waveformData.length;
      const barSpacing = barWidth * -(config.waveformBarWidth - 1);

      if (!context) return;

      context.clearRect(0, 0, width, height);
      context.fillStyle = config.waveformColor;

      for (let i = 0; i < waveformData.length; i++) {
        const barHeight = waveformData[i] * height;
        const x = i * barWidth + barSpacing;
        const y = height / 2 - barHeight / 2;

        context.fillRect(x, y, barWidth - barSpacing, barHeight);
      }

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
