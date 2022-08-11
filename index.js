numberFormatter = Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

const colorPalette = {
  "Carolina Herrera": "#ff3021",
  "Paco Rabanne": "#035ff4",
  "Jean Paul Gaultier": "#28d92f",
  "Christian Louboutin": "#ff899d",
  "Penhaligon's": "#ff9800",
  "Nina Ricci": "#727272",
  "Dries van Noten": "#ffff18",
  "L'Artisan Parfumeur": "#604439",
  "L'Artisan Parfumeur Obsolete": "#604439",
  Other: "#1f77b4"
}

const defaultColor = '#607d8b'

formatType = (valueFormat) => {
  if (!valueFormat) return undefined
  let format = ''
  switch (valueFormat.charAt(0)) {
    case '$':
      format += '$'; break
    case '£':
      format += '£'; break
    case '€':
      format += '€'; break
  }
  if (valueFormat.indexOf(',') > -1) {
    format += ','
  }
  const splitValueFormat = valueFormat.split('.')
  format += '.'
  format += splitValueFormat.length > 1 ? splitValueFormat[1].length : 0

  switch (valueFormat.slice(-1)) {
    case '%':
      format += '%'; break
    case '0':
      format += 'f'; break
  }
  return d3.format(format)
}

adjustShade = (col, amt) => {
  amt = Math.round(amt);

  let usePound = false;

  if (col[0] == '#') {
    col = col.slice(1);
    usePound = true;
  }

  let R = parseInt(col.substring(0, 2), 16);
  let G = parseInt(col.substring(2, 4), 16);
  let B = parseInt(col.substring(4, 6), 16);

  // to make the colour less bright than the input
  // change the following three "+" symbols to "-"
  R = R + amt;
  G = G + amt;
  B = B + amt;

  if (R > 255) R = 255;
  else if (R < 0) R = 0;

  if (G > 255) G = 255;
  else if (G < 0) G = 0;

  if (B > 255) B = 255;
  else if (B < 0) B = 0;

  const brightness = Math.round((R * 299 + G * 587 + B * 114) / 1000);

  const textColour = brightness > 125 ? 'black' : 'white';

  const RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);

  return [(usePound ? '#' : '') + RR + GG + BB, textColour];
};

generateMakkoData = data => data.map((config, i) => {
  const { key, label, color: baseColor = defaultColor, segments } = config || {};

  const largetsSegmentValue = Math.max(...segments.map(({ value }) => value))

  const values = segments?.map((segment, index) => {
    const {
      value,
      key: segmentKey,
      label: segmentLabel,
      color: customTextColor,
      backgroundColor: customBackgroundColor
    } = segment;

    const [backgroundColor, color] = adjustShade(baseColor, 100 - Math.min(100, getPercent(value, largetsSegmentValue)))

    return {
      section: key,
      value,
      label,
      segmentLabel,
      segmentKey,
      backgroundColor: customBackgroundColor ?? backgroundColor,
      color: customTextColor ?? color
    }
  });

  const item = {
    key,
    values
  }

  values.forEach((value) => {
    value.parent = item
  })

  return item
})

generateLengendData = (data) =>
  data.reduce((arr, { segmentKey, segmentLabel }) => {
    if (!arr.find(({ key }) => key === segmentKey))
      arr.push({ key: segmentKey, label: segmentLabel });
    return arr;
  }, []);

getSectionLabel = (sectionKey, data) =>
  data.find(({ key }) => key === sectionKey)?.label ?? '-';

getValueFormatted = (
  value,
  { prefix, suffix }
) => `${prefix}${value}${suffix}`;

getPercent = (value, total) =>
  numberFormatter.format((value / total) * 100);


class Tooltip {
  constructor(container, sections, valueConfig) {
    d3.select(container).selectAll('.tooltip').remove();

    // add content holder
    let holder = document.createElement("div");

    holder.style.position = "absolute";
    holder.style.visibility = "hidden";
    holder.style.display = "block";
    holder.className = "tooltip";

    container.append(holder);

    let segment, rect, content = '';

    const tooltip = d3
      .select(container)
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip');

    const mouseover = function () {
      tooltip.style('opacity', 1);
    };

    const mousemove = function (e, d) {
      const offset = d3.select(this).attr("data-offset")

      const maxWidth = container.clientWidth - 60

      if (segment !== d.segmentLabel) {
        content = `
                <div>
                    <h3 class="tooltip-title">${d.segmentLabel}</h3>
                    <h4 class="tooltip-subtitle">${d.label}</h4>
                    <p>${getPercent(d.value, d.parent.sum)}%, ${getValueFormatted(d.value, valueConfig)}</p>
                </div>  
            `
        holder.innerHTML = content

        rect = holder.getBoundingClientRect();
      }

      const { width, height } = rect

      const xOffset = d3.pointer(e)[0] + Number(offset)
      const yOffset = d3.pointer(e)[1]

      const xOffsetCorrection = xOffset + width > maxWidth ? -width + 60 : 60;
      const yOffsetCorrection = yOffset - height + 20 < 0 ? -height + 100 : -50;

      tooltip.style("transform", `translate3d(${xOffset + xOffsetCorrection}px, ${yOffset + yOffsetCorrection}px, 0)`);

      if (segment !== d.segmentLabel)
        tooltip.html(content)

      segment = d.segmentLabel
    };

    const mouseleave = function () {
      tooltip.style('opacity', 0);
    };

    sections
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);
  }
}


class MakkoChart {
  sections;
  tooltip;

  render({ data, config, element }) {
    const width = element.clientWidth - 10,
      height = element.clientHeight,
      margin = 30;

    const { xAxis, value } = config;

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

    // add columns.
    const sectionsData = svg
      .selectAll('.col')
      .data(this.sections)
      .enter()
      .append('g')
      .attr('class', 'col')
      .attr('transform', (d) => 'translate(' + x(d.offset / sum) + ')');

    // add a rect for each section.
    const rows = sectionsData
      .selectAll('.section-wrapper')
      .data((d) => d.values)
      .enter()
      .append('a')
      .attr('class', 'section-wrapper');

    const rowsSections = rows.append("rect")
      .attr("y", (d) => Math.max(0, y(d.offset / d.parent.sum)))
      .attr("height", (d) => Math.max(1, y(d.value / d.parent.sum) - 1))
      .attr("width", (d) => Math.max(1, x(d.parent.sum / sum) - 1))
      .attr("data-offset", (d) => x(d.parent.offset / sum))
      .attr("class", "section")
      .style("fill", (d) => d.backgroundColor)

    // add total on each column
    svg.selectAll(".col")
      .append("svg:text")
      .text((d, i, cols) => {
        const el = cols[i].parentElement.getBoundingClientRect();

        if (el.width < 100) return ''

        return (`${getSectionLabel(d.key, data)} (${getPercent(d.sum, sum)}%, ${getValueFormatted(d.sum, value)})`)
      })
      .attr("class", "colLabel")
      .attr("x", (d) => x(d.sum / sum) / 2)
      .attr("y", (d) => -10)
      .attr("text-anchor", "middle")

    rows.append("text")
      .text((d) => Math.max(1, y(d.value / d.parent.sum) - 1) < 10 || Math.max(1, x(d.parent.sum / sum) - 1) < 50 ? '' : `${getPercent(d.value, d.parent.sum)}%`)
      .attr("x", (d) => x(d.parent.sum / sum) / 2)
      .attr("y", (d) => y(d.offset / d.parent.sum) + ((y(d.value / d.parent.sum)) / 2 + 2))
      .attr("class", "label")
      .attr("fill", (d) => d.color);

    // create Tooltip
    this.tooltip = new Tooltip(element.querySelector('#chart'), rowsSections, value);
  }
}


const vis = {
  id: 'treemap',
  label: 'Treemap',
  options: {},
  // set up the initial state of the visualization
  create(element, config) {
    const container = element.appendChild(document.createElement("div"));
    container.setAttribute("id", "chart");

    const css = document.createElement("style");
    css.setAttribute("type", "text/css")
    css.innerHTML = `
        .wrapper {
          position: relative;
        }
        
        svg {
          shape-rendering: crispEdges;
        }
        
        #chart {
          margin-bottom: 20px;
          overflow: hidden;
          font-family: system-ui, sans-serif;
        }
        
        .label {
          font-size: 12px;
          font-weight: 600;
          text-anchor: middle;
          pointer-events: none;
        }
        
        .tooltip {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          transition: opacity 0.3s ease-out;
          background-color: #ffffff;
          border-radius: 1px;
          padding: 5px 10px;
          font-size: 12px;
          box-shadow: 1px 1px 7px #00000021;
        }
        
        .tooltip-title {
          color: #000000;
          border-bottom: 1px solid #00000021;
          padding-bottom: 3px;
          margin-bottom: 5px;
          margin-top: 0;
        }
        
        .tooltip-subtitle {
          margin-top: 0;
          margin-bottom: 2px;
          color: #00000086;
        }
        
        .tooltip p {
          margin: 0;
        }
        
        #legend {
          display: flex;
          gap: 15px;
          align-items: center;
          justify-content: center;
        }
        
        .legend-item {
          text-align: center;
        }
        
        .x-text,
        .y-text {
          font-size: 12px;
          fill: #7c868e;
        }
        
        .section {
          transition: fill-opacity 0.1s ease-out;
        }
        
        .section:hover,
        .section:focus {
          fill-opacity: 0.9;
        }
        
        .colLabel {
          font-weight: 600;
          font-size: 12px;
        }
    `;

    element.prepend(css);

    // add chart
    this.makkoChart = new MakkoChart();
  },
  // render in response to the data or settings changing
  // TODO: arguments to be integrated
  updateAsync(data, element, config, queryResponse, details, done) {

    const { totals_data, fields } = queryResponse

    const dimension = fields.dimension_like[0]
    const measure = fields.measure_like[0]

    const dimension_key = dimension.name
    const measure_key = measure.name

    const format = formatType(measure.value_format) || ((s) => s.toString())

    const transformedData = data.map((item) => {
      const key = item[dimension_key].value

      return {
        key,
        label: key,
        color: colorPalette[key],
        segments: Object.entries(item[measure_key] ?? {})
          .flatMap(([label, { value, rendered }]) => Number.isFinite(value) ? ({
            key: label,
            label,
            value,
            rendered
          }) : [])
      }
    })

    const chartConfig = {
      xAxis: {
        type: 'percent',
        prefix: '$'
      },
      value: {
        prefix: '$',
        suffix: 'MM',
      }
    }

    // render chart
    this.makkoChart.render({ data: transformedData, config: chartConfig, element });

    done()
  },
};

looker.plugins.visualizations.add(vis);
