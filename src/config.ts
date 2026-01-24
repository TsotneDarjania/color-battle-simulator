import Phaser, { Physics } from "phaser";

export default {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#040C12",
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      // debug: true, // << ENABLE DEBUGGING
      gravity: { y: 0 }, // or whatever gravity you use
    },
  },
};

export const gamePlayConfig = {
  unitWidth: 40,
};
