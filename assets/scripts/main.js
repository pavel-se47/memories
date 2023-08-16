let config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  rows: 2,
  cols: 2,
  cards: [1, 2],
  timeout: 15,
  scene: new GameScene(),
};

let game = new Phaser.Game(config);
