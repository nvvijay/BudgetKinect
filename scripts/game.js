/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tf from '@tensorflow/tfjs';

let mouseDown = false;

// const c0Button = document.getElementById('tc0');
// const c1Button = document.getElementById('tc1');
// const c2Button = document.getElementById('tc2');
// const c3Button = document.getElementById('tc3');
// const c4Button = document.getElementById('tc4');

const CONTROLS = ["tc0", "tc1", "tc2", "tc3", "tc4"];

export let exampleHandler;

export function setExampleHandler(handler){
  exampleHandler = handler;
}

async function handler(label) {
  mouseDown = true;
  const className = label
  // const button = document.getElementById("tc"+className);
  // const total = document.getElementById(className + '-total');
  while (mouseDown) {
    exampleHandler(label);
    // document.body.setAttribute('data-active', CONTROLS[label]);
    // total.innerText = ++totals[label];
    await tf.nextFrame();
  }
  // document.body.removeAttribute('data-active');
}

export function drawThumb(img, label) {
  // if (thumbDisplayed[label] == null) {
    const thumbCanvas = document.getElementById(CONTROLS[label] + 'preview');
    draw(img, thumbCanvas);
  // }
}

export function draw(image, canvas) {
  const [width, height] = [224, 224];
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
    imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
    imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

// c0Button.addEventListener('mousedown', () => handler(0));
// c0Button.addEventListener('mouseup', () => mouseDown = false);

// c1Button.addEventListener('mousedown', () => handler(1));
// c1Button.addEventListener('mouseup', () => mouseDown = false);

// c2Button.addEventListener('mousedown', () => handler(2));
// c2Button.addEventListener('mouseup', () => mouseDown = false);

// c3Button.addEventListener('mousedown', () => handler(3));
// c3Button.addEventListener('mouseup', () => mouseDown = false);

// c4Button.addEventListener('mousedown', () => handler(4));
// c4Button.addEventListener('mouseup', () => mouseDown = false);

