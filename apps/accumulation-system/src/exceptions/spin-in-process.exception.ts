import { HttpException, HttpStatus } from "@nestjs/common";

export class SpinInProcessException extends HttpException {
    constructor() {
        super('Spin is already being processed', HttpStatus.BAD_REQUEST);
    }
}