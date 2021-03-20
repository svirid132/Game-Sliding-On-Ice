let menu = document.querySelector('.Menu .play');
menu.addEventListener('click', initGame);

const WIDTH_FIELD = 300;
const HEIGHT_FIELD = 400;
const WIDTH_PERSON = 45;
const HEIGHT_PERSON = 50;
const BEGIN_Y = 0;
let currentIndexFrame = 0;

const WIDTH_PLATFORM = 60;
const HEIGHT_PLATFORM = 60;
const COUNT_MAX_PLATFORM = WIDTH_FIELD / WIDTH_PLATFORM;
const COUNT_VEIW_PLATFORM = 6; 

const X_BEGIN_FOR_PERSON = 0; 
const Y_BEGIN_FOR_PERSON = HEIGHT_FIELD - HEIGHT_PLATFORM - 40;
// const Y_BEGIN_FOR_PERSON = 0;

class managerSpriteCoordinate {
    #widthItemSprite = 0;
    #heightItemSprite = 0;

    #indexStateMove = 0;//0 - move 2 - jump
    #indexDirec = 0;//0 - right 1 - left

    constructor (widthItemSprite, heightItemSprite) {
        this.#widthItemSprite = widthItemSprite;
        this.#heightItemSprite = heightItemSprite;
    }

    setDirection(direc) { //left, right, up, down
        if (direc.right) {
            this.#indexDirec = 0;
        }  else if (direc.left) {
            this.#indexDirec = 1;
        }

        const isJump = direc.up || direc.down;
        if (isJump){
             this.#indexStateMove = 2;
        } else {
            this.#indexStateMove = 0;
        }
    }

    getCoordinate(indexColumn) {
        const indexRow = this.#indexStateMove + this.#indexDirec;
        return (
            {
                x: indexColumn * this.#widthItemSprite, 
                y: indexRow * this.#heightItemSprite, 
            });
    }
};

class Person {
    #coordinate = {
        x: 0,
        y: 0,
    };
    #move = {
        right: false,
        left: false,
        up: false,
        down: false,
        speedStep: 80,
        speedJump: 170,
        onUp: 0,
    };
    #sprite;
    #spriteCoordinate;
    #spriteProps = {
        speedChange: 7,
        indexRow: 0,
        indexColumn: 0,
        dChangeColumn: 0,
        countItem: 0,
    };

    constructor(x, y) {
        this.#coordinate.x = x;
        this.#coordinate.y = y;
    }

    setMove(direction) {
        switch (direction) {
            case 'up':
                if (this.isJump()) return;
                this.#move.up = true;
                this.#move.onUp = 60;
                break;
            case 'left':
                if (this.#move.right === true) return;
                this.#move.left = true;
                break;
            case 'right':
                if (this.#move.left === true) return;
                this.#move.right = true;
                break;
        }
        this.#spriteCoordinate.setDirection(this.#move);
    }

    resertSpriteColumn() {
        this.#spriteProps.dChangeColumn = 0;
        this.#spriteProps.indexColumn = 0;
    }

    isJump() {
        return this.#move.up || this.#move.down;
    }

    setUnmove(direction) {
        switch (direction) {
            case 'left':
                this.#move.left = false;
                if (!this.isJump()) this.resertSpriteColumn();
                break;
            case 'right':
                this.#move.right = false;
                if (!this.isJump()) this.resertSpriteColumn();
                break;
        }
    }

    setSprite(path, itemWidth, itemHeight) {
        this.#sprite = new Image();
        this.#sprite.src = path;
        this.#spriteCoordinate = new managerSpriteCoordinate(itemWidth, itemHeight);
    }

    getSpriteImage() {
        return this.#sprite;
    }

    getCoordinate() {
        return this.#coordinate;
    }

    getSpriteCoordinate() {
        if (this.#move.up && this.#move.right) {
            return this.#spriteCoordinate.getCoordinate(1);
        } else if (this.#move.down) {
            return this.#spriteCoordinate.getCoordinate(2);
        } else if (this.#move.left || this.#move.right) {
            return this.#spriteCoordinate.getCoordinate(this.#spriteProps.indexColumn);
        }
        return this.#spriteCoordinate.getCoordinate(0);
    }

    updateCoordinate(dt) {
        if (this.#move.left === true) {
            this.#coordinate.x -= this.#move.speedStep * dt;
        }
        if (this.#move.right === true) {
            this.#coordinate.x += this.#move.speedStep * dt;
        }
        if (this.#move.up === true) {
            const dChange = this.#move.speedJump * dt;
            this.#move.onUp -= dChange;
            console.log(this.#move.onUp);
            if (Math.floor(this.#move.onUp) < 0) {
                this.#move.up = false;
                this.#move.down = true;
                return;
            }
            this.#coordinate.y -= dChange;
        }
        if (this.#move.down === true) {
            this.#coordinate.y += this.#move.speedJump * dt;
        }
    }

    updateCoordinateSprite(dt) {
        if (this.#move.right || this.#move.left && !this.isJump()) {
            this.#spriteProps.indexRow = 0;
            this.#spriteProps.dChangeColumn += dt * this.#spriteProps.speedChange;
            const column = Math.floor(this.#spriteProps.dChangeColumn);
            if (column > 3) { 
                this.resertSpriteColumn();
                return;
            }
            this.#spriteProps.indexColumn = column;
        }
        if (this.isJump()) {
            this.#spriteProps.indexRow = 1;
            if (this.onUp > 0) {
                this.#spriteProps.indexColumn = 1;
            } else {
                this.#spriteProps.indexColumn = 2;
            }
        }
    }

    update(dt) {
        this.updateCoordinate(dt);
        this.updateCoordinateSprite(dt);
    }
};

class Platform {
    #firstBlock = {
        x: 0,
        y: 0,
    };
    #endBlock = {
        x: 0,
        y: 0,
    }
    #coordinates; 
    #spriteCoordinates;

    constructor() {
        const x = WIDTH_PLATFORM * this.getRandomNum(0, COUNT_MAX_PLATFORM - 1);
        const y = 100;
        this.#firstBlock.x = x;
        this.#firstBlock.y = y;

        const x_ =  WIDTH_PLATFORM * this.getRandomNum(this.#firstBlock.x / WIDTH_PLATFORM + 1, 
            COUNT_MAX_PLATFORM - 1); 
        const y_ = 100;
        this.#endBlock.x = x_;
        this.#endBlock.y = y_;
        this.createCoordinatePlatform();
        this.createCoordinateSprite();
    }

    createCoordinatePlatform() {
        const countBlock = ((this.#endBlock.x + WIDTH_PLATFORM) - this.#firstBlock.x) / WIDTH_PLATFORM;
        this.#coordinates = new Array(countBlock);
        for (let i = 0; i < countBlock; ++i) {
            const x = (i * WIDTH_PLATFORM) + this.#firstBlock.x;
            this.#coordinates[i] = {
                x: x,
                y: this.#firstBlock.y,
            };
        }
    }

    createCoordinateSprite() {
        const countBlock = this.#coordinates.length;
        this.#spriteCoordinates = new Array(countBlock);
        for (let i = 0; i < countBlock; ++i) {
            const row = this.getRandomNum(0, 1);
            if (i === 0) {
                this.#spriteCoordinates[0] = {
                    x: 0,
                    y: row * HEIGHT_PLATFORM,
                }
                continue;
            } else if (i === countBlock - 1) {
                console.log(`blcok - 1: ${i}`);
                console.log((COUNT_VEIW_PLATFORM - 1) * WIDTH_PLATFORM);
                this.#spriteCoordinates[countBlock - 1] = {
                    x: ((COUNT_VEIW_PLATFORM - 1) * WIDTH_PLATFORM),
                    y: row * HEIGHT_PLATFORM,
                }
                continue;
            }
            console.log(i);
            const columnSprite = this.getRandomNum(1, COUNT_VEIW_PLATFORM - 2);
            this.#spriteCoordinates[i] = {
                x: columnSprite * WIDTH_PLATFORM,
                y: row * HEIGHT_PLATFORM,
            }
        }
    }

    getCoordinates() {
        return this.#coordinates;
    }

    getSpriteCoordinates() {
        return this.#spriteCoordinates;
    }

    getRandomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

} 

class Platforms {
    #coordinate = {
        x: 0,
        y: 0,
    };
    #countBlock;
    
    addPlatform(y, countBlock) {

    }
}

class logicGame {
    #person;
    #platforms = new Array();
    constructor(person) {
        this.#person = person;
    };

    add(platform) {
        this.#platforms.add(platform);
    }

    delete(platform) {
        this.#platforms.delete(platform);
    }
};

function initGame() {
    document.querySelector('.Menu').hidden = true;
    let game = document.querySelector('.Game');
    game.hidden = false;
}

let person = new Person(X_BEGIN_FOR_PERSON, Y_BEGIN_FOR_PERSON, WIDTH_PERSON, HEIGHT_PERSON);
person.setSprite('screen/pingvins.png', WIDTH_PERSON, HEIGHT_PERSON);

let leterTime;
let needPerson = 100;

let platform = new Platform;


function playGame() {

    let now = Date.now();
    let dt = (now - leterTime) / 1000.0;

    let x = 10;
    let y = HEIGHT_FIELD - HEIGHT_PLATFORM - 43;

    ctx.clearRect(0, 0,  WIDTH_FIELD, HEIGHT_FIELD);

    for (let i = 0 ; i < COUNT_MAX_PLATFORM; ++i) {
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

    person.update(dt);
    const spriteCoordinate = person.getSpriteCoordinate();
    const coordinate = person.getCoordinate();

    // console.log(`coordinate: ${coordinate.x} ${coordinate.y}`);
    // console.log(`spriteCoordinate: ${spriteCoordinate.x} ${spriteCoordinate.y}`);

    ctx.drawImage(person.getSpriteImage(), 
        spriteCoordinate.x, spriteCoordinate.y, 
        WIDTH_PERSON, HEIGHT_PERSON, 
        coordinate.x, coordinate.y, 
        WIDTH_PERSON, HEIGHT_PERSON);


    //     for (let i = 0 ; i < COUNT_MAX_PLATFORM; ++i) {
    //         let numPlatform = getRandomIntInclusive(1, 4);
    //         let xSprite = WIDTH_PLATFORM * numPlatform;
    //         let xField = WIDTH_PLATFORM * i;
    //         let yField = HEIGHT_FIELD - HEIGHT_PLATFORM - 150;
    //         ctx.drawImage(imgPlatform, 
    //             xSprite, 0,
    //             WIDTH_PLATFORM, HEIGHT_PLATFORM,
    //             xField, yField,
    //         WIDTH_PLATFORM, HEIGHT_PLATFORM - 20);
    // }

    if (currentIndexFrame === 3) currentIndexFrame = 0; 
    ++currentIndexFrame;

    const platformCoordinates = platform.getCoordinates();
    const spriteCoordinates = platform.getSpriteCoordinates();
    
    for (let i = 0; i < platformCoordinates.length; ++i) {
        ctx.drawImage(imgPlatform, 
        spriteCoordinates[i].x, spriteCoordinates[i].y, 
        WIDTH_PLATFORM, HEIGHT_PLATFORM, 
        platformCoordinates[i].x, platformCoordinates[i].y, 
        WIDTH_PLATFORM, HEIGHT_PLATFORM);
    }

    leterTime = now; 
}

let canvas = document.querySelector('.GameCanvas');
var ctx = canvas.getContext("2d");

let imgPlatform = new Image();
imgPlatform.src = 'screen/Platforms.png';

letterTime = Date.now();

setInterval(playGame, 1000 / 60);

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


document.addEventListener('keydown', function(event) {
        if (event.code == 'KeyD') {
            person.setMove('right');
        } else if (event.code == 'KeyA') {
            person.setMove('left');
        }   
        if (event.code == 'Space') {
            person.setMove('up')
        }
    }
);

document.addEventListener('keyup', function(event) {
        if (event.code == 'KeyD') {
            person.setUnmove('right');
        } else if (event.code == 'KeyA') {
            person.setUnmove('left');
        } 
    }   
);