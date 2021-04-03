export class CheckerLogicPlatform {
    coordinatePerson;//pointer
    coordinatePlatform;//pointer
    checker;
    constructor(coordinatePerson, coordinatePlatform) {
        this.coordinatePlatform = coordinatePlatform;
        this.coordinatePerson = coordinatePerson;
        this.setChecker(new checkerDownPlatform);
    };
    setChecker(checker) {
        this.checker = checker;
    }
    check() {
        return this.checker.check(this);//return method changed Person
    }
};

class checkerDownPlatform {
    name = 'down';
    constructor(){}
    check(checkLogic) {
        let person = checkLogic.coordinatePerson;
        let platform = checkLogic.coordinatePlatform;
        if (person.p1.y <= platform.p2.y && person.p1.y > platform.p1.y) {
            if (platform.p1.x >= person.p2.x || platform.p2.x <= person.p1.x) {
                checkLogic.setChecker(new CheckerMiddlePlatform);
                return checkLogic.check();
            } else {
                return function(checkLogic) {
                    this.setCoordinate({
                        x: this.coordinate.p1.x, 
                        y: checkLogic.coordinatePlatform.p2.y,
                    }, null);   
                    this.stopJump();
                    this.move.down = true;
                }
            }
        }
        return null;
    }
};

class CheckerMiddlePlatform {
    name = 'middle';
    constructor(){}
    check(checkLogic) {
        let person = checkLogic.coordinatePerson;
        let platform = checkLogic.coordinatePlatform;
        if (person.p2.y < platform.p1.y) {
            checkLogic.setChecker(new CheckerTopPlatform);
            return checkLogic.check();
        } else if(person.p1.y > platform.p2.y) {
            checkLogic.setChecker(new checkerDownPlatform);
            return checkLogic.check();
        } else if (person.p2.x > platform.p1.x) {
            // return function(checkLogic) {
            //     this.setCoordinate(null, {
            //         x: checkLogic.coordinatePlatform.p1.x, 
            //         y: checkLogic.coordinatePerson.p2.y,
            //     });
            // }
        } else if (person.p1.x < platform.p2.x) {
            // return function(checkLogic) {
            //     this.setCoordinate({
            //         x: checkLogic.coordinatePlatform.p2.x, 
            //         y: checkLogic.coordinatePerson.p1.y,
            //     }, null);
            // }
        }
    return null;
    }
};

class CheckerTopPlatform {
    name = 'top';
    constructor() {

    }
    check(checkLogic) {
        let person = checkLogic.coordinatePerson;
        let platform = checkLogic.coordinatePlatform;
        if (platform.p1.x < person.p2.x && platform.p2.x > person.p1.x && platform.p1.y <= person.p2.y) {
            checkLogic.setChecker(new CheckerOnPlatform);
            return function(checkLogic) {
                this.setCoordinate(null, {
                    x: checkLogic.coordinatePerson.p2.x, 
                    y: checkLogic.coordinatePlatform.p1.y,
                });
                this.move.down = false;
            }
        } else if ((platform.p1.x >= person.p2.x || platform.p2.x <= person.p1.x) && (platform.p1.y < person.p2.y && platform.p2.y > person.p2.y)) {
            checkLogic.setChecker(new CheckerMiddlePlatform);
            return checkLogic.check();
        }
        return null;
    }
};

export class CheckerOnPlatform {
    name = 'on';
    constructor(){

    }
    check(checkLogic) {
        // console.log('onPlatform');
        let person = checkLogic.coordinatePerson;
        let platform = checkLogic.coordinatePlatform;
        //platform.p1.x > person.p2.x && platform.p2.x < person.p1.x || 
        if (person.p2.y < platform.p1.y) {
            checkLogic.setChecker(new CheckerTopPlatform());
            return checkLogic.check();
        } else if(platform.p1.x > person.p2.x || platform.p2.x < person.p1.x) {
            checkLogic.setChecker(new CheckerTopPlatform());
            return function(checkLogic) {
                this.move.down = true;
            }
        }
    }
}