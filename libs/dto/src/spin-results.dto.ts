import { IsNotEmpty, Length, ArrayMaxSize, ArrayMinSize } from "class-validator";

export class SpinResultsDto {
    @IsNotEmpty()
    @Length(4, 4)
    userId: string;

    @IsNotEmpty()
    @ArrayMinSize(3)
    @ArrayMaxSize(3)
    spinResults: number[];

    constructor(userId: string, spinResults: number[]) {
        this.userId = userId;
        this.spinResults = spinResults;
    }
}