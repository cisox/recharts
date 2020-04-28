import _isFunction from "lodash/isFunction";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @fileOverview Axis of radial direction
 */
import React, { PureComponent } from 'react';
import Layer from '../container/Layer';
import Dot from '../shape/Dot';
import Polygon from '../shape/Polygon';
import Text from '../component/Text';
import { filterProps, adaptEventsOfChild } from '../util/types';
import { polarToCartesian } from '../util/PolarUtils';
var RADIAN = Math.PI / 180;
var eps = 1e-5;

var PolarAngleAxis = /*#__PURE__*/function (_PureComponent) {
  _inherits(PolarAngleAxis, _PureComponent);

  var _super = _createSuper(PolarAngleAxis);

  function PolarAngleAxis() {
    _classCallCheck(this, PolarAngleAxis);

    return _super.apply(this, arguments);
  }

  _createClass(PolarAngleAxis, [{
    key: "getTickLineCoord",

    /**
     * Calculate the coordinate of line endpoint
     * @param  {Object} data The Data if ticks
     * @return {Object} (x0, y0): The start point of text,
     *                  (x1, y1): The end point close to text,
     *                  (x2, y2): The end point close to axis
     */
    value: function getTickLineCoord(data) {
      var _this$props = this.props,
          cx = _this$props.cx,
          cy = _this$props.cy,
          radius = _this$props.radius,
          orientation = _this$props.orientation,
          tickSize = _this$props.tickSize;
      var tickLineSize = tickSize || 8;
      var p1 = polarToCartesian(cx, cy, radius, data.coordinate);
      var p2 = polarToCartesian(cx, cy, radius + (orientation === 'inner' ? -1 : 1) * tickLineSize, data.coordinate);
      return {
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y
      };
    }
    /**
     * Get the text-anchor of each tick
     * @param  {Object} data Data of ticks
     * @return {String} text-anchor
     */

  }, {
    key: "getTickTextAnchor",
    value: function getTickTextAnchor(data) {
      var orientation = this.props.orientation;
      var cos = Math.cos(-data.coordinate * RADIAN);
      var textAnchor;

      if (cos > eps) {
        textAnchor = orientation === 'outer' ? 'start' : 'end';
      } else if (cos < -eps) {
        textAnchor = orientation === 'outer' ? 'end' : 'start';
      } else {
        textAnchor = 'middle';
      }

      return textAnchor;
    }
  }, {
    key: "renderAxisLine",
    value: function renderAxisLine() {
      var _this$props2 = this.props,
          cx = _this$props2.cx,
          cy = _this$props2.cy,
          radius = _this$props2.radius,
          axisLine = _this$props2.axisLine,
          axisLineType = _this$props2.axisLineType;

      var props = _objectSpread({}, filterProps(this.props), {
        fill: 'none'
      }, filterProps(axisLine));

      if (axisLineType === 'circle') {
        return /*#__PURE__*/React.createElement(Dot, _extends({
          className: "recharts-polar-angle-axis-line"
        }, props, {
          cx: cx,
          cy: cy,
          r: radius
        }));
      }

      var ticks = this.props.ticks;
      var points = ticks.map(function (entry) {
        return polarToCartesian(cx, cy, radius, entry.coordinate);
      });
      return /*#__PURE__*/React.createElement(Polygon, _extends({
        className: "recharts-polar-angle-axis-line"
      }, props, {
        points: points
      }));
    }
  }, {
    key: "renderTicks",
    value: function renderTicks() {
      var _this = this;

      var _this$props3 = this.props,
          ticks = _this$props3.ticks,
          tick = _this$props3.tick,
          tickLine = _this$props3.tickLine,
          tickFormatter = _this$props3.tickFormatter,
          stroke = _this$props3.stroke;
      var axisProps = filterProps(this.props);
      var customTickProps = filterProps(tick);

      var tickLineProps = _objectSpread({}, axisProps, {
        fill: 'none'
      }, filterProps(tickLine));

      var items = ticks.map(function (entry, i) {
        var lineCoord = _this.getTickLineCoord(entry);

        var textAnchor = _this.getTickTextAnchor(entry);

        var tickProps = _objectSpread({
          textAnchor: textAnchor
        }, axisProps, {
          stroke: 'none',
          fill: stroke
        }, customTickProps, {
          index: i,
          payload: entry,
          x: lineCoord.x2,
          y: lineCoord.y2
        });

        return /*#__PURE__*/React.createElement(Layer, _extends({
          className: "recharts-polar-angle-axis-tick",
          key: "tick-".concat(i) // eslint-disable-line react/no-array-index-key

        }, adaptEventsOfChild(_this.props, entry, i)), tickLine && /*#__PURE__*/React.createElement("line", _extends({
          className: "recharts-polar-angle-axis-tick-line"
        }, tickLineProps, lineCoord)), tick && PolarAngleAxis.renderTickItem(tick, tickProps, tickFormatter ? tickFormatter(entry.value, i) : entry.value));
      });
      return /*#__PURE__*/React.createElement(Layer, {
        className: "recharts-polar-angle-axis-ticks"
      }, items);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
          ticks = _this$props4.ticks,
          radius = _this$props4.radius,
          axisLine = _this$props4.axisLine;

      if (radius <= 0 || !ticks || !ticks.length) {
        return null;
      }

      return /*#__PURE__*/React.createElement(Layer, {
        className: "recharts-polar-angle-axis"
      }, axisLine && this.renderAxisLine(), this.renderTicks());
    }
  }], [{
    key: "renderTickItem",
    value: function renderTickItem(option, props, value) {
      var tickItem;

      if (React.isValidElement(option)) {
        tickItem = React.cloneElement(option, props);
      } else if (_isFunction(option)) {
        tickItem = option(props);
      } else {
        tickItem = /*#__PURE__*/React.createElement(Text, _extends({}, props, {
          className: "recharts-polar-angle-axis-tick-value"
        }), value);
      }

      return tickItem;
    }
  }]);

  return PolarAngleAxis;
}(PureComponent);

PolarAngleAxis.displayName = 'PolarAngleAxis';
PolarAngleAxis.axisType = 'angleAxis';
PolarAngleAxis.defaultProps = {
  type: 'category',
  angleAxisId: 0,
  scale: 'auto',
  cx: 0,
  cy: 0,
  domain: [0, 'auto'],
  orientation: 'outer',
  axisLine: true,
  tickLine: true,
  tickSize: 8,
  tick: true,
  hide: false,
  allowDuplicatedCategory: true
};
export default PolarAngleAxis;