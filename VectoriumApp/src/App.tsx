
import { SideBar } from './components/SideBar';
import { CanvasView } from './components/CanvasView';
import { Inspector } from './components/Inspector';

function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vectorium-bg text-white selection:bg-white/20">
      <SideBar />
      <CanvasView />
      <Inspector />
    </div>
  );
}

export default App;
