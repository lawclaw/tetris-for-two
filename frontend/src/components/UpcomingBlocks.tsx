import { Piece, SHAPES } from "./Types";

interface UpcomingPiecesProps {
    upcomingPieces: Piece[];
}
 
function UpcomingPieces({upcomingPieces}: UpcomingPiecesProps) {
    return (
        <div className="upcoming">
        {upcomingPieces.map((piece, pieceIndex) => {
          const shape = SHAPES[piece].shape.filter((row) =>
            row.some((cell) => cell)
          );
          return (
            <div key={pieceIndex}>
              {shape.map((row, rowIndex) => {
                return (
                  <div key={rowIndex} className="row">
                    {row.map((isSet, cellIndex) => {
                      const cellClass = isSet ? piece : 'hidden';
                      return (
                        <div
                          key={`${pieceIndex}-${rowIndex}-${cellIndex}`}
                          className={`cell ${cellClass}`}
                        ></div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
}
 
export default UpcomingPieces;