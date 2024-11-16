import Cell from "./Cell";
import { BoardShape } from "./Types"

interface BoardProps {
    currentBoard: BoardShape;
}

function Board({ currentBoard }: BoardProps) {
    return (
        <div className="board">
            {currentBoard.map((row, rowIndex) => (
                <div className="row" key={`${rowIndex}`}>
                    {row.map((cell, colIndex) => (
                        <Cell key={`${rowIndex}-${colIndex}`}  type={cell}/>
                    ))}
                </div>
            ))}
        </div>
    );
}


export default Board;