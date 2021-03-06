import {Component, OnInit} from '@angular/core';
import {single, multi, countries, generateData, generateGraph} from './data';
import chartGroups from './chartTypes';
import '../src/ng2d3.scss';
import './demo.scss';

@Component({
  selector: 'app',
  template: `
    <main>
      <div class="chart-col">
          <bar-horizontal
            *ngIf="chartType === 'bar-horizontal'"
            [maxVal]="maxVal"
            [view]="view"
            [scheme]="colorScheme"
            [results]="single"
            [extraResults]="[{label: 'topup 123131312312321', color: 'red', val: 5000000}, {label: 'bla', color: 'blue', val: 6000000}]"
            [mainLabel]="{label: 'text', color: 'pink'}"
            [gradient]="gradient"
            [xAxis]="showXAxis"
            [yAxis]="showYAxis"
            [legend]="showLegend"
            [showXAxisLabel]="showXAxisLabel"
            [showYAxisLabel]="showYAxisLabel"
            [xAxisLabel]="xAxisLabel"
            [yAxisLabel]="yAxisLabel"
            [showGridLines]="showGridLines"
            (clickHandler)="clickHandler($event)">
          </bar-horizontal>
          <bar-horizontal-stacked
            *ngIf="chartType === 'bar-horizontal-stacked'"
            [view]="view"
            [maxVal]="maxVal"
            [scheme]="colorScheme"
            [results]="multi"
      [extraResults]="[{label: 'topup 123131312312321', color: 'red', val: 5000000}, {label: 'bla', color: 'blue', val: 6000000}]"
            [mainLabel]="[{label: 'text', color: 'pink'}, {label: 'endtext', color: 'black'}]"
            [gradient]="gradient"
            [xAxis]="showXAxis"
            [yAxis]="showYAxis"
            [legend]="showLegend"
            [showXAxisLabel]="showXAxisLabel"
            [showYAxisLabel]="showYAxisLabel"
            [xAxisLabel]="xAxisLabel"
            [yAxisLabel]="yAxisLabel"
            [showGridLines]="showGridLines"
            (clickHandler)="clickHandler($event)">
          </bar-horizontal-stacked>

      </div>
      <div class="sidebar">
        <h1>
          ng2<strong>d3</strong>
          <small>Angular2 D3 Chart Framework</small>
        </h1>
        <h3>Chart Type</h3>
        <select
          [ngModel]="chartType"
          (ngModelChange)="selectChart($event)">
          <template ngFor let-group [ngForOf]="chartGroups">
            <optgroup [label]="group.name">
              <option *ngFor="let chart of group.charts" [value]="chart.selector">{{chart.name}}</option>
            </optgroup>
          </template>
        </select>
        <!--
        <h3>Data</h3>
        <select>
          <option>Country</option>
        </select>
        -->
        <pre *ngIf="chart.inputFormat === 'singleSeries'">{{single | json}}</pre>
        <pre *ngIf="chart.inputFormat === 'multiSeries' && !linearScale">{{multi | json}}</pre>
        <pre *ngIf="chart.inputFormat === 'multiSeries' && linearScale">{{dateData | json}}</pre>
        <div>
          <label>
            <input type="checkbox" [checked]="realTimeData" (change)="realTimeData = $event.target.checked">
            Real-time
          </label>
        </div>
        <h3>Options</h3>
        <div>
          <label><strong>Dimensions</strong></label><br />
          <label>
            <input type="checkbox" [checked]="fitContainer" (change)="toggleFitContainer($event.target.checked)">
            Fit Container
          </label> <br />
          <div *ngIf="!fitContainer">
            <label>Width:</label><br />
            <input type="number" [(ngModel)]="width"><br />
            <label>Height:</label><br />
            <input type="number" [(ngModel)]="height"><br />
            <button (click)="applyDimensions()">Apply dimensions</button>
          </div>
        </div>
        <hr />

        <div *ngIf="chart.options.includes('showXAxis')">
          <label>
            <input type="checkbox" [checked]="showXAxis" (change)="showXAxis = $event.target.checked">
            Show X Axis
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('showYAxis')">
          <label>
            <input type="checkbox" [checked]="showYAxis" (change)="showYAxis = $event.target.checked">
            Show Y Axis
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('showGridLines')">
          <label>
            <input type="checkbox" [checked]="showGridLines" (change)="showGridLines = $event.target.checked">
            Show Grid Lines
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('gradient')">
          <label>
            <input type="checkbox" [checked]="gradient" (change)="gradient = $event.target.checked">
            Use Gradients
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('showLegend')">
          <label>
            <input type="checkbox" [checked]="showLegend" (change)="showLegend = $event.target.checked">
            Show Legend
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('showXAxisLabel')">
          <label>
            <input type="checkbox" [checked]="showXAxisLabel" (change)="showXAxisLabel = $event.target.checked">
            Show X Axis Label
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('xAxisLabel')">
          <label>X Axis Label:</label><br />
          <input type="text" [(ngModel)]="xAxisLabel"><br />
        </div>
        <div *ngIf="chart.options.includes('showYAxisLabel')">
          <label>
            <input type="checkbox" [checked]="showYAxisLabel" (change)="showYAxisLabel = $event.target.checked">
            Show Y Axis Label
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('yAxisLabel')">
          <label>Y Axis Label:</label><br />
          <input type="text" [(ngModel)]="yAxisLabel"><br />
        </div>
        <div *ngIf="chart.options.includes('showLabels')">
          <label>
            <input type="checkbox" [checked]="showLabels" (change)="showLabels = $event.target.checked">
            Show Labels
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('explodeSlices')">
          <label>
            <input type="checkbox" [checked]="explodeSlices" (change)="explodeSlices = $event.target.checked">
            Explode Slices
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('doughnut')">
          <label>
            <input type="checkbox" [checked]="doughnut" (change)="doughnut = $event.target.checked">
            Doughnut
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('autoScale')">
          <label>
            <input type="checkbox" [checked]="autoScale" (change)="autoScale = $event.target.checked">
            Auto Scale
          </label> <br />
        </div>
        <div *ngIf="chart.options.includes('timeline')">
          <label>
            <input type="checkbox" [checked]="timeline" (change)="timeline = $event.target.checked">
            Timeline
          </label> <br />
        </div>
      </div>
    </main>
  `
})

export class App implements OnInit {
  chartType = 'bar-vertical';
  chartGroups: any[];
  chart: any;
  realTimeData: boolean = false;
  countries: any[];
  single: any[];
  multi: any[];
  dateData: any[];
  graph: { links: any[], nodes: any[] };
  linearScale: boolean = false;

  view: any[];
  width: number = 700;
  height: number = 300;
  fitContainer: boolean = true;

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Population';
  showGridLines = true;

  colorScheme = {
    domain: ['#F44336', '#3F51B5', '#8BC34A', '#2196F3', '#009688', '#FF5722', '#CDDC39', '#00BCD4', '#FFC107', '#795548', '#607D8B']
  };

  // pie
  showLabels = true;
  explodeSlices = false;
  doughnut = false;

  // line, area
  autoScale = true;
  timeline = false;

  constructor() {
    Object.assign(this, {single, multi, countries, chartGroups, graph: generateGraph(5) });

    this.dateData = generateData(5);
  }

  ngOnInit() {
    this.selectChart(this.chartType);

    setInterval(this.updateData.bind(this), 2000);
  }

  updateData() {
    if (!this.realTimeData) {
      return;
    }

    let country = this.countries[Math.floor(Math.random() * this.countries.length)];
    let add = Math.random() < 0.7;
    let remove = Math.random() < 0.5;

    if (remove) {
      if (this.single.length > 1) {
        let index = Math.floor(Math.random() * this.single.length);
        this.single.splice(index, 1);
        this.single = [...this.single];
      }

      if (this.multi.length > 1) {
        let index = Math.floor(Math.random() * this.multi.length);
        this.multi.splice(index, 1);
        this.multi = [...this.multi];
      }

      if (this.graph.nodes.length > 1) {
        let index = Math.floor(Math.random() * this.graph.nodes.length);
        let value = this.graph.nodes[index].value;
        this.graph.nodes.splice(index, 1);
        const nodes = [ ...this.graph.nodes ];

        const links = this.graph.links.filter(link => {
          return link.source !== value && link.source.value !== value &&
            link.target !== value && link.target.value !== value;
        });
        this.graph = { links, nodes };
      }
    }

    if (add) {
      // single
      let entry = {
        name: country,
        value: Math.floor(1000000 + Math.random() * 20000000)
      };
      this.single = [...this.single, entry];

      // multi
      let multiEntry = {
        name: country,
        series: [{
          name: "2010",
          value: Math.floor(1000000 + Math.random() * 20000000)
        }, {
          name: "2011",
          value: Math.floor(1000000 + Math.random() * 20000000)
        }]
      };

      this.multi = [...this.multi, multiEntry];

      // graph
      const node = { value: country };
      const nodes = [ ...this.graph.nodes, node];
      const link = {
        source: country,
        target: nodes[Math.floor(Math.random() * (nodes.length - 1))].value,
      };
      const links = [ ...this.graph.links, link];
      this.graph = { links, nodes };
    }
  }

  applyDimensions() {
    this.view = [this.width, this.height];
  }

  toggleFitContainer(event) {
    this.fitContainer = event;

    if (this.fitContainer) {
      this.view = undefined;
    } else {
      this.applyDimensions();
    }
  }

  selectChart(chartSelector) {
    this.chartType = chartSelector;

    this.linearScale = this.chartType === 'line-chart' ||
      this.chartType === 'area-chart' ||
      this.chartType === 'area-chart-normalized' ||
      this.chartType === 'area-chart-stacked';

    for (let group of this.chartGroups) {
      for (let chart of group.charts) {
        if (chart.selector === chartSelector) {
          this.chart = chart;
          return;
        }
      }
    }
  }

  clickHandler(data) {
    console.log('Item clicked', data);
  }
}
