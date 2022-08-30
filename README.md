# react-mirt

An react audio trimmer component ~copied~ inspired by iOS. It can be used to set a start and end time for an audio file in order to process it further, e.g. using ffmpeg. You can also zoom in to make finer adjustments by holding down the handle.

![ezgif-1-bfe867f0ff](https://user-images.githubusercontent.com/34043608/166158444-5a7b99db-31b7-4991-a836-2a9ce632599c.gif)

## Install

```bash
  yarn add react-mirt
  # npm install react-mirt
```

## Use

```javascript
import Mirt from 'react-mirt';
import 'react-mirt/dist/css/react-mirt.css';

function App() {
  return <Mirt file={myWayTooLongAudioFile} />;
}
```

## Props

| Property    | Type     | Description                            |
| :---------- | :------- | :------------------------------------- |
| `file`      | `File`   | The audio file to be trimmed           |
| `className` | `string` | Additional classes on the root element |
| `style`     | `object` | Additional styles on the root element  |
| `options`   | `object` | See options below                      |

## Options

| Parameter            | Type      | Default                  | Description                                                                                  |
| :------------------- | :-------- | :----------------------- | :------------------------------------------------------------------------------------------- |
| `showButton`         | `boolean` | true                     | Show/hide the play button                                                                    |
| `waveformColor`      | `string`  | rgba(255, 255, 255, 0.5) | Color of the waveform as CSS color value                                                     |
| `waveformBarWidth`   | `number`  | 0.5                      | Width of waveform bar depending on the block width (e.g. 0.5 equals half of the block width) |
| `waveformBlockWidth` | `number`  | 4                        | Width of waveform block (sum of bar and space)                                               |
| `fineTuningDelay`    | `number`  | 500                      | Delay (ms) for switching to fine tuning (0 disables fine tuning)                             |
| `fineTuningScale`    | `number`  | 5                        | Zoom factor for fine tuning                                                                  |
| `start`              | `number`  |                          | Overwrite current start value                                                                |
| `end`                | `number`  |                          | Overwrite current end value                                                                  |

## Callback functions

| Event              | Type                                                         | Description                                                                                        |
| :----------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `onChange`         | `({ start: number; current: number; end: number }) => void;` | Returns the start and end values and the current playhead handle position, if one of these changed |
| `onAudioLoaded`    | `(audio: HTMLAudioElement) => void;`                         | Triggered as soon as the audio element has been loaded, returns the HTML audio element             |
| `onWaveformLoaded` | `() => void;`                                                | Triggered as soon as the waveform has been generated                                               |
| `onError`          | `(error: Error) => void;`                                    | Triggered when an error has occurred, returns the error                                            |

## Styling

There are several ways to customise the appearance. I recommend overwriting the CSS variables. But you can also import the sass file and overwrite its variables or you add your own styles on top.

| Variable                            | Sass Variable                 | Default | Description                                         |
| :---------------------------------- | :---------------------------- | :------ | :-------------------------------------------------- |
| `--mirt-height`                     | `$height`                     | 3rem    | Height of the component                             |
| `--mirt-border-radius`              | `$border-radius`              | 0.3rem  | Border radius of component and inner frame          |
| `--mirt-background-color`           | `$background-color`           | #333    | Background color (also of button and waveform)      |
| `--mirt-playhead-width`             | `$playhead-width`             | 0.35rem | Playhead width                                      |
| `--mirt-playhead-color`             | `$playhead-color`             | #fff    | Playhead color                                      |
| `--mirt-frame-border-width`         | `$frame-border-width`         | 0.3rem  | Width of (colored) frame border                     |
| `--mirt-frame-color`                | `$frame-color`                | #409f80 | Color of frame                                      |
| `--mirt-handle-width`               | `$handle-width`               | 1.2rem  | Width of start and end handles                      |
| `--mirt-handle-icon-width`          | `$handle-icon-width`          | 0.75rem | Icon width of start and end handles                 |
| `--mirt-handle-icon-color`          | `$handle-icon-color`          | #333    | Icon color of start and end handles                 |
| `--mirt-handle-transition-duration` | `$handle-transition-duration` | 500ms   | Transition duration start, end and playhead handles |
| `--mirt-button-width`               | `$button-width`               | 3rem    | Width of play/pause button                          |
| `--mirt-button-border-color`        | `$button-border-color`        | #222    | Border (right) color of play/pause button           |
| `--mirt-button-hover-color`         | `$button-hover-color`         | #444    | Hover color of play/pause button                    |
| `--mirt-button-icon-width`          | `$button-icon-width`          | 1rem    | Icon width of play/pause button                     |
| `--mirt-button-icon-color`          | `$button-icon-color`          | #fff    | Icon color of play/pause button                     |

## License
MIT
