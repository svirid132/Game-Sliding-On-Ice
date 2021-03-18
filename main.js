let menu = document.querySelector('.Menu .play');
menu.addEventListener('click', initGame);

class managerImageSizes {
    #widthItemSprite = 0;
    #heightItemSprite = 0;

    constructor (widthItemSprite, heightItemSprite) {
        this.#widthItemSprite = widthItemSprite;
        this.#heightItemSprite = heightItemSprite;
    }

    getXSprite(indexRow) {
        return indexRow * this.#widthItemSprite;
    }

    getYSpite(indexColumn) {
        return indexColumn * this.#heightItemSprite;
    }
};

class Person {
    #x = 0;
    #y = 0;
    #img;
    #managerImage;

    //count Pixel moving
    #right = 0;
    #left = 0;
    #jumpUp = 0;
    #jumpDown = 0;

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    jump() {
        if (!this.#jumpUp && !this.#jumpDown) {
            this.#jumpUp = 10;
            this.#jumpDown = 10;
        }
    }

    moveLeft() {
        if (this.#left === 0) this.#left = 4;
    }

    moveRight() {
        if (this.#right === 0) this.#right = 4;
    }

    setImage(imgPath, itemWidth, itemHeight) {
        let imgPerson = new Image();
        imgPerson.src = imgPath;
        this.#managerImage = new managerImageSizes(itemWidth, itemHeight);
        this.#img = imgPerson;
    };

    getImage() {
        return this.#img;
    }

    getX() {
        if (this.#left !== 0) {
            this.#left -= 1;
            this.#x -= 1;
        } else if (this.#right !== 0) {
            this.#right -= 1;
            this.#x += 1;
        }
        return this.#x;
    }

    getY() {
        if (this.#jumpUp !== 0) {
            this.#jumpUp -= 1;
            this.#y -= 1;
        } else if (this.#jumpDown !== 0) {
            this.#jumpDown -= 1;
            this.#y += 1;
        }
        return this.#y;
    }

    getXSpriteСoordinate () {

        if (this.#jumpUp > 0) {
            return this.#managerImage.getXSprite(1);
        } else if (this.#jumpDown > 0) {
            return this.#managerImage.getXSprite(2);
        }

        switch (this.#right) {
            case 4:
                return this.#managerImage.getXSprite(1);
            case 3:
            case 2:
                return this.#managerImage.getXSprite(2);
            case 3:
                return this.#managerImage.getXSprite(3);
        }

        return this.#managerImage.getXSprite(0);
    }

    getYSpriteСoordinate () {
        if (this.#jumpUp > 0 || this.#jumpDown > 0) {
            return this.#managerImage.getYSpite(1);
        } else {
            return this.#managerImage.getYSpite(0);
        }
    }
};

function initGame() {
    document.querySelector('.Menu').hidden = true;
    let game = document.querySelector('.Game');
    game.hidden = false;
}

const WIDTH_FIELD = 300;
const HEIGHT_FIELD = 400;
const WIDTH_PERSON = 45;
const HEIGHT_PERSON = 50;
const BEGIN_Y = 0;
let currentIndexFrame = 0;

const WIDTH_PLATFORM = 60;
const HEIGHT_PLATFORM = 60;
const COUNT_MAX_PLATFORM_WIDTH = WIDTH_FIELD / WIDTH_PLATFORM;

const X_BEGIN_FOR_PERSON = 0; 
const Y_BEGIN_FOR_PERSON = HEIGHT_FIELD - HEIGHT_PLATFORM - 40;
// const Y_BEGIN_FOR_PERSON = 0;

let person = new Person(X_BEGIN_FOR_PERSON, Y_BEGIN_FOR_PERSON, WIDTH_PERSON, HEIGHT_PERSON);
person.setImage('screen/pingvins.png', WIDTH_PERSON, HEIGHT_PERSON);

function playGame() {
    let x = 10;
    let y = HEIGHT_FIELD - HEIGHT_PLATFORM - 43;

    ctx.clearRect(0, 0,  WIDTH_FIELD, HEIGHT_FIELD);

    for (let i = 0 ; i < COUNT_MAX_PLATFORM_WIDTH; ++i) {
        let numPlatform = getRandomIntInclusive(1, 4);
        let xSprite = WIDTH_PLATFORM * numPlatform;
        let xField = WIDTH_PLATFORM * i;
        let yField = HEIGHT_FIELD - HEIGHT_PLATFORM;
        ctx.drawImage(imgPlatform, 
            xSprite, 0,
            WIDTH_PLATFORM, HEIGHT_PLATFORM,
            xField, yField,
            WIDTH_PLATFORM, HEIGHT_PLATFORM);
    }

    ctx.drawImage(person.getImage(), 
        person.getXSpriteСoordinate(), person.getYSpriteСoordinate(), 
        WIDTH_PERSON, HEIGHT_PERSON, 
        person.getX(), person.getY(), 
        WIDTH_PERSON, HEIGHT_PERSON);


        for (let i = 0 ; i < COUNT_MAX_PLATFORM_WIDTH; ++i) {
            let numPlatform = getRandomIntInclusive(1, 4);
            let xSprite = WIDTH_PLATFORM * numPlatform;
            let xField = WIDTH_PLATFORM * i;
            let yField = HEIGHT_FIELD - HEIGHT_PLATFORM - 150;
            ctx.drawImage(imgPlatform, 
                xSprite, 0,
                WIDTH_PLATFORM, HEIGHT_PLATFORM,
                xField, yField,
            WIDTH_PLATFORM, HEIGHT_PLATFORM - 20);
    }

    if (currentIndexFrame === 3) currentIndexFrame = 0; 
    ++currentIndexFrame;
}

let canvas = document.querySelector('.GameCanvas');
var ctx = canvas.getContext("2d");

let imgPlatform = new Image();
imgPlatform.src = 'screen/Platforms.png';

setInterval(playGame, 25);

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener('keydown', function(event) {
        if (event.code == 'KeyD') {
            console.log(event.code);
            person.moveRight();
        } else if (event.code == 'KeyA') {
            person.moveLeft();
        }   
        if (event.code == 'Space') {
            console.log(event.code);
            person.jump();
        }
    }
);
