import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Gamepad2, Zap, Play, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle2, Box, Keyboard } from 'lucide-react';
import { TECH_QUIZ_QUESTIONS } from '../data/roboticsData';

const SIZE = 9;
const START = { x: 0, z: 8 };
const EXIT = { x: 8, z: 0 };
const WALLS = new Set([
  '1,8','1,7','1,6','3,7','3,6','3,5','5,5','5,4','5,3',
  '7,4','7,3','7,2','2,2','3,2','4,2','6,7','7,7'
]);
const CELLS = [{x:2,z:8},{x:4,z:8},{x:6,z:6},{x:2,z:4},{x:4,z:3}];

function ThreeMaze({ onWin }) {
  const hostRef = useRef(null);
  const engineRef = useRef(null);
  const [position, setPosition] = useState(START);
  const [collected, setCollected] = useState([]);
  const [status, setStatus] = useState('Điều khiển robot trong mê cung 3D và thu thập 5 lõi năng lượng.');
  const [won, setWon] = useState(false);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let renderer;
    let cleanup = () => {};
    const setup = async () => {
      try {
        const THREE = await import(/* @vite-ignore */ 'https://esm.sh/three@0.160.0');
        if (disposed || !hostRef.current) return;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#080808');
        scene.fog = new THREE.Fog('#080808', 15, 34);
        const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
        camera.position.set(10, 13, 14);
        camera.lookAt(0, 0, 0);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        hostRef.current.appendChild(renderer.domElement);
        const ambient = new THREE.HemisphereLight(0xffffff, 0x444444, 2.1);
        scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 2.3);
        sun.position.set(7, 14, 8);
        sun.castShadow = true;
        scene.add(sun);

        const floor = new THREE.Mesh(
          new THREE.BoxGeometry(SIZE, 0.35, SIZE),
          new THREE.MeshStandardMaterial({ color: '#242424', roughness: 0.9 })
        );
        floor.position.set(0, -0.24, 0);
        floor.receiveShadow = true;
        scene.add(floor);

        const grid = new THREE.GridHelper(SIZE, SIZE, 0x777777, 0x444444);
        grid.position.y = -0.04;
        scene.add(grid);

        const wallMat = new THREE.MeshStandardMaterial({ color: '#555555', roughness: 0.82 });
        WALLS.forEach((key) => {
          const [x,z] = key.split(',').map(Number);
          const wall = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.15, 0.92), wallMat);
          wall.position.set(x - 4, 0.48, z - 4);
          wall.castShadow = true;
          wall.receiveShadow = true;
          scene.add(wall);
        });

        const exit = new THREE.Mesh(
          new THREE.CylinderGeometry(0.48, 0.48, 0.08, 32),
          new THREE.MeshStandardMaterial({ color: '#d4d4d4', emissive: '#777777', emissiveIntensity: 0.7 })
        );
        exit.position.set(EXIT.x - 4, 0.03, EXIT.z - 4);
        scene.add(exit);

        const robot = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.5, 0.58), new THREE.MeshStandardMaterial({ color: '#d4d4d4', metalness: 0.45, roughness: 0.35 }));
        body.position.y = 0.42;
        body.castShadow = true;
        robot.add(body);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.38), new THREE.MeshStandardMaterial({ color: '#f5f5f5', metalness: 0.3 }));
        head.position.y = 0.82;
        head.castShadow = true;
        robot.add(head);
        const eyeMat = new THREE.MeshStandardMaterial({ color: '#111111', emissive: '#aaaaaa', emissiveIntensity: 0.7 });
        [-0.1,0.1].forEach(x => {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), eyeMat);
          eye.position.set(x,0.84,0.195);
          robot.add(eye);
        });
        const wheelMat = new THREE.MeshStandardMaterial({ color: '#333333' });
        [-0.27,0.27].forEach(x => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.12,20),wheelMat);
          wheel.rotation.z = Math.PI/2;
          wheel.position.set(x,0.18,0);
          robot.add(wheel);
        });
        scene.add(robot);

        const cores = CELLS.map((cell) => {
          const core = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.25, 0),
            new THREE.MeshStandardMaterial({ color: '#eeeeee', emissive: '#999999', emissiveIntensity: 1.1, metalness: 0.55 })
          );
          core.position.set(cell.x - 4, 0.48, cell.z - 4);
          core.castShadow = true;
          scene.add(core);
          return core;
        });

        const resize = () => {
          if (!hostRef.current) return;
          const width = hostRef.current.clientWidth;
          const height = hostRef.current.clientHeight;
          if (!width || !height) return;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(hostRef.current);
        resize();

        const render = () => {
          frame = requestAnimationFrame(render);
          const t = performance.now() * 0.001;
          cores.forEach((core, i) => {
            core.rotation.y += 0.012;
            core.position.y = 0.48 + Math.sin(t * 2 + i) * 0.09;
          });
          robot.position.set(positionRef.current.x - 4, 0, positionRef.current.z - 4);
          renderer.render(scene, camera);
        };
        frame = requestAnimationFrame(render);
        engineRef.current = { THREE, scene, robot, cores, renderer, camera };
        setEngineReady(true);
        cleanup = () => {
          observer.disconnect();
          cancelAnimationFrame(frame);
          renderer?.dispose();
          scene.traverse((obj) => {
            obj.geometry?.dispose?.();
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material?.dispose?.();
          });
          renderer?.domElement?.remove();
        };
      } catch {
        setStatus('Không tải được thư viện 3D. Kiểm tra kết nối mạng rồi tải lại trang.');
      }
    };
    const positionRef = { current: position };
    positionRefRef.current = positionRef;
    setup();
    return () => {
      disposed = true;
      cleanup();
    };
  // Three.js scene is initialized once; position updates are rendered from the ref.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const positionRefRef = useRef({ current: START });
  useEffect(() => { positionRefRef.current.current = position; }, [position]);

  const move = useCallback((dx, dz) => {
    if (won) return;
    const next = { x: position.x + dx, z: position.z + dz };
    if (next.x < 0 || next.x >= SIZE || next.z < 0 || next.z >= SIZE || WALLS.has(`${next.x},${next.z}`)) {
      setStatus('Lối đi bị chặn. Hãy chọn hướng khác.');
      return;
    }
    setPosition(next);
    const coreIndex = CELLS.findIndex((c, i) => !collected.includes(i) && c.x === next.x && c.z === next.z);
    if (coreIndex >= 0) {
      const updated = [...collected, coreIndex];
      setCollected(updated);
      setStatus(`Đã thu thập lõi năng lượng ${updated.length}/5.`);
    }
    if (next.x === EXIT.x && next.z === EXIT.z) {
      if (collected.length + (coreIndex >= 0 ? 1 : 0) === CELLS.length) {
        setWon(true);
        setStatus('Hoàn thành! Robot đã mở cổng thoát và nhận 100 XP.');
        onWin();
      } else {
        setStatus('Cổng thoát cần đủ 5 lõi năng lượng. Hãy tìm các lõi còn lại.');
      }
    }
  }, [position, collected, won, onWin]);

  useEffect(() => {
    const handleKey = (event) => {
      const map = {
        ArrowUp: [0,-1], w: [0,-1], W: [0,-1],
        ArrowDown: [0,1], s: [0,1], S: [0,1],
        ArrowLeft: [-1,0], a: [-1,0], A: [-1,0],
        ArrowRight: [1,0], d: [1,0], D: [1,0],
      };
      const moveBy = map[event.key];
      if (moveBy) {
        event.preventDefault();
        move(moveBy[0], moveBy[1]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  const reset = () => {
    setPosition(START);
    setCollected([]);
    setWon(false);
    setStatus('Đã khởi động lại mê cung. Thu thập đủ 5 lõi năng lượng!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8 rounded-2xl border border-neutral-700 bg-black overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-100"><Box className="w-4 h-4"/> RoboMaze 3D</div>
          <div className="text-xs text-neutral-400">{engineReady ? 'WebGL 3D đang chạy' : 'Đang tải cảnh 3D…'}</div>
        </div>
        <div ref={hostRef} className="w-full h-[390px] sm:h-[500px]" />
        <div className="p-3 border-t border-neutral-800 text-sm text-neutral-300">{status}</div>
      </div>
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-neutral-700 bg-neutral-950 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white"><Keyboard className="w-4 h-4"/> Điều khiển robot</div>
          <p className="text-xs text-neutral-400 mt-2">Dùng WASD, phím mũi tên hoặc các nút dưới đây.</p>
          <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto mt-5">
            <span />
            <button onClick={() => move(0,-1)} className="rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white p-3 flex justify-center"><ArrowUp/></button>
            <span />
            <button onClick={() => move(-1,0)} className="rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white p-3 flex justify-center"><ArrowLeft/></button>
            <button onClick={() => move(0,1)} className="rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white p-3 flex justify-center"><ArrowDown/></button>
            <button onClick={() => move(1,0)} className="rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white p-3 flex justify-center"><ArrowRight/></button>
          </div>
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs text-neutral-300"><span>Lõi năng lượng</span><strong>{collected.length}/5</strong></div>
            <div className="h-2 rounded-full bg-neutral-800 overflow-hidden"><div className="h-full bg-neutral-200 transition-all" style={{width:`${collected.length/5*100}%`}}/></div>
            <button onClick={reset} className="w-full mt-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 text-sm flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4"/> Chơi lại</button>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-700 bg-neutral-950 p-5 text-xs text-neutral-300 space-y-2">
          <div className="font-bold text-white">Nhiệm vụ</div>
          <p>1. Thu thập đủ 5 lõi năng lượng đang phát sáng.</p>
          <p>2. Tìm đường đến cổng thoát ở góc đối diện.</p>
          <p>3. Tránh các khối tường và lập kế hoạch đường đi.</p>
          <div className="flex items-center gap-2 pt-2 text-neutral-400"><span className="w-3 h-3 rounded-sm bg-neutral-500"/> Tường <span className="w-3 h-3 rounded-full bg-neutral-200 ml-2"/> Lõi năng lượng</div>
        </div>
      </div>
    </div>
  );
}

export default function GamesAndChallenges({ onEarnXp }) {
  const [activeGame, setActiveGame] = useState('maze');
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [mazeWins, setMazeWins] = useState(0);
  const currentQ = TECH_QUIZ_QUESTIONS[qIndex];

  const handleAnswer = (idx) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (idx === currentQ.answer) {
      setQuizScore((s) => s + 1);
      onEarnXp(30, 'Trả lời đúng Tech Quiz');
    }
  };

  const weeklyChallenges = [
    { id: 'c1', title: 'Thiết kế mô hình robot mê cung trong môi trường mô phỏng 3D', xp: 150, level: 'Kỹ sư tập sự' },
    { id: 'c2', title: 'Giải thích cách PID giúp robot bám đường ổn định', xp: 200, level: 'Kỹ sư chính' },
    { id: 'c3', title: 'Thiết kế sơ đồ node ROS2 cho robot tự hành', xp: 250, level: 'Cấp cao' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Gamepad2 className="w-5 h-5"/> Đấu trường Game & Thử thách Kỹ thuật</h2>
          <p className="text-sm text-neutral-400 mt-1">Game mê cung 3D tương tác, thử thách thuật toán và tích lũy XP.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveGame('maze')} className={`px-4 py-2 rounded-xl text-xs font-semibold ${activeGame === 'maze' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300'}`}>🤖 RoboMaze 3D</button>
          <button onClick={() => setActiveGame('quiz')} className={`px-4 py-2 rounded-xl text-xs font-semibold ${activeGame === 'quiz' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300'}`}>⚡ Đố vui Kỹ thuật</button>
        </div>
      </div>
      {activeGame === 'maze' ? (
        <ThreeMaze onWin={() => { setMazeWins(v => v + 1); onEarnXp(100, 'Hoàn thành RoboMaze 3D'); }} />
      ) : (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 max-w-3xl mx-auto space-y-5">
          <div className="flex items-center justify-between text-xs text-neutral-400"><span>Câu hỏi {qIndex + 1} / {TECH_QUIZ_QUESTIONS.length}</span><span className="font-semibold">Điểm phiên này: {quizScore} đúng</span></div>
          <h3 className="text-lg font-bold text-white">{currentQ.q}</h3>
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const correct = idx === currentQ.answer;
              const selected = selectedOpt === idx;
              const style = selectedOpt === null ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:border-neutral-400' : correct ? 'bg-neutral-800 border-neutral-300 text-white' : selected ? 'bg-neutral-800 border-neutral-500 text-neutral-200' : 'bg-neutral-900 border-neutral-800 text-neutral-400';
              return <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full text-left p-3.5 rounded-xl border text-sm ${style}`}>{opt}</button>;
            })}
          </div>
          {selectedOpt !== null && <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><p className="text-xs text-neutral-300"><strong>Giải thích:</strong> {currentQ.explain}</p><button onClick={() => {setSelectedOpt(null);setQIndex(v=>(v+1)%TECH_QUIZ_QUESTIONS.length);}} className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs">Câu tiếp theo →</button></div>}
        </div>
      )}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4"><Trophy className="w-5 h-5"/> Thử thách Kỹ thuật Tuần này</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weeklyChallenges.map(ch => {
            const joined = joinedChallenges.includes(ch.id);
            return <div key={ch.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between"><div><span className="text-[11px] font-semibold text-neutral-300">+{ch.xp} XP • {ch.level}</span><h4 className="text-sm font-bold text-white mt-2">{ch.title}</h4></div><button disabled={joined} onClick={() => {setJoinedChallenges(prev=>[...prev,ch.id]);onEarnXp(ch.xp,`Hoàn thành thử thách: ${ch.title}`);}} className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${joined?'bg-neutral-800 text-neutral-500':'bg-neutral-700 hover:bg-neutral-600 text-white'}`}><CheckCircle2 className="w-3.5 h-3.5"/>{joined?'Đã nộp thử thách':'Nhận & Hoàn thành thử thách'}</button></div>;
          })}
        </div>
      </div>
    </div>
  );
}
