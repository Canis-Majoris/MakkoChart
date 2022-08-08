initTooltip = (sections, valueConfig) => {
    const wrapper = document.createElement('div');
    wrapper.id = "tooltip"

    document.querySelector('#chart').append(wrapper)

    d3.select(wrapper).selectAll('.tooltip').remove();
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

        tooltip
            .html(`
                <div>
                    <h4 class="tooltip-title">${d.segmentLabel}</h4>
                    <p>${getPercent(d.value, d.parent.sum)}%, ${getValueFormatted(d.value, valueConfig)}</p>
                </div>
            `)
            .style("transform", `translate3d(${d3.pointer(e)[0] + Number(offset) + 60}px, ${d3.pointer(e)[1] - 20}px, 0)`);
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