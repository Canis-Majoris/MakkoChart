const numberFormatter = Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 })

onSectionHover = (e) => {
    console.log(e)
}

debounce = (func, timeout = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

adjustShade = (col, amt) => {

    amt = Math.round(amt)

    let usePound = false;

    if (col[0] == "#") {
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

    const brightness = Math.round(((R * 299) +
        (G * 587) +
        (B * 114)) / 1000);

    const textColour = (brightness > 125) ? 'black' : 'white';

    const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return [(usePound ? "#" : "") + RR + GG + BB, textColour];

}

const data = [
    {
        key: 'brand-1',
        label: 'Brand 1',
        color: '#000000',
        segments: [
            {
                key: 'segment-1',
                label: 'Segment 1',
                value: 345
            },
            {
                key: 'segment-2',
                label: 'Segment 2',
                value: 34
            },
            {
                key: 'segment-3',
                label: 'Segment 3',
                value: 453
            },
            {
                key: 'segment-4',
                label: 'Segment 4',
                value: 123
            },

        ]
    },
    {
        key: 'brand-2',
        label: 'Brand 2',
        color: '#1f77b4',
        segments: [
            {
                key: 'segment-1',
                label: 'Segment 1',
                value: 45
            },
            {
                key: 'segment-2',
                label: 'Segment 2',
                value: 659
            },
            {
                key: 'segment-4',
                label: 'Segment 4',
                value: 543
            },

        ]
    },
    {
        key: 'brand-3',
        label: 'Brand 3',
        color: '#009688',
        segments: [
            {
                key: 'segment-2',
                label: 'Segment 2',
                value: 656
            },
            {
                key: 'segment-3',
                label: 'Segment 3',
                value: 231
            },
            {
                key: 'segment-4',
                label: 'Segment 4',
                value: 43
            },
            {
                key: 'segment-5',
                label: 'Segment 5',
                value: 124
            },
        ]
    },
    {
        key: 'brand-4',
        label: 'Brand 4',
        color: '#6d36cf',
        segments: [
            {
                key: 'segment-1',
                label: 'Segment 1',
                value: 34
            },
            {
                key: 'segment-3',
                label: 'Segment 3',
                value: 18
            },
            {
                key: 'segment-4',
                label: 'Segment 4',
                value: 45
            },
            {
                key: 'segment-5',
                label: 'Segment 5',
                value: 124
            },
        ]
    },
    {
        key: 'brand-5',
        label: 'Brand 5',
        color: '#ab1618',
        segments: [
            {
                key: 'segment-2',
                label: 'Segment 2',
                value: 223
            },
            {
                key: 'segment-3',
                label: 'Segment 3',
                value: 211
            },
            {
                key: 'segment-4',
                label: 'Segment 4',
                value: 43
            },
            {
                key: 'segment-5',
                label: 'Segment 5',
                value: 67
            },
            {
                key: 'segment-6',
                label: 'Segment 6',
                value: 44
            },
            {
                key: 'segment-7',
                label: 'Segment 7',
                value: 257
            },
            {
                key: 'segment-8',
                label: 'Segment 8',
                value: 112
            },
            {
                key: 'segment-9',
                label: 'Segment 9',
                value: 97
            },
            {
                key: 'segment-10',
                label: 'Segment 10',
                value: 124
            },
        ]
    },
]

const config = {
    xAxis: {
        type: 'value',
        prefix: '$'
    },
    value: {
        prefix: '$',
        suffix: 'MM',
    }
}

calculateSegmentOffsets = segments => {
    let offset = 0;
    const offsetArr = [];

    for (let i = segments.length - 1; i >= 0; i--) {
        offsetArr.push(offset);
        offset += segments[i].value

    }

    return offsetArr;
}

generatePalleteFromColor = (color, size) => [...Array(size)].map((_, i) => adjustShade(color, (1 - (size - i) / size) * 100))

generateMakkoData = data => data.map((config, i) => {
    const { key, label, color, segments } = config || {};

    const colorPalette = generatePalleteFromColor(color || '#000000', segments?.length ?? 1)

    const values = segments?.map((segment, index) => {
        const {
            value,
            key: segmentKey,
            label: segmentLabel,
            color: customTextColor,
            backgroundColor: customBackgroundColor
        } = segment;

        return {
            section: key,
            value,
            label,
            segmentLabel,
            segmentKey,
            backgroundColor: customBackgroundColor ?? colorPalette[index][0],
            color: customTextColor ?? colorPalette[index][1]
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

generateLengendData = data => data.reduce((arr, { segmentKey, segmentLabel }) => {
    if (!arr.find(({ key }) => key === segmentKey))
        arr.push({ key: segmentKey, label: segmentLabel })
    return arr
}, [])

getSectionLabel = (sectionKey, data) => data.find(({ key }) => key === sectionKey)?.label ?? '-'

getValueFormatted = (value, { prefix, suffix }) => `${prefix}${value}${suffix}`

getPercent = (value, total) => numberFormatter.format((value / total * 100))

const init = () => {
    addEventListener('load', render)
    addEventListener('resize', debounce(render, 200))
}

const render = () => {
    const width = innerWidth - 10,
        height = 700,
        margin = 30;

    const { xAxis, value } = config

    d3.select('#chart').selectAll('svg').remove();

    // Nest values by section. We assume each section + cause is unique.
    const sections = generateMakkoData(data);

    // Compute the total sum, the per-section sum, and the per-cause offset.
    // You can use reduce rather than reduceRight to reverse the ordering.
    // We also record a reference to the parent cause for each section.
    const sum = sections.reduce((v, p) => (p.offset = v) + (p.sum = p.values.reduceRight((v, d) => {
        d.parent = p;
        return (d.offset = v) + d.value;
    }, 0)), 0);

    const x = d3.scaleLinear()
        .range([0, width - 3 * margin]);

    const y = d3.scaleLinear()
        .range([0, height - 2 * margin]);

    const n = d3.format(`${xAxis.prefix ?? ''},d${xAxis.suffix ?? ''}`),
        p = d3.format(".0%");

    const xValue = d3.scaleLinear()
        .domain([0, xAxis.type === 'value' ? sum : 1])
        .range([0, width - 3 * margin])

    const svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + 2 * margin + "," + margin + ")");

    // Add x-axis ticks.

    const xtick = svg.selectAll(".x")
        .data(xValue.ticks())
        .enter().append("svg:g")
        .attr("class", "x")
        .attr("transform", (d) => "translate(" + xValue(d) + "," + y(1) + ")");

    xtick.append("svg:line")
        .attr("y2", 6)
        .style("stroke", "#CECECE");

    xtick.append("svg:text")
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("class", "x-text")
        .attr("dy", ".71em")
        .text(xAxis.type === 'value' ? n : p);

    svg.append("svg:line")
        .attr("class", "x-axis")
        .style("stroke", "#CECECE")
        .attr("x2", width - margin * 3)
        .attr("transform", (d) => "translate(" + 0 + "," + y(1) + ")");

    // Add y-axis ticks.
    const ytick = svg.selectAll(".y")
        .data(y.ticks(10))
        .enter().append("svg:g")
        .attr("class", "y")
        .attr("transform", (d) => "translate(0," + y(1 - d) + ")");

    ytick.append("svg:text")
        .attr("x", -15)
        .attr("text-anchor", "end")
        .attr("class", "y-text")
        .attr("dy", ".35em")
        .text(p);

    // Add a group for each cause.
    const sectionsData = svg.selectAll(".col")
        .data(sections)
        .enter().append("g")
        .attr("class", "col")
        .attr("transform", (d) => "translate(" + x(d.offset / sum) + ")");

    // add total on each column
    svg.selectAll(".col")
        .append("svg:text")
        .text((d) => (`${getSectionLabel(d.key, data)} (${getPercent(d.sum, sum)}%, ${getValueFormatted(d.sum, value)})`))
        .attr("class", "colLabel")
        .attr("x", (d) => x(d.sum / sum) / 2)
        .attr("y", (d) => -10)
        .attr("text-anchor", "middle")
    // Add a rect for each section.
    const rows = sectionsData.selectAll(".section-wrapper")
        .data((d) => d.values)
        .enter().append("a")
        .attr("class", "section-wrapper")

    const rowsSections = rows.append("rect")
        .attr("y", (d) => Math.max(0, y(d.offset / d.parent.sum)))
        .attr("height", (d) => Math.max(0, y(d.value / d.parent.sum)) - 5)
        .attr("width", (d) => Math.max(0, x(d.parent.sum / sum)) - 2)
        .attr("data-offset", (d) => x(d.parent.offset / sum))
        .attr("class", "section")
        .style("fill", (d) => d.backgroundColor)

    rows.append("text")
        .text((d) => `${getPercent(d.value, d.parent.sum)}%`)
        .attr("x", (d) => x(d.parent.sum / sum) / 2)
        .attr("y", (d) => y(d.offset / d.parent.sum) + ((y(d.value / d.parent.sum)) / 2 + 2))
        .attr("class", "label")
        .attr("fill", (d) => d.color);

    // Create legend

    /*
    const legendData = generateLengendData(makkoData)

    const legendVals = d3.set(legendData.map(({ label }) => label)).values();

    const legend5 = d3.select('#legend').selectAll(".legend-item")
        .data(legendVals)
        .enter().append("div")
        .attr("class", "legend-item");

    console.log(legend5);

    const picked = legend5.append("p").attr("class", "cause picked");
    picked.append("span").attr("class", "key-dot").style("background", (d, i) => color[i]);
    picked.insert("text").text((d, i) => d);

    */

    // Create Tooltip
    initTooltip(rowsSections, value)
}

init()