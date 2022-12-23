import { MirtOptions } from '../Mirt';

export const toSeconds = (milliseconds: number) => {
  return milliseconds / 1000;
};

export const debounce = (fn: Function, ms = 3000) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const getMinValue = (fineTuning: number, fineTuningResolution: number, duration: number): number => {
  if (fineTuning === -1) return 0;

  return fineTuning - (fineTuningResolution * fineTuning) / duration;
};

export const getMaxValue = (fineTuning: number, fineTuningResolution: number, duration: number): number => {
  if (fineTuning === -1) return duration;

  return fineTuning + (fineTuningResolution * (duration - fineTuning)) / duration;
};

export const getStartHandleValue = (
  position: number,
  fineTuning: number,
  fineTuningResolution: number,
  duration: number
): string => {
  let value = 0;

  if (fineTuning >= 0 && fineTuningResolution) {
    const min = fineTuning - (fineTuningResolution * fineTuning) / duration;

    value = ((position - min) * 100) / fineTuningResolution;
  } else {
    value = (position * 100) / duration;
  }

  return value.toFixed(4);
};

export const getRawData = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const rawData = await audioBuffer.getChannelData(0);

  return rawData;
};

export const getEndHandleValue = (
  position: number,
  fineTuning: number,
  fineTuningResolution: number,
  duration: number
): string => {
  let value = 0;

  if (fineTuning >= 0 && fineTuningResolution) {
    const max = fineTuning + (fineTuningResolution * (duration - fineTuning)) / duration;

    value = ((position - max) * 100 * -1) / fineTuningResolution;
  } else {
    value = (position * 100 * -1) / duration + 100;
  }

  return value.toFixed(4);
};

export const getWaveformData = async (
  rawData: Float32Array,
  canvas: HTMLCanvasElement,
  fineTuning: number,
  fineTuningResolution: number,
  duration: number,
  config: MirtOptions
) => {
  const samples = Math.floor(canvas.offsetWidth / config.waveformBlockWidth);

  let data: Float32Array;

  if (fineTuning >= 0) {
    const ftStart = fineTuning - (fineTuningResolution * fineTuning) / duration;
    const ftEnd = fineTuning + (fineTuningResolution * (duration - fineTuning)) / duration;
    const min = Math.floor((rawData.length * ftStart) / duration);
    const max = Math.floor((rawData.length * ftEnd) / duration);

    data = rawData.slice(min, max);
  } else {
    data = rawData;
  }

  const blockSize = Math.floor(data.length / samples);
  const filteredData = [];

  for (let i = 0; i < samples; i++) {
    let blockStart = blockSize * i;
    let sum = 0;

    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(data[blockStart + j]);
    }

    filteredData.push(sum / blockSize);
  }

  const multiplier = Math.pow(Math.max(...filteredData), -1);
  const normalizedData = filteredData.map((n) => n * multiplier);

  return normalizedData;
};
