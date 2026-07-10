import { useState } from "react";
import { Menu } from "./components/Menu";
import { GameTable } from "./components/GameTable";
import { useGameController } from "./lib/useGameController";

export default function App() {
  const [started, setStarted] = useState(false);
  const ctrl = useGameController();

  if (!started) {
    return (
      <Menu
        onStart={(playerCount) => {
          ctrl.startMatch(playerCount);
          setStarted(true);
        }}
      />
    );
  }

  return <GameTable ctrl={ctrl} onExitToMenu={() => setStarted(false)} />;
}
