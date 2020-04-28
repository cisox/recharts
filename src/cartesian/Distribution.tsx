/**
 * @fileOverview Distribution
 */
import React, { PureComponent, ReactElement } from 'react';
import classNames from 'classnames';
import Animate from 'react-smooth';
import _ from 'lodash';
import Curve, { CurveType, Point as CurvePoint } from '../shape/Curve';
import Dot, { Props as DotProps } from '../shape/Dot';
import Layer from '../container/Layer';
import LabelList from '../component/LabelList';
import Global from '../util/Global';
import { isNumber, uniqueId, interpolateNumber } from '../util/DataUtils';
import { getCateCoordinateOfLine, getValueByDataKey } from '../util/ChartUtils';
import { Props as XAxisProps } from './XAxis';
import { Props as YAxisProps } from './YAxis';
import {
  D3Scale,
  LegendType,
  TooltipType,
  AnimationTiming,
  PresentationAttributes,
  filterProps,
  ChartOffset,
  Coordinate,
  DataKey,
  TickItem,
} from '../util/types';

type DistributionDot = ReactElement<SVGElement> | ((props: any) => SVGElement) | DotProps | boolean;
interface DistributionPointItem extends CurvePoint {
  value?: number | number[];
  payload?: any;
}

interface InternalDistributionProps {
  xAxis?: Omit<XAxisProps, 'scale'> & { scale: D3Scale<string | number> };
  yAxis?: Omit<YAxisProps, 'scale'> & { scale: D3Scale<string | number> };
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  points?: DistributionPointItem[];
  baseLine?: number | Coordinate[];
}

interface DistributionProps extends InternalDistributionProps {
  className?: string;
  dataKey: DataKey<any>;
  type?: CurveType;
  unit?: string | number;
  name?: string | number;
  xAxisId?: string | number;
  yAxisId?: string | number;

  stackId?: string | number;
  legendType?: LegendType;
  tooltipType?: TooltipType;
  connectNulls?: boolean;
  // whether have dot in line
  activeDot?: DistributionDot;
  dot?: DistributionDot;

  label?: any;
  layout?: 'horizontal' | 'vertical';
  hide?: boolean;
  baseValue?: number | 'dataMin' | 'dataMax';
  isRange?: boolean;

  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;

  isAnimationActive?: boolean;
  animateNewValues?: boolean;
  animationBegin?: number;
  animationDuration?: number;
  animationEasing?: AnimationTiming;
  animationId?: number;
  id?: string;
}

type Props = PresentationAttributes<SVGElement> & DistributionProps;

interface State {
  prevPoints?: DistributionPointItem[];
  prevBaseLine?: number | Coordinate[];
  isAnimationFinished?: boolean;
  totalLength?: number;
}

class Distribution extends PureComponent<Props, State> {
  static displayName = 'Distribution';

  static defaultProps = {
    stroke: '#3182bd',
    fill: '#3182bd',
    fillOpacity: 0.6,
    xAxisId: 0,
    yAxisId: 0,
    legendType: 'line',
    connectNulls: false,
    // points of area
    points: [] as DistributionPointItem[],
    dot: false,
    activeDot: true,
    hide: false,

    isAnimationActive: !Global.isSsr,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',
  };

  static getBaseValue = (props: Props, xAxis: Props['xAxis'], yAxis: Props['yAxis']): number => {
    const { layout, baseValue } = props;

    if (isNumber(baseValue) && typeof baseValue === 'number') {
      return baseValue;
    }

    const numericAxis = layout === 'horizontal' ? yAxis : xAxis;
    const domain = numericAxis.scale.domain();

    if (numericAxis.type === 'number') {
      const max = Math.max(domain[0], domain[1]);
      const min = Math.min(domain[0], domain[1]);

      if (baseValue === 'dataMin') {
        return min;
      }
      if (baseValue === 'dataMax') {
        return max;
      }

      return max < 0 ? max : Math.max(Math.min(domain[0], domain[1]), 0);
    }

    if (baseValue === 'dataMin') {
      return domain[0];
    }
    if (baseValue === 'dataMax') {
      return domain[1];
    }

    return domain[0];
  };

  static getComposedData = ({
    props,
    xAxis,
    yAxis,
    xAxisTicks,
    yAxisTicks,
    bandSize,
    dataKey,
    stackedData,
    dataStartIndex,
    displayedData,
    offset,
  }: {
    props: Props;
    item: Distribution;
    bandSize: number;
    xAxis: InternalDistributionProps['xAxis'];
    yAxis: InternalDistributionProps['yAxis'];
    xAxisTicks: TickItem[];
    yAxisTicks: TickItem[];
    stackedData: number[][];
    dataStartIndex: number;
    offset: ChartOffset;
    displayedData: any[];
    dataKey: Props['dataKey'];
  }) => {
    const { layout } = props;
    const hasStack = stackedData && stackedData.length;
    const baseValue = Distribution.getBaseValue(props, xAxis, yAxis);
    let isRange = false;

    const points = displayedData.map((entry, index) => {
      const originalValue = getValueByDataKey(entry, dataKey);
      let value;

      if (hasStack) {
        value = stackedData[dataStartIndex + index];
      } else {
        value = originalValue;

        if (!_.isArray(value)) {
          value = [baseValue, value];
        } else {
          isRange = true;
        }
      }

      const isBreakPoint = _.isNil(value[1]) || (hasStack && _.isNil(originalValue));
      if (layout === 'horizontal') {
        return {
          x: getCateCoordinateOfLine({ axis: xAxis, ticks: xAxisTicks, bandSize, entry, index }),
          y: isBreakPoint ? null : yAxis.scale(value[1]),
          value,
          payload: entry,
        };
      }

      return {
        x: isBreakPoint ? null : xAxis.scale(value[1]),
        y: getCateCoordinateOfLine({ axis: yAxis, ticks: yAxisTicks, bandSize, entry, index }),
        value,
        payload: entry,
      };
    });

    let baseLine;
    if (hasStack || isRange) {
      baseLine = points.map(entry => {
        if (layout === 'horizontal') {
          return {
            x: entry.x,
            y: !_.isNil(_.get(entry, 'value[0]')) ? yAxis.scale(_.get(entry, 'value[0]')) : null,
          };
        }
        return {
          x: !_.isNil(_.get(entry, 'value[0]')) ? xAxis.scale(_.get(entry, 'value[0]')) : null,
          y: entry.y,
        };
      });
    } else if (layout === 'horizontal') {
      baseLine = yAxis.scale(baseValue);
    } else {
      baseLine = xAxis.scale(baseValue);
    }

    return { points, baseLine, layout, isRange, ...offset };
  };

  static renderDotItem = (option: DistributionDot, props: any) => {
    let dotItem;

    if (React.isValidElement(option)) {
      dotItem = React.cloneElement(option, props);
    } else if (_.isFunction(option)) {
      dotItem = option(props);
    } else {
      dotItem = <Dot {...props} className="recharts-area-dot" />;
    }

    return dotItem;
  };

  state: State = { isAnimationFinished: true };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { animationId, points, baseLine } = this.props;

    if (nextProps.animationId !== animationId) {
      this.cachePrevData(points, baseLine);
    }
  }

  id = uniqueId('recharts-area-');

  cachePrevData = (points: DistributionPointItem[], baseLine: Props['baseLine']) => {
    this.setState({
      prevPoints: points,
      prevBaseLine: baseLine,
    });
  };

  handleAnimationEnd = () => {
    const { onAnimationEnd } = this.props;

    this.setState({ isAnimationFinished: true });

    if (_.isFunction(onAnimationEnd)) {
      onAnimationEnd();
    }
  };

  handleAnimationStart = () => {
    const { onAnimationStart } = this.props;
    this.setState({ isAnimationFinished: false });

    if (_.isFunction(onAnimationStart)) {
      onAnimationStart();
    }
  };

  renderDots(needClip: boolean, clipPathId: string) {
    const { isAnimationActive } = this.props;
    const { isAnimationFinished } = this.state;

    if (isAnimationActive && !isAnimationFinished) {
      return null;
    }

    const { dot, points, dataKey } = this.props;
    const areaProps = filterProps(this.props);
    const customDotProps = filterProps(dot, true);

    const dots = points.map((entry: DistributionPointItem, i: number) => {
      const dotProps = {
        key: `dot-${i}`,
        r: 3,
        ...areaProps,
        ...customDotProps,
        dataKey,
        cx: entry.x,
        cy: entry.y,
        index: i,
        value: entry.value,
        payload: entry.payload,
      };

      return Distribution.renderDotItem(dot, dotProps);
    });
    const dotsProps = {
      clipPath: needClip ? `url(#clipPath-${clipPathId})` : null,
    };
    return (
      <Layer className="recharts-area-dots" {...dotsProps}>
        {dots}
      </Layer>
    );
  }

  renderHorizontalRect(alpha: number) {
    const { baseLine, points, strokeWidth } = this.props;
    const startX = points[0].x;
    const endX = points[points.length - 1].x;
    const width = alpha * Math.abs(startX - endX);
    let maxY = _.max(points.map((entry: DistributionPointItem) => entry.y || 0));

    if (isNumber(baseLine) && typeof baseLine === 'number') {
      maxY = Math.max(baseLine, maxY);
    } else if (baseLine && _.isArray(baseLine) && baseLine.length) {
      maxY = Math.max(_.max(baseLine.map((entry: DistributionPointItem) => entry.y || 0)), maxY);
    }

    if (isNumber(maxY)) {
      return (
        <rect
          x={startX < endX ? startX : startX - width}
          y={0}
          width={width}
          height={Math.floor(maxY + (strokeWidth ? parseInt(`${strokeWidth}`, 10) : 1))}
        />
      );
    }

    return null;
  }

  renderVerticalRect(alpha: number) {
    const { baseLine, points, strokeWidth } = this.props;
    const startY = points[0].y;
    const endY = points[points.length - 1].y;
    const height = alpha * Math.abs(startY - endY);
    let maxX = _.max(points.map((entry: DistributionPointItem) => entry.x || 0));

    if (isNumber(baseLine) && typeof baseLine === 'number') {
      maxX = Math.max(baseLine, maxX);
    } else if (baseLine && _.isArray(baseLine) && baseLine.length) {
      maxX = Math.max(_.max(baseLine.map((entry: DistributionPointItem) => entry.x || 0)), maxX);
    }

    if (isNumber(maxX)) {
      return (
        <rect
          x={0}
          y={startY < endY ? startY : startY - height}
          width={maxX + (strokeWidth ? parseInt(`${strokeWidth}`, 10) : 1)}
          height={Math.floor(height)}
        />
      );
    }

    return null;
  }

  renderClipRect(alpha: number) {
    const { layout } = this.props;

    if (layout === 'vertical') {
      return this.renderVerticalRect(alpha);
    }

    return this.renderHorizontalRect(alpha);
  }

  renderAreaStatically(
    points: DistributionPointItem[],
    baseLine: Props['baseLine'],
    needClip: boolean,
    clipPathId: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { layout, type, stroke, connectNulls, isRange, ref, ...others } = this.props;

    return (
      <Layer clipPath={needClip ? `url(#clipPath-${clipPathId})` : null}>
        <Curve
          {...filterProps(others, true)}
          points={points}
          connectNulls={connectNulls}
          type={type}
          baseLine={baseLine}
          layout={layout}
          stroke="none"
          className="recharts-area-area"
        />
        {stroke !== 'none' && (
          <Curve
            {...filterProps(this.props)}
            className="recharts-area-curve"
            layout={layout}
            type={type}
            connectNulls={connectNulls}
            fill="none"
            points={points}
          />
        )}
        {stroke !== 'none' && isRange && (
          <Curve
            {...filterProps(this.props)}
            className="recharts-area-curve"
            layout={layout}
            type={type}
            connectNulls={connectNulls}
            fill="none"
            points={baseLine as CurvePoint[]}
          />
        )}
      </Layer>
    );
  }

  renderAreaWithAnimation(needClip: boolean, clipPathId: string) {
    const {
      points,
      baseLine,
      isAnimationActive,
      animationBegin,
      animationDuration,
      animationEasing,
      animationId,
    } = this.props;
    const { prevPoints, prevBaseLine } = this.state;
    // const clipPathId = _.isNil(id) ? this.id : id;

    return (
      <Animate
        begin={animationBegin}
        duration={animationDuration}
        isActive={isAnimationActive}
        easing={animationEasing}
        from={{ t: 0 }}
        to={{ t: 1 }}
        key={`area-${animationId}`}
        onAnimationEnd={this.handleAnimationEnd}
        onAnimationStart={this.handleAnimationStart}
      >
        {({ t }: { t: number }) => {
          if (prevPoints) {
            const prevPointsDiffFactor = prevPoints.length / points.length;
            // update animtaion
            const stepPoints = points.map((entry: DistributionPointItem, index: number) => {
              const prevPointIndex = Math.floor(index * prevPointsDiffFactor);
              if (prevPoints[prevPointIndex]) {
                const prev = prevPoints[prevPointIndex];
                const interpolatorX = interpolateNumber(prev.x, entry.x);
                const interpolatorY = interpolateNumber(prev.y, entry.y);

                return { ...entry, x: interpolatorX(t), y: interpolatorY(t) };
              }

              return entry;
            });
            let stepBaseLine;

            if (isNumber(baseLine) && typeof baseLine === 'number') {
              const interpolator = interpolateNumber(prevBaseLine as number, baseLine);
              stepBaseLine = interpolator(t);
            } else if (_.isNil(baseLine) || _.isNaN(baseLine)) {
              const interpolator = interpolateNumber(prevBaseLine as number, 0);
              stepBaseLine = interpolator(t);
            } else {
              stepBaseLine = (baseLine as Coordinate[]).map((entry, index) => {
                const prevPointIndex = Math.floor(index * prevPointsDiffFactor);
                if ((prevBaseLine as Coordinate[])[prevPointIndex]) {
                  const prev = (prevBaseLine as Coordinate[])[prevPointIndex];
                  const interpolatorX = interpolateNumber(prev.x, entry.x);
                  const interpolatorY = interpolateNumber(prev.y, entry.y);

                  return { ...entry, x: interpolatorX(t), y: interpolatorY(t) };
                }

                return entry;
              });
            }

            return this.renderAreaStatically(stepPoints, stepBaseLine, needClip, clipPathId);
          }

          return (
            <Layer>
              <defs>
                <clipPath id={`animationClipPath-${clipPathId}`}>{this.renderClipRect(t)}</clipPath>
              </defs>
              <Layer clipPath={`url(#animationClipPath-${clipPathId})`}>
                {this.renderAreaStatically(points, baseLine, needClip, clipPathId)}
              </Layer>
            </Layer>
          );
        }}
      </Animate>
    );
  }

  renderArea(needClip: boolean, clipPathId: string) {
    const { points, baseLine, isAnimationActive } = this.props;
    const { prevPoints, prevBaseLine, totalLength } = this.state;

    if (
      isAnimationActive &&
      points &&
      points.length &&
      ((!prevPoints && totalLength > 0) || !_.isEqual(prevPoints, points) || !_.isEqual(prevBaseLine, baseLine))
    ) {
      return this.renderAreaWithAnimation(needClip, clipPathId);
    }

    return this.renderAreaStatically(points, baseLine, needClip, clipPathId);
  }

  render() {
    const { hide, dot, points, className, top, left, xAxis, yAxis, width, height, isAnimationActive, id } = this.props;

    if (hide || !points || !points.length) {
      return null;
    }

    const { isAnimationFinished } = this.state;
    const hasSinglePoint = points.length === 1;
    const layerClass = classNames('recharts-area', className);
    const needClip = (xAxis && xAxis.allowDataOverflow) || (yAxis && yAxis.allowDataOverflow);
    const clipPathId = _.isNil(id) ? this.id : id;

    return (
      <Layer className={layerClass}>
        {needClip ? (
          <defs>
            <clipPath id={`clipPath-${clipPathId}`}>
              <rect x={left} y={top} width={width} height={Math.floor(height)} />
            </clipPath>
          </defs>
        ) : null}
        {!hasSinglePoint ? this.renderArea(needClip, clipPathId) : null}
        {(dot || hasSinglePoint) && this.renderDots(needClip, clipPathId)}
        {(!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, points)}
      </Layer>
    );
  }
}

export default Distribution;
