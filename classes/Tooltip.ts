import * as d3 from 'd3';
import { getPercent, getValueFormatted } from '../common/utils';

export interface ITooltip {}

export default class Tooltip implements ITooltip {
  container: HTMLElement;
  sections: d3.Selection<SVGRectElement, unknown, SVGGElement, unknown>;
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  valueConfig: { prefix?: string; suffix?: string };

  constructor(container, sections, valueConfig) {
    this.container = container;
    this.sections = sections;
    this.valueConfig = valueConfig;
  }

  render() {
    d3.select(this.container).selectAll('.tooltip').remove();

    this.tooltip = d3
      .select(this.container)
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip');

    this.sections
      .on('mouseover', this.mouseover)
      .on('mousemove', this.mousemove)
      .on('mouseleave', this.mouseleave);
  }

  mouseover = function () {
    this.tooltip.style('opacity', 1);
  };

  mousemove = function (e, d) {
    const offset = d3.select(this).attr('data-offset');

    this.tooltip
      .html(
        `
        <div>
            <h4 class="tooltip-title">${d.segmentLabel}</h4>
            <p>${getPercent(d.value, d.parent.sum)}%, ${getValueFormatted(
          d.value,
          this.valueConfig
        )}</p>
        </div>
    `
      )
      .style(
        'transform',
        `translate3d(${d3.pointer(e)[0] + Number(offset) + 60}px, ${
          d3.pointer(e)[1] - 20
        }px, 0)`
      );
  };

  mouseleave = function () {
    this.tooltip.style('opacity', 0);
  };
}
