/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Element"
], function(Element) {
    "use strict";

    /**
     * Element representing an item in an Evaluation Matrix
     *
     * <ul>
     * <li>Properties
     * <ul>
     * <li>name: identifying name of a matrix item</li>
     * <li>xValue: x value </li>
     * <li>yValue: y value </li>
     * <li>r1Value: value for radius 1</li>
     * <li>r2Value: value for radius 2</li>
     * </ul>
     * </li>
     * </ul>
     */
    return Element.extend("sap.ino.controls.EvaluationMatrixItem", {
        metadata : {
            properties : {
                name : {
                    type : "string",
                    defaultValue : "item"
                },
                dataType : "string",
                xValue : {
                    type : "float",
                    defaultValue : 0
                },
                xValueDataType : "string",
                yValue : {
                    type : "float",
                    defaultValue : 0
                },
                yValueDataType : "string",
                r1Value : {
                    type : "float",
                    defaultValue : 0
                },
                r1ValueDataType : "string",
                r2Value : {
                    type : "float",
                    defaultValue : 0
                },
                r2ValueDataType : "string"
            }
        }
    });
});