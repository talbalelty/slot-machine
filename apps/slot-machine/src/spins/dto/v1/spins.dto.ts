import { IsNotEmpty, Length } from 'class-validator';

export class SpinsDto {
    @IsNotEmpty()
    @Length(4, 4)
    userId: string;
}