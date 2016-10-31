import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  trigger,
  style,
  transition,
  animate, ElementRef, NgZone, AfterViewInit
} from '@angular/core';
import { calculateViewDimensions, ViewDimensions } from '../common/view-dimensions.helper';
import { colorHelper } from '../utils/color-sets';
import { BaseChart } from '../common/base-chart.component';
import d3 from '../d3';

@Component({
  selector: 'bar-horizontal-stacked',
  template: `
<chart
[legend]="legend"
[view]="[width, height]"
[colors]="colors"
[legendData]="innerDomain">
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
[showLabel]="showYAxisLabel"
[labelText]="yAxisLabel">
</svg:g>

<svg:g
*ngFor="let group of results; trackBy:trackBy"
[@animationState]="'active'"
[attr.transform]="groupTransform(group)">
<svg:g seriesHorizontal
type="stacked"
[xScale]="xScale"
[yScale]="yScale"
[colors]="colors"
[series]="group.series"
[dims]="dims"
[gradient]="gradient"
(clickHandler)="click($event, group)"
/>
</svg:g>

<line *ngFor="let line of lines; let i=index; trackBy:trackBy"
[attr.x1]="line.x1"
[attr.y1]="line.y1"
[attr.x2]="line.x2"
[attr.y2]="line.y2 + 50 + i * 20"
[attr.stroke]="line.color" stroke-dasharray="5, 5" />

<text *ngFor="let label of labels; trackBy:trackBy"
font-size="13" font-weight="bold"
[attr.x]="label.x" [attr.y]="label.y"
[attr.text-anchor]="label.anchor"
[attr.fill]="label.color">
{{ label.label }}
</text>

<text *ngFor="let line of lines; let i=index; trackBy:trackBy"
font-weight="bold" font-size="13"
[attr.x]="line.x2 - 150" [attr.y]="line.y2 + 60 + i * 20"
[attr.fill]="line.color"
>
{{ line.label }}
</text>

</svg:g>
</chart>
`,
  animations: [
    trigger('animationState', [
      transition('* => void', [
        style({
          opacity: 1,
          transform: '*',
        }),
        animate(500, style({opacity: 0, transform: 'scale(0)'}))
      ])
    ])
  ]
})
export class BarHorizontalStacked extends BaseChart implements  OnChanges, OnDestroy, AfterViewInit {
  dims: ViewDimensions;
  groupDomain: any[];
  innerDomain: any[];
  valueDomain: any[];
  xScale: any;
  yScale: any;
  transform: string;
  colors: Function;
  margin = [10, 20, 70, 100];
  lines = [];
  labels = [];

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
  @Input() extraResults: any;
  @Input() mainLabel: any;
  @Input() maxVal;

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

    this.groupDomain = this.getGroupDomain();
    this.innerDomain = this.getInnerDomain();
    this.valueDomain = this.getValueDomain();

    this.xScale = this.getXScale();
    this.yScale = this.getYScale();

    this.getLabels();
    this.getExtraResultsDim();
    this.setColors();

    this.transform = `translate(${ this.dims.xOffset } , ${ this.margin[0] })`;
  }
  getLabels() {
    if (this.mainLabel) {
      this.labels.push(
        {
          label: this.mainLabel[0].label,
          color: this.mainLabel[0].color,
          x: 0, y: 0,
          anchor: 'start'
        }
      );
      if (this.mainLabel.length === 2) {
        this.labels.push(
          {
            label: this.mainLabel[1].label,
            color: this.mainLabel[1].color,
            x: this.dims.width - 5, y: 0,
            anchor: 'end'
          }
        );
      }
    } else {
      this.labels = [{label: '', color: 'black', x: 0, y: 0}];
    }
  }
  getExtraResultsDim() {
    this.lines = this.extraResults.map((value) => {
      let label = value.label;
      let val = value.val;
      let color = value.color;
      let x = (val / this.maxVal) * this.dims.width;
      return {
        x1: x,
        y1: -10,
        x2: x,
        y2: this.dims.height,
        color: color,
        label: `${label}`
      };
    });
  }

  getGroupDomain() {
    let domain = [];
    for (let group of this.results) {
      if (!domain.includes(group.name)) {
        domain.push(group.name);
      }
    }

    return domain;
  }

  getInnerDomain() {
    let domain = [];
    for (let group of this.results) {
      for (let d of group.series) {
        if (!domain.includes(d.name)) {
          domain.push(d.name);
        }
      }
    }

    return domain;
  }

  getValueDomain() {
    let domain = [];
    for (let group of this.results) {
      let sum = 0;
      for (let d of group.series) {
        sum += d.value;
      }

      domain.push(sum);
    }

    let min = Math.min(0, ...domain);
    let max;
    if (this.maxVal) {
      max = this.maxVal;
    } else {
      this.maxVal = max = Math.max(...domain);
    }

    return [min, max];
  }

  getYScale() {
    let spacing = 0.1;
    return d3.scaleBand()
      .rangeRound([this.dims.height, 0])
      .paddingInner(spacing)
      .domain(this.groupDomain);
  }

  getXScale() {
    return d3.scaleLinear()
      .range([0, this.dims.width])
      .domain(this.valueDomain);

  }

  groupTransform(group) {
    return `translate(0, ${this.yScale(group.name)})`;
  }

  click(data, group) {
    data.series = group.name;
    this.clickHandler.emit(data);
  }

  trackBy(index, item) {
    return item.name;
  }

  setColors() {
    this.colors = colorHelper(this.scheme, 'ordinal', this.innerDomain, this.customColors);
  }
}
