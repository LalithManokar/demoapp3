/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ino/controls/EvaluationMatrixItem",
    "sap/ui/thirdparty/d3"
], function(Control,
            EvaluationMatrixItem,
            d3) {
    "use strict";

    /*
     * the usage of the global variable d3 (sap.ui.thirdparty.d3) will cause a warning during the build process =>
     * that's ok
     */

    /**
     * The evaluation matrix shows evaluations as bubble in a matrix with 4 quadrants. In addition to the x and y
     * coordinates evaluations may have 2 for more dimensions which are represented as different radius' of the
     * evaluations' bubble.<br />
     * The quadrants are numbered like this:
     *
     * <pre>
     * 12
     * <br />
     * 34
     * </pre>
     *
     * <ul>
     * <li>Properties
     * <ul>
     * <li>width: width of the control</li>
     * <li>height: height of the control</li>
     * <li>xMin: minimum value of the x axis</li>
     * <li>xMax: maximum value of the x axis</li>
     * <li>xLabel: Label of the x axis</li>
     * <li>yMin: minimum value of the y axis</li>
     * <li>yMax: maximum value of the y axis</li>
     * <li>yLabel: Label of the y axis</li>
     * <li>r1Min: minimum value of the inner bubble</li>
     * <li>r1Max: maximum value of the inner bubble</li>
     * <li>r2Min: minimum value of the outer bubble</li>
     * <li>r2Max: maximum value of the outer bubble</li>
     * <li>rMax: maximum value of the bubble radius</li>
     * <li>xSegments: Number of segments on x-axis</li>
     * <li>ySegments: Number of segments on y-axis</li>
     * <li>mode: if mode is "radio" only one bubble is selected at a time</li>
     * <li>clickable: is the matrix clickable</li>
     * <li>selectedItemName: name of currently selected matrix item</li>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>items: sap.ino.controls.EvaluationMatrixItem
     * </ul>
     * <li>Events
     * <ul>
     * <li>itemSelected: matrix item has been selected. Name of item is given as parameter.</li>
     * </ul>
     * </li>
     * </ul>
     */
    return Control.extend("sap.ino.controls.EvaluationMatrix", {
        metadata: {
            properties: {
                width: {
                    type: "float",
                    defaultValue: 500
                },
                height: {
                    type: "float",
                    defaultValue: 500
                },
                xMin: {
                    type: "float",
                    defaultValue: 0
                },
                xMax: {
                    type: "float",
                    defaultValue: 50
                },
                xLabel: {
                    type: "string"
                },
                xLabelUom: {
                    type: "string"
                },
                yMin: {
                    type: "float",
                    defaultValue: 0
                },
                yMax: {
                    type: "float",
                    defaultValue: 50
                },
                yLabel: {
                    type: "string"
                },
                yLabelUom: {
                    type: "string"
                },
                r1Min: {
                    type: "float",
                    defaultValue: 0
                },
                r1Max: {
                    type: "float",
                    defaultValue: null
                },
                r2Min: {
                    type: "float",
                    defaultValue: 0
                },
                r2Max: {
                    type: "float",
                    defaultValue: null
                },
                rMin: {
                    type: "float",
                    defaultValue: 6
                },
                rMax: {
                    type: "float",
                    defaultValue: 25
                },
                xSegments: {
                    type: "int",
                    defaultValue: 2
                },
                ySegments: {
                    type: "int",
                    defaultValue: 2
                },
                mode: {
                    type: "string",
                    defaultValue: "radio" // check
                },
                clickable: {
                    type: "boolean",
                    defaultValue: true
                },
                selectedItemName: {
                    type: "string",
                    defaultValue: "item"
                },
                legendHeight: {
                    type: "float",
                    defaultValue: 0
                },
                displayLegend: {
                    type: "boolean",
                    defaultValue: false
                },
                innerCircleText: "string",
                outerCircleText: "string"
            },

            aggregations: {
                "items": {
                    type: "sap.ino.controls.EvaluationMatrixItem",
                    multiple: true,
                    singularName: "item",
                    bindable: true
                },
                "evalData": {
                    type: "sap.ino.controls.EvaluationData",
                    multiple: true,
                    singularName: "datum",
                    bindable: true
                }
            },

            events: {
                "itemSelected": {}
            }
        },

        renderer: function(orm, oControl) {
            orm.write("<div");
            orm.writeControlData(oControl);
            orm.addClass("matrix");
            orm.writeClasses();
            orm.write(">");
            orm.write("</div>");
        },

        determineRadiusMax: function() {
            var aItems = this.getItems();
            var i, oItem;
            this._r1MaxCalc = null;
            if (this.getR1Max()) {
                this._r1MaxCalc = this.getR1Max();
            } else if (aItems.length > 0) {
                for (i = 0; i < aItems.length; i++) {
                    oItem = aItems[i];
                    if (!this._r1MaxCalc || this._r1MaxCalc < oItem.getR1Value()) {
                        this._r1MaxCalc = oItem.getR1Value();
                    }
                }
            }

            this._r2MaxCalc = null;
            if (this.getR2Max()) {
                this._r2MaxCalc = this.getR2Max();
            } else if (aItems.length > 0) {
                for (i = 0; i < aItems.length; i++) {
                    oItem = aItems[i];
                    if (!this._r2MaxCalc || this._r2MaxCalc < oItem.getR2Value()) {
                        this._r2MaxCalc = oItem.getR2Value();
                    }
                }
            }
        },
        
        onBeforeRendering: function() {
            this.prepareMatrix();
        },
        
        prepareMatrix: function() {
            this.removeAllAggregation("items", true);
            var aData = this.getEvalData();
            var visParam1Score;
            var visParam2Score;
            
            if (aData.length === 0) {
                return;
            }
            for (var i = 0; i < aData.length; i ++) {
                var oMatrixCriterion = aData[i].findValueByAggregationTypeMatrix();
                if (oMatrixCriterion) {
                    this.setXSegments(oMatrixCriterion.getXAxisSegmentNo());
                    this.setYSegments(oMatrixCriterion.getYAxisSegmentNo());

                    var xAxisScore = aData[i].findValueByCriterionCode(oMatrixCriterion.getXAxisCriterionCode());
                    var yAxisScore = aData[i].findValueByCriterionCode(oMatrixCriterion.getYAxisCriterionCode());

                    if (yAxisScore && xAxisScore) {
                        this.setXLabel(xAxisScore.getCriterionName());
                        if (xAxisScore.getUomCode()) {
                            this.setXLabelUom(xAxisScore.getXAxisCriterionCodeLabel());
                        }
                        this.setYLabel(yAxisScore.getCriterionName());
                        if (yAxisScore.getUomCode()) {
                            this.setYLabelUom(yAxisScore.getYAxisCriterionCodeLabel());
                        }

                        if (oMatrixCriterion.getVisParam1CriterionCode()) {
                            visParam1Score = aData[i].findValueByCriterionCode(oMatrixCriterion.getVisParam1CriterionCode());
                        }

                        if (oMatrixCriterion.getVisParam2CriterionCode()) {
                            visParam2Score = aData[i].findValueByCriterionCode(oMatrixCriterion.getVisParam2CriterionCode());
                        }

                        var oMatrixItem = new sap.ino.controls.EvaluationMatrixItem({
                            name: aData[i].getEvaluationId()
                        });

                        // X-Axis
                        if (xAxisScore.getCriterionValue()) {
                            oMatrixItem.setXValue(parseFloat(xAxisScore.getCriterionValue()));
                            oMatrixItem.setXValueDataType(xAxisScore.getCriterionDataType());
                        }

                        if (xAxisScore.getValueMin()) {
                            this.setXMin(xAxisScore.getValueMin());
                        }

                        if (xAxisScore.getValueMax()) {
                            this.setXMax(xAxisScore.getValueMax());
                        }

                        // Y-Axis
                        if (yAxisScore.getCriterionValue()) {
                            oMatrixItem.setYValue(parseFloat(yAxisScore.getCriterionValue()));
                            oMatrixItem.setYValueDataType(yAxisScore.getCriterionDataType());
                        }

                        if (yAxisScore.getValueMin()) {
                            this.setYMin(yAxisScore.getValueMin());
                        }

                        if (yAxisScore.getValueMax()) {
                            this.setYMax(yAxisScore.getValueMax());
                        }

                        // Inner Radius
                        if (visParam1Score) {
                            if (visParam1Score.getCriterionValue()) {
                                oMatrixItem.setR1Value(parseFloat(visParam1Score.getCriterionValue()));
                                oMatrixItem.setR1ValueDataType(visParam1Score.getCriterionDataType());
                            }

                            if (visParam1Score.getValueMin()) {
                                this.setR1Min(visParam1Score.getValueMin());
                            }

                            if (visParam1Score.getValueMax()) {
                                this.setR1Max(visParam1Score.getValueMax());
                            }
                        }

                        // Outer Radius
                        if (visParam2Score) {
                            if (visParam2Score.getCriterionValue()) {
                                oMatrixItem.setR2Value(parseFloat(visParam2Score.getCriterionValue()));
                                oMatrixItem.setR2ValueDataType(visParam2Score.getCriterionDataType());
                            }

                            if (visParam2Score.getValueMin()) {
                                this.setR2Min(visParam2Score.getValueMin());
                            }

                            if (visParam2Score.getValueMax()) {
                                this.setR2Max(visParam2Score.getValueMax());
                            }
                        }
                        this.addItem(oMatrixItem);
                    }
                }
            }
        },

        onAfterRendering: function() {
            var margin = {
                top: 10,
                right: 10,
                bottom: 30,
                left: 30
            };

            if (this.getDisplayLegend()) {
                margin.bottom += this.getLegendHeight();
            }

            this.determineRadiusMax();
            var data = elementsToPlainObjects(this.getItems());

            var width = this.getWidth() - margin.left - margin.right;
            var height = this.getHeight() - margin.top - margin.bottom;

            var x = d3.scale.linear().domain([this.getXMin(), this.getXMax()]).range([0, width]);
            var y = d3.scale.linear().domain([this.getYMin(), this.getYMax()]).range([height, 0]);

            var rMin = this.getR1Min() < this.getR2Min() ? this.getR1Min() : this.getR2Min();
            var rMax = this._r1MaxCalc > this._r2MaxCalc ? this._r1MaxCalc : this._r2MaxCalc;
            var r = d3.scale.linear().domain([rMin, rMax]).range([this.getRMin(), this.getRMax()]);

            var root = d3.select("#" + this.getId());
            var svg = svgAppendSvgElement(root, width, height, margin);

            var xMax = this.getXMax() - this.getXMin();
            var sX = xMax / this.getXSegments();
            var i, j;
            for (i = 1; i <= this.getXSegments(); i++) {
                svgAppendVLine(svg, x(this.getXMin() + i * sX), y(this.getYMin()), y(this.getYMax()));
            }
            var yMax = this.getYMax() - this.getYMin();
            var sY = yMax / this.getYSegments();
            for (j = 1; j <= this.getYSegments(); j++) {
                svgAppendHLine(svg, x(this.getXMin()), x(this.getXMax()), y(this.getYMin() + j * sY));
            }

            svgAppendXAxis(svg, x(this.getXMin()), x(this.getXMax()), y(this.getYMin()), this.getXLabel(), this.getXLabelUom());
            svgAppendYAxis(svg, y(this.getYMin()), this.getYLabel(), this.getYLabelUom());

            var aEvalData = this.getEvalData();
            for (i = 0; i < aEvalData.length; i++) {
                var oMatrixCriterion = aEvalData[i].findValueByAggregationTypeMatrix();
                if(oMatrixCriterion) {
                    var aLabelCodes = oMatrixCriterion.getValueOptionListLabelCodes();
                    if (aLabelCodes) {
                        for (j = 0; j < aLabelCodes.length; j++) {
                            var oQLabelCode = aLabelCodes[j];
                            var jCode = oQLabelCode.CODE - 1;
                            if (jCode >= 0) {
                                var qX = jCode % this.getXSegments();
                                var qY = Math.floor(jCode / this.getXSegments());
                                svgAppendQuadrantLabel(svg, x(this.getXMin() + qX * sX + 0.5 * sX), y(this.getYMin() + (1 + qY) * sY) + 20, oQLabelCode.TEXT, x(this.getXMin() + sX), this.getXSegments());
                            }
                        }
                    }
                }
            }
            var ce = svgAppendCircleEnter(this, svg, x, y, data);
            svgAppendCoordinates(this, ce, x, y, data);
            svgAppendCircles(this, ce, r, this.getMode(), this.getClickable());
            var cg = jQuery(this.getDomRef()).find("g[name='circleGroup_" + this.getSelectedItemName() + "']")[0];
            if (cg) {
                highlightCircle(this, cg, this.getMode());
            }
        }
    });

    function wrap(that) {
        /* jshint validthis: true */
        var self = d3.select(this),
            textLength = self.node().getComputedTextLength(),
            text = self.text();
        while (textLength > 260 && text.length > 0) {
            text = text.slice(0, -1);
            self.text(text + '...');
            textLength = self.node().getComputedTextLength();
        }
    }

    function svgAppendSvgElement(el, width, height, margin) {
        var svg = el.append("svg").attr("width", width + margin.left + margin.right).attr("focusable", "false").attr("height", height + margin.top + margin.bottom).attr("class", "sapUiInoEvaluationMatrixSvgElement").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        return svg;
    }

    function svgAppendHLine(el, x1, x2, y) {
        var l = el.append("g").attr("class", "sapUiInoEvaluationMatrixLine").attr("transform", "translate(" + x1 + "," + y + ")").append("svg:line").attr("x1", 0).attr("y1", 0).attr("x2", x2 - x1).attr("y2", 0);
        return l;
    }

    function svgAppendVLine(el, x, y1, y2) {
        var l = el.append("g").attr("class", "sapUiInoEvaluationMatrixLine").attr("transform", "translate(" + x + "," + y1 + ")").append("svg:line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", y2 - y1);
        return l;
    }

    function svgAppendXAxis(el, x1, x2, y, label, uom) {
        var sLabel = uom ? label + " [" + uom + "]" : label;
        var ax = el.append("g").attr("class", "sapUiInoEvaluationMatrixAxis").attr("transform", "translate(" + x1 + "," + y + ")");
        ax.append("svg:line").attr("x1", 0).attr("y1", 0).attr("x2", x2 + 1).attr("y2", 0); // + 1 is for 2px width of
        // border
        ax.append("svg:text").attr("transform", "translate(" + x2 + ",0)").attr("class", "sapUiInoEvaluationMatrixLabel").attr("y", "25").attr("x", "0").style("text-anchor", "end").text(sLabel);
        return ax;
    }

    function svgAppendYAxis(el, y2, label, uom) {
        var sLabel = uom ? label + " [" + uom + "]" : label;
        var ax = el.append("g").attr("class", "sapUiInoEvaluationMatrixAxis");
        ax.append("svg:line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", y2 + 1); // + 1 is for 2px width of
        // border
        ax.append("svg:text").attr("transform", "rotate(-90)").attr("class", "sapUiInoEvaluationMatrixLabel").attr("x", "0").attr("y", "-18").style("text-anchor", "end").text(sLabel);
        return ax;
    }

    function svgAppendQuadrantLabel(el, x, y, label, width, segments) {
        var sClass = "sapUiInoEvaluationMatrixQuadrant sapUiInoEvaluationMatrixQuadrantSegments" + segments;
        var lb = el.append("g").attr("transform", "translate(" + x + "," + y + ")").append("svg:text").attr("class", sClass).style("text-anchor", "middle").text(label);
        return lb;
    }

    function svgAppendCircleEnter(that, el, xScale, yScale, values) {
        var ce = el.selectAll("circle").data(values).enter().append("g").attr("name", "circleEnter").attr("transform", function(d) {
            return "translate(" + xScale(d.xValue) + "," + yScale(d.yValue) + ")";
        });
        return ce;
    }

    function svgAppendCoordinates(that, el, xScale, yScale, values) {
        var co = el.append("g").attr("class", "sapUiInoEvaluationMatrixHidden").attr("name", function(d) {
            return "coord_" + d.name;
        });
        co.append("svg:line").attr("x1", 0).attr("y1", 0).attr("x2", function(d) {
            var fAxisLeft = -xScale(d.xValue);
            return fAxisLeft;
        }).attr("y2", 0).attr("class", "sapUiInoEvaluationMatrixValueLine");
        co.append("svg:line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", function(d) {
            var fAxisBottom = yScale(that.getYMax() - d.yValue + that.getYMin());
            return fAxisBottom;
        }).attr("class", "sapUiInoEvaluationMatrixValueLine");
        co.append("svg:text").attr("transform", function(d) {
            var fAxisLeft = -xScale(d.xValue);
            return "translate(" + (fAxisLeft - 17) + ", 5)";
        }).attr("class", "sapUiInoEvaluationMatrixCoordinate").text(function(d) {
            return getFormattedValue(d.yValueDataType, d.yValue);
        });
        co.append("svg:text").attr("transform", function(d) {
            var fAxisBottom = yScale(that.getYMax() - d.yValue + that.getYMin());
            return "translate(0, " + (fAxisBottom + 14) + ")";
        }).attr("class", "sapUiInoEvaluationMatrixCoordinate").style("text-anchor", "middle").text(function(d) {
            return getFormattedValue(d.xValueDataType, d.xValue);
        });
        svgAppendLegend(that, co, xScale, yScale);
        return co;
    }

    function svgAppendLegend(that, co, xScale, yScale) {
        var aEvalData = that.getEvalData();
        var sR1Label, sR2Label, r1LabelUom, r2LabelUom;
        for (var i = 0; i < aEvalData.length; i++) {
            var oMatrixCriterion = aEvalData[i].findValueByAggregationTypeMatrix();
            if (oMatrixCriterion) {
                var visParam1Score, visParam2Score;
                if (oMatrixCriterion.getVisParam1CriterionCode()) {
                    visParam1Score = aEvalData[i].findValueByCriterionCode(oMatrixCriterion.getVisParam1CriterionCode());
                    if (visParam1Score) {
                        sR1Label = visParam1Score.getCriterionLabel();
                        r1LabelUom = visParam1Score.getVisParam1CriterionCodeLabel();
                    }
                }
                if (oMatrixCriterion.getVisParam2CriterionCode()) {
                    visParam2Score = aEvalData[i].findValueByCriterionCode(oMatrixCriterion.getVisParam2CriterionCode());
                    if (visParam2Score) {
                        sR2Label = visParam2Score.getCriterionLabel();
                        r2LabelUom = visParam2Score.getVisParam2CriterionCodeLabel();
                    }
                }
            }
        }
        if (that.getDisplayLegend() && sR1Label && sR2Label) {
            // Inner Circle
            co.append("svg:circle").attr("cx", function(d) {
                var fAxisLeft = -xScale(d.xValue);
                return fAxisLeft + 3;
            }).attr("cy", function(d) {
                var fAxisBottom = yScale(that.getYMax() - d.yValue + that.getYMin());
                return fAxisBottom + 40;
            }).attr("r", 6).attr("class", function(d) {
                if (d.r1Value <= d.r2Value) {
                    return "sapUiInoEvaluationMatrixInnerCircleHighlight";
                } else {
                    return "sapUiInoEvaluationMatrixOuterCircleHighlight";
                }
            });
            co.append("svg:text").attr("transform", function(d) {
                var fAxisLeft = -xScale(d.xValue);
                var fAxisBottom = yScale(that.getYMax() - d.yValue + that.getYMin());
                return "translate(" + (fAxisLeft + 15) + ", " + (fAxisBottom + 45) + ")";
            }).text(function(d) {
                var sLegendText;
                if (d.r1Value <= d.r2Value) {
                    sLegendText = sR1Label;
                    if (r1LabelUom) {
                        sLegendText = sLegendText + " " + r1LabelUom;
                    }
                } else {
                    sLegendText = sR2Label;
                    if (r2LabelUom) {
                        sLegendText = sLegendText + " " + r2LabelUom;
                    }
                }
                return sLegendText + " (" + that.getInnerCircleText() + ")";
            }).each(wrap);
            // Outside Circle
            co.append("svg:circle").attr("cx", function(d) {
                var fAxisLeft = -xScale(d.xValue);
                return fAxisLeft + 3;
            }).attr("cy", function(d) {
                var fAxisBottom = yScale(that.getYMax() - d.yValue + that.getYMin());
                return fAxisBottom + 60;
            }).attr("r", 6).attr("class", function(d) {
                if (d.r1Value > d.r2Value) {
                    return "sapUiInoEvaluationMatrixInnerCircleHighlight";
                } else {
                    return "sapUiInoEvaluationMatrixOuterCircleHighlight";
                }
            });
            co.append("svg:text").attr("transform", function(d) {
                var fAxisLeft = -xScale(d.xValue);
                var fAxisBottom = yScale(that.getYMax() - d.yValue + that.getYMin());
                return "translate(" + (fAxisLeft + 15) + ", " + (fAxisBottom + 65) + ")";
            }).text(function(d) {
                var sLegendText;
                if (d.r1Value > d.r2Value) {
                    sLegendText = sR1Label;
                    if (r1LabelUom) {
                        sLegendText = sLegendText + " " + r1LabelUom;
                    }
                } else {
                    sLegendText = sR2Label;
                    if (r2LabelUom) {
                        sLegendText = sLegendText + " " + r2LabelUom;
                    }
                }
                return sLegendText + " (" + that.getOuterCircleText() + ")";
            }).each(wrap);
        }
    }

    function svgAppendCircles(that, el, rScale, mode, clickable) {
        var c = el.append("g").attr("name", function(d) {
            return "circleGroup_" + d.name;
        });
        c.append("svg:circle").attr("cx", 0).attr("cy", 0).attr("r", function(d) {
            return rScale(d.r2Value);
        }).attr("class", "sapUiInoEvaluationMatrixOuterCircle").attr("name", "outerCircle").attr("title", function(d) {
            return d.r2Value;
        });
        c.append("svg:circle").attr("cx", 0).attr("cy", 0).attr("r", function(d) {
            return rScale(d.r1Value);
        }).attr("class", "sapUiInoEvaluationMatrixInnerCircle").attr("name", "innerCircle").attr("title", function(d) {
            return d.r1Value;
        });
        c.select("circle").each(function(d) {
            // Bring first circle (r2Value) to front when having lower value
            if (d.r2Value < d.r1Value) {
                var circleGroup = this.parentNode;
                circleGroup.appendChild(circleGroup.removeChild(this));
            }
        });
        if (clickable) {
            c.on("click", function(d) {
                that.setSelectedItemName(getNameForCircleGroup(this), true);
                that.fireItemSelected({
                    itemName: getNameForCircleGroup(this)
                });
            });
        }
        c.append("svg:text").attr("transform", function(d) {
            var rMax = d.r1Value > d.r2Value ? d.r1Value : d.r2Value;
            return "translate(" + (rScale(rMax) + 4) + ", 4)";
        }).attr("class", "sapUiInoEvaluationMatrixItemName").
        // style("text-anchor", "begin"). //doesn't work in IE9!
        text(function(d) {
            return d.name;
        });
    }

    function getNameForCircleGroup(circleGroup) {
        var parts = circleGroup.attributes.name.value.split("_");
        if (parts && parts.length > 1) {
            return parts[1];
        }
        return circleGroup.attributes.name.value;
    }

    function highlightCircle(that, circleGroup, mode) {
        // highlight the clicked circle
        var innerCircle = jQuery(circleGroup).find("> circle[name*='innerCircle']")[0];
        addClass(innerCircle, "sapUiInoEvaluationMatrixInnerCircleHighlight");
        removeClass(innerCircle, "sapUiInoEvaluationMatrixInnerCircle");

        var outerCircle = jQuery(circleGroup).find("> circle[name*='outerCircle']")[0];
        addClass(outerCircle, "sapUiInoEvaluationMatrixOuterCircleHighlight");
        removeClass(outerCircle, "sapUiInoEvaluationMatrixOuterCircle");

        // un-highlight the other circles
        jQuery(circleGroup.parentNode.parentNode.parentNode).find("g[name*='circleGroup']").each(function(idx, el) {
            if (el !== circleGroup) {
                var innerCircle = jQuery(el).find("> circle[name*='innerCircle']")[0];
                addClass(innerCircle, "sapUiInoEvaluationMatrixInnerCircle");
                removeClass(innerCircle, "sapUiInoEvaluationMatrixInnerCircleHighlight");

                var outerCircle = jQuery(el).find("> circle[name*='outerCircle']")[0];
                addClass(outerCircle, "sapUiInoEvaluationMatrixOuterCircle");
                removeClass(outerCircle, "sapUiInoEvaluationMatrixOuterCircleHighlight");
            }
        });

        // show the coordinates for the clicked circle
        var coord = circleGroup.previousSibling;
        removeClass(coord, "sapUiInoEvaluationMatrixHidden");
        if (mode === "radio") {
            jQuery(circleGroup.parentNode.parentNode.parentNode).find("g[name*='coord']").each(function(idx, el) {
                if (el !== coord) {
                    addClass(el, "sapUiInoEvaluationMatrixHidden");
                }
            });
        }
        // Bring highlighted circle to the top
        var circleEnter = coord.parentNode;
        circleEnter.parentNode.appendChild(circleEnter.parentNode.removeChild(circleEnter));
    }

    function toggleBetweenClasses(element, class1, class2) {
        if (hasClass(element, class1)) {
            removeClass(element, class1);
            if (!hasClass(element, class2)) {
                addClass(element, class2);
            }
        } else if (hasClass(element, class2)) {
            removeClass(element, class2);
            if (!hasClass(element, class1)) {
                addClass(element, class1);
            }
        }
    }

    function toggleClass(element, cls) {
        var value = element.getAttribute("class");
        var p = new RegExp("\\b" + cls + "\\b");
        if (p.test(value)) {
            value = value.replace(p, "");
        } else {
            value = value.concat(" " + cls);
        }
        element.setAttribute("class", value);
        return element;
    }

    function addClass(element, cls) {
        var value = element.getAttribute("class");
        var p = new RegExp("\\b" + cls + "\\b");
        if (!p.test(value)) {
            value = value.concat(" " + cls);
            element.setAttribute("class", value);
        }
        return element;
    }

    function removeClass(element, cls) {
        var value = element.getAttribute("class");
        var p = new RegExp("\\b" + cls + "\\b");
        if (p.test(value)) {
            value = value.replace(p, "");
            element.setAttribute("class", value);
        }
        return element;
    }

    function hasClass(element, cls) {
        var value = element.getAttribute("class");
        var p = new RegExp("\\b" + cls + "\\b");
        return (p.test(value));
    }

    function elementsToPlainObjects(elements) {
        var data = [];
        for (var i = 0; i < elements.length; i++) {
            var oEntry = {};
            for (var j in elements[i].mProperties) {
                oEntry[j] = elements[i].mProperties[j];
            }
            data.push(oEntry);
        }
        return data;
    }

    function getFormattedValue(sDataType, fValue) {
        if (isNaN(fValue) || fValue === undefined || fValue === null) {
            return 0;
        }
        switch (sDataType) {
            case "INTEGER":
                fValue = Math.round(fValue);
                break;
            case "NUMERIC":
                fValue = (Math.round(fValue * 100) / 100).toLocaleString();
                break;
            default:
                break;
        }
        return fValue;
    }
});