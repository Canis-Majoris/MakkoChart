import { Looker, VisualizationDefinition } from './common/types';
import data from './mocks/data.json';
import config from './mocks/config.json';
import MakkoChart from './classes/MakkoChart';

declare var looker: Looker;

interface TreemapVisualization extends VisualizationDefinition {
  makkoChart?: MakkoChart;
}

const vis: TreemapVisualization = {
  id: 'treemap',
  label: 'Treemap',
  options: {},
  // set up the initial state of the visualization
  create(element, config) {
    element.innerHTML = `
    <style>
        .wrapper {
          position: relative;
          font-family: system-ui, sans-serif;
        }
        
        svg {
          shape-rendering: crispEdges;
        }
        
        #chart {
          margin-bottom: 20px;
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
      </style>
    `;

    // add chart
    this.makkoChart = new MakkoChart();
  },
  // render in response to the data or settings changing
  // TODO: arguments to be integrated
  update(_data, element, _config, queryResponse) {
    // render chart
    this.makkoChart.render({ data, config, element });
  },
};

looker.plugins.visualizations.add(vis);
