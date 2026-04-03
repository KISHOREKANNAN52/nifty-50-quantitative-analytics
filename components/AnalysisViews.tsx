import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphData } from '../types';
import { RefreshCw, Maximize, Minimize } from 'lucide-react';

export const CorrelationNetwork: React.FC<{ data: GraphData }> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    
    // Helper to get neighbors for highlighting
    const getNeighbors = (nodeId: string) => {
        const neighbors = new Set<string>();
        data.links.forEach(link => {
            // D3 replaces string IDs with object references after simulation starts
            const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
            const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
            if (sourceId === nodeId) neighbors.add(targetId);
            if (targetId === nodeId) neighbors.add(sourceId);
        });
        return neighbors;
    };

    useEffect(() => {
        if (!data.nodes.length || !svgRef.current || !containerRef.current) return;
        
        // Clear previous render
        d3.select(svgRef.current).selectAll("*").remove();

        const width = containerRef.current.clientWidth;
        const height = 650;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .style("background", "#0f172a");

        // --- DEFINITIONS (Glow Filter) ---
        const defs = svg.append("defs");
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // --- ZOOM LAYER ---
        const g = svg.append("g");
        
        const zoomBehavior = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoomBehavior as any);

        // --- SIMULATION ---
        const simulation = d3.forceSimulation(data.nodes as any)
            .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(30));

        // Color Scale for Sectors
        const color = d3.scaleOrdinal(d3.schemeTableau10);

        // --- LINKS ---
        const link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke", "#475569")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", d => Math.sqrt(d.value * 2));

        // --- NODES ---
        const node = g.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .call(d3.drag()
                .on("start", (event, d: any) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d: any) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d: any) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }) as any
            );

        // Node Circle (Sized by value/centrality)
        node.append("circle")
            .attr("r", (d: any) => Math.min(25, 8 + (d.val || 0) * 1.5)) 
            .attr("fill", (d: any) => color(d.group))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .style("filter", "url(#glow)"); // Apply glow

        // Node Label
        node.append("text")
            .text(d => d.id)
            .attr("x", (d: any) => 12 + (d.val || 0))
            .attr("y", 5)
            .attr("fill", "#e2e8f0")
            .style("font-size", "10px")
            .style("font-weight", "600")
            .style("font-family", "sans-serif")
            .style("pointer-events", "none")
            .style("text-shadow", "0px 1px 4px #000");

        // --- INTERACTION ---
        node.on("click", (event, d: any) => {
            event.stopPropagation(); // Prevent bg click
            setSelectedNodeId(d.id);
        });

        svg.on("click", () => {
            setSelectedNodeId(null);
        });

        // --- TICK FUNCTION ---
        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        // Cleanup
        return () => {
            simulation.stop();
        };
    }, [data]);

    // --- HIGHLIGHT EFFECT ---
    useEffect(() => {
        if (!svgRef.current) return;
        
        const svg = d3.select(svgRef.current);
        const nodes = svg.selectAll(".nodes circle");
        const texts = svg.selectAll(".nodes text");
        const lines = svg.selectAll(".links line");

        if (selectedNodeId) {
            const neighbors = getNeighbors(selectedNodeId);
            
            // Fade out non-neighbors
            nodes.transition().duration(300).style("opacity", (d: any) => {
                return (d.id === selectedNodeId || neighbors.has(d.id)) ? 1 : 0.1;
            });
            texts.transition().duration(300).style("opacity", (d: any) => {
                return (d.id === selectedNodeId || neighbors.has(d.id)) ? 1 : 0.1;
            });

            // Highlight connections
            lines.transition().duration(300)
                .style("opacity", (d: any) => {
                    const s = d.source.id || d.source;
                    const t = d.target.id || d.target;
                    return (s === selectedNodeId && neighbors.has(t)) || (t === selectedNodeId && neighbors.has(s)) ? 1 : 0.05;
                })
                .attr("stroke", (d: any) => {
                    const s = d.source.id || d.source;
                    const t = d.target.id || d.target;
                    return (s === selectedNodeId || t === selectedNodeId) ? "#fbbf24" : "#475569"; // Amber for active links
                })
                .attr("stroke-width", (d: any) => {
                    const s = d.source.id || d.source;
                    const t = d.target.id || d.target;
                    return (s === selectedNodeId || t === selectedNodeId) ? 3 : Math.sqrt(d.value * 3);
                });

        } else {
            // Reset
            nodes.transition().duration(300).style("opacity", 1);
            texts.transition().duration(300).style("opacity", 1);
            lines.transition().duration(300)
                .style("opacity", 0.4)
                .attr("stroke", "#475569")
                .attr("stroke-width", (d: any) => Math.sqrt(d.value * 3));
        }
    }, [selectedNodeId, data]);

    return (
        <div ref={containerRef} className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-0 overflow-hidden h-[650px] flex flex-col group">
            
            {/* Top Overlay Controls */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <h3 className="text-xl font-bold text-slate-100 drop-shadow-md">Market Correlation Topology</h3>
                 <p className="text-sm text-slate-400 drop-shadow-md max-w-md">
                     Visualizing price movement correlations. <br/>
                     <span className="text-xs text-slate-500">Node size represents connection density (centrality).</span>
                 </p>
                 {selectedNodeId && (
                     <div className="mt-2 text-yellow-400 font-bold bg-slate-900/50 p-2 rounded inline-block backdrop-blur-md border border-yellow-500/30">
                         Focus: {selectedNodeId}
                     </div>
                 )}
            </div>

            <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                 <button 
                    onClick={() => setSelectedNodeId(null)} 
                    className="p-2 bg-slate-700/80 hover:bg-slate-600 text-white rounded-lg shadow backdrop-blur transition-all" 
                    title="Reset View"
                 >
                    <RefreshCw size={18} />
                 </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-[#0b1120] relative">
                <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
            </div>
            
            {/* Legend Overlay */}
            <div className="absolute bottom-6 left-6 pointer-events-none bg-slate-900/80 p-4 rounded-xl backdrop-blur-sm border border-slate-700/50 shadow-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-wider">Sector Key</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {Array.from(new Set(data.nodes.map(n => n.group))).slice(0, 10).map((sector, i) => (
                        <div key={sector} className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ background: d3.schemeTableau10[i % 10] }}></div>
                             <span className="text-[11px] font-medium text-slate-300">{sector}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
