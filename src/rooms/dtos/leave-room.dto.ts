import { IsNotEmpty, IsInt } from 'class-validator';

export class LeaveRoomDto {
    @IsNotEmpty()
    @IsInt()
    roomId: number;
}
