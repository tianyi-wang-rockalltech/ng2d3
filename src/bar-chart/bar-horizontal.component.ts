import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  NgZone,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { calculateViewDimensions, ViewDimensions } from '../common/view-dimensions.helper';
import { colorHelper } from '../utils/color-sets';
import { BaseChart } from '../common/base-chart.component';
import { tickFormat } from '../common/tick-format.helper';
import d3 from '../d3';

@Component({
  selector: 'bar-horizontal',
  template: `
<chart
[legend]="legend"
[view]="[width, height]"
[colors]="colors"
[legendData]="yDomain">
<svg:g [attr.transform]="transform" class="bar-chart chart">
<svg:g xAxis
*ngIf="xAxis"
[xScale]="xScale"
[dims]="dims"
[showGridLines]="showGridLines"
[showLabel]="showXAxisLabel"
[labelText]="xAxisLabel">
</svg:g>

<svg:g yAxis
*ngIf="yAxis"
[yScale]="yScale"
[dims]="dims"
[tickFormatting]="yAxisTickFormatting()"
[showLabel]="showYAxisLabel"
[labelText]="yAxisLabel">
</svg:g>

<svg:g seriesHorizontal
[xScale]="xScale"
[yScale]="yScale"
[colors]="colors"
[series]="results"
[dims]="dims"
[gradient]="gradient"
(clickHandler)="click($event)"
/>

<line *ngFor="let line of lines; let i=index; trackBy:trackBy"
[attr.x1]="line.x1"
[attr.y1]="line.y1"
[attr.x2]="line.x2"
[attr.y2]="line.y2 + 50 + i * 20"
[attr.stroke]="line.color" stroke-dasharray="5, 5" />

<text x="-5" y="0" font-size="13" font-weight="bold" [attr.fill]="mainLabel.color">{{ mainLabel.label }}</text>

<text *ngFor="let line of lines; let i=index; trackBy:trackBy"
font-weight="bold" font-size="13"
[attr.x]="line.x2 - 150" [attr.y]="line.y2 + 60 + i * 20"
[attr.fill]="line.color"
>
{{ line.label }}
</text>
</svg:g>
</chart>
`
})
export class BarHorizontal extends BaseChart implements OnChanges, OnDestroy, AfterViewInit {
  dims: ViewDimensions;
  yScale: any;
  xScale: any;
  xDomain: any;
  yDomain: any;
  transform: string;
  colors: Function;
  margin = [10, 20, 70, 100];
  lines = [];

  @Input() extraResults;
  @Input() maxVal;
  @Input() view;
  @Input() results;
  @Input() scheme;
  @Input() customColors;
  @Input() legend = false;
  @Input() xAxis;
  @Input() yAxis;
  @Input() showXAxisLabel;
  @Input() showYAxisLabel;
  @Input() xAxisLabel;
  @Input() yAxisLabel;
  @Input() gradient: boolean;
  @Input() showGridLines: boolean = true;
  @Input() mainLabel;

  @Output() clickHandler = new EventEmitter();

  constructor(private element: ElementRef, zone: NgZone) {
    super(element, zone);
  }

  ngAfterViewInit(): void {
    this.bindResizeEvents(this.view);
  }

  ngOnDestroy() {
    this.unbindEvents();
  }

  ngOnChanges() {
    this.update();
  }

  update() {
    super.update();
    this.dims = calculateViewDimensions(this.width, this.height, this.margin, this.showXAxisLabel, this.showYAxisLabel, this.legend, 9);

    this.xScale = this.getXScale();
    this.yScale = this.getYScale();

    this.setColors();
    this.getExtraResultsDim();
    this.transform = `translate(${ this.dims.xOffset } , ${ this.margin[0] })`;
  }

  getExtraResultsDim() {
    this.mainLabel = this.mainLabel ? this.mainLabel : {label: '', color: 'black'};
    this.lines = this.extraResults.map((value) => {
      let label = value.label;
      let val = value.val;
      let color = value.color;
      let x = (val / this.maxVal) * this.dims.width;
      return {
        x1: x,
        y1: 0,
        x2: x,
        y2: this.dims.height,
        color: color,
        label: `${label}`
      };
    });
  }
  getXScale() {
    this.xDomain = this.getXDomain();
    return d3.scaleLinear()
      .range([0, this.dims.width])
      .domain(this.xDomain);
  }

  getYScale() {
    const spacing = 0.2;
    this.yDomain = this.getYDomain();
    return d3.scaleBand()
      .rangeRound([this.dims.height, 0])
      .paddingInner(spacing)
      .domain(this.yDomain);
  }

  getXDomain() {
    let values = this.results.map(d => d.value);
    let min = Math.min(0, ...values);
    let max;
    if (this.maxVal) {
      max = this.maxVal;
    } else {
      this.maxVal = max = Math.max(...values);
    }
    return [min, max];
  }

  getYDomain() {
    return this.results.map(d => d.name);
  }

  yAxisTickFormatting() {
    let tickFormatting;
    if (this.results.query && this.results.query.dimensions.length) {
      tickFormatting = tickFormat(this.results.query.dimensions[0].field.fieldType, this.results.query.dimensions[0].groupByType.value);
    }
    return tickFormatting;
  }

  click(data) {
    this.clickHandler.emit(data);
  }

  setColors() {
    this.colors = colorHelper(this.scheme, 'ordinal', this.yDomain, this.customColors);
  }
}
