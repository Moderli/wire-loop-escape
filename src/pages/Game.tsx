import { WireLoopGame } from "@/components/WireLoopGame";
import { Dispatch, SetStateAction } from "react";

export interface GameProps {
  nickname: string;
  currentLevel: number;
  setCurrentLevel: Dispatch<SetStateAction<number>>;
}

const Game = ({ nickname, currentLevel, setCurrentLevel }: GameProps) => {
  return (
    <div className="game-container">
      <WireLoopGame nickname={nickname} currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} />
    </div>
  );
};

export default Game; 