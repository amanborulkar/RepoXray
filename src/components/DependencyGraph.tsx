import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DependencyGraphData, GraphNode, GraphLink } from '../types';

interface Props { graphData: DependencyGraphData; onNodeClick: (path: string) => void; }

const NODE_COLOR: Record<string, string> = {
  entry: '#f59e0b', module: '#818cf8', external: '#22d3ee', circular: '#ef4444',
};

const LEGEND = [
  { type: 'entry',    label: 'Entry Point',  desc: 'Not imported by others' },
  { type: 'module',   label: 'Module',       desc: 'Regular internal file' },
  { type: 'circular', label: 'Circular Dep', desc: 'Creates a cycle ⚠️' },
];

export default function DependencyGraph({ graphData, onNodeClick }: Props) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const [filter, setFilter] = useState('');
  const [hovered, setHovered] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return;
    const el = svgRef.current;
    const W = el.parentElement?.clientWidth || 700;
    const H = 480;

    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el)
      .attr('width', W).attr('height', H)
      .attr('viewBox', [0, 0, W, H].join(' '));

    const filtered = filter
      ? {
          nodes: graphData.nodes.filter(n => n.path.toLowerCase().includes(filter.toLowerCase())),
          links: graphData.links.filter(l => {
            const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
            const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
            return s.toLowerCase().includes(filter.toLowerCase()) || t.toLowerCase().includes(filter.toLowerCase());
          }),
        }
      : graphData;

    if (!filtered.nodes.length) return;

    const nodes: GraphNode[] = filtered.nodes.map(n => ({ ...n }));
    const nodeById = new Map(nodes.map(n => [n.id, n]));

    const links = filtered.links
      .map(l => ({
        source: nodeById.get(typeof l.source === 'string' ? l.source : (l.source as GraphNode).id),
        target: nodeById.get(typeof l.target === 'string' ? l.target : (l.target as GraphNode).id),
      }))
      .filter(l => l.source && l.target);

    const sim = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(22));

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);

    // Arrow markers
    svg.append('defs').selectAll('marker')
      .data(['default', 'circular'])
      .enter().append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20).attr('refY', 0)
      .attr('markerWidth', 5).attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', d => d === 'circular' ? '#ef4444' : '#4b5563')
      .attr('d', 'M0,-5L10,0L0,5');

    // Links
    const link = g.append('g').selectAll<SVGLineElement, any>('line')
      .data(links).enter().append('line')
      .attr('stroke', '#374151').attr('stroke-width', 1)
      .attr('marker-end', 'url(#arrow-default)');

    // Nodes group
    const node = g.append('g').selectAll<SVGGElement, GraphNode>('g')
      .data(nodes).enter().append('g')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    node.append('circle')
      .attr('r', (d: GraphNode) => Math.max(6, Math.min(18, d.importedByCount * 2 + 6)))
      .attr('fill', (d: GraphNode) => NODE_COLOR[d.type] || NODE_COLOR.module)
      .attr('fill-opacity', 0.85)
      .attr('stroke', (d: GraphNode) => NODE_COLOR[d.type] || NODE_COLOR.module)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4);

    node.append('text')
      .attr('dy', (d: GraphNode) => -(Math.max(6, Math.min(18, d.importedByCount * 2 + 6)) + 4))
      .attr('text-anchor', 'middle')
      .attr('font-size', 9).attr('font-family', 'Geist Mono, monospace')
      .attr('fill', '#94a3b8')
      .text((d: GraphNode) => d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name);

    node
      .on('mouseover', (_, d: GraphNode) => setHovered(d))
      .on('mouseout', () => setHovered(null))
      .on('click', (_, d: GraphNode) => onNodeClick(d.path));

    sim.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => { sim.stop(); };
  }, [graphData, filter]);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{ fontSize: 16 }}>⟁</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Dependency Graph</span>
          <span className="tag tag-blue" style={{ fontSize: 10 }}>{graphData.nodes.length} nodes · {graphData.links.length} edges</span>
        </div>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter files..."
          style={{
            padding: '6px 12px', borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)',
            color: 'var(--text)', fontSize: 12, fontFamily: 'Geist Mono, monospace', outline: 'none', width: 200,
          }}
        />
      </div>

      {/* Legend */}
      <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {LEGEND.map(l => (
          <div key={l.type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted2)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: NODE_COLOR[l.type] }} />
            <span style={{ color: NODE_COLOR[l.type], fontWeight: 500 }}>{l.label}</span>
            <span style={{ color: 'var(--muted)' }}>— {l.desc}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute', zIndex: 99, top: 70, left: 20,
          background: '#0b0d18', border: '1px solid var(--border-h)',
          borderRadius: 10, padding: '10px 14px', minWidth: 200, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, marginBottom: 6 }}>{hovered.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{hovered.path}</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Type:</span><span style={{ color: NODE_COLOR[hovered.type] }}>{hovered.type}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Imports:</span><span>{hovered.importCount}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Imported by:</span><span>{hovered.importedByCount}</span></div>
          </div>
        </div>
      )}

      {/* SVG canvas */}
      <div style={{ position: 'relative' }}>
        {graphData.nodes.length === 0 ? (
          <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
            No dependency data — analyze a repo first.
          </div>
        ) : (
          <svg ref={svgRef} style={{ display: 'block', width: '100%', background: '#07080f' }} />
        )}
      </div>

      <div style={{ padding: '8px 16px', fontSize: 11, color: 'var(--muted)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        Scroll to zoom · Drag nodes · Click to open file
      </div>
    </div>
  );
}
