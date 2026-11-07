# VR-game
# Skyline Archery

A small browser-based archery game built with Three.js and WebXR. Play with a mouse on desktop or enter VR and shoot with a motion-controller trigger.

## Run locally

1. Install Node.js 18 or newer.
2. In this folder, run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.

WebXR requires a supported browser and headset, and a secure context. `localhost` is considered secure for local testing; a deployed game needs HTTPS.

## Controls

- **Desktop:** Move the mouse to aim and click to shoot.
- **VR:** Select **ENTER VR**, point either controller, and press its trigger.
- Hit the center ring for 1,000 points. The challenge starts on the first arrow and lasts 60 seconds.
