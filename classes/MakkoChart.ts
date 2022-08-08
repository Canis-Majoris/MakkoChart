import * as d3 from 'd3';
import {
  generateMakkoData,
  getPercent,
  getSectionLabel,
  getValueFormatted,
} from '../common/utils';
import Tooltip from './Tooltip';
import { ChartConfig } from '../common/types';

export interface IMakkoChart {}

export default class MakkoChart implements IMakkoChart {
  sections: any;
  tooltip: Tooltip;

  render({ data, config, element }) {
    const width = element.clientWidth - 10,
      height = element.clientHeight,
      margin = 30;

    const { xAxis, value }: ChartConfig = config;

    d3.select('#chart').selectAll('svg').remove();

    // nest values by section
    this.sections = generateMakkoData(data);

    const sum = this.sections.reduce(
      (v, p) =>
        (p.offset = v) +
        (p.sum = p.values.reduceRight((v, d) => {
          d.parent = p;
          return (d.offset = v) + d.value;
        }, 0)),
      0
    );

    const x = d3.scaleLinear().range([0, width - 3 * margin]);

    const y = d3.scaleLinear().range([0, height - 2 * margin]);

    const n = d3.format(`${xAxis?.prefix ?? ''},d${xAxis.suffix ?? ''}`),
      p = d3.format('.0%');

    const xValue = d3
      .scaleLinear()
      .domain([0, xAxis.type === 'value' ? sum : 1])
      .range([0, width - 3 * margin]);

    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + 2 * margin + ',' + margin + ')');

    // add x-axis ticks.
    const xtick = svg
      .selectAll('.x')
      .data(xValue.ticks())
      .enter()
      .append('svg:g')
      .attr('class', 'x')
      .attr('transform', (d) => 'translate(' + xValue(d) + ',' + y(1) + ')');

    xtick.append('svg:line').attr('y2', 6).style('stroke', '#CECECE');

    xtick
      .append('svg:text')
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('class', 'x-text')
      .attr('dy', '.71em')
      .text(xAxis.type === 'value' ? n : p);

    svg
      .append('svg:line')
      .attr('class', 'x-axis')
      .style('stroke', '#CECECE')
      .attr('x2', width - margin * 3)
      .attr('transform', () => 'translate(' + 0 + ',' + y(1) + ')');

    // add y-axis ticks.
    const ytick = svg
      .selectAll('.y')
      .data(y.ticks(10))
      .enter()
      .append('svg:g')
      .attr('class', 'y')
      .attr('transform', (d) => 'translate(0,' + y(1 - d) + ')');

    ytick
      .append('svg:text')
      .attr('x', -15)
      .attr('text-anchor', 'end')
      .attr('class', 'y-text')
      .attr('dy', '.35em')
      .text(p);

    // add columns.
    const sectionsData = svg
      .selectAll('.col')
      .data(this.sections)
      .enter()
      .append('g')
      .attr('class', 'col')
      .attr('transform', (d: any) => 'translate(' + x(d.offset / sum) + ')');

    // add column labels
    svg
      .selectAll('.col')
      .append('svg:text')
      .text(
        (d: any) =>
          `${getSectionLabel(d.key, data)} (${getPercent(
            d.sum,
            sum
          )}%, ${getValueFormatted(d.sum, value)})`
      )
      .attr('class', 'colLabel')
      .attr('x', (d: any) => x(d.sum / sum) / 2)
      .attr('y', () => -10)
      .attr('text-anchor', 'middle');

    // add a rect for each section.
    const rows = sectionsData
      .selectAll('.section-wrapper')
      .data((d: any) => d.values)
      .enter()
      .append('a')
      .attr('class', 'section-wrapper');

    const rowsSections = rows
      .append('rect')
      .attr('y', (d: any) => Math.max(0, y(d.offset / d.parent.sum)))
      .attr('height', (d: any) => Math.max(0, y(d.value / d.parent.sum)) - 5)
      .attr('width', (d: any) => Math.max(0, x(d.parent.sum / sum)) - 2)
      .attr('data-offset', (d: any) => x(d.parent.offset / sum))
      .attr('class', 'section')
      .style('fill', (d: any) => d.backgroundColor);

    rows
      .append('text')
      .text((d: any) => `${getPercent(d.value, d.parent.sum)}%`)
      .attr('x', (d: any) => x(d.parent.sum / sum) / 2)
      .attr(
        'y',
        (d: any) =>
          y(d.offset / d.parent.sum) + (y(d.value / d.parent.sum) / 2 + 2)
      )
      .attr('class', 'label')
      .attr('fill', (d: any) => d.color);

    // create Tooltip
    const tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'tooltip';

    document.querySelector('#chart')?.append(tooltipContainer);

    this.tooltip = new Tooltip(tooltipContainer, rowsSections, value);
  }
}
