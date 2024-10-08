sap.ui.define(["sap/ui/core/Control","sap/suite/ui/microchart/ColumnMicroChart","sap/suite/ui/microchart/AreaMicroChart","sap/suite/ui/microchart/ComparisonMicroChart","sap/suite/ui/microchart/HarveyBallMicroChart","sap/suite/ui/microchart/RadialMicroChart"],function(C,c,A,d,H,R){"use strict";var m=["Good","Error","Critical","Neutral"];return C.extend("sap.ino.controls.ReportMicroChart",{metadata:{properties:{chartType:{type:"string",defaultValue:"Column"}},aggregations:{_chart:{multiple:false,visibility:"hidden"}},events:{}},init:function(){sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");},_createChart:function(){var o;switch(this.getProperty("chartType")){case"Column":o=new c();break;case"Area":o=new A({width:"160px",height:"120px"});break;case"Comparison":o=new d();break;case"HarveyBall":o=new H({total:100,totalScale:" ",showFractions:true});break;case"Radial":o=new R();break;default:o=new c();break;}return o;},addChartItems:function(D,t){var o=this.getAggregation("_chart");var M=t.Chart.Type;this.getAggregation("_chart").setTooltip(this._createChartTooltip(D,t));switch(M){case"Column":jQuery.each(D,function(I,a){o.addColumn(new sap.suite.ui.microchart.ColumnMicroChartData({color:m[I%4],label:a[t.Dimensions[0]],value:a[t.Measures[0]]}));});break;case"Area":var e=new sap.suite.ui.microchart.AreaMicroChartItem({color:"Good"});var x=100/D.length;jQuery.each(D,function(I,a){e.addPoint(new sap.suite.ui.microchart.AreaMicroChartPoint({x:x*I,y:a[t.Measures[0]]}));});o.addLine(e);break;case"Comparison":jQuery.each(D,function(I,a){o.addData(new sap.suite.ui.microchart.ComparisonMicroChartData({color:m[I%4],title:a[t.Dimensions[0]],value:a[t.Measures[0]]}));});break;case"HarveyBall":var T=0;jQuery.each(D,function(I,a){o.addItem(new sap.suite.ui.microchart.HarveyBallMicroChartItem({color:"Good",fractionLabel:a[t.Dimensions[0]],fraction:a[t.Measures[0]],fractionScale:" "}));T+=a[t.Measures[0]];});if(T){o.setTotal(T);}break;case"Radial":var r=0;jQuery.each(D,function(I,a){r+=a[t.Measures[0]];});o.setTotal(r);o.setFraction(D[0][t.Measures[0]]);o.setValueColor("Good");break;case"TopList":D.sort(function(a,b){return b[t.Measures[0]]-a[t.Measures[0]];});var f=D.length<3?D.length:3;for(var i=0;i<f;i++){o.addColumn(new sap.suite.ui.microchart.ColumnMicroChartData({color:m[i%4],label:D[i][t.Dimensions[0]],value:D[i][t.Measures[0]]}));}break;default:jQuery.each(D,function(I,a){o.addColumn(new sap.suite.ui.microchart.ColumnMicroChartData({color:m[I%4],label:a[t.Dimensions[0]],value:a[t.Measures[0]]}));});break;}},_createChartTooltip:function(D,t){var T="";if(t.Content==="TopList"){D.sort(function(a,b){return b[t.Measures[0]]-a[t.Measures[0]];});var e=D.length<3?D.length:3;for(var i=0;i<e;i++){T+=D[i][t.Dimensions[0]]+" "+D[i][t.Measures[0]];T+=(i!==e-1)?"\n":"";}}else{jQuery.each(D,function(I,r){T+=r[t.Dimensions[0]]+" "+r[t.Measures[0]];T+=(I!==D.length)?"\n":"";});}return T;},renderer:function(r,o){o.setAggregation("_chart",o._createChart());r.write("<div");r.writeControlData(o);r.writeClasses();r.write(">");r.renderControl(o.getAggregation("_chart"));r.write("</div>");}});});
