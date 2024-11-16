import { useCallback, useEffect, useState } from "react";
import { BOARD_HEIGHT, getRandomPiece, hasCollisions, useTetrisBoard } from "./useTetrisBoard";
import { useInterval } from "./useInterval";
import { BoardShape, EmptyCell, Piece, PieceShape, SHAPES } from "../components/Types";

enum TickSpeed {
    Normal = 800,
    Sliding = 100,
    Fast = 50,
}

export function useTetris() {
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);
    const [isCommitting, setIsCommitting] = useState(false);
    const [upcomingPieces, setUpcomingPieces] = useState<Piece[]>([]);

    const [
        { board, droppingRow, droppingColumn, droppingPiece, droppingShape },
        dispatchBoardState,
    ] = useTetrisBoard();

    const startGame = useCallback(() => {
        const startingPieces = [
            getRandomPiece(),
            getRandomPiece(),
            getRandomPiece(),
        ];
        setUpcomingPieces(startingPieces);
        setIsPlaying(true);
        setTickSpeed(TickSpeed.Normal);
        dispatchBoardState({ type: 'start' });
    }, [dispatchBoardState]);

    useEffect(() => {
        if (!isPlaying) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            
            if (event.key === 'ArrowDown') {
                setTickSpeed(TickSpeed.Fast);
            }

            if (event.key === 'ArrowUp') {
                dispatchBoardState({
                    type: 'move',
                    isRotating: true,
                });
            }

            if (event.key === 'ArrowLeft') {
                dispatchBoardState({
                    type: 'move',
                    isPressingLeft: true,
                });
            }

            if (event.key === 'ArrowRight') {
                dispatchBoardState({
                    type: 'move',
                    isPressingRight: true,
                });
            }

            if (event.key === ' ') {
                dispatchBoardState({ type: 'instantDrop' });
                setTickSpeed(TickSpeed.Sliding); // Trigger the sliding behavior after an instant drop
                setIsCommitting(true); // Commit the piece immediately
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'ArrowDown') {
                setTickSpeed(TickSpeed.Normal);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            setTickSpeed(TickSpeed.Normal);

        }
    }, [isPlaying]);

    const commitPosition = useCallback(() => {
        if (!hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
            setIsCommitting(false);
            setTickSpeed(TickSpeed.Normal);
            return;
        }

        const newBoard = structuredClone(board) as BoardShape;
        addShapeToBoard(
            newBoard,
            droppingPiece,
            droppingShape,
            droppingRow,
            droppingColumn
        );

        let numCleared = 0
        for  (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
            if (newBoard[row].every((entry) => entry != EmptyCell.Empty)) {
                numCleared++;
                newBoard.splice(row, 1);
            }
        }

        const newUpcomingPieces = structuredClone(upcomingPieces) as Piece[];
        const newPiece = newUpcomingPieces.pop() as Piece;
        newUpcomingPieces.unshift(getRandomPiece());


        if (hasCollisions(board, SHAPES[newPiece].shape, 0, 3)) {
            setIsPlaying(false);
            setTickSpeed(null);
        } else {
            setTickSpeed(TickSpeed.Normal);
        }
    


        setScore((prevScore) => prevScore + getPoints(numCleared));
        setTickSpeed(TickSpeed.Normal);
        setUpcomingPieces(newUpcomingPieces);
        dispatchBoardState({ type: 'commit', newBoard, newPiece });
        setIsCommitting(false);

    }, [board, dispatchBoardState, droppingPiece, droppingColumn, droppingRow, droppingShape]);


    const gameTick = useCallback(() => {
        if (isCommitting) {
            commitPosition();
        } else if (
            hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)
        ) {
            setTickSpeed(TickSpeed.Sliding);
            setIsCommitting(true);
        } else {
            dispatchBoardState({ type: 'drop' });
        }
    }, [board,
        commitPosition,
        dispatchBoardState,
        droppingColumn,
        droppingRow,
        droppingShape,
        isCommitting,])

    useInterval(() => {
        if (!isPlaying) {
            return;
        }
        gameTick();
    }, tickSpeed);

    const renderedBoard = structuredClone(board) as BoardShape;
    if (isPlaying) {
        addShapeToBoard(
            renderedBoard,
            droppingPiece,
            droppingShape,
            droppingRow,
            droppingColumn
        );
    }

    return {
        board: renderedBoard,
        startGame,
        isPlaying,
        score,
        upcomingPieces,
    };
}


function addShapeToBoard(
    board: BoardShape,
    droppingPiece: Piece,
    droppingShape: PieceShape,
    droppingRow: number,
    droppingColumn: number
) {
    droppingShape
        .filter((row) => row.some((isSet) => isSet))
        .forEach((row: boolean[], rowIndex: number) => {
            row.forEach((isSet: boolean, colIndex: number) => {
                if (isSet) {
                    board[droppingRow + rowIndex][droppingColumn + colIndex] = droppingPiece;
                }
            })
        })
}


function getPoints(numCleared: number): number {
    switch(numCleared) {
        case 0:
            return 0;
        case 1:
            return 100;
        case 2: 
            return 300;
        case 3:
            return 500;
        case 4:
            return 800;
        default:
            throw new Error(`Unexpected number of rows cleared: ${numCleared}`);
    }
}
