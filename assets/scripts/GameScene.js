class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
    this.load.image('bg', 'assets/sprites/background.png');
    this.load.image('backSideCard', 'assets/sprites/card.png');
    this.load.image('card1', 'assets/sprites/card1.png');
    this.load.image('card2', 'assets/sprites/card2.png');
    this.load.image('card3', 'assets/sprites/card3.png');
    this.load.image('card4', 'assets/sprites/card4.png');
    this.load.image('card5', 'assets/sprites/card5.png');

    this.load.audio('theme', 'assets/sounds/theme.mp3');
    this.load.audio('card', 'assets/sounds/card.mp3');
    this.load.audio('complete', 'assets/sounds/complete.mp3');
    this.load.audio('success', 'assets/sounds/success.mp3');
    this.load.audio('timeout', 'assets/sounds/timeout.mp3');
  }

  create() {
    this.timeout = config.timeout;
    this.points = 0;
    this.level = 1;

    this.createBackground();
    this.createSounds();
    this.createTimer();
    this.createText();
    this.createTextPoints();
    this.createTextLevels();
    this.createCards();
    this.start();
  }

  restart() {
    let count = 0;
    let onCardMoveComplete = () => {
      count += 1;
      if (count >= this.cards.length) {
        this.lvlUp();
        this.createCards();
        this.start();
      }
    };

    this.cards.forEach(card => {
      card.move({
        x: this.sys.game.config.width + card.width,
        y: this.sys.game.config.height + card.height,
        delay: card.position.delay,
        callback: onCardMoveComplete,
      });
    });
  }

  start() {
    this.pointsText.setText('Points: ' + this.points);
    this.levelsText.setText('Level: ' + this.level);
    this.timeout = config.timeout;
    this.openedCard = null;
    this.openCardsInARow = 0;
    this.openedCardsCount = 0;
    this.timer.paused = false;

    this.initCardsPositions();
    this.initCards();
    this.showCards();
  }

  initCardsPositions() {
    let positions = [];
    let cardTexture = this.textures.get('backSideCard').getSourceImage();
    let cardWidth = cardTexture.width + 4;
    let cardHeight = cardTexture.height + 4;
    let offsetX =
      (this.sys.game.config.width - cardWidth * config.cols) / 2 +
      cardWidth / 2;
    let offsetY =
      (this.sys.game.config.height - cardHeight * config.rows) / 2 +
      cardHeight / 2;

    let id = 0;

    for (let row = 0; row < config.rows; row += 1) {
      for (let col = 0; col < config.cols; col += 1) {
        (id += 1),
          positions.push({
            x: offsetX + col * cardWidth,
            y: offsetY + row * cardHeight,
            delay: id * 100,
          });
      }
    }

    this.positions = positions;
  }

  initCards() {
    let positions = Phaser.Utils.Array.Shuffle(this.positions);

    this.cards.forEach(card => {
      card.init(positions.pop());
    });
  }

  showCards() {
    this.cards.forEach(card => {
      card.depth = card.position.delay;
      card.move({
        x: card.position.x,
        y: card.position.y,
        delay: card.position.delay,
      });
    });
  }

  createBackground() {
    this.add.sprite(0, 0, 'bg').setOrigin(0, 0);
  }

  createSounds() {
    this.sounds = {
      theme: this.sound.add('theme'),
      card: this.sound.add('card'),
      complete: this.sound.add('complete'),
      success: this.sound.add('success'),
      timeout: this.sound.add('timeout'),
    };
    // this.sounds.theme.play({
    //   volume: 0.1,
    // });
  }

  createTimer() {
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      callbackScope: this,
      loop: true,
    });
  }

  onTimerTick() {
    this.timeoutText.setText('Time: ' + this.timeout);
    if (this.timeout <= 0) {
      this.timer.paused = true;
      this.level = 1;
      this.points = 0;
      config.cols = 2;
      config.timeout = 15;
      config.cards.splice(2);
      this.sounds.timeout.play();
      this.restart();
    } else {
      this.timeout -= 1;
    }
  }

  createText() {
    this.timeoutText = this.add.text(5, 340, '', {
      font: '34px ember',
      fill: 'white',
    });
  }

  createTextPoints() {
    this.pointsText = this.add.text(570, 680, 'Points: ' + this.points, {
      font: '34px ember',
      fill: 'white',
    });
  }

  createTextLevels() {
    this.levelsText = this.add.text(570, 10, 'Level: ' + this.level, {
      font: '34px ember',
      fill: 'white',
    });
  }

  createCards() {
    this.cards = [];

    for (let value of config.cards) {
      for (let i = 0; i < 2; i += 1) {
        this.cards.push(new Card(this, value));
      }
    }

    this.input.on('gameobjectdown', this.onCardClicked, this);
  }

  onCardClicked(pointer, card) {
    if (card.opened) {
      return false;
    }

    this.sounds.card.play();

    if (this.openedCard) {
      if (this.openedCard.value === card.value) {
        this.openedCard = null;
        this.openedCardsCount += 1;

        if (this.openCardsInARow === 0) {
          this.points += 100;
          this.openCardsInARow += 1;
        } else if (this.openCardsInARow === 1) {
          this.points += 250;
          this.openCardsInARow += 1;
        } else if (this.openCardsInARow === 2) {
          this.points += 500;
          this.openCardsInARow += 1;
        } else if (this.openCardsInARow === 3) {
          this.points += 1000;
          this.openCardsInARow += 1;
        } else if (this.openCardsInARow === 4) {
          this.points += 5000;
          this.openCardsInARow += 1;
        }

        this.pointsText.setText('Points: ' + this.points);

        if (this.openedCardsCount < this.cards.length / 2) {
          this.sounds.success.play();
        }
      } else {
        this.openCardsInARow = 0;
        this.openedCard.close();
        this.openedCard = card;
      }
    } else {
      this.openedCard = card;
    }

    card.open(() => {
      if (this.openedCardsCount === this.cards.length / 2) {
        this.sounds.complete.play();
        this.restart();
      }
    });
  }

  lvlUp() {
    if (this.openedCardsCount === 2) {
      config.cols = 3;
      config.cards.push(3);
      config.timeout = 20;
      this.level = 2;
    } else if (this.openedCardsCount === 3) {
      config.cols = 4;
      config.cards.push(4);
      config.timeout = 25;
      this.level = 3;
    } else if (this.openedCardsCount === 4) {
      config.cols = 5;
      config.cards.push(5);
      config.timeout = 30;
      this.level = 4;
    } else if (this.openedCardsCount === 5 && config.timeout === 30) {
      config.timeout = 25;
      this.level = 5;
    } else if (this.openedCardsCount === 5 && config.timeout === 25) {
      config.timeout = 20;
      this.level = 6;
    } else if (this.openedCardsCount === 5 && config.timeout === 20) {
      config.timeout = 15;
      this.level = 7;
    }
    return;
  }
}
