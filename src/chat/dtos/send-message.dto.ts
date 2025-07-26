import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class SendMessageDto {
    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsInt()
    roomId: number;
}
