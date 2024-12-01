import { HttpException, HttpStatus } from "@nestjs/common";

export class NoSpinsException extends HttpException {
    constructor() {
        super('No spins left', HttpStatus.BAD_REQUEST);
    }
}