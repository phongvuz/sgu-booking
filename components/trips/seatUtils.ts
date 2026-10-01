export interface Seat {
    id: string;
    row: string;
    num: number;
    floor: 1 | 2;
    isBooked: boolean;
}
const checkIsBooked = (seatCode: string, bookedSeats: string[]):boolean =>{
    if (!bookedSeats) return false;
    return bookedSeats.includes(seatCode);
}
export default function generateSeats(bookedSeats: string[] = []): Seat []{
    const rows = ["A", "B", "C"];
    const generated: Seat[] = [];
    for( const row of rows){
        for(let num = 1; num <= 6; num++){
            const id = `${row}${String(num).padStart(2,"0")}`;
            generated.push({
                id,row,num,floor:1,isBooked:checkIsBooked(id,bookedSeats),
            });
        }
    }
    for( const row of rows){
        for(let num = 7; num <= 12; num++){
            const id = `${row}${String(num).padStart(2,"0")}`;
            generated.push({
                id,row,num,floor:2,isBooked:checkIsBooked(id,bookedSeats),
            });
        }
    }
    return generated;
}