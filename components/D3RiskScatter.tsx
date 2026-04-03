import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { RiskReturnMetric } from '../types';

interface D3RiskScatterProps {
  data: RiskReturnMetric[];
}

const D3RiskScatter: React.FC<D3RiskScatterProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length || !containerRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = 500;
    
    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Axis: Risk (Std Dev)
    const xMax = d3.max(data, d => d.risk) || 0;
    const x = d3.scaleLinear()
      .domain([0, xMax * 1.2])
      .range([0, width]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr("color", "#94a3b8")
      .style("font-size", "12px");

    // Label X
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + 40)
      .text("Risk (Volatility %)")
      .attr("fill", "#cbd5e1");

    // Y Axis: Return
    const yMin = d3.min(data, d => d.avgReturn) || 0;
    const yMax = d3.max(data, d => d.avgReturn) || 0;
    
    const y = d3.scaleLinear()
      .domain([Math.min(0, yMin * 1.2), Math.max(0, yMax * 1.2)])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y))
      .attr("color", "#94a3b8")
      .style("font-size", "12px");

    // Label Y
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", 0)
      .text("Avg Daily Return (%)")
      .attr("fill", "#cbd5e1");

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("color", "#334155")
      .attr("opacity", 0.3)
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ""));
      
    svg.append("g")
      .attr("class", "grid")
      .attr("color", "#334155")
      .attr("opacity", 0.3)
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(() => ""));

    // Color scale for sectors
    const sectors = Array.from(new Set(data.map(d => d.sector)));
    const color = d3.scaleOrdinal()
      .domain(sectors)
      .range(d3.schemeTableau10);

    // Tooltip
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "#1e293b")
      .style("border", "1px solid #475569")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("color", "white")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("z-index", "10");

    // Add Dots
    svg.append('g')
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => x(d.risk))
      .attr("cy", d => y(d.avgReturn))
      .attr("r", 8)
      .style("fill", d => color(d.sector) as string)
      .style("opacity", 0.8)
      .style("stroke", "white")
      .style("stroke-width", 1.5)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`
          <div class="font-bold">${d.symbol}</div>
          <div class="text-xs text-gray-300">${d.sector}</div>
          <div class="mt-1">Return: ${d.avgReturn.toFixed(3)}%</div>
          <div>Risk: ${d.risk.toFixed(3)}</div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Quadrant Lines (Zero Lines)
    svg.append("line")
        .attr("x1", 0)
        .attr("y1", y(0))
        .attr("x2", width)
        .attr("y2", y(0))
        .attr("stroke", "#ef4444") // Red line for zero return
        .attr("stroke-dasharray", "4");

    // Legend
    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(sectors)
      .join("g")
      .attr("transform", (d, i) => `translate(${width + 10},${i * 20})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => color(d) as string);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => d)
      .attr("fill", "#e2e8f0");

  }, [data]);

  return (
    <div ref={containerRef} className="relative w-full bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-4">
        <h3 className="text-xl font-bold text-slate-100 mb-2">Risk vs Return Analysis (Efficient Frontier)</h3>
        <p className="text-sm text-slate-400 mb-4">
            Visualizing the trade-off between volatility (Risk) and average daily returns. 
            Companies in the top-left quadrant are generally preferred (High Return, Low Risk).
        </p>
        <svg ref={svgRef} className="w-full"></svg>
    </div>
  );
};

export default D3RiskScatter;
