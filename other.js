'use strict'

export default class myClass {
    constructor() {

    }

    ur = '20';

    hello() {
        // alert(this.ur);
        return function() {
            alert(this.ur);
        }
    }
};