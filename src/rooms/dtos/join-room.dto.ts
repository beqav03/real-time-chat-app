import { IsNotEmpty, IsInt } from 'class-validator';

export class JoinRoomDto {
    @IsNotEmpty()
    @IsInt()
    roomId: number;
}
