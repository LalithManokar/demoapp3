/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/thirdparty/d3"
], function(Control, d3) {
    "use strict";

    return Control.extend("sap.ino.controls.ExpertGraph", {
        metadata : {
            properties : {
                experts : {
                    type : "object",
                    defaultValue : {}
                }
            },
            events : {
                "mouseOverNode" : {},
                "mouseOutNode" : {},
                "clickNode" : {}
            }
        },

        init: function () {
            this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
		},

        renderer : function(oRm, oControl) {
            oRm.write("<div ");
            oRm.writeControlData(oControl);
            oRm.addClass("sapInoExpertGraphContainer");
            oRm.writeClasses();
            oRm.write("></div>");
        },

        onAfterRendering : function() {
            var i;
            var fnZoom = d3.behavior.zoom()
                .scaleExtent([0.1, 10])
                .on("zoom", fnZoomed);

            var $element = d3.select("#" + this.getId());
            var width = $element[0][0].scrollWidth;
            var height = $element[0][0].scrollHeight;
            var scale = 1;
            var $svg = $element
                .append("svg")
                .call(fnZoom)
                .attr("transform", "translate(0,0)");

            var radius = 7;

            var force = d3.layout.force()
                .gravity(0.1)
                .distance(100)
                .charge(-500)
                .size([width, height]);
                
            d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("dragstart", fnDragStarted)
                .on("drag", fnDragged)
                .on("dragend", fnDragEnded);
                
            var $container = $svg.append("g");
            
            function fnDragStarted(d) {
                d3.event.sourceEvent.stopPropagation();
                d3.select(this)
                    .classed("dragging", true);
                force.start();
            }
            
            function fnDragged(d) { 
                d3.select(this)
                    .attr("cx", d.x = d3.event.x)
                    .attr("cy", d.y = d3.event.y); 
            }
            
            function fnDragEnded(d) { 
                d3.select(this)
                    .classed("dragging", false); 
            }
                
            $svg.on("dblclick.zoom", null);
            $svg.on("dblclick", function(){
                scale = 1;
                fnZoom.scale(1);
                fnZoom.translate([0, 0]);
                $container.transition()
                    .duration(500)
                    .attr('transform', '');
                force.resume();
            });
            
            function fnZoomed() { 
                scale = d3.event.scale;
                if(scale > 1) {
                    $container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                } else {
                    $container.attr("transform", "scale(" + d3.event.scale + ")");
                }
                force.resume();
            }
    
            function createGraph(experts) {
                var oGraph = {
                    nodes : [], 
                    links : []
                };
                
                function addLink(source,target) {
                    var result = jQuery.grep(oGraph.links, function(e){ 
                        return e.source === source && e.target === target;
                    });
                    
                    if(result.length === 0) {
                        oGraph.links.push({ source: source, target: target });
                        return oGraph.links[oGraph.links.length - 1];
                    }
                    return result[0];
                }
                
                function addTag(iTagId, sTagName) {
                    var result = jQuery.grep(oGraph.nodes, function(e){ 
                        return e.tag_id === iTagId; 
                    });
                    
                    if(result.length === 0) {
                        var oNewTag = { 
                            NAME: sTagName, 
                            tag_id: iTagId, 
                            group: 0    // value 0 is used to identify Tag node
                        };
                        oGraph.nodes.push(oNewTag);
                        return oGraph.nodes[oGraph.nodes.length - 1];
                    }
                    return result[0];
                }
                
                function addPerson(person) {
                    var aNodes = jQuery.grep(oGraph.nodes, function(oNode){ 
                        return oNode.PERSON_ID === person.ID; 
                    });
                    
                    if(aNodes.length === 0) {
                        var oNewPerson = { 
                            NAME: person.NAME,
                            PERSON_ID: person.ID,
                            EMAIL: person.EMAIL,
                            PHONE: person.PHONE,
                            MOBILE: person.MOBILE,
                            OFFICE: person.OFFICE,
                            group: 1,   // value 1 is used to identify Person node
                            x: 150,
                            y: 150,
                            RANK: person.RANK,
                            CORRELATION: person.CORRELATION
                        };
                        oGraph.nodes.push(oNewPerson);
                        return oNewPerson;
                    } else {
                        return aNodes[0];
                    }
                }
                
                jQuery.each(experts, function(index, currentExpert) {
                    var person = addPerson(currentExpert);
                    jQuery.each(currentExpert.CORRELATION, function(i1, currentCorrelation) {
                        jQuery.each(currentCorrelation.TAGS, function(i2, currentTag) {
                            var tag = addTag(currentTag.ID, currentTag.NAME);
                            var link = addLink(person, tag);
                        });
                    });
                });
                return oGraph;
            }
                
            var graph = createGraph(this.getExperts());
            
            if (graph.nodes.length === 0) {
                $svg.append("text").text(this._oRB.getText("CTRL_EXPERTFINDER_EMPTY_SCREEN")).classed("sapInoExpertGraphEmptyScreenText", true);
                var xPos = ($element[0][0].scrollWidth - $svg.select("text")[0][0].getBBox().width) / 3;
                var yPos = ($element[0][0].scrollHeight - $svg.select("text")[0][0].getBBox().height) / 2;
                $svg.select("text").attr("x", xPos).attr("y", yPos);
            } else {
                force.nodes(graph.nodes).links(graph.links).start();
            }
    
            var link = $container.selectAll(".sapInoExpertLink")
                .data(graph.links)
                .enter()
                .append("line")
                .classed("sapInoExpertLink", true);
    
            var node = $container.selectAll(".sapInoExpertNode")
                .data(graph.nodes)
                .enter().append("g")
                .attr("class", "sapInoExpertNode")
                .call(force.drag);
            
            var that = this;
            var aSelectedNodes = [];
            var aSelectedLinks = [];
                
            node.append("circle")
                .attr("r",  function(d) {
                    if(d.group === 0) {
                        return 12;
                    } else {
                        if(radius + (5 / d.RANK) < 8) {
                            return 8;
                        }
                        else {
                            return radius + (5 / d.RANK);
                        }
                    }
                })
                .style("cursor", function(d) { 
                        return d.group !== 0 ? "pointer" : "auto"; 
                })
                .on("click", function(d,i) { 
                    if(d.group !== 0) {
                        if(aSelectedNodes.length > 0 || aSelectedLinks.length > 0 ) {
                            for(i = 0; i < aSelectedNodes.length; i++) {
                                d3.select(aSelectedNodes[i])
                                    .classed("sapInoExpertGraphSelectedPerson", false)
                                    .classed("sapInoExpertGraphSelectedTag", false)
                                    .classed("sapInoExpertGraphSelectText", false)
                                    .classed("sapInoExpertGraphHighlightLine", false)
                                    .classed("sapInoExpertGraphSelectedPerson", false);
                            }
                            aSelectedNodes = [];
                            
                            for(i = 0; i < aSelectedLinks.length; i++) {
                                d3.select(aSelectedLinks[i])
                                    .classed("sapInoExpertGraphSelectLine", false)
                                    .classed("sapInoExpertLink", true);
                            }
                            aSelectedLinks = [];
                        }
                        
                        var aAssociatedNodeIds = [];
                        
                        var aAssociatedLinks = link.filter(function(l) {
                            if(l.source.index === d.index || l.target.index === d.index) {
                                aAssociatedNodeIds.push(l.source.index);
                                aAssociatedNodeIds.push(l.target.index);
                                return true;
                            } else {
                                return false;
                            }
                        });        
                        
                        var aAssociatedNodes = node.filter(function(l) {
                            return (aAssociatedNodeIds.indexOf(l.index) >= 0);
                        });
                        
                        aAssociatedLinks.each(function() {
                            aSelectedLinks.push(this);
                            d3.select(this)
                                .classed("sapInoExpertLink", false)
                                .classed("sapInoExpertGraphHighlightLine", false)
                                .classed("sapInoExpertGraphSelectLine", true);
                        });
                        
                        aAssociatedNodes.each(function(dNode) {
                            aSelectedNodes.push(this.childNodes[0]);
                            aSelectedNodes.push(this.childNodes[1]);
                            d3.select(this.childNodes[1])
                                .classed("sapInoExpertGraphSelectText", true);
                            if(dNode.group !== 1) {
                                d3.select(this.childNodes[0]).classed("sapInoExpertGraphSelectedTag", true);
                            } else {
                                d3.select(this.childNodes[0]).classed("sapInoExpertGraphSelectedPerson", true);
                            }
                        });
                        
                        that.fireClickNode(d); 
                    }
                });
              
            node.append("text")
                .attr("dx", 14)
                .attr("dy", ".35em")
                .attr("x", - 0)
                .attr("y", function(d) { 
                    if(d.group === 0) {
                          return -12;
                      } else {
                        if(radius + (5 / d.RANK) < 8) {
                            return 8;
                        } else {
                            return radius + (5 / d.RANK);
                        }
                      }
                })
                .text(function(d) { 
                    return d.NAME ? d.NAME : "[" + that._oRB.getText("CTRL_EXPERTFINDER_GRP_NO_NAME") + "]"; //d.NAME; 
                })
                .classed("sapInoExpertGraphText", true);
                    
            node.each(function(dNode) {
                if(dNode.group !== 0) {
                    d3.select(this).classed("sapInoExpertGraphPerson", true);
                } else {
                    d3.select(this).classed("sapInoExpertGraphTag", true);
                }
            });
            
            var aTouchedNodes = [];
            var aTouchedLinks = [];
            
            var getRadius = function(oNode) {
                if(oNode.group === 0) {
                      return 12;
                  } else {
                      if(radius + (10 / oNode.RANK) < 8) {
                          return 8;
                      } else {
                          return radius + (10 / oNode.RANK);
                      }
                  }
            };
    
            force.on("tick", function() {
                node.attr("cx", function(d) { 
                        var w = scale > 1 ? width : width / scale;
                        d.x = Math.max(getRadius(d), Math.min(w - getRadius(d), d.x));
                        return d.x;   
                    }).attr("cy", function(d) { 
                        var h = scale > 1 ? height : height / scale;
                        d.y = Math.max(getRadius(d), Math.min(h - getRadius(d), d.y));
                        return d.y;    
                    }).on("mouseover", function(d){
                        
                        var aAssociatedNodeIds = [];
        
                        var aAssociatedLinks = link.filter(function(l) {
                            if(l.source.index === d.index || l.target.index === d.index) {
                                aAssociatedNodeIds.push(l.source.index);
                                aAssociatedNodeIds.push(l.target.index);
                                return true;
                            } else {
                                return false;
                            }
                        });        
                        
                        var aAssociatedNodes = node.filter(function(l) {
                            return (aAssociatedNodeIds.indexOf(l.index) >= 0);
                        });
                        
                        aAssociatedLinks.each(function() {
                            aTouchedLinks.push(this);
                            d3.select(this)
                                .classed("sapInoExpertLink", false)
                                .classed("sapInoExpertGraphHiglightLine", true);
                        });
                        
                        aAssociatedNodes.each(function() {
                            aTouchedNodes.push(this.childNodes[0]);
                            aTouchedNodes.push(this.childNodes[1]);
                            d3.select(this.childNodes[0]).classed("sapInoExpertGraphHiglightCircle", true);
                            d3.select(this.childNodes[1]).classed("sapInoExpertGraphHiglightText", true);
                        });
                        
                        that.fireMouseOverNode(d);
                    })
                    .on("mouseout", function(d) {
                        
                        for(i = 0; i < aTouchedNodes.length; i++) {
                            d3.select(aTouchedLinks[i])
                                .classed("sapInoExpertGraphHiglightCircle", false)
                                .classed("sapInoExpertGraphHiglightText", false)
                                .classed("sapInoExpertGraphHiglightLine", false);
                        }
                        aTouchedNodes = [];

                        for(i = 0; i < aTouchedLinks.length; i++) {
                            var oTouchedLink = aTouchedLinks[i];
                            var aResultLinks = jQuery.grep(aSelectedLinks, function(oSelectedLink) {
                                return oSelectedLink === oTouchedLink;
                            });
                            
                            if(aResultLinks.length === 0) {
                                d3.select(oTouchedLink).classed("sapInoExpertLink", true);
                            }
                        }

                        aTouchedLinks = [];
                        
                        that.fireMouseOutNode(d);
                    });
                        
                node.attr("transform", function(d) { 
                    return "translate(" + d.x + "," + d.y + ")"; 
                });
                
                link.attr("x1", function(d) {
                    return d.source.x;
                }).attr("y1", function(d) { 
                    return d.source.y; 
                }).attr("x2", function(d) { 
                    return d.target.x;  
                }).attr("y2", function(d) { 
                    return d.target.y;   
                });
            });
                
            var safety = 0;
            while(force.alpha() > 0.03) { // this will calm the graph down before rendering it
                force.tick();
                if(safety++ > 500) {
                  break; // Avoids infinite looping in case this solution was a bad idea
                }
            }
            function resize() {
                var width = $element[0][0].scrollWidth;
                var height = $element[0][0].scrollHeight;
                
                $svg.attr("width", width).attr("height", height);
                if (force.nodes().length !== 0) {
                    force.size([width, height]).resume();
                } else {
                    var xPos = ($element[0][0].scrollWidth - $svg.select("text")[0][0].getBBox().width) / 3;
                    var yPos = ($element[0][0].scrollHeight - $svg.select("text")[0][0].getBBox().height) / 2;
                    $svg.select("text").attr("x", xPos).attr("y", yPos);
             }
            }
            d3.select(window).on('resize', resize);
        }
    });
});