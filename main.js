import {CheckerLogicPlatform, CheckerOnPlatform} from './checker.js';

let menu = document.querySelector('.Menu .play');
menu.addEventListener('click', initGame);

const WIDTH_FIELD = 300;
const HEIGHT_FIELD = 400;

const WIDTH_PLATFORM = 60;
const HEIGHT_PLATFORM = 50;
const INDENT_HEIGHT_PLATFORM = 10;
const MAX_CREATING_BLOCKS = 4;
const COUNT_MAX_PLATFORM = WIDTH_FIELD / WIDTH_PLATFORM;
const COUNT_SORT_PLATFORM_SPRITE = 6; 
const DISTANCE_BETWEEN_PLATFRORMS = HEIGHT_FIELD / 3;

const JUMP = DISTANCE_BETWEEN_PLATFRORMS + 50;
const WIDTH_PERSON = 45;
const HEIGHT_PERSON = 50;
const SPEED_CHANGED_FRAME_PERSON = 10;
const SPEED_STEP = 100;
const SPEED_JUMP = 250;
const COUNT_FRAME = 4;

const EGG_HEIGHT = 15;
const EGG_WIDTH = 10;

const EGG_HEIGHT_SPRITE = 66;
const EGG_WIDTH_SPRITE = 44;

const X_BEGIN_FOR_PERSON = 0; 
const Y_BEGIN_FOR_PERSON = HEIGHT_FIELD - HEIGHT_PLATFORM - 40;
// const Y_BEGIN_FOR_PERSON = 0;

let caughtEgg = 0;

function drawItems() {
    arrayPlatfroms.forEach( (pl) => {
        for (let i = 0; i < pl.coordinateSprite.length; ++i) {
            ctx.drawImage(platformSprite, 
            pl.coordinateSprite[i].p1.x, pl.coordinateSprite[i].p1.y, 
            WIDTH_PLATFORM, HEIGHT_PLATFORM + INDENT_HEIGHT_PLATFORM, 
            pl.coordinate.p1.x + i * WIDTH_PLATFORM, pl.coordinate.p1.y - INDENT_HEIGHT_PLATFORM, 
            WIDTH_PLATFORM, WIDTH_PLATFORM
            );
        }
    });

    const coorPerson = person.getCoordinateSprite();
    ctx.drawImage(personSprite, 
        coorPerson.p1.x, coorPerson.p1.y, 
        WIDTH_PERSON, HEIGHT_PERSON, 
        person.coordinate.p1.x, person.coordinate.p1.y, 
        WIDTH_PERSON, HEIGHT_PERSON
    );

    if (egg) {
        ctx.drawImage(eggSprite, 
            0, 0, 
            EGG_WIDTH_SPRITE, EGG_HEIGHT_SPRITE, 
            egg.coordinate.p1.x, egg.coordinate.p1.y, 
            EGG_WIDTH, EGG_HEIGHT
        );
    }

    ctx.font = "36px serif";
    ctx.fillText(`${caughtEgg}/10`, 220, 40);
}

class managerSpriteCoordinate {
    directionPerson;
    sizeItem = {
        width: 0,
        height: 0,
    };
    directionMove = {
        right: true,
        left: false,
    };
    indexRow;
    indexColumnChanged;

    constructor () {
        this.indexRow = 0;
        this.indexColumnChanged = 0;
    }

    setDirection(direction) { //left, right, up, down
        this.directionPerson = direction;
    }

    setItemSize(widthItem, heightItem) {
        this.sizeItem.width = widthItem;
        this.sizeItem.height = heightItem;
    }

    getCoordinate() {
        return (
            {
                p1: {
                    x: Math.floor(this.indexColumnChanged) * WIDTH_PERSON, 
                    y: this.indexRow * this.sizeItem.height, 
                },
                p2: {
                    x: Math.floor(this.indexColumnChanged) * WIDTH_PERSON + WIDTH_PERSON, 
                    y: this.indexRow * this.sizeItem.height + this.sizeItem.height, 
                },
            });
    }

    update(dt) {
        //update Move
        if (this.directionPerson.left || this.directionPerson.right) {
            this.directionMove.left = this.directionPerson.left;
            this.directionMove.right = this.directionPerson.right;
        }
        //finding row
        this.indexRow = 0;
        if (this.directionMove.right === true){ 
            this.indexRow = 0;
        } else if (this.directionMove.left === true) {
            this.indexRow = 1;
        }
        if (this.directionPerson.up || this.directionPerson.down) {
            this.indexRow += 2;
        }
        //finding column
        if (this.directionPerson.up) {
            this.indexColumnChanged = 1
        } else if (this.directionPerson.down) {
            this.indexColumnChanged = 2;
        } else if (this.directionMove.right === this.directionPerson.right &&
            this.directionMove.left === this.directionPerson.left) {
            this.indexColumnChanged += SPEED_CHANGED_FRAME_PERSON * dt;
            if (COUNT_FRAME - 1 < Math.floor(this.indexColumnChanged)) this.indexColumnChanged = 0;
        } else if (this.directionPerson.left || this.directionPerson.right) {
            this.indexColumnChanged = 0;
        } else {
            this.indexColumnChanged = 0;
        }
    }
};

class Person {
    coordinate = {
        p1: {
            x: 0,
            y: 0,
        },
        p2: {
            x: 0,
            y: 0,
        },
    };
    move = {
        right: false,
        left: false,
        up: false,
        down: false,
    };
    managerSprite;
    jumpOnUp = 0;

    constructor() {
        this.managerSprite = new managerSpriteCoordinate();
        this.managerSprite.setDirection(this.move);
        this.managerSprite.setItemSize(WIDTH_PERSON, HEIGHT_PERSON);
    }

    setMove(direction) {
        switch (direction) {
            case 'up':
                if (this.move.up || this.move.down) return;
                this.move.up = true;
                this.jumpOnUp = JUMP;
                break;
            case 'left':
                this.move.right = false;
                this.move.left = true;
                break;
            case 'right':
                this.move.left = false;
                this.move.right = true;
                break;
        }
    }

    setCoordinate(p1, p2) {
        if (p1) {
            this.coordinate.p1.x = p1.x;
            this.coordinate.p1.y = p1.y;
            this.coordinate.p2.x = this.coordinate.p1.x + WIDTH_PERSON;
            this.coordinate.p2.y = this.coordinate.p1.y + HEIGHT_PERSON;
        } else if(p2) {
            this.coordinate.p2.x = p2.x;
            this.coordinate.p2.y = p2.y;
            this.coordinate.p1.x = this.coordinate.p2.x - WIDTH_PERSON;
            this.coordinate.p1.y = this.coordinate.p2.y - HEIGHT_PERSON;
        }
    }

    plusY(y) {
        this.coordinate.p1.y += y;
        this.coordinate.p2.y += y;
    }

    stopJump() {
        this.move.up = false;
        this.jumpOnUp = 0;
    }

    setUnmove(direction) {
        switch (direction) {
            case 'left':
                this.move.left = false;
                break;
            case 'right':
                this.move.right = false;
                break;
        }
    }

    getCoordinateSprite() {
        return this.managerSprite.getCoordinate();
    }

    update(dt) {
        if (this.move.left === true) {
            this.coordinate.p1.x -= SPEED_STEP * dt;
            this.coordinate.p2.x -= SPEED_STEP * dt;
        } else if (this.move.right === true) {
            this.coordinate.p1.x += SPEED_STEP * dt;
            this.coordinate.p2.x += SPEED_STEP * dt;
        }
        if (this.move.up === true) {
            const dJump = SPEED_JUMP * dt;
            this.jumpOnUp -= dJump;
            
            if (Math.floor(this.jumpOnUp) < 0) {
                this.move.up = false;
                this.move.down = true;
                return;
            }
            this.coordinate.p1.y -= dJump;
            this.coordinate.p2.y -= dJump;
        } else if (this.move.down === true) {
            this.coordinate.p1.y += SPEED_JUMP * dt;
            this.coordinate.p2.y += SPEED_JUMP * dt;
        }
        this.managerSprite.update(dt);
    }
};


function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Platform {
    coordinate =  {
        p1: {
            x: 0,
            y: 0,
        },
        p2: {
            x: 0,
            y: 0,
        },
    }
    coordinateSprite;
    countBlocks = 0;

    constructor() {
        this.countBlocks = getRandomNum(2, MAX_CREATING_BLOCKS);
        let indexFirstBlock = getRandomNum(0, COUNT_MAX_PLATFORM - this.countBlocks);
        this.coordinate.p1.x = indexFirstBlock * WIDTH_PLATFORM;
        this.coordinate.p2.x = (indexFirstBlock + this.countBlocks) * WIDTH_PLATFORM;

        this.createCoordinateSprite();
    }

    createCoordinateSprite() {
        this.coordinateSprite = new Array(this.countBlocks);
        for (let i = 0; i < this.countBlocks; ++i) {
            const indexRow = getRandomNum(0, 1);
            if (i === 0) {
                this.coordinateSprite[0] = {
                    p1: {
                        x: 0,
                        y: indexRow * (HEIGHT_PLATFORM + INDENT_HEIGHT_PLATFORM),
                    },
                    p2: {
                        x: WIDTH_PLATFORM,
                        y: indexRow * (HEIGHT_PLATFORM + INDENT_HEIGHT_PLATFORM) + (HEIGHT_PLATFORM + INDENT_HEIGHT_PLATFORM),
                    }
                }
                continue;
            } else if (i === this.countBlocks - 1) {
                this.coordinateSprite[i] = {
                    p1: {
                        x: (COUNT_SORT_PLATFORM_SPRITE - 1) * WIDTH_PLATFORM,
                        y: indexRow * (HEIGHT_PLATFORM + INDENT_HEIGHT_PLATFORM),
                    },
                    p2: {
                        x: (COUNT_SORT_PLATFORM_SPRITE - 1) * WIDTH_PLATFORM + WIDTH_PLATFORM,
                        y: indexRow * (HEIGHT_PLATFORM + INDENT_HEIGHT_PLATFORM) + (HEIGHT_PLATFORM + INDENT_HEIGHT_PLATFORM),
                    }
                }
                continue;
            }
            this.filingCoordinateSprite(i);
        }
    }

    filingCoordinateSprite(i) {
        const columnSprite = getRandomNum(1, COUNT_SORT_PLATFORM_SPRITE - 2);
        let row = getRandomNum(0, 1);
        this.coordinateSprite[i]  = {
            p1: {
                x: columnSprite * WIDTH_PLATFORM,
                y: row * (HEIGHT_PLATFORM + INDENT_HEIGHT_PLATFORM),
            },
            p2: {
                x: columnSprite * WIDTH_PLATFORM + WIDTH_PLATFORM,
                y: row * (HEIGHT_PLATFORM + INDENT_HEIGHT_PLATFORM) + (HEIGHT_PLATFORM + INDENT_HEIGHT_PLATFORM),
            }
        }
    }

    initBeginPlatform() {
        this.countBlocks = COUNT_MAX_PLATFORM;
        this.coordinateSprite = new Array(this.countBlocks);
        this.coordinate.p1.x = 0;
        this.coordinate.p2.x = WIDTH_FIELD;
        for (let i = 0; i < this.countBlocks; ++i) {
            this.filingCoordinateSprite(i);
        }
    }

    setCoordinateY1(y) {
        this.coordinate.p1.y = y;
        this.coordinate.p2.y = y + HEIGHT_PLATFORM;
    }

    plusY(y) {
        this.coordinate.p1.y += y;
        this.coordinate.p2.y += y;
    }
} 

class Egg {
    coordinate = {
        p1: {
            x: 0,
            y: 0,
        },
        p2: {
            x: 0,
            y: 0,
        }
    }
    center = {
        x: 0,
        y: 0,
    }
    constructor(p1) {
        this.coordinate.p1.x = p1.x;
        this.coordinate.p1.y = p1.y;
        this.coordinate.p2.x = this.coordinate.p1.x + EGG_WIDTH;
        this.coordinate.p2.y = this.coordinate.p1.y + EGG_HEIGHT;

        this.updateCenter();
    }

    updateCenter() {
        this.center.x = this.coordinate.p1.x + (EGG_WIDTH / 2);
        this.center.y = this.coordinate.p1.y + (EGG_HEIGHT / 2);
    }

    getCoordinateSprite() {
        return {
            p1: {
                x: 0,
                y: 0,
            },
            p2: {
                x: EGG_WIDTH,
                y: EGG_HEIGHT,
            }
        }
    }

    plusY(y) {
        this.coordinate.p1.y += y;
        this.coordinate.p2.y += y;

        this.updateCenter();
    }
}

class LogicGame {
    platformCheckers = new Map();
    speedDown;
    scope = 0;
    nextEggOnScope = 240;

    constructor() {
        this.speedDown = 0;
        this.scope = 0;
        this.nextEggOnScope = 240;
    };

    initGame() {
        person.setCoordinate({x: 0, y: HEIGHT_FIELD - HEIGHT_PLATFORM - HEIGHT_PERSON}, null);
        this.initBeginPlatform();
        for (let i = 0; i < 3; ++i) {
            this.createPlatform();
        }
        // this.createPlatform();
    }

    initBeginPlatform() {
        let platform_1 = new Platform();
        platform_1.initBeginPlatform();
        platform_1.setCoordinateY1(HEIGHT_FIELD - HEIGHT_PLATFORM);
        arrayPlatfroms.push(platform_1);
        let checker = new CheckerLogicPlatform(person.coordinate, platform_1.coordinate);
        this.platformCheckers.set(platform_1, checker);
        checker.setChecker(new CheckerOnPlatform); 
    }

    checkOutPerson() {
        if (person.coordinate.p1.x < 0) {
            person.setCoordinate({x: 0, y: person.coordinate.p1.y}, null);
        } else if (person.coordinate.p2.x > WIDTH_FIELD) {
            person.setCoordinate(null, {x: WIDTH_FIELD, y: person.coordinate.p2.y});
        }
    }

    plusY(y) {
        person.plusY(y);
        if (egg) egg.plusY(y);
        arrayPlatfroms.forEach((pl) => {
            pl.plusY(y);
        });
    }

    createPlatform() {
        let platform = new Platform();
        const lastIndex = arrayPlatfroms.length - 1;
        platform.setCoordinateY1(arrayPlatfroms[lastIndex].coordinate.p1.y - DISTANCE_BETWEEN_PLATFRORMS);
        arrayPlatfroms.push(platform);
        this.platformCheckers.set(platform, new CheckerLogicPlatform(person.coordinate, platform.coordinate)); 
    }

    deletePlatform(platform) {
        this.platformCheckers.delete(platform);
        arrayPlatfroms.shift();
    }

    checkPlatformDelete() {
        if (arrayPlatfroms[0].coordinate.p1.y >= HEIGHT_FIELD) {
            return arrayPlatfroms[0];
        }
        return null;
    }

    createEgg() {
        let pl = arrayPlatfroms[arrayPlatfroms.length - 1];
        let eggX1;
        const eggY1 = getRandomNum(pl.coordinate.p2.y - EGG_HEIGHT, pl.coordinate.p2.y - DISTANCE_BETWEEN_PLATFRORMS);
        if (eggY1 + EGG_HEIGHT > pl.coordinate.p1.y) {
            eggX1 = (pl.coordinate.p1.x > 0) ? 
                getRandomNum(0, pl.coordinate.p1.x - EGG_WIDTH) :
                getRandomNum(pl.coordinate.p2.x, WIDTH_FIELD - EGG_WIDTH);
        } else {
            eggX1 = getRandomNum(0, WIDTH_FIELD - EGG_WIDTH);
        }
        egg = new Egg({
            x: eggX1,
            y: eggY1,
        });

        const yNext = getRandomNum(400, 800);
        this.nextEggOnScope += yNext;
    }

    checkCaughtEgg(){
        return (
            egg.center.x >= person.coordinate.p1.x &&
            egg.center.x <= person.coordinate.p2.x &&
            egg.center.y >= person.coordinate.p1.y &&
            egg.center.y <= person.coordinate.p2.y
        );
    }

    update(dt) {
        this.checkOutPerson();
        this.plusY(dt * this.speedDown);
        this.platformCheckers.forEach((checker) => {
            let whatChanged = checker.check();
            if (whatChanged) {
                this.speedDown = 30;
                whatChanged.bind(person)(checker);
            };
        });
        let platform = this.checkPlatformDelete();
        if (platform) {
            this.deletePlatform(platform);
            this.createPlatform();
        }
        if (egg) {
            if (this.checkCaughtEgg()) {
                caughtEgg += 1;
                egg = null;
            } else if (egg.coordinate.p1.y > HEIGHT_FIELD) {
                egg = null;
            }
        }
        if (caughtEgg === 10) ; //finishGame   
        this.scope += this.speedDown * dt;
        if (this.scope > this.nextEggOnScope) this.createEgg();
    };
};

function initGame() {
    document.querySelector('.Menu').hidden = true;
    let game = document.querySelector('.Game');
    game.hidden = false;
}

let leterTime = 0;
let platform = new Platform;

function playGame() {

    let now = Date.now();
    let dt = (now - leterTime) / 1000.0;

    person.update(dt);
    logicGame.update(dt);

    ctx.clearRect(0, 0,  WIDTH_FIELD, HEIGHT_FIELD);
    drawItems();

    leterTime = now; 
}

let arrayPlatfroms = new Array();

let egg;

let canvas = document.querySelector('.GameCanvas');
let ctx = canvas.getContext("2d");

let person = new Person();

let personSprite = new Image();
personSprite.src = 'screen/pingvins.png';
let platformSprite = new Image();
platformSprite.src = 'screen/Platforms.png';
let eggSprite = new Image();
eggSprite.src = 'screen/egg.png';

let logicGame = new LogicGame();
logicGame.initGame();

setInterval(playGame, 1000 / 60);

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