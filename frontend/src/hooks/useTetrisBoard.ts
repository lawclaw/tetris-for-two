import { Dispatch, useReducer } from "react";
import { BoardShape, EmptyCell, Piece, PieceShape, SHAPES } from "../components/Types";

export type BoardState = {
    board: BoardShape;
    droppingRow: number;
    droppingColumn: number;
    droppingPiece: Piece;
    droppingShape: PieceShape;
}

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;


export function useTetrisBoard(): [BoardState, Dispatch<Action>] {
    const [boardState, dispatchBoardState] = useReducer(
        boardReducer,
        {
            board: [],
            droppingRow: 0,
            droppingColumn: 0,
            droppingPiece: Piece.I,
            droppingShape: SHAPES.I.shape,
        },
        (emptyState) => {
            const state = {
                ...emptyState,
                board: getEmptyBoard(),
            };
            return state;
        }
    );
    return [boardState, dispatchBoardState];
}

export function getEmptyBoard(height = BOARD_HEIGHT): BoardShape {
    return Array(height)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(EmptyCell.Empty));
}

export function getRandomPiece(): Piece {
    const pieceValues = Object.values(Piece);
    return pieceValues[Math.floor(Math.random() * pieceValues.length)] as Piece;
}

export function hasCollisions(
    board: BoardShape,
    currentShape: PieceShape,
    row: number,
    column: number,
): boolean {
    let hasCollision = false;
    currentShape
        .filter((shapeRow) => shapeRow.some((isSet) => isSet))
        .forEach((shapeRow: boolean[], rowIndex: number) => {
            shapeRow.forEach((isSet: boolean, colIndex: number) => {
                if (isSet &&
                    (row + rowIndex >= board.length ||
                        column + colIndex >= board[0].length ||
                        column + colIndex < 0 ||
                        board[row + rowIndex][column + colIndex] !== EmptyCell.Empty)
                ) {
                    hasCollision = true;
                }
            })
        })

    return hasCollision;
}



type Action = {
    type: 'start' | 'drop' | 'commit' | 'move' | 'instantDrop',
    newBoard?: BoardShape,
    newPiece?: Piece,
    isPressingLeft?: boolean;
    isPressingRight?: boolean;
    isRotating?: boolean;
};

function boardReducer(state: BoardState, action: Action): BoardState {
    let newState = { ...state };

    switch (action.type) {
        case 'start':
            const firstPiece = getRandomPiece();
            return {
                board: getEmptyBoard(),
                droppingRow: 0,
                droppingColumn: 3,
                droppingPiece: firstPiece,
                droppingShape: SHAPES[firstPiece].shape,
            };
        case 'drop':
            newState.droppingRow++;
            break;
        case 'commit':
            return {
                board: [
                    ...getEmptyBoard(BOARD_HEIGHT - action.newBoard!.length),
                    ...action.newBoard!,
                ], 
                droppingRow: 0,
                droppingColumn: 3,
                droppingPiece: action.newPiece!,
                droppingShape: SHAPES[action.newPiece!].shape,
            }
        case 'move':
            const rotatedShape = action.isRotating
                ? rotatePiece(newState.droppingShape)
                : newState.droppingShape;
            let columnOffset = action.isPressingLeft ? -1 : 0;
            columnOffset = action.isPressingRight ? 1 : columnOffset;
            if (
                !hasCollisions(
                    newState.board,
                    rotatedShape,
                    newState.droppingRow,
                    newState.droppingColumn + columnOffset
                )
            ) {
                newState.droppingColumn += columnOffset;
                newState.droppingShape = rotatedShape;
            }
            break; 
        case 'instantDrop':
            while (!hasCollisions(newState.board, newState.droppingShape, newState.droppingRow + 1, newState.droppingColumn)) {
                newState.droppingRow++;
            }
            break;
        default:
            const unhandledType: never = action.type;
            throw new Error(`Unhandled action type: ${unhandledType}`)
    }

    return newState;
}


function rotatePiece(shape: PieceShape): PieceShape {
    const rows = shape.length;
    const columns = shape[0].length;

    const rotated = Array(rows)
        .fill(null)
        .map(() => Array(columns).fill(false));
    
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            rotated[column][rows - 1 - row] = shape[row][column];
        }
    }
    return rotated;
}