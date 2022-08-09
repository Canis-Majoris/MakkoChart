initTooltip = (sections, valueConfig) => {
    d3.select('#chart').selectAll('#tooltip').remove();

    const wrapper = document.createElement('div');
    wrapper.setAttribute('id', 'tooltip')

    document.querySelector('#chart').append(wrapper)

    // create a tooltip
    const tooltip = d3.select("#tooltip")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (d) {
        tooltip
            .style("opacity", 1)
    }
    const mousemove = function (e, d) {
        const offset = d3.select(this).attr("data-offset")

        const maxWidth = document.querySelector('#chart').clientWidth - 60

        const { clientWidth, clientHeight } = tooltip.node()

        const xOffset = d3.pointer(e)[0] + Number(offset)
        const yOffset = d3.pointer(e)[1]

        const xOffsetCorrection = xOffset + clientWidth > maxWidth ? -clientWidth + 60 : 60;
        const yOffsetCorrection = yOffset - clientHeight + 20 < 0 ? -clientHeight + 100 : -50;

        tooltip
            .html(`
                <div>
                    <h3 class="tooltip-title">${d.segmentLabel}</h3>
                    <h4 class="tooltip-subtitle">${d.label}</h4>
                    <p>${getPercent(d.value, d.parent.sum)}%, ${getValueFormatted(d.value, valueConfig)}</p>
                </div>
            `)
            .style("transform", `translate3d(${xOffset + xOffsetCorrection}px, ${yOffset + yOffsetCorrection}px, 0)`);
    }
    const mouseleave = function (d) {
        tooltip
            .style("opacity", 0)
    }

    // add the squares
    sections
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
}