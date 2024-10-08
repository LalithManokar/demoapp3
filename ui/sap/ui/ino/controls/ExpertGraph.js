/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.ExpertGraph");

(function() {
"use strict";
    jQuery.sap.require("sap.ui.thirdparty.d3");
    sap.ui.core.Control.extend("sap.ui.ino.controls.ExpertGraph", {
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
        renderer : function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiInoExpertGraphContainer");
            oRm.writeClasses();
            oRm.write("></div>");
        },

        onAfterRendering : function() {
            var zoom = d3.behavior.zoom()
                .scaleExtent([0.1, 10])
                .on("zoom", zoomed);

            var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();

            var oElement = d3.select("#"+this.getId());
            var width = oElement[0][0].scrollWidth;
            var height = oElement[0][0].scrollHeight;
            var scale = 1;
            var svg = oElement
                        .append("svg")
                        .call(zoom)
                        .attr("transform", "translate(0,0)");

            function setText(sText) {
                svg.selectAll("text").data([{ "cx": 10, "cy": 20}]).enter().append("text")
                .attr("x", function(d) { return d.cx; })
                .attr("y", function(d) { return d.cy; })
                .text( function (d) { return sText; });
            }

            if(this.getExperts().length === 0) {
                setText(i18n.getText("CTRL_EXPERTFINDER_GRP_ADD_TAG"));
                return;
            } else {
                setText(i18n.getText("CTRL_EXPERTFINDER_GRP_LEGEND"));
            }

            var radius = 7;

            var force = d3.layout.force()
                .gravity(0.1)
                .distance(100)
                .charge(-500)
                .size([width, height]);
            var drag = d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);
        var container = svg.append("g");
        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
            force.start();
        }
        function dragged(d) { 
            d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y); }
        function dragended(d) { d3.select(this).classed("dragging", false); }
            
            svg.on("dblclick.zoom", null);
            svg.on("dblclick", function(){
                scale = 1;
                zoom.scale(1);
                zoom.translate([0, 0]);
                container.transition().duration(500).attr('transform', '');
                //zoom.translate([0, 0]);
                //container.transition().duration(500).attr('transform', 'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')')
                force.resume();
            });
            function zoomed() { 
                scale = d3.event.scale;
                if(scale > 1) {
                    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                } else {
                    container.attr("transform", "scale(" + d3.event.scale + ")");
                }
                force.resume();
            }

            function getPersonFromArray(personArray,personid) {
                for (var i=0;i<personArray.length;i++) {
                    var currentPerson = personArray[i];

                    if(currentPerson.id == personid) {
                        return currentPerson;
                    }  
                }
                return null;
            }

            function createGraph(experts) {
                var graph = {"nodes" : [], "links" : []};
                
                function addLink(source,target) {
                    var result = jQuery.grep(graph.links, function(e){ return e.source == source && e.target == target; });
                    
                    if(result.length === 0) {
                        graph.links.push({ source: source, target: target });
                        return graph.links[graph.links.length-1];
                    }
                    return result[0];
                }
                
                function addTag(tag_id,tag_name) {
                    var result = jQuery.grep(graph.nodes, function(e){ return e.tag_id == tag_id; });
                    
                    if(result.length === 0) {
                        graph.nodes.push({ NAME: tag_name, tag_id: tag_id, group: 0 });
                        return graph.nodes[graph.nodes.length-1];
                    }
                    return result[0];
                }
                
                function addPerson(person) {
                    var result = jQuery.grep(graph.nodes, function(e){ return e.person_id == person.ID; });
                    
                    if(result.length === 0) {
                        graph.nodes.push({ 
                            NAME: person.NAME,
                            PERSON_ID: person.ID,
                            EMAIL: person.EMAIL,
                            PHONE: person.PHONE,
                            MOBILE: person.MOBILE,
                            OFFICE: person.OFFICE,
                            group: 1,
                            x: 150,
                            y: 150,
                            RANK: person.RANK,
                            CORRELATION: person.CORRELATION});
                        return graph.nodes[graph.nodes.length-1];
                    }
                    return result[0];
                }
                
                jQuery.each(experts, function(index,currentExpert) {
                    var person = addPerson(currentExpert);
                    
                    jQuery.each(currentExpert.CORRELATION, function(index,currentCorrelation) {
                        var tag = addTag(currentCorrelation.TAG.ID, currentCorrelation.TAG.NAME);
                        var link = addLink(person,tag);
                    });
                    
                });
                
                return graph;
            }
            
            var graph = createGraph(this.getExperts());
            force.nodes(graph.nodes).links(graph.links).start();

            var link = container.selectAll(".sapUiInoExpertLink")
                .data(graph.links)
                .enter().append("line")
                .classed("sapUiInoExpertLink", true);

            var node = container.selectAll(".sapUiInoExpertNode")
                .data(graph.nodes)
                .enter().append("g")
                .attr("class", "sapUiInoExpertNode")
                .call(force.drag);
            
            var that = this;
            var selected_nodes = [];
            var selected_links = [];
            
            var nodes = node.append("circle")
              .attr("r",  function(d) { 
                  
                  if(d.group === 0) {
                      return 12;
                  } else {
                      if(radius + (5 / d.RANK) < 8) {
                          return 8;
                      } else {
                          return radius + (5 / d.RANK);
                      }
                  }})
              .style("cursor", function(d) { 
                  return d.group !== 0 ? "pointer" : "auto"; })
              .on("click", function(d,i) { 
                    if(d.group !== 0) {
                        if(selected_nodes.length > 0 || selected_links.length > 0 ) {
                            for(var i = 0; i < selected_nodes.length; i++) {
                                d3.select(selected_nodes[i]).classed("sapUiInoExpertGraphSelectedPerson", false);
                                d3.select(selected_nodes[i]).classed("sapUiInoExpertGraphSelectedTag", false);
                                d3.select(selected_nodes[i]).classed("sapUiInoExpertGraphSelectText", false);
                                d3.select(selected_nodes[i]).classed("sapUiInoExpertGraphHighlightLine", false);
                                d3.select(selected_nodes[i]).classed("apUiInoExpertGraphSelectedPerson", false);
                            }
                            selected_nodes = [];
                            
                            for(var i = 0; i < selected_links.length; i++) {
                                d3.select(selected_links[i]).classed("sapUiInoExpertGraphSelectLine", false);
                                d3.select(selected_links[i]).classed("sapUiInoExpertLink", true);
                            }
                            selected_links = [];
                        }
                        
                        var associated_nodeids = [];
                        
                        var associated_links = link.filter(function(l) {
                            if(l.source.index == d.index || l.target.index == d.index) {
                                associated_nodeids.push(l.source.index);
                                associated_nodeids.push(l.target.index);
                                return true;
                            } else {
                                return false;
                            }
                        });        
                        
                        var associated_nodes = node.filter(function(l) {
                            return (associated_nodeids.indexOf(l.index) >= 0);
                        });
                        
                        associated_links.each(function(dLink, iLink) {
                            selected_links.push(this);
                            d3.select(this).classed("sapUiInoExpertLink", false);
                            d3.select(this).classed("sapUiInoExpertGraphHighlightLine", false);
                            d3.select(this).classed("sapUiInoExpertGraphSelectLine", true);
                        });
                        
                        associated_nodes.each(function(dNode, iNode) {
                            selected_nodes.push(this.childNodes[0]);
                            selected_nodes.push(this.childNodes[1]);
                            d3.select(this.childNodes[1]).classed("sapUiInoExpertGraphSelectText", true);
                            if(dNode.group != 1) {
                                d3.select(this.childNodes[0]).classed("sapUiInoExpertGraphSelectedTag", true);
                            } else {
                                d3.select(this.childNodes[0]).classed("sapUiInoExpertGraphSelectedPerson", true);
                            }
                        });
                        
                        that.fireClickNode(d); }
            });
          
            node.append("text")
                .attr("dx", 14)
                .attr("dy", ".35em")
                .attr("x", - 0)
                .attr("y", function(d,i) { 
                    if(d.group == 0) {
                          return -12;
                      } else {
                        if(radius + (5 / d.RANK) < 8) {
                            return 8;
                        } else {
                            return radius + (5 / d.RANK);
                        }
                      }
                })
                .text(function(d) { return d.NAME; })
                .classed("sapUiInoExpertGraphText", true);
                
            node.each(function(dNode, iNode) {
                if(dNode.group != 0) {
                    d3.select(this).classed("sapUiInoExpertGraphPerson", true);
                } else {
                    d3.select(this).classed("sapUiInoExpertGraphTag", true);
                }
            });
            
            var touched_nodes = [];
            var touched_links = [];
            

            var getRadius = function(node) {
                if(node.group === 0) {
                      return 12;
                  } else {
                      if(radius + (10 / node.RANK) < 8) {
                          return 8;
                      } else {
                          return radius + (10 / node.RANK);
                      }
                  }
            };

            force.on("tick", function() {
                node.attr("cx", function(d) { 
                        //var width = oElement[0][0].scrollWidth;
                        var w = scale>1 ? width : width/scale;
                        d.x = Math.max(getRadius(d), Math.min(w - getRadius(d), d.x));
                        return d.x;   
                    }).attr("cy", function(d) { 
                        //var height = oElement[0][0].scrollHeight;
                        var h = scale>1 ? height : height/scale;
                        d.y = Math.max(getRadius(d), Math.min(h - getRadius(d), d.y));
                        return d.y;    
                    }).on("mouseover", function(d){
                        
                        var associated_nodeids = [];
        
                        var associated_links = link.filter(function(l) {
                            if(l.source.index == d.index || l.target.index == d.index) {
                                associated_nodeids.push(l.source.index);
                                associated_nodeids.push(l.target.index);
                                return true;
                            } else {
                                return false;
                            }
                        });        
                        
                        var associated_nodes = node.filter(function(l) {
                            return (associated_nodeids.indexOf(l.index) >= 0);
                        });
                        
                        associated_links.each(function(dLink, iLink) {
                            touched_links.push(this);
                            d3.select(this).classed("sapUiInoExpertLink", false);
                            d3.select(this).classed("sapUiInoExpertGraphHiglightLine", true);
                        });
                        
                        associated_nodes.each(function(dNode, iNode) {
                            touched_nodes.push(this.childNodes[0]);
                            touched_nodes.push(this.childNodes[1]);
                            d3.select(this.childNodes[0]).classed("sapUiInoExpertGraphHiglightCircle", true);
                            d3.select(this.childNodes[1]).classed("sapUiInoExpertGraphHiglightText", true);
                        });
                        
                        
                        that.fireMouseOverNode(d);})
                    .on("mouseout", function(d){
                        
                        for(var i = 0; i < touched_nodes.length; i++) {
                            d3.select(touched_nodes[i]).classed("sapUiInoExpertGraphHiglightCircle", false);
                            d3.select(touched_nodes[i]).classed("sapUiInoExpertGraphHiglightText", false);
                            d3.select(touched_nodes[i]).classed("sapUiInoExpertGraphHiglightLine", false);
                        }
                        touched_nodes = [];
                        
                        for(var i = 0; i < touched_links.length; i++) {
                            var result = jQuery.grep(selected_links, function(e) {
                                return e === touched_links[i];
                            });
                            
                            if(result.length === 0) {
                                d3.select(touched_links[i]).classed("sapUiInoExpertLink", true);
                            }
                            
                        }
                        touched_links = [];
                        
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
                var width = oElement[0][0].scrollWidth;
                var height = oElement[0][0].scrollHeight;
                
                svg.attr("width",width).attr("height",height);
                force.size([width,height]).resume();
            }
            d3.select(window).on('resize', resize);
            
            var xTransform = 0;
            var iRectWidth = container.node().getBoundingClientRect().width;
        }
    });
})();