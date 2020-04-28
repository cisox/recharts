/**
 * @fileOverview Distribution Chart
 */
import generateCategoricalChart from './generateCategoricalChart';
import Distribution from '../cartesian/Distribution';
import XAxis from '../cartesian/XAxis';
import YAxis from '../cartesian/YAxis';
import { formatAxisMap } from '../util/CartesianUtils';

export default generateCategoricalChart({
  chartName: 'DistributionChart',
  GraphicalChild: Distribution,
  axisComponents: [
    { axisType: 'xAxis', AxisComp: XAxis },
    { axisType: 'yAxis', AxisComp: YAxis },
  ],
  formatAxisMap,
});
