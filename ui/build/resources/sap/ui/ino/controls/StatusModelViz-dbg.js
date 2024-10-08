/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.StatusModelViz");

(function() {
	"use strict";

	jQuery.sap.require("sap.ui.thirdparty.d3");
	jQuery.sap.require("sap.ui.ino.controls.StatusModelVizData");

	sap.ui.core.Control.extend("sap.ui.ino.controls.StatusModelViz", {
		metadata: {
			properties: {
				"width": {
					type: "string",
					defaultValue: "100%"
				},
				"height": {
					type: "string",
					defaultValue: "100%"
				},
				"zoom": {
					type: "boolean",
					defaultValue: true
				},
				"rectWidth": {
					type: "int",
					defaultValue: 140
				},
				"rectHeight": {
					type: "int",
					defaultValue: 140
				},
				"rectTextSize": {
					type: "int",
					defaultValue: 16
				},
				"edgeTextSize": {
					type: "int",
					defaultValue: 14
				},
				"rectRadius": {
					type: "int",
					defaultValue: 10
				},
				// the number of connective nodes in every edge of the rectangle 
				"vEdgeCount": {
					type: "int",
					defaultValue: 7
				},
				"edgeRadius": {
					type: "int",
					defaultValue: 15
				},
				"verticalRectGap": {
					type: "float",
					defaultValue: 2.5
				},
				"edgeGap": {
					type: "int",
					defaultValue: 180
				},
				"rectGap": {
					type: "int",
					defaultValue: 260
				},
				"arrowSize": {
					type: "int",
					defaultValue: 8
				},
				"warning": {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {
				"data": {
					type: "sap.ui.ino.controls.StatusModelVizData",
					multiple: true,
					singularName: "data",
					bindable: true
				},
				"diagramLegend": {
					type: "sap.ui.core.Control",
					multiple: false
				},
				"diagramReason": {
					type: "sap.ui.core.Control",
					multiple: false
				},
				"diagramNoImage": {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {
				"click": {}
			}
		},

		renderer: function(oRm, oControl) {

			oControl.$().removeClass('sapUiNoDisplayedStatusModelImage');

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiInoStatusModelViz");
			if (!oControl.hasListeners("click")) {
				oRm.addClass("unclickable");
			}
			oRm.writeAttribute("tabindex", 0);
			oRm.writeClasses();
			oRm.write(">");
			if (oControl.getData().length !== 0) {
				oRm.renderControl(oControl.getDiagramLegend());
				oRm.renderControl(oControl.getDiagramReason());
				oRm.renderControl(oControl.getDiagramNoImage());
			}
			oRm.write("</div>");
		},

		init: function() {
			//help function for needed contains use
			Object.defineProperty(Array.prototype, "contains", {
				enumerable: false,
				writable: true,
				value: function(obj) {
					var i = this.length;
					while (i--) {
						if (this[i] === obj) {
							return true;
						}
					}
					return false;
				}
			})
		},

		onAfterRendering: function() {
			if (this.getData().length !== 0) {
				this.aNoPoints = [];
				this._start(this.getData());
				if (this.aNoPoints && this.aNoPoints.length > 0) {
					var diagramWarning = this.getWarning();
					var sPoints = diagramWarning + "<br />";
					this.aNoPoints.forEach(function(oPoint) {
						sPoints += oPoint.from + " -> " + oPoint.to + ";<br />";
					});
					this.$().append('<label class="sapUiLbl sapUiInoWarning" style="direction: inherit; width: 80%;">' + sPoints + '</label>');
				}
			}
		},

		onclick: function(oEvent) {
			this.fireClick(oEvent);
		},

		onsapenter: function(oEvent) {
			this.fireClick(oEvent);
		},

		_start: function(data) {
			var oElement = d3.select("#" + this.getId() /*+ " .sapUiInoStatusModelViz"*/ );
			var iDestinatedHeight = this.getHeight();
			var iDestinatedWidth = this.getWidth();

			//Set up svg with zoom
			if (this.getZoom()) {
				var zoomed = function() {
					svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
				}

				var dragstarted = function(d) {
					d3.event.sourceEvent.stopPropagation();
					d3.select(this).classed("dragging", true);
				}

				var dragged = function(d) {
					d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
				}

				var dragended = function(d) {
					d3.select(this).classed("dragging", false);
				}

				var zoom = d3.behavior.zoom()
					.scaleExtent([0.5, 2])
					.on("zoom", zoomed);

				var drag = d3.behavior.drag()
					.origin(function(d) {
						return d;
					})
					.on("dragstart", dragstarted)
					.on("drag", dragged)
					.on("dragend", dragended);

				this.svg = oElement.insert("svg", ".sapUiLbl").attr("width", iDestinatedWidth)
					.attr("height", iDestinatedHeight).append("g")
					.attr("transform", "translate( 0 , 0)")
					.call(zoom);
			} else {
				this.svg = oElement.insert("svg", ".sapUiLbl").attr("width", iDestinatedWidth)
					.attr("height", iDestinatedHeight);
				var g = this.svg.append("g").attr("class", "sapUiInoStatusContainer");
			}

			var svg = this.svg;

			this.iRectWidth = this.getRectWidth();
			this.iRectHeight = this.getRectHeight();
			this.iRectTextSize = this.getRectTextSize();
			this.iEdgeTextSize = this.getEdgeTextSize();
			this.iRectRadius = this.getRectRadius();
			this.iVEdgeCount = this.getVEdgeCount();
			this.iHEdgeCount = 7;
			this.iEdgeRadius = this.getEdgeRadius();
			this.iVerticalRectGap = this.getVerticalRectGap();
			this.iEdgeGap = this.getEdgeGap();
			this.iArrowSize = this.getArrowSize();
			this.iRectGap = this.getRectGap();

			this.aLineList = [];
			this.aStatusList = [];
			this.cust = false;
			/* if there is no sap.ino.config ,iPackage return -1 ,then cust = true  */
			var iPackage = data[0].getProperty("code").search("sap.ino.config");
			this.cust = (iPackage < 0);

			//handele the data, and push into the array aStatusList
			for (var i = 0; i < data.length; i++) {
				var oStatus = jQuery.grep(this.aStatusList, function(oStatus, iIndex) {
					return (oStatus.id === data[i].getProperty("currentStatusCode"));
				});
				if (oStatus.length > 0) {
					oStatus[0].nextId.push(data[i].getProperty("nextStatusCode"));
					oStatus[0].transitions.push({
						transitionText: data[i].getStatusActionText(),
						nextStatus: data[i].getProperty("nextStatusCode"),
						type: data[i].getProperty("nextStatusType"),
						decisionRelevant: data[i].getProperty("decisionRelevant"),
						decisionReasonListCode: data[i].getProperty("decisionReasonListCode")
					});
				} else {
					var oStatus = {
						id: data[i].getProperty("currentStatusCode"),
						type: data[i].getProperty("currentStatusType"),
						created: false,
						nextId: [data[i].getProperty("nextStatusCode")],
						transitions: [{
							transitionText: data[i].getStatusActionText(),
							nextStatus: data[i].getProperty("nextStatusCode"),
							type: data[i].getProperty("nextStatusType"),
							decisionRelevant: data[i].getProperty("decisionRelevant"),
							decisionReasonListCode: data[i].getProperty("decisionReasonListCode")
                        }],
						text: data[i].getCurrentStatusText()
					}
					if (oStatus.id === "sap.ino.config.NEW_IN_PHASE" || oStatus.type === "NEW") {
						oStatus.isStart = true;
					}
					if (oStatus.id === "sap.ino.config.DISCONTINUED" || oStatus.type === "DISCONTINUED" || oStatus.type === "COMPLETED") {
						oStatus.isLast = true;
					}
					this.aStatusList.push(oStatus);
				}
			}

			// push nextstatuscode into StatusList
			for (i = 0; i < data.length; i++) {
				oStatus = jQuery.grep(this.aStatusList, function(oStatus, iIndex) {
					return (oStatus.id === data[i].getProperty("nextStatusCode"));
				});
				if (oStatus.length === 0) {
					var oStatusNext = {
						id: data[i].getProperty("nextStatusCode"),
						created: false,
						nextId: [],
						transitions: [],
						text: data[i].getNextStatusText()
					};

					if (oStatusNext.id === "sap.ino.config.DISCONTINUED") {
						oStatusNext.isLast = true;
					}
					this.aStatusList.push(oStatusNext);
				}
			}

			this.statusAsoList = new Array();

			for (var i = 0; i < this.aStatusList.length; i++) {
				this.statusAsoList[this.aStatusList[i].id] = this.aStatusList[i];
			}

			//sort list, so that the first item is the starting item and the next items are next status of the start. Each following item is dependend
			//of the next statuses of the particular status.
			this._sortList();

			//the main path is computed as the following:
			//It starts at the first element, this element is immediately marked as main path
			//The next elements of the first element are examined, if one of the next is not already seen it is part of the main path
			//If one of an elements nexts statuses is not already contained in one of the previous next statuses, it is added to the main path
			this._computeMainPath();

			//positions the rects in a good way. So that the statuses of the main path are straight forward.
			//The parameters give the x and y coordinate of the start status. The other status are oriented at the start Status
			this._positionRects();

			//Compute the distances between two statuses that need to be connected and save the distance together with the origin and destination status
			var connectionArray = new Array();
			for (var i = 0; i < this.aStatusList.length; i++) {
				var oStatus = this.aStatusList[i];
				for (var j = 0; j < oStatus.transitions.length; j++) {
					var nextStatus = this.statusAsoList[oStatus.transitions[j].nextStatus];
					var connection = {
						statusFrom: oStatus,
						statusTo: nextStatus,
						transition: oStatus.transitions[j],
						distance: this._computePointDistance(oStatus, nextStatus)
					}
					connectionArray.push(connection);
				}
			}
			//Sort the connections, the smallest connections first, the larger last.
			connectionArray.sort(function(a, b) {
				return a.distance - b.distance;
			});

			//Connect the tranisitions with the shortest first and the longest last
			//except for distance = 0
			for (var i = 0; i < connectionArray.length; i++) {
				// if (connectionArray[i].distance != 0) {
				this._connect(connectionArray[i].statusFrom, connectionArray[i].statusTo, connectionArray[i].transition);
				// }
			}

			// //Connect the transitions with distance = 0
			// for (var i = 0; i < connectionArray.length; i++) {
			//     if (connectionArray[i].distance == 0
			//         //&& connectionArray[i].transition.transitionText.search("End") < 0
			//     ) {
			//         this._connect(connectionArray[i].statusFrom, connectionArray[i].statusTo, connectionArray[i].transition);
			//     }
			// }

			var bBox = jQuery(svg[0][0])[0].getBBox();
			var gWidth = bBox.width;
			var xOffset = bBox.x;
			var yOffset = bBox.y;
			var gHeight = bBox.height;

			if (this.getZoom()) {
				var shape = document.getElementsByTagName("svg")[0];
				shape.setAttribute("viewBox", "" + xOffset + " " + yOffset + " " + gWidth + " " + gHeight + "");
			} else {
				svg.attr("viewBox", "" + xOffset + " " + yOffset + " " + gWidth + " " + gHeight + "");
			}
		},

		_connect: function(oStatusFrom, oStatusTo, transition) {
			//TODO: Find more alternatives, if you want to connect to left side, but it is already taken. Go to the top sides or bottom sides
			var sPoints = null;
			var bConnected = false;

			var relative_posi = this._judgeStatusPosition(oStatusFrom, oStatusTo);
			switch (relative_posi) {
				case "circle":
					sPoints = this._connectCircleBtoL(oStatusFrom, oStatusTo, bConnected);
					break;
				case "RtoL":
					sPoints = this._connectRtoL(oStatusFrom, oStatusTo, bConnected);
					break;
				case "LtoR":
					sPoints = this._connectLtoR(oStatusFrom, oStatusTo, bConnected);
					break;
				case "BtoT":
					sPoints = this._connectBtoT(oStatusFrom, oStatusTo, bConnected);
					break;
				case "BtoT_RtoL":
					sPoints = this._connectBtoT_RtoL(oStatusFrom, oStatusTo, bConnected);
					break;
				case "BtoT_LtoR":
					sPoints = this._connectBtoT_LtoR(oStatusFrom, oStatusTo, bConnected);
					break;
				case "TtoB":
					sPoints = this._connectTtoB(oStatusFrom, oStatusTo, bConnected);
					break;
				case "TtoB_RtoL":
					sPoints = this._connectTtoB_RtoL(oStatusFrom, oStatusTo, bConnected);
					break;
				case "TtoB_LtoR":
					sPoints = this._connectTtoB_LtoR(oStatusFrom, oStatusTo, bConnected);
					break;
				default:
					sPoints = null;
					//console.log("can't find a proper path in the _connect function");
			}

			//Draws the actual line
			this._drawLine(sPoints);
			if (!sPoints) {
				console.log(relative_posi);
				console.log("oStatusFrom:" + JSON.stringify(oStatusFrom.id));
				console.log("oStatusTo:" + JSON.stringify(oStatusTo.id));
				this.aNoPoints.push({
					"from": oStatusFrom.id,
					"to": oStatusTo.id
				});
			}

			//Sets the text of the edge
			this._setEdgeText(sPoints, transition, oStatusFrom, oStatusTo);
		},

		//  judge the relative position of Current status and Next status, then return corresponding value
		// *Note* : the relative_posi indicates the path from Current status to Next status based on relative position. e.g.1: 'RtoL' means Current status placed at right side of Next Status.
		// if you want to connect them, it may start from Right to Left, so it marked 'RtoL'. 
		// e.g.2: 'BtoT_RtoL' means Current status placed at both Bottom side && Right side of Next Status, so the path may be from Bottom to Top and from Right to Left, which marked 'BtoT_RtoL'
		// *End-Note*
		_judgeStatusPosition: function(oStatusFrom, oStatusTo) {
			var relative_posi;
			var aStatusList = this.aStatusList;
			if (oStatusFrom.y === oStatusTo.y) {
				if (oStatusFrom.x === oStatusTo.x) {
					relative_posi = "circle";
				} else if (oStatusFrom.x > oStatusTo.x) {
					relative_posi = "RtoL";
				} else {
					relative_posi = "LtoR";
				}

			} else if (oStatusFrom.y > oStatusTo.y) {
				if (oStatusFrom.x === oStatusTo.x) {
					relative_posi = "BtoT";
				} else if (oStatusFrom.x > oStatusTo.x) {
					relative_posi = "BtoT_RtoL";
				} else {
					relative_posi = "BtoT_LtoR";
				}

			} else {
				//oStatusFrom.y < oStatusTo.y
				if (oStatusFrom.x === oStatusTo.x) {
					relative_posi = "TtoB";
				} else if (oStatusFrom.x > oStatusTo.x) {
					relative_posi = "TtoB_RtoL";
				} else {
					relative_posi = "TtoB_LtoR";
				}
			}
			return relative_posi;
		},

		_connectCircleBtoL: function(oStatusFrom, oStatusTo, bConnected) {
			var sPoints = null;
			for (var i = 0; i < this.iVEdgeCount && !bConnected; i++) {
				//Try to connect to Bottom
				for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
					if (oStatusFrom["connectB" + i]) {
						if (j === 0) {
							var k = 2;
						} else if (j === 1) {
							var k = 0;
						} else {
							var k = 1;
						}
						if (oStatusFrom["connectL" + k]) {
							sPoints = this._getPointString(oStatusFrom.lX, oStatusFrom["h" + k + "Y"], oStatusTo["v" + i + "X"], oStatusTo.botY, oStatusFrom,
								oStatusTo);
							oStatusTo["connectL" + k] = false;
							oStatusFrom["connectB" + i] = false;
							bConnected = true;
							break;
						}
						//Else connect to Top
					} else if (oStatusFrom["connectT" + i]) {
						if (j === 0) {
							var k = 1;
						} else if (j === 1) {
							var k = 0;
						} else {
							var k = 2;
						}
						if (oStatusFrom["connectL" + k]) {
							sPoints = this._getPointString(oStatusFrom.lX, oStatusFrom["h" + k + "Y"], oStatusTo["v" + i + "X"], oStatusTo.topY, oStatusFrom,
								oStatusTo);
							oStatusTo["connectL" + k] = false;
							oStatusFrom["connectT" + i] = false;
							bConnected = true;
							break;
						}
					}
				}
			}
			return sPoints;
		},

		_connectRtoL: function(oStatusFrom, oStatusTo, bConnected) {
			var sPoints = null;
			for (var i = 0; i < this.iVEdgeCount && !bConnected; i++) {
				if (oStatusFrom["connectB" + i]) {
					for (var j = this.iVEdgeCount - 1; j >= 0 && !bConnected; j--) {
						if (oStatusTo["connectB" + j]) {
							sPoints = this._getPointString(oStatusFrom["v" + i + "X"], oStatusFrom.botY, oStatusTo["v" + j + "X"], oStatusTo.botY,
								oStatusFrom, oStatusTo);
							if (sPoints === null) {
								break;
							}
							oStatusTo["connectB" + j] = false;
							oStatusFrom["connectB" + i] = false;
							bConnected = true;
							break;
						}
					}
				}
			}
			if (!bConnected) {
				//Then try the top nav points
				for (var i = 0; i < this.iVEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectT" + i]) {
						for (var j = this.iVEdgeCount - 1; j >= 0 && !bConnected; j--) {
							if (oStatusTo["connectT" + j]) {
								sPoints = this._getPointString(oStatusFrom["v" + i + "X"], oStatusFrom.topY, oStatusTo["v" + j + "X"], oStatusTo.topY,
									oStatusFrom, oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectT" + j] = false;
								oStatusFrom["connectT" + i] = false;
								bConnected = true;
								break;
							}
						}
					}
				}
			}
			return sPoints;
		},

		_connectLtoR: function(oStatusFrom, oStatusTo, bConnected) {
			var sPoints = null;
			//Always connect from left to right
			for (var i = 0; i < this.iHEdgeCount && !bConnected; i++) {
				if (oStatusFrom["connectR" + i]) {
					for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
						if (oStatusTo["connectL" + j]) {
							sPoints = this._getPointString(oStatusFrom.rX, oStatusFrom["h" + i + "Y"], oStatusTo.lX, oStatusTo["h" + j + "Y"], oStatusFrom,
								oStatusTo);
							if (sPoints === null) {
								break;
							}
							oStatusFrom["connectR" + i] = false;
							oStatusTo["connectL" + j] = false;
							bConnected = true;
							break;
						}

					}
				}
			}
			return sPoints;
		},

		_connectBtoT: function(oStatusFrom, oStatusTo, bConnected) {
			var sPoints = null,
				aStatusList = this.aStatusList;
			for (var i = 0; i < this.iVEdgeCount && !bConnected; i++) {
				if (oStatusFrom["connectT" + i] && oStatusTo["connectB" + i] && !bConnected) {
					sPoints = this._getPointString(oStatusFrom["v" + i + "X"], oStatusFrom.topY, oStatusTo["v" + i + "X"], oStatusTo.botY, oStatusFrom,
						oStatusTo);
					if (sPoints === null) {
						break;
					}
					oStatusTo["connectB" + i] = false;
					oStatusFrom["connectT" + i] = false;
					bConnected = true;
					break;
				}
			}
			// in case the way from bottom to top is blocked, then try left to left 
			if (sPoints === null) {
				for (var i = 0; i < this.iHEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectL" + i]) {
						for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
							if (oStatusTo["connectL" + j]) {
								sPoints = this._getPointString(oStatusFrom.lX, oStatusFrom["h" + i + "Y"], oStatusTo.lX, oStatusTo["h" + j + "Y"], oStatusFrom,
									oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectL" + j] = false;
								oStatusFrom["connectL" + i] = false;
								bConnected = true;
								for (var k = 0; k < aStatusList.length; k++) {
									// invalidate the path which has the same y
									if (aStatusList[k].lX === oStatusFrom.lX && aStatusList[k]["h" + j + "Y"] === oStatusTo["h" + j + "Y"]) {
										aStatusList[k]["connectL" + j] = false;
									}
								}
								break;
							}
						}
					}
				}
			}
			// in case the way from bottom to top is blocked, then try right to right 
			if (sPoints === null) {
				for (var i = 0; i < this.iHEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectR" + i]) {
						for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
							if (oStatusTo["connectR" + j]) {
								sPoints = this._getPointString(oStatusFrom.rX, oStatusFrom["h" + i + "Y"], oStatusTo.rX, oStatusTo["h" + j + "Y"], oStatusFrom,
									oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectR" + j] = false;
								oStatusFrom["connectR" + i] = false;
								bConnected = true;
								for (var k = 0; k < aStatusList.length; k++) {
									// invalidate the path which has the same y
									if (aStatusList[k].rX === oStatusFrom.rX && aStatusList[k]["h" + j + "Y"] === oStatusTo["h" + j + "Y"]) {
										aStatusList[k]["connectR" + j] = false;
									}
								}
								break;
							}
						}
					}
				}
			}
			//--- end of if (point==null)		
			return sPoints;
		},

		_connectBtoT_LtoR: function(oStatusFrom, oStatusTo, bConnected) {
			var sPoints = null;
			var aStatusList = this.aStatusList;
			//Try to connect from Top to the left of the status to
			for (var i1 = this.iVEdgeCount - 1; i1 >= 0 && !bConnected; i1--) {
				if (oStatusFrom["connectT" + i1] && !bConnected) {
					for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
						if (oStatusTo["connectL" + j] && !bConnected) {
							sPoints = this._getPointString(oStatusFrom["v" + i1 + "X"], oStatusFrom.topY, oStatusTo["lX"], oStatusTo["h" + j + "Y"],
								oStatusFrom, oStatusTo);
							if (sPoints === null) {
								break;
							}
							oStatusTo["connectL" + j] = false;
							oStatusFrom["connectT" + i1] = false;
							bConnected = true;
							break;
						} else { //bottom to bottom
							for (var i2 = 0; i2 < this.iVEdgeCount && !bConnected; i2++) {
								if (oStatusFrom["connectB" + i2]) {
									for (var j = this.iVEdgeCount - 1; j >= 0 && !bConnected; j--) {
										if (oStatusTo["connectB" + j]) {
											sPoints = this._getPointString(oStatusFrom["v" + i2 + "X"], oStatusFrom.botY, oStatusTo["v" + j + "X"], oStatusTo.botY,
												oStatusFrom, oStatusTo);
											if (sPoints === null) {
												break;
											}
											oStatusTo["connectB" + j] = false;
											oStatusFrom["connectB" + i2] = false;
											bConnected = true;
											break;
										}
									}
								}
							}

						}
					}
				}
			}

			if (sPoints === null) {
				for (var i = 0; i < this.iHEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectR" + i]) {
						for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
							if (oStatusTo["connectL" + j]) {
								sPoints = this._getPointString(oStatusFrom.rX, oStatusFrom["h" + i + "Y"], oStatusTo.lX, oStatusTo["h" + j + "Y"], oStatusFrom,
									oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectL" + j] = false;
								oStatusFrom["connectR" + i] = false;
								bConnected = true;
								// invalidate the path which has the same y
								for (var k = 0; k < aStatusList.length; k++) {
									if (aStatusList[k].rX === oStatusFrom.rX && aStatusList[k]["h" + j + "Y"] === oStatusTo["h" + j + "Y"]) {
										aStatusList[k]["connectR" + j] = false;
									}
								}
								break;
							}
						}
					}
				}
			} //--- end of if (point==null)				
			return sPoints;
		},

		_connectBtoT_RtoL: function(oStatusFrom, oStatusTo, bConnected) {
			var sPoints = null;
			var aStatusList = this.aStatusList;
			//Navigate up left
			for (var i = 0; i < this.iVEdgeCount && !bConnected; i++) {
				if (oStatusFrom["connectB" + i]) {
					for (var j = this.iVEdgeCount - 1; j >= 0 && !bConnected; j--) {
						if (oStatusTo["connectB" + j]) {
							sPoints = this._getPointString(oStatusFrom["v" + i + "X"], oStatusFrom.botY, oStatusTo["v" + j + "X"], oStatusTo.botY,
								oStatusFrom, oStatusTo);
							if (sPoints === null) {
								break;
							}
							oStatusTo["connectB" + j] = false;
							oStatusFrom["connectB" + i] = false;
							bConnected = true;
							break;
						}
					}
				}
			}
			// in case the way from bottom to bottom is blocked, then try left to right 
			if (sPoints === null) {
				for (var i = 0; i < this.iHEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectL" + i]) {
						for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
							if (oStatusTo["connectR" + j]) {
								sPoints = this._getPointString(oStatusFrom.lX, oStatusFrom["h" + i + "Y"], oStatusTo.rX, oStatusTo["h" + j + "Y"], oStatusFrom,
									oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectR" + j] = false;
								oStatusFrom["connectL" + i] = false;
								bConnected = true;
								for (var k = 0; k < aStatusList.length; k++) {
									// invalidate the path which has the same y
									if (aStatusList[k].lX === oStatusFrom.lX && aStatusList[k]["h" + j + "Y"] === oStatusTo["h" + j + "Y"]) {
										aStatusList[k]["connectL" + j] = false;
									}
								}
								break;
							}
						}
					}
				}
			} //--- end of if (point==null)	
			return sPoints;
		},

		_connectTtoB: function(oStatusFrom, oStatusTo, bConnected) {
			var sPoints = null;
			var aStatusList = this.aStatusList;
			//from bot to top
			for (var i = this.iVEdgeCount - 1; i >= 0 && !bConnected; i--) {
				if (oStatusFrom["connectB" + i] && oStatusTo["connectT" + i] && !bConnected) {
					sPoints = this._getPointString(oStatusFrom["v" + i + "X"], oStatusFrom.botY, oStatusTo["v" + i + "X"], oStatusTo.topY, oStatusFrom,
						oStatusTo);
					if (sPoints === null) {
						break;
					}
					oStatusTo["connectT" + i] = false;
					oStatusFrom["connectB" + i] = false;
					bConnected = true;
					break;
				}
			}
			// in case the way from bottom to top is blocked, then try right to right 
			if (sPoints === null) {
				for (var i = 0; i < this.iHEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectR" + i]) {
						for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
							if (oStatusTo["connectR" + j]) {
								sPoints = this._getPointString(oStatusFrom.rX, oStatusFrom["h" + i + "Y"], oStatusTo.rX, oStatusTo["h" + j + "Y"], oStatusFrom,
									oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectR" + j] = false;
								oStatusFrom["connectR" + i] = false;
								bConnected = true;
								for (var k = 0; k < aStatusList.length; k++) {
									// invalidate the path which has the same y
									if (aStatusList[k].rX === oStatusFrom.rX && aStatusList[k]["h" + j + "Y"] === oStatusTo["h" + j + "Y"]) {
										aStatusList[k]["connectR" + j] = false;
									}
								}
								break;
							}
						}
					}
				}
			}
			// in case the way from bottom to top is blocked, then try left to left 
			if (sPoints === null) {
				for (var i = 0; i < this.iHEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectL" + i]) {
						for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
							if (oStatusTo["connectL" + j]) {
								sPoints = this._getPointString(oStatusFrom.lX, oStatusFrom["h" + i + "Y"], oStatusTo.lX, oStatusTo["h" + j + "Y"], oStatusFrom,
									oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectL" + j] = false;
								oStatusFrom["connectL" + i] = false;
								bConnected = true;
								for (var k = 0; k < aStatusList.length; k++) {
									// invalidate the path which has the same y
									if (aStatusList[k].lX === oStatusFrom.lX && aStatusList[k]["h" + j + "Y"] === oStatusTo["h" + j + "Y"]) {
										aStatusList[k]["connectL" + j] = false;
									}
								}
								break;
							}
						}
					}
				}
			} //--- end of if (point==null)		
			return sPoints;
		},

		_connectTtoB_LtoR: function(oStatusFrom, oStatusTo, bConnected) {
			var sPoints = null;
			var aStatusList = this.aStatusList;
			//bottom right navigation
			for (var i = this.iVEdgeCount - 1; i >= 0 && !bConnected; i--) {
				//try bottom to left side
				if (oStatusFrom["connectB" + i]) {
					for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
						if (oStatusTo["connectL" + j]) {
							sPoints = this._getPointString(oStatusFrom["v" + i + "X"], oStatusFrom.botY, oStatusTo.lX, oStatusTo["h" + j + "Y"], oStatusFrom,
								oStatusTo);
							if (sPoints === null) {
								break;
							}
							oStatusTo["connectL" + j] = false;
							oStatusFrom["connectB" + i] = false;
							bConnected = true;
							break;
							//else bottom to top
						}
						// else {
						// 	for (var j = 0; j < this.iVEdgeCount && !bConnected; j++) {
						// 		if (oStatusTo["connectT" + j]) {
						// 			sPoints = this._getPointString(oStatusFrom["v" + i + "X"], oStatusFrom.botY, oStatusTo["v" + j + "X"], oStatusTo.topY,
						// 				oStatusFrom, oStatusTo);
						// 			oStatusTo["connectT" + j] = false;
						// 			oStatusFrom["connectB" + i] = false;
						// 			bConnected = true;
						// 			break;
						// 		}
						// 	}
						// }
					}
				}
			}
			//navigate from right to left
			if (sPoints === null) {
				for (var i = 0; i < this.iHEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectR" + i]) {
						for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
							if (oStatusTo["connectL" + j]) {
								sPoints = this._getPointString(oStatusFrom.rX, oStatusFrom["h" + i + "Y"], oStatusTo.lX, oStatusTo["h" + j + "Y"], oStatusFrom,
									oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectL" + j] = false;
								oStatusFrom["connectR" + i] = false;
								bConnected = true;
								// invalidate the path which has the same y
								for (var k = 0; k < aStatusList.length; k++) {
									if (aStatusList[k].rX === oStatusFrom.rX && aStatusList[k]["h" + j + "Y"] === oStatusTo["h" + j + "Y"]) {
										aStatusList[k]["connectR" + j] = false;
									}
								}
								break;
							}
						}
					}
				}
			}
			//navigate from bottom to top
			if (sPoints === null) {
				for (var i = 0; i < this.iVEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectB" + i]) {
						for (var j = 0; j < this.iVEdgeCount && !bConnected; j++) {
							if (oStatusTo["connectT" + j]) {
								sPoints = this._getPointString(oStatusFrom["v" + i + "X"], oStatusFrom.botY, oStatusTo["v" + j + "X"], oStatusTo.topY,
									oStatusFrom,
									oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectT" + i] = false;
								oStatusFrom["connectB" + j] = false;
								bConnected = true;
								break;
							}
						}
					}
				}
			} //--- end of if (point==null)	
			return sPoints;
		},

		_connectTtoB_RtoL: function(oStatusFrom, oStatusTo, bConnected) {
			var sPoints = null;
			var aStatusList = this.aStatusList;
			for (var i = 0; i < this.iVEdgeCount && !bConnected; i++) {
				if (oStatusFrom["connectT" + i]) {
					for (var j = this.iVEdgeCount - 1; j >= 0 && !bConnected; j--) {
						if (oStatusTo["connectT" + j]) {
							sPoints = this._getPointString(oStatusFrom["v" + i + "X"], oStatusFrom.topY, oStatusTo["v" + j + "X"], oStatusTo.topY,
								oStatusFrom, oStatusTo);
							if (sPoints === null) {
								break;
							}
							oStatusTo["connectT" + j] = false;
							oStatusFrom["connectT" + i] = false;
							bConnected = true;
							break;
						}
					}
				}
			}
			// in case the way from top to top is blocked, then try left to right 
			if (sPoints === null) {
				for (var i = 0; i < this.iHEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectL" + i]) {
						for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
							if (oStatusTo["connectR" + j]) {
								sPoints = this._getPointString(oStatusFrom.lX, oStatusFrom["h" + i + "Y"], oStatusTo.rX, oStatusTo["h" + j + "Y"], oStatusFrom,
									oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectR" + j] = false;
								oStatusFrom["connectL" + i] = false;
								bConnected = true;
								for (var k = 0; k < aStatusList.length; k++) {
									// invalidate the path which has the same y
									if (aStatusList[k].lX === oStatusFrom.lX && aStatusList[k]["h" + j + "Y"] === oStatusTo["h" + j + "Y"]) {
										aStatusList[k]["connectL" + j] = false;
									}
								}
								break;
							}
						}
					}
				}
			}
			// in case the way from top to top is blocked, then try right to right 
			if (sPoints === null) {
				for (var i = 0; i < this.iHEdgeCount && !bConnected; i++) {
					if (oStatusFrom["connectR" + i]) {
						for (var j = 0; j < this.iHEdgeCount && !bConnected; j++) {
							if (oStatusTo["connectR" + j]) {
								sPoints = this._getPointString(oStatusFrom.rX, oStatusFrom["h" + i + "Y"], oStatusTo.rX, oStatusTo["h" + j + "Y"], oStatusFrom,
									oStatusTo);
								if (sPoints === null) {
									break;
								}
								oStatusTo["connectR" + j] = false;
								oStatusFrom["connectR" + i] = false;
								bConnected = true;
								for (var k = 0; k < aStatusList.length; k++) {
									// invalidate the path which has the same y
									if (aStatusList[k].rX === oStatusFrom.lX && aStatusList[k]["h" + j + "Y"] === oStatusTo["h" + j + "Y"]) {
										aStatusList[k]["connectR" + j] = false;
									}
								}
								break;
							}
						}
					}
				}
			} //--- end of if (point==null)	
			return sPoints;
		},

		//This method gets the start and end point and returns the string containing all the points
		_getPointString: function(fromX, fromY, toX, toY, oStatusFrom, oStatusTo) {
			var checked = false;
			var sPoints = fromX + "," + fromY + " " + toX + "," + toY;

			//To avoid infinite loops in case it is no way found for the edge
			var infinteLoopStopper = 0;

			if (fromX !== toX && fromY !== toY) {
				//this is only called when the destinated rect is not on same x and not on same y level
				//so if it is a curve (a edge with 3 points)
				sPoints = this._getAlternativeWay(sPoints, oStatusFrom, oStatusTo, fromX, fromY, toX, toY, true);
			}

			while (!checked) {
				//this methods checks if the way of the edge is free
				if (!this._isBlocked(sPoints, oStatusFrom, oStatusTo)) {
					checked = true;
				} else {
					//gets a new alternative point string, so a new way for the edge
					sPoints = this._getAlternativeWay(sPoints, oStatusFrom, oStatusTo, fromX, fromY, toX, toY);

					if (infinteLoopStopper === 24) {
						// console.log("A infinite loop was canceled, something is buggy. In Method getPointString the method isBlocked did not find a way");
						checked = true;
						sPoints = null;
						return sPoints;
					}
					infinteLoopStopper++;
				}
			}
			return sPoints;
		},

		_getAlternativeWay: function(sPoints, oStatusFrom, oStatusTo, fromX, fromY, toX, toY, bCurve) {
			//TODO: Maybe we can improve here, and make it more generic, and catch all possible cases
			//Get x and y array from the point string
			var coords = this._getCoordArrayFromPointString(sPoints);
			var xArray = coords.x;
			var yArray = coords.y;

			//Space between the edges
			var iEdgeGap = this.iEdgeGap / 6;
			var iRectGap = this.iRectGap;
			var ibEdgeGap = Math.round(iRectGap / 13);

			if (bCurve) {
				//Add a third point for the curce edges
				sPoints = xArray[0] + "," + yArray[0] + " " + xArray[0] + "," + yArray[1] + " " + xArray[1] + "," + yArray[1];
			} else if (fromY === oStatusFrom.botY && toY === oStatusTo.botY) {
				//same y axis, starting from bottom side of rect
				if (xArray.length === 2) {
					sPoints = xArray[0] + "," + yArray[0] + " " + xArray[0] + "," + yArray[0] + " " + xArray[1] + "," + yArray[1] + " " + xArray[1] +
						"," + yArray[1];
				} else if (xArray.length === 3) {
					sPoints = xArray[0] + "," + yArray[0] + " " + xArray[0] + "," + parseInt(yArray[2] + iEdgeGap) + " " + xArray[2] + "," + parseInt(
						yArray[2] + iEdgeGap) + " " + xArray[2] + "," + yArray[2];
				} else {
					sPoints = xArray[0] + "," + yArray[0] + " " + xArray[1] + "," + parseInt(yArray[1] + iEdgeGap) + " " + xArray[2] + "," + parseInt(
						yArray[2] + iEdgeGap) + " " + xArray[3] + "," + yArray[3];
				}
			} else if (fromX === oStatusFrom.rX && toX === oStatusTo.rX) {
				if (fromX != toX) {
					//same x axis, starting from right side of rect	to right side.							
					if (xArray.length === 2) {
						sPoints = xArray[0] + "," + yArray[0] + " " + xArray[0] + "," + yArray[0] + " " + xArray[1] + "," + yArray[1] + " " + xArray[1] +
							"," + yArray[1];
					} else if (xArray.length === 3) {
						sPoints = xArray[0] + "," + yArray[0] + " " + parseInt(xArray[1] + iEdgeGap) + "," + yArray[0] + " " + parseInt(xArray[1] +
							iEdgeGap) +
							"," + yArray[2] + " " + xArray[2] + "," + yArray[2];
					} else {
						sPoints = xArray[0] + "," + yArray[0] + " " + parseInt(xArray[1] + iEdgeGap) + "," + yArray[0] + " " + parseInt(xArray[1] +
							iEdgeGap) +
							"," + yArray[3] + " " + xArray[3] + "," + yArray[3];
					}
				} else {
					//same x axis, starting from right side of rect	to right side.							
					if (xArray.length === 2) {
						sPoints = xArray[0] + "," + yArray[0] + " " + xArray[0] + "," + yArray[0] + " " + xArray[1] + "," + yArray[1] + " " + xArray[1] +
							"," + yArray[1];
					} else if (xArray.length === 3) {
						sPoints = xArray[0] + "," + yArray[0] + " " + parseInt(xArray[2] + iEdgeGap) + "," + yArray[0] + " " + parseInt(xArray[2] +
							iEdgeGap) +
							"," + yArray[2] + " " + xArray[2] + "," + yArray[2];
					} else {
						sPoints = xArray[0] + "," + yArray[0] + " " + parseInt(xArray[2] + iEdgeGap) + "," + yArray[0] + " " + parseInt(xArray[2] +
							iEdgeGap) +
							"," + yArray[3] + " " + xArray[3] + "," + yArray[3];
					}
				}
			} else if (fromX === oStatusFrom.lX && toX === oStatusTo.lX) {
				//same x axis, starting from left side of rect	to left side.							
				if (xArray.length === 2) {
					sPoints = xArray[0] + "," + yArray[0] + " " + xArray[0] + "," + yArray[0] + " " + xArray[1] + "," + yArray[1] + " " + xArray[1] +
						"," + yArray[1];
				} else if (xArray.length === 3) {
					sPoints = xArray[0] + "," + yArray[0] + " " + parseInt(xArray[2] - iEdgeGap) + "," + yArray[0] + " " + parseInt(xArray[2] - iEdgeGap) +
						"," + yArray[2] + " " + xArray[2] + "," + yArray[2];
				} else {
					sPoints = xArray[0] + "," + yArray[0] + " " + parseInt(xArray[2] - iEdgeGap) + "," + yArray[0] + " " + parseInt(xArray[2] - iEdgeGap) +
						"," + yArray[3] + " " + xArray[3] + "," + yArray[3];
				}
			} else if (fromY === oStatusFrom.topY && toY === oStatusTo.topY) {
				//same y axis, starting from top side of rect								
				if (xArray.length === 2) {
					sPoints = xArray[0] + "," + yArray[0] + " " + xArray[0] + "," + yArray[1] + " " + xArray[1] + "," + yArray[1];
				} else if (xArray.length === 3) {
					sPoints = xArray[0] + "," + yArray[0] + " " + xArray[0] + "," + parseInt(yArray[2] - iEdgeGap) + " " + xArray[2] + "," + parseInt(
						yArray[2] - iEdgeGap) + " " + xArray[2] + "," + yArray[2];
				} else {
					sPoints = xArray[0] + "," + yArray[0] + " " + xArray[1] + "," + parseInt(yArray[1] - iEdgeGap) + " " + xArray[2] + "," + parseInt(
						yArray[2] - iEdgeGap) + " " + xArray[3] + "," + yArray[3];
				}

			} else if (fromX === oStatusFrom.rX && toX === oStatusTo.lX) {
				// starting from left to right with two additional points in the edge
				// var iGapEdgeCount = this.iGapEdgeCount;
				if (xArray.length !== 4) {
					sPoints = fromX + "," + fromY + " " + fromX + "," + fromY + " " + toX + "," + toY + " " + toX + "," + toY;
					var coords = this._getCoordArrayFromPointString(sPoints);
					var xArray = coords.x;
					var yArray = coords.y;
				}

				sPoints = xArray[0] + "," + yArray[0] + " " + parseInt(xArray[1] + ibEdgeGap) + "," + yArray[1] + " " + parseInt(xArray[1] +
					ibEdgeGap) + "," + yArray[2] + " " + xArray[3] + "," + yArray[3];

			} else if (fromX === oStatusFrom.lX && toX === oStatusTo.rX) {
				// starting from right to left wiht two additional points in the edge
				if (xArray.length !== 4) {
					sPoints = fromX + "," + fromY + " " + fromX + "," + fromY + " " + toX + "," + toY + " " + toX + "," + toY;
					var coords = this._getCoordArrayFromPointString(sPoints);
					var xArray = coords.x;
					var yArray = coords.y;

				}

				sPoints = xArray[0] + "," + yArray[0] + " " + parseInt(xArray[1] - ibEdgeGap) + "," + yArray[1] + " " + parseInt(xArray[1] -
					ibEdgeGap) + "," + yArray[2] + " " + xArray[3] + "," + yArray[3];

			} else if (fromX === oStatusFrom.lX || fromX === oStatusFrom.rX) {
				//starting from a side of the rect

				if (toY === oStatusTo.topY) {
					// got to top side of rect
					sPoints = xArray[0] + "," + yArray[0] + " " + parseInt(xArray[0] - iEdgeGap) + "," + yArray[0] + " " + parseInt(xArray[0] - iEdgeGap) +
						"," + parseInt(yArray[2] - iEdgeGap) + " " + xArray[2] + "," + parseInt(yArray[2] - iEdgeGap) + " " + xArray[2] + "," + yArray[2];
				} else if (toY === oStatusTo.botY) {
					// go to bottom side of rect
					sPoints = xArray[0] + "," + yArray[0] + " " + parseInt(xArray[0] - iEdgeGap) + "," + yArray[0] + " " + parseInt(xArray[0] - iEdgeGap) +
						"," + parseInt(yArray[2] + iEdgeGap) + " " + xArray[2] + "," + parseInt(yArray[2] + iEdgeGap) + " " + xArray[2] + "," + yArray[2];
				}
			} else if (fromY === oStatusFrom.botY && toY === oStatusTo.topY && fromX != toX) {
				//starting from a side of the rect
				if (xArray.length === 3) {
					// got to top side of rect
					sPoints = xArray[0] + "," + yArray[0] + " " + xArray[0] + "," + parseInt(yArray[0] + iEdgeGap) + " " + xArray[2] +
						"," + parseInt(yArray[0] + iEdgeGap) + " " + xArray[2] + "," + yArray[2];
				} else {
					// go to bottom side of rect
					sPoints = xArray[0] + "," + yArray[0] + " " + xArray[0] + "," + parseInt(yArray[1] + iEdgeGap) + " " + xArray[2] +
						"," + parseInt(yArray[1] + iEdgeGap) + " " + xArray[3] + "," + yArray[3];
				}
			}
			return sPoints;
		},

		_isBlocked: function(sPoints, oStatusFrom, oStatusTo) {
			//checks if way is blocked
			var coords = this._getCoordArrayFromPointString(sPoints);
			var xArray = coords.x;
			var yArray = coords.y;

			var aStatusList = this.aStatusList;
			var aLineList = this.aLineList;
			var bBlocked = false;
			//loop through all points
			for (var j = 0; j < xArray.length - 1 && !bBlocked; j++) {
				//if this part of the edge is horizontal
				if (yArray[j] === yArray[j + 1]) {
					//get the lower and higher x value
					var x1 = Math.min(xArray[j], xArray[j + 1]);
					var x2 = Math.max(xArray[j], xArray[j + 1]);
					var y = yArray[j];
					//loop through all statuses
					for (var i = 0; i < aStatusList.length && !bBlocked; i++) {
						//if y is in on the same y height as a rect ( plus some puffer)
						if (y > aStatusList[i].topY - Math.round(this.iRectHeight / 20) && y < aStatusList[i].botY + Math.round(this.iRectHeight / 20)) {
							//and if the small x is smaller than left side of the rect and the big x is bigger than the right side
							//or if big x2 is bigger than x value of the right side of the rect and the small x is smaller than the right side x value
							//--> if an edge would cross a rect
							if (x1 <= aStatusList[i].lX && x2 > aStatusList[i].lX || x2 >= aStatusList[i].rX && x1 < aStatusList[i].rX) {
								bBlocked = true;
							}
						}
					}
					//loop through all edges
					for (var i = 0; i < aLineList.length && !bBlocked; i++) {
						var existingCoords = this._getCoordArrayFromPointString(aLineList[i].points);
						var xLineArray = existingCoords.x;
						var yLineArray = existingCoords.y;
						for (var k = 0; k < xLineArray.length && !bBlocked; k++) {
							//if the y value of both edges are the same and if they are in the same x corridor, its blocked
							if (y === yLineArray[k]) {
								if (x1 < xLineArray[k] && x2 > xLineArray[k]) {
									bBlocked = true;
								}
							}
						}

					}
				} else {
					//if the part of the edge goes veritcally 
					var y1 = Math.min(yArray[j], yArray[j + 1]);
					var y2 = Math.max(yArray[j], yArray[j + 1]);
					var x = xArray[j];
					//loop through all statuses
					for (var i = 0; i < aStatusList.length && !bBlocked; i++) {
						//if x is bigger than left rect value and smaller than right rect value (plus buffer)
						//--> if x is on the same x band as a rect
						if (x > aStatusList[i].lX - Math.round(this.iRectWidth / 10) && x < aStatusList[i].rX + Math.round(this.iRectWidth / 10)) {
							//if an edge crosses the rect
							//if small y is smaller than bottom rect value and big y is bigger than bot rect value
							//if big y is bigger than top rect value and small y is smaller than top rect value
							if (y1 < aStatusList[i].botY && y2 > aStatusList[i].botY || y2 > aStatusList[i].topY && y1 < aStatusList[i].topY) {
								bBlocked = true;
							}
						}
					}
					//loop through all edges
					for (var i = 0; i < aLineList.length && !bBlocked; i++) {
						var existingCoords = this._getCoordArrayFromPointString(aLineList[i].points);
						var xLineArray = existingCoords.x;
						var yLineArray = existingCoords.y;

						for (var k = 0; k < yLineArray.length && !bBlocked; k++) {
							//if the x value of both edges are the same and if they are in the same y corridor, its blocked
							if (x === xLineArray[k]) {
								if ((y1 <= yLineArray[k] && y2 >= yLineArray[k])) {
									bBlocked = true;
								}
								if (k + 1 < yLineArray.length && x === xLineArray[k + 1]) {
									var y_min = Math.min(yLineArray[k], yLineArray[k + 1]);
									var y_max = Math.max(yLineArray[k], yLineArray[k + 1]);
									if ((y_min > y1 && y_min < y2) || (y_max > y1 && y_max < y2) || (y1 > y_min && y1 < y_max) || (y2 > y_min && y2 < y_max)) {
										bBlocked = true;
										//                                                 console.log("sPoints"+sPoints)
										//                                                 console.log("existingCoords:"+JSON.stringify(existingCoords))
									}
								}
							}
						}
					}
				}
			}

			return bBlocked;
		},

		_getCoordArrayFromPointString: function(sPoints) {
			//takes an point String an returns an object with the x and y coords in an array
			var pointArray = sPoints && sPoints.split(" ") || [];
			var coordArray = [];
			for (var i = 0; i < pointArray.length; i++) {
				coordArray[i] = pointArray[i].split(",")
			}

			var xArray = [];
			var yArray = [];
			for (var i = 0; i < coordArray.length; i++) {
				xArray[i] = parseInt(coordArray[i][0]);
				yArray[i] = parseInt(coordArray[i][1]);
			}

			return {
				"x": xArray,
				"y": yArray
			};
		},

		_computePointDistance: function(oStatusFrom, oStatusTo) {
			//TODO: Could be improved and more generic
			//computes the distances of transitions, but adds some specials, so that some transitions are preferred
			var iDistance = 0;
			//takes the absolute x distance
			iDistance = Math.abs(oStatusFrom.x - oStatusTo.x);
			//if the nav goes bot
			if (oStatusFrom.y < oStatusTo.y) {
				//add the absolute y distance --> therefore top navigations have a smaller distance will be drawn earlier
				iDistance += Math.abs(oStatusFrom.y - oStatusTo.y);
			} else if (oStatusFrom.x === oStatusTo.x) {
				//if x value stays the same, add the absolute y distance
				iDistance += Math.abs(oStatusFrom.y - oStatusTo.y);
			}
			return iDistance;
		},

		_createRect: function(x, y, oStatus) {
			//Creates a rect and sets many properties to the status for finding the edges
			var rect = this.svg.append("rect").attr("width", this.iRectWidth)
				.attr("height", this.iRectHeight)
				.attr("x", x)
				.attr("y", y)
				.attr("rx", this.iRectRadius)
				.attr("ry", this.iRectRadius)
				.attr("style", "stroke-width: 2px")
				.attr("class", "sapUiInoStatusModelViz-rect-" + oStatus.id + " sapUiInoStatusModelVizRect");
			this._setRectText(rect, oStatus.text);
			oStatus.created = true;
			oStatus.rect = rect;
			oStatus.x = x;
			oStatus.y = y;
			oStatus.lX = x;
			oStatus.rX = x + this.iRectWidth;
			oStatus.hY = y + Math.round(this.iRectHeight / 2);
			oStatus.topY = y;
			oStatus.botY = y + this.iRectHeight;

			for (var i = 0; i < this.iHEdgeCount; i++) {
				oStatus["connectR" + i] = true;
				oStatus["connectL" + i] = true;
				oStatus["h" + i + "Y"] = y + Math.round(this.iRectHeight * (i + 1) / (this.iHEdgeCount + 1));
				// if (i === 0) {
				//     oStatus["h" + i + "Y"] = y + Math.round(this.iRectHeight * (0 + 1) / (this.iHEdgeCount + 1));
				// } else if (i === 1) {
				//     oStatus["h" + i + "Y"] = y + Math.round(this.iRectHeight * (1 + 1) / (this.iHEdgeCount + 1));
				// } else {
				//     oStatus["h" + i + "Y"] = y + Math.round(this.iRectHeight * (2 + 1) / (this.iHEdgeCount + 1));
				// }
			}

			for (var i = 0; i < this.iVEdgeCount; i++) {
				oStatus["connectT" + i] = true;
				oStatus["connectB" + i] = true;
				oStatus["v" + i + "X"] = x + Math.round(this.iRectWidth * (i + 1) / (this.iVEdgeCount + 1));
			}

		},

		_drawLine: function(sPoints) {
			if (sPoints) {
				var coords = this._getCoordArrayFromPointString(sPoints);
				var xArray = coords.x;
				var yArray = coords.y;

				var line;
				//if less than three points, we have no curves, so we can use polyline instead of path
				if (xArray.length < 3) {
					line = this.svg.append("polyline")
						.attr("points", sPoints)
						.attr("style", "stroke-width:2")
						.attr("class", "sapUiInoStatusModelVizEdge");
				} else {
					//Build the path string
					var d = "";
					var iEdgeRadius = this.iEdgeRadius;
					for (var i = 0; i < xArray.length; i++) {
						if (i == 0) {
							d += "M" + xArray[0] + "," + yArray[0];
						} else if (i == xArray.length - 1) {
							d += " L" + xArray[i] + "," + yArray[i];
						} else {
							if (xArray[i] === xArray[i - 1]) {
								if (yArray[i] < yArray[i - 1]) {
									//goes top
									var tmpValue = yArray[i] + iEdgeRadius
									d += " L" + xArray[i] + "," + tmpValue;
									d += " Q" + xArray[i] + "," + yArray[i];
								} else {
									//goes down
									var tmpValue = yArray[i] - iEdgeRadius;
									d += " L" + xArray[i] + "," + tmpValue;
									d += " Q" + xArray[i] + "," + yArray[i];
								}
								if (xArray[i] < xArray[i + 1]) {
									//goes right
									var tmpValue = xArray[i] + iEdgeRadius;
									d += " " + tmpValue + "," + yArray[i];
								} else {
									//goes left
									var tmpValue = xArray[i] - iEdgeRadius;
									d += " " + tmpValue + "," + yArray[i];
								}
							} else {
								if (xArray[i] > xArray[i - 1]) {
									//goes right
									var tmpValue = xArray[i] - iEdgeRadius;
									d += " L" + tmpValue + "," + yArray[i];
									d += " Q" + xArray[i] + "," + yArray[i];
								} else {
									//goes left
									var tmpValue = xArray[i] + iEdgeRadius;
									d += " L" + tmpValue + "," + yArray[i];
									d += " Q" + xArray[i] + "," + yArray[i];
								}
								if (yArray[i] > yArray[i + 1]) {
									//goes top
									var tmpValue = yArray[i] - iEdgeRadius;
									d += " " + xArray[i] + "," + tmpValue;
								} else {
									//goes down
									var tmpValue = yArray[i] + iEdgeRadius;
									d += " " + xArray[i] + "," + tmpValue;
								}
							}
						}
					}
					line = this.svg.append("path")
						.attr("d", d)
						.attr("style", "stroke-width:2")
						.attr("class", "sapUiInoStatusModelVizEdge");
				}
				//add points to line, only the points are necessary, the svg is not
				line.points = sPoints;
				//push line to lineList for block checking
				this.aLineList.push(line);
				//draw Arrow Head
				this._drawArrowHead(sPoints);
			} else {
				//console.log("No Points set! Error in drawLine");
				// this.$().addClass('sapUiNoDisplayedStatusModelImage');
				// this.detachClick();
				console.log("No Points set! Error in drawLine");
			}
		},

		_drawArrowHead: function(sPoints) {
			var coords = this._getCoordArrayFromPointString(sPoints);
			var xArray = coords.x;
			var yArray = coords.y;

			var x1 = xArray[xArray.length - 2],
				x2 = xArray[xArray.length - 1],
				y1 = yArray[yArray.length - 2],
				y2 = yArray[yArray.length - 1];

			var p1 = x2 + "," + y2 + " ",
				p2,
				p3,
				p4,
				iArrowSize = this.iArrowSize;
			if (x1 === x2) {
				if (y1 > y2) {
					p2 = parseInt(x2 - iArrowSize) + "," + parseInt(y2 + iArrowSize) + " ";
					p3 = parseInt(x2 + iArrowSize) + "," + parseInt(y2 + iArrowSize) + " ";
					p4 = x2 + "," + parseInt(y2 + (iArrowSize - 3)) + " ";
				} else {
					p2 = parseInt(x2 - iArrowSize) + "," + parseInt(y2 - iArrowSize) + " ";
					p3 = parseInt(x2 + iArrowSize) + "," + parseInt(y2 - iArrowSize) + " ";
					p4 = x2 + "," + parseInt(y2 - (iArrowSize - 3)) + " ";
				}
			} else if (y1 === y2) {
				if (x1 > x2) {
					p2 = parseInt(x2 + iArrowSize) + "," + parseInt(y2 - iArrowSize) + " ";
					p3 = parseInt(x2 + iArrowSize) + "," + parseInt(y2 + iArrowSize) + " ";
					p4 = parseInt(x2 + (iArrowSize - 3)) + "," + y2 + " ";
				} else {
					p2 = parseInt(x2 - iArrowSize) + "," + parseInt(y2 - iArrowSize) + " ";
					p3 = parseInt(x2 - iArrowSize) + "," + parseInt(y2 + iArrowSize) + " ";
					p4 = parseInt(x2 - (iArrowSize - 3)) + "," + y2 + " ";
				}
			} else {
				p2 = parseInt(x2 - iArrowSize) + "," + parseInt(y2 - iArrowSize) + " ";
				p3 = parseInt(x2 - iArrowSize) + "," + parseInt(y2 + iArrowSize) + " ";
				p4 = y2 + "," + parseInt(x2 - (iArrowSize - 3)) + " ";
			}
			this.svg.append("polygon")
				.attr("points", p1 + p2 + p4 + p3)
				.attr("class", "sapUiInoStatusModelVizArrowHead");
		},

		//sort list, so that the first item is the starting item and the next items are next status of the start.
		//Each following item is dependend
		//of the next statuses of the particular status.	
		_sortList: function() {
			var aStatusList = this.aStatusList;
			var sortedStatusList = [];

			for (var i = 0; i < aStatusList.length; i++) {
				if (aStatusList[i].isStart) {
					sortedStatusList.push(aStatusList[i]);
				}
			}

			for (var i = 0; i < aStatusList.length; i++) {
				var oStatus = sortedStatusList[i];
				for (var j = 0; j < oStatus.nextId.length; j++) {
					if (!(oStatus.nextId[j] === oStatus.id) && !(sortedStatusList.contains(this.statusAsoList[oStatus.nextId[j]]))) {
						sortedStatusList.push(this.statusAsoList[oStatus.nextId[j]])
					}
				}
			}
			this.aStatusList = sortedStatusList;
		},

		//the main path is computed as the following:
		//It starts at the first element, this element is immediately marked as main path
		//The next elements of the first element are examined, if one of the next is not already seen it is part of the main path
		//If one of an element's next statuses is not already contained in one of the previous next statuses, it is added to the main path

		_computeMainPath: function() {
			var aStatusList = this.aStatusList;
			for (var i = 0; i < aStatusList.length; i++) {
				var oStatus = aStatusList[i];
				if (oStatus.isStart || oStatus.isLast) {
					oStatus.isMainPath = true;
				}
				for (var j = 0; j < oStatus.nextId.length; j++) {
					var nextStatus = this.statusAsoList[oStatus.nextId[j]];
					var myList = this.statusAsoList;
					if (!nextStatus.isMainPath) {
						for (var k = 0; k < nextStatus.nextId.length; k++) {
							if ((!oStatus.nextId.contains(nextStatus.nextId[k]))) {
								//for 1 status, only 1 of its next status could be in main path
								//   var oMainStatus = jQuery.grep(oStatus.nextId, function (Id, iIndex ) {
								//     		                return (myList[Id].isMainPath === true);});
								//     		            if(oMainStatus.length === 0){
								nextStatus.isMainPath = true;
								break;
								// }
							}
							if (nextStatus.transitions.length > 0 &&
								nextStatus.transitions[0].transitionText.search("End") >= 0 &&
								oStatus.id !== nextStatus.id) {
								nextStatus.isMainPath = true;
								break;
							}
						}
						if (this.cust && nextStatus.isMainPath === true) {
							break;
						}
					}
				}
			}
		},

		//positions the rects in a good way. So that the statuses of the main path are straight forward.
		//The parameters give the x and y coordinate of the start status. The other status are oriented at the start Status
		_positionRects: function() {
			var aStatusList = this.aStatusList;

			for (var i = 0; i < aStatusList.length; i++) {
				var oStatus = aStatusList[i];
				var k = 1;
				var x = 0;
				var y = 0;

				if (oStatus.isStart) {
					x = 0;
					y = 0;
					this._createRect(x, y, oStatus);
				}
				for (var j = 0; j < oStatus.nextId.length; j++) {
					var nextStatus = this.statusAsoList[oStatus.nextId[j]];

					if (!nextStatus.created) {
						x = oStatus.x + this.iRectWidth + this.iRectGap;

						//judage if there is already a rec occupied the main path
						for (var n = 0; n < aStatusList.length; n++) {
							if (aStatusList[n].x === x && aStatusList[n].y === oStatus.y) {
								nextStatus.isMainPath = false;
								break;
							}
						}
						if (nextStatus.isMainPath) {
							y = oStatus.y;
						} else {
							if (k % 2 != 0) {

								y = oStatus.hY - (Math.round(this.iVerticalRectGap * this.iRectHeight) * Math.floor(k + 1) / 2);
							} else {
								y = oStatus.hY + (Math.round(this.iVerticalRectGap * this.iRectHeight) * Math.floor(k) / 2) - this.iRectHeight;
							}
							k++;
						}
						this._createRect(x, y, nextStatus);
					}
				}
			}
		},

		//Sets the edge text to the edges and handles the line break
		_setEdgeText: function(sPoints, transition, oStatusFrom, oStatusTo) {
			if (!sPoints) {
				return;
			}
			var text = transition.transitionText;
			var iRectGap = this.iRectGap;

			var bDecisionRelevant = transition.decisionRelevant;

			if (bDecisionRelevant) {
				text += " *";
			}

			if (transition.decisionReasonListCode && transition.decisionReasonListCode !== '') {
				text += " #";
			}

			var coords = this._getCoordArrayFromPointString(sPoints);
			var xArray = coords.x;
			var yArray = coords.y;

			var bTextSet = false;
			var x = 0;
			var y = 0;
			var textWidth = this._getTextWidth(text);
			var textHeight = this._getTextHeight(text);
			var textParts;

			//Text position for, when start and end status are the same
			if (oStatusFrom === oStatusTo) {
				var distance = Math.round(this.iRectWidth * 2 / 3);
				if (textWidth > distance) {
					var bLineBreak = true;
					textParts = this._wrapText(text, distance);
				} else {
					textParts = [text];
				}
				//takes the min x value in xArray and substracts the doubled text length
				x = Math.min.apply(null, xArray);
				//checks if last y is bigger or smaller than first
				if (yArray[0] > yArray[yArray.length - 1]) {
					y = Math.min.apply(null, yArray) - textHeight / 2;
				} else {
					y = Math.max.apply(null, yArray) + textHeight * textParts.length;
				}
			} else {
				for (var i = 0; i < xArray.length; i++) {
					//horizontal edge, alwas write the text to the horizontal part of the edge if possible
					if (yArray[i + 1] && yArray[i] === yArray[i + 1]) {
						//distance between start and end of the horizontal part of the edge
						var distance = Math.abs(xArray[i] - xArray[i + 1]) - Math.round(this.iEdgeRadius / 3);
						if (textWidth > distance) {
							var bLineBreak = true;
							var textParts = this._wrapText(text, distance);
						}
						// if the length of horizontal edge is too short, wrap the text by space. handle the last character
						if (distance < iRectGap / 2) {

							if (xArray[i + 1] && xArray[i + 2]) {
								x = xArray[i + 1] - Math.round(this.iEdgeRadius) * 3 / 2;
								y = (yArray[yArray.length - 1] + yArray[i]) / 2;
							}

						} else {

							//if the edge goes left
							if (xArray[i + 1] && xArray[i] > xArray[i + 1]) {
								x = xArray[i] - (bLineBreak ? this._getTextWidth(textParts[0]) : textWidth) - Math.round(this.iEdgeRadius / 3);
								// if previous edge goes up
								if (yArray[i - 1] && yArray[i] < yArray[i - 1]) {
									y = yArray[i] - this.iEdgeTextSize / 2;
								} else {
									y = yArray[i] + this.iEdgeTextSize * 6 / 5;
								}
							} else {
								//if the edge goes right
								x = xArray[i] + 5;
								// if previous edge goes up
								if (yArray[i - 1] && yArray[i] < yArray[i - 1]) {
									y = yArray[i] + this.iEdgeTextSize;
								} else {
									y = yArray[i] - this.iEdgeTextSize / 2;
								}
							}
						}
						bTextSet = true;
						break;
					}
				}
				//if the edge does not contain horizontal parts
				if (!bTextSet) {
					for (var i = 0; i < xArray.length; i++) {
						var distance = Math.round(this.iRectWidth * 2 / 3);
						if (textWidth > distance) {
							var bLineBreak = true;
							var textParts = this._wrapText(text, distance);
						}

						if (xArray[i + 1] && xArray[i] === xArray[i + 1]) {
							if (textParts) {
								var lineCount = textParts.length;
							} else {
								var lineCount = 1;
							}
							x = xArray[i] + 5;
							y = Math.round((yArray[i] + yArray[i + 1]) / 2) + Math.floor(lineCount / 2) * textHeight;
							bTextSet = true;
							break;
						}
					}
				}
			}

			if (bLineBreak) {
				//if there are line breaks, it is necessary to create tspan elements
				var iLines = textParts.length;
				var textSVG = this.svg.append("text")
					.attr("style", "font-size:" + this.iEdgeTextSize + "px;font-style:italic;")
					.attr("class", "sapUiInoStatusModelVizEdgeText");

				for (var i = 0; i < iLines; i++) {
					textSVG.append("tspan").text(textParts[i])
						.attr("x", x)
						.attr("y", y - (iLines - i - 1) * this.iEdgeTextSize)
				}
			} else {
				var textSVG = this.svg.append("text").text(text)
					.attr("x", x).attr("y", y)
					.attr("style", "font-size:" + this.iEdgeTextSize + "px;font-style:italic;")
					.attr("class", "sapUiInoStatusModelVizEdgeText");
			}
		},

		_getTextWidth: function(text, textSize) {
			if (!textSize) {
				textSize = this.iEdgeTextSize;
			}
			var textSVG = this.svg.append("text").text(text)
				.attr("style", "font-size:" + textSize + "px");
			var bBox = textSVG[0][0].getBBox();
			textSVG.remove();
			return Math.round(bBox.width);
		},

		_getTextHeight: function(text, textSize) {
			if (!textSize) {
				textSize = this.iEdgeTextSize;
			}
			var textSVG = this.svg.append("text").text(text)
				.attr("style", "font-size:" + textSize + "px");
			var bBox = textSVG[0][0].getBBox();
			textSVG.remove();
			return Math.round(bBox.height);
		},

		_wrapText: function(text, distance, textSize) {
			//if text is too large for one line
			if (!textSize) {
				textSize = this.iEdgeTextSize;
			}
			var iRectGap = this.iRectGap;
			var textParts = [];
			//Split text at space
			textParts = text.split(" ");
			if (distance < iRectGap / 2) {
				if (textParts[textParts.length - 1] === "#" || textParts[textParts.length - 1] === "*") {
					textParts[textParts.length - 2] = textParts[textParts.length - 2] + " " + textParts[textParts.length - 1];
					textParts.splice(textParts.length - 1, 1);
				}
			} else {
				for (var k = 0; k < textParts.length; k++) {
					//if single parts of the text are too small add them back together
					if (textParts[k + 1]) {
						var tempTexts = textParts[k] + " " + textParts[k + 1];
						if ((this._getTextWidth(tempTexts, textSize) < distance)) {
							textParts[k] = textParts[k] + " " + textParts[k + 1];
							textParts.splice(k + 1, 1);
							k--;
						}
					}
				}
				var bender = true;
				for (var k = 0; k < textParts.length && bender; k++) {

					var textPart = textParts[k];
					var tempText = textPart;
					var j = 0;
					var newTextParts = [];

					// To calculate the length of each local factor
					var localTextFactor = Math.round(this._getTextWidth(tempText, textSize) / tempText.length);
					// To calculate the number of factors each line(within the rectangle) can hold
					var localLengthText = Math.floor(distance / localTextFactor);

					while (this._getTextWidth(tempText, textSize) > distance) {
						if (textPart.length) {
							tempText = textPart.substring((j + 1) * localLengthText);
							newTextParts[j] = textPart.substring(j * localLengthText, (j + 1) * localLengthText);
							j++;
							newTextParts[j] = tempText;
						}
					}

					if (newTextParts.length > 0) {
						textParts.splice(k, 1);
						for (var l = 0; l < newTextParts.length; l++) {
							textParts.splice(k + l, 0, newTextParts[l]);
						}
						k = k + newTextParts.length - 1;
					}
				}
				for (var k = 0; k < textParts.length; k++) {
					//if single parts of the text are too small add them back together
					if (textParts[k + 1]) {
						tempTexts = textParts[k] + " " + textParts[k + 1];
						if ((this._getTextWidth(tempTexts, textSize) < distance)) {
							textParts[k] = textParts[k] + " " + textParts[k + 1];
							textParts.splice(k + 1, 1);
							k--;
						}
					}
					// if (textParts[k].length === 0) {
					// 	textParts.splice(k, 1);
					// }
				}
			}

			return textParts;
		},

		_setRectText: function(rect, text) {
			//calculate the max amount of characters per line
			var rectText;
			var distance = this.iRectWidth - this.iRectRadius * 2;
			var textWidth = this._getTextWidth(text, this.iRectTextSize);
			var textHeight = this._getTextHeight(text, this.iRectTextSize);

			if (textWidth < distance) {
				//if text is smaller then max amount of characters, its easy work
				rectText = this.svg.append("text").text(text)
				//center the text
				.attr("x", parseInt(rect.attr("x")) + Math.round(this.iRectWidth / 2) - textWidth / 2)
					.attr("y", parseInt(rect.attr("y")) + Math.round(this.iRectHeight / 2) + 5)
					.attr("class", rect.attr("class") + "-text sapUiInoStatusModelVizRectText")
					.attr("style", "font-size:" + this.iRectTextSize + "px")
			} else {
				var textParts = this._wrapText(text, distance, this.iRectTextSize);
				var lineCount = textParts.length;

				rectText = this.svg.append("text")
					.attr("class", rect.attr("class") + "-text sapUiInoStatusModelVizRectText")
					.attr("style", "font-size:" + this.iRectTextSize + "px")
				var j = 0;
				var lineHeight = textHeight;
				//manage vertical text align

				var y = Math.round((parseInt(rect.attr("y")) * 2 + this.iRectHeight) / 2) + Math.round(lineCount * textHeight / 2.5);
				for (var i = 0; i < lineCount; i++) {
					rectText.append("tspan").text(textParts[i])
						.attr("x", parseInt(rect.attr("x")) + Math.round(this.iRectWidth / 2) - this._getTextWidth(textParts[i], this.iRectTextSize) / 2)
						.attr("y", y - (lineCount - i - 1) * this.iRectTextSize)
				}
			}
		}
	});
})();