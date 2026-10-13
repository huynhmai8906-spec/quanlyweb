import React, { useState } from 'react';
import { Ambulance } from '../types';
import { DIJKSTRA_NODES, DIJKSTRA_EDGES } from '../data/mockData';

interface EmergencyViewProps {
  ambulances: Ambulance[];
  onTriggerToast: (title: string, desc: string, type: 'emergency' | 'success') => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  ambulances,
  onTriggerToast,
}) => {
  const [selectedDestId, setSelectedDestId] = useState<string>('DEST-Q1');
  const [trafficCondition, setTrafficCondition] = useState<number>(1.0); // 1.0: Normal, 1.4: Rush hour, 1.8: Flooding

  // Dijkstra shortest path computation
  const calculateDijkstra = () => {
    const startNode = 'NODE-GRANDCARE';
    const distances: Record<string, number> = {};
    const times: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const unvisited = new Set<string>();

    DIJKSTRA_NODES.forEach((node) => {
      distances[node.id] = Infinity;
      times[node.id] = Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });

    distances[startNode] = 0;
    times[startNode] = 0;

    while (unvisited.size > 0) {
      // Find unvisited node with smallest distance
      let current: string | null = null;
      let smallestDist = Infinity;
      unvisited.forEach((nodeId) => {
        if (distances[nodeId] < smallestDist) {
          smallestDist = distances[nodeId];
          current = nodeId;
        }
      });

      if (!current || distances[current] === Infinity) break;
      if (current === selectedDestId) break;

      unvisited.delete(current);

      // Check neighbors
      DIJKSTRA_EDGES.forEach((edge) => {
        let neighbor: string | null = null;
        if (edge.from === current && unvisited.has(edge.to)) neighbor = edge.to;
        else if (edge.to === current && unvisited.has(edge.from)) neighbor = edge.from;

        if (neighbor) {
          const effectiveTime = edge.normalTimeMin * trafficCondition;
          const altDist = distances[current!] + edge.baseDistanceKm;
          const altTime = times[current!] + effectiveTime;

          if (altDist < distances[neighbor]) {
            distances[neighbor] = altDist;
            times[neighbor] = altTime;
            previous[neighbor] = current;
          }
        }
      });
    }

    // Reconstruct path
    const path: string[] = [];
    let curr: string | null = selectedDestId;
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }

    return {
      path,
      totalDistanceKm: Math.round(distances[selectedDestId] * 10) / 10,
      totalTimeMin: Math.round(times[selectedDestId]),
    };
  };

  const dijkstraResult = calculateDijkstra();

  // Helper to check if edge is part of shortest path
  const isEdgeInPath = (from: string, to: string) => {
    const path = dijkstraResult.path;
    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i] === from && path[i + 1] === to) ||
        (path[i] === to && path[i + 1] === from)
      ) {
        return true;
      }
    }
    return false;
  };

  const handleSendToTablet = () => {
    onTriggerToast(
      'Đã Gửi Lộ Trình Thành Công!',
      'Dijkstra Waypoint đã được nạp tự động vào Tablet Panasonic Toughbook của BS. Huỳnh Mai (Xe ICU-02).',
      'success'
    );
  };

  const handleDepartEmergency = () => {
    onTriggerToast(
      'LỆNH XUẤT PHÁT KHẨN CẤP ĐÃ BAN HÀNH',
      'Đã cấp phép còi ưu tiên & gửi yêu cầu mở luồng xanh giao thông tuyến Mai Chí Thọ tới CSGT TP.HCM.',
      'emergency'
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-6 py-4 bg-surface flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Top Command Strip */}
        <div className="px-6 py-4 bg-surface-clean rounded-2xl shadow-xs border border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-xs font-bold text-emergency-red uppercase tracking-wider">
                Trung Tâm Cấp Cứu 115 Ngoại Viện
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emergency-red text-white text-[10px] font-bold animate-pulse">
                CẤP CỨU THỜI GIAN VÀNG
              </span>
            </div>
            <h2 className="font-headline-sm text-xl text-primary font-bold mt-1">
              Trung Tâm Điều Phối Cấp Cứu 115 & Dijkstra GPS
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSendToTablet}
              className="h-10 px-4 rounded-xl bg-sapphire-dispatch hover:bg-slate-800 text-white font-title-sm text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">tablet_mac</span>
              <span>Phát Lệnh Sang Tablet Đội Cứu Thương</span>
            </button>

            <button
              onClick={handleDepartEmergency}
              className="h-10 px-4 rounded-xl bg-emergency-red hover:bg-red-700 text-white font-title-sm text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all animate-pulse"
            >
              <span className="material-symbols-outlined text-[18px]">emergency</span>
              <span>Lệnh Xuất Phát Khẩn Cấp</span>
            </button>
          </div>
        </div>

        {/* Section 1: Ambulance Fleet */}
        <div>
          <h3 className="font-headline-sm text-lg text-on-surface font-bold mb-3 flex items-center justify-between">
            <span>Đội Xe Cứu Thương ICU Ngoại Viện Thường Trực</span>
            <span className="text-xs text-primary font-bold">4 Đội xe sẵn sàng</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ambulances.map((amb) => {
              const isMoving = amb.status.includes('cấp cứu');
              return (
                <div
                  key={amb.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isMoving
                      ? 'bg-emergency-red/5 border-emergency-red ring-1 ring-emergency-red/20 shadow-xs'
                      : 'bg-surface-container-lowest border-outline-variant/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-primary">{amb.code}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono">({amb.licensePlate})</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isMoving
                            ? 'bg-emergency-red text-white animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {amb.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-on-surface mb-0.5">{amb.type}</div>
                    <div className="text-[11px] text-on-surface-variant truncate mb-2">
                      {amb.currentLocation}
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-clean border border-outline-variant/20 space-y-1 mb-3 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Trưởng kíp:</span>
                        <span className="font-bold text-on-surface truncate">{amb.leadDoctor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Tài xế:</span>
                        <span className="text-on-surface">{amb.driver}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-on-surface-variant/90 line-clamp-2 italic mb-2">
                      Trang bị: {amb.equipment.join(' · ')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-vital-stable font-bold">Pin: {amb.batteryPercent}%</span>
                    <span className="text-on-surface font-semibold">Nhiên liệu: {amb.fuelPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Dijkstra Route Optimizer & Graph Map */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Dijkstra Algorithm Controls & Step Logs (4 Columns) */}
          <div className="xl:col-span-4 rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-1">
                <span className="material-symbols-outlined text-[18px]">route</span>
                <span>Thuật Toán Tối Ưu Lộ Trình Dijkstra</span>
              </div>
              <h3 className="font-headline-sm text-base text-on-surface font-bold">
                Cấu Hình Tham Số Điều Hướng
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">Điểm Xuất Phát (Origin)</label>
                <input
                  type="text"
                  disabled
                  value="Bệnh Viện GrandCare (Mai Chí Thọ, TP. Thủ Đức)"
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-semibold text-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Điểm Đến / Hiện Trường Cấp Cứu *</label>
                <select
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-semibold"
                >
                  <option value="DEST-Q1">Điểm Cấp Cứu Quận 1 (Phố Nguyễn Huệ)</option>
                  <option value="DEST-CHORAY">Bệnh Viện Chợ Rẫy (Tuyến Trên Q5)</option>
                  <option value="DEST-Q7">Điểm Cấp Cứu Phú Mỹ Hưng (Quận 7)</option>
                  <option value="DEST-HIGHTECH">Khu Công Nghệ Cao (TP. Thủ Đức)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1.5">
                  Tình Trạng Giao Thông Thực Tế (Hệ số thời gian)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { factor: 1.0, label: 'Thông thoáng (1.0x)' },
                    { factor: 1.4, label: 'Cao điểm (1.4x)' },
                    { factor: 1.8, label: 'Mưa ngập (1.8x)' },
                  ].map((item) => (
                    <button
                      key={item.factor}
                      type="button"
                      onClick={() => setTrafficCondition(item.factor)}
                      className={`py-2 px-1 rounded-xl text-center font-bold text-[11px] transition-all ${
                        trafficCondition === item.factor
                          ? 'bg-sapphire-dispatch text-white shadow-2xs'
                          : 'bg-surface-clean border border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Computed Shortest Route Box */}
            <div className="p-4 rounded-xl bg-surface-clean border border-outline-variant/20 space-y-2">
              <div className="text-xs font-bold text-primary flex items-center justify-between">
                <span>Kết Quả Lộ Trình Dijkstra:</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Tối Ưu Nhất
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center font-mono pt-1">
                <div className="p-2 rounded-lg bg-surface-container-low">
                  <div className="text-[10px] text-on-surface-variant font-sans">Khoảng cách</div>
                  <div className="text-lg font-bold text-primary tabular-nums">
                    {dijkstraResult.totalDistanceKm} km
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-low">
                  <div className="text-[10px] text-on-surface-variant font-sans">Thời gian vàng</div>
                  <div className="text-lg font-bold text-emergency-red tabular-nums">
                    ~{dijkstraResult.totalTimeMin} phút
                  </div>
                </div>
              </div>

              {/* Node Sequence */}
              <div className="pt-2 text-[11px] text-on-surface-variant">
                <span className="font-bold text-on-surface">Chuỗi nút giao:</span>
                <div className="font-mono text-emerald-800 font-semibold mt-1 space-y-0.5">
                  {dijkstraResult.path.map((nodeId, idx) => {
                    const node = DIJKSTRA_NODES.find((n) => n.id === nodeId);
                    return (
                      <div key={nodeId} className="flex items-center gap-1">
                        <span className="text-xs">{idx === 0 ? '⚑' : idx === dijkstraResult.path.length - 1 ? '🎯' : '↓'}</span>
                        <span>{node?.label || nodeId}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step-by-step algorithm logs */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1">
              <div className="text-amber-400 font-bold">// Dijkstra Algorithm Step Logs:</div>
              <div>1. Init dist[GrandCare]=0, dist[others]=∞</div>
              <div>2. Min-PriorityQueue pop: [NODE-GRANDCARE]</div>
              <div>3. Relax adjacent edges: An Phú, Ba Son, Hầm...</div>
              <div>4. Optimal path settled for: {selectedDestId}</div>
            </div>
          </div>

          {/* Interactive SVG Graph Map Canvas (8 Columns) */}
          <div className="xl:col-span-8 rounded-2xl bg-slate-950 p-6 border border-slate-800 shadow-md text-white flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline-sm text-base text-white font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[20px]">map</span>
                  <span>Bản Đồ GPS Điều Hướng Đồ Thị Dijkstra Realtime</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trực quan hóa đường đi ngắn nhất qua các nút giao trọng điểm TP.HCM
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-1 bg-emerald-400 inline-block"></span>
                  Lộ trình tối ưu
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-1 bg-slate-600 inline-block"></span>
                  Tuyến phụ
                </span>
              </div>
            </div>

            {/* SVG Graph Viewport */}
            <div className="w-full h-[400px] bg-slate-900/80 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 700 500" className="w-full h-full">
                {/* Defs for gradients & glowing filters */}
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Draw Edges */}
                {DIJKSTRA_EDGES.map((edge, i) => {
                  const fromNode = DIJKSTRA_NODES.find((n) => n.id === edge.from);
                  const toNode = DIJKSTRA_NODES.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const isShortest = isEdgeInPath(edge.from, edge.to);

                  return (
                    <g key={i}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={isShortest ? '#10b981' : '#334155'}
                        strokeWidth={isShortest ? 4 : 1.5}
                        strokeDasharray={isShortest ? '8,4' : undefined}
                        filter={isShortest ? 'url(#glow)' : undefined}
                        className={isShortest ? 'animate-pulse' : ''}
                      />
                      {/* Distance label */}
                      <text
                        x={(fromNode.x + toNode.x) / 2}
                        y={(fromNode.y + toNode.y) / 2 - 4}
                        fill={isShortest ? '#6ee7b7' : '#64748b'}
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {edge.baseDistanceKm}km
                      </text>
                    </g>
                  );
                })}

                {/* Draw Nodes */}
                {DIJKSTRA_NODES.map((node) => {
                  const isInShortest = dijkstraResult.path.includes(node.id);
                  const isHospital = node.type === 'hospital';
                  const isDestination = node.id === selectedDestId;

                  return (
                    <g key={node.id} className="cursor-pointer" onClick={() => setSelectedDestId(node.id)}>
                      {/* Halo */}
                      {isInShortest && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isHospital || isDestination ? 18 : 12}
                          fill={isDestination ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.2)'}
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isHospital ? 12 : isDestination ? 11 : 7}
                        fill={
                          isHospital
                            ? '#004340'
                            : isDestination
                            ? '#ef4444'
                            : isInShortest
                            ? '#10b981'
                            : '#475569'
                        }
                        stroke="#ffffff"
                        strokeWidth={isInShortest ? 2 : 1}
                      />

                      {/* Icon or Marker */}
                      {isHospital && (
                        <text
                          x={node.x}
                          y={node.y + 4}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          H+
                        </text>
                      )}

                      {/* Label */}
                      <text
                        x={node.x}
                        y={node.y + (isHospital ? 24 : 18)}
                        fill={isDestination ? '#f87171' : isInShortest ? '#a7f3d0' : '#94a3b8'}
                        fontSize="10"
                        fontWeight={isInShortest ? 'bold' : 'normal'}
                        textAnchor="middle"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Live Tele-ICU Stream Strip (Ambulance ICU-02) */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emergency-red animate-ping shrink-0"></span>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Tele-ICU Trực Tiếp: Xe ICU-02</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Starlink 5G Connected</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Bệnh nhân cấp cứu: Hôn mê, nghi ngờ đột quỵ não cấp giờ thứ 1.5
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">HR</span>
                  <span className="text-emerald-400 font-bold text-sm">108 bpm</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">SpO2</span>
                  <span className="text-emerald-400 font-bold text-sm">94.0%</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">NIBP</span>
                  <span className="text-white font-bold text-sm">138/88</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">EtCO2</span>
                  <span className="text-amber-400 font-bold text-sm">36 mmHg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
