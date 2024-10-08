/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/thirdparty/d3"
],function(Control, d3) {
    'use strict';
    return Control.extend("sap.ino.controls.Milestone", {
        metadata: {
            properties: {
                "Id": {
                    type: "int"
                },
                "tasks": {
                    type: "array"
                },
                "visible": {
                    type: "boolean"
                },
                "max-point": {
                    type: 'int'   
                }
            },
            aggregations: {
                
            },
            events: {
                
            }
        },
        init: function() {
             this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
        },
        
        controlConfig: {
            // it's the milestone default setting .
            width: '900',
            height:'300',
            maxPoints: 2,
            defaultThemeColor:'E50082',
            defaultFontColor: '666666',
            fontSizeX: 14,
            fontSizeM: 12,
            fontSizeS: 10,
            defaultBarColor: '5f95c2',
            defaultBgColor: 'f3f3f3',
            barHeight: 20,
            gap: 60,
            topPadding: 5,
            bottomPadding: 15,
            sidePadding: 150,
            outPadding: 200,
            labelMaxLength: 18,
            milestoneMaxLength: 220,
            milestoneNameMaxFactorLength: 30,
            minWidth: 768,
            normalWidth :800
        },
    
        nowTime:  new Date().getTime(),
        
        onAfterRendering: function(){
            // milestone 
            this.handleInfinity();
            this.dataMixin();
            this.resetting();
            this.initSVG();
            this.drawMileStone();
        },
        
        resetting: function(){
            $.extend(this.controlConfig, {
                width: this.getParent().$().width() * 0.95,
                height: this.getProperty('tasks') && this.getProperty('tasks').length * 100 + 10
            });
        },
        
        initSVG: function(){
            var tasks = this.getProperty('tasks');
            if(this.controlConfig.width < this.controlConfig.minWidth){
                return d3.selectAll(".mile-stone-svg").style({'display':'none'});
            }
            this.svg = d3.selectAll(".mile-stone-svg")
                .style({'display': 'block'})
                .append("svg")
                .attr("width", this.controlConfig.width)
                .attr("height", this.controlConfig.height)
                .attr("class", "svg-content");
            this.timeScale = d3.time.scale()
                .domain([d3.min(tasks, function(d) { 
                            return d.START_DATE; }),
                        d3.max(tasks, function(d) { 
                            return d.END_DATE; })
                ])
                .range([0, this.controlConfig.width - this.controlConfig.outPadding]);
        },
        
        _mileStoneMerge: function(scope){
            //prototype of milestone merge point 
            this.MILESTONE_NAME = '...';
            this.MILESTONE_DATE = undefined;
            this.MILESTONE_MERGE = [];
            this.MILESTONE_COLOR_CODE = scope.controlConfig.defaultThemeColor;
            this.MILESTONE_IS_MERGE = true;
            this.IS_MILESTONE_DISPLAY = true;
        },
        
        _timeSort: function(a, b){
            return a.MILESTONE_DATE.getTime() - b.MILESTONE_DATE.getTime();
        },

        _isClean: function(task){
            return task.END_DATE.getFullYear() < 9999;
        },

        _isInfinity: function(task){
            return task.END_DATE.getFullYear() === 9999;
        },

        _isShowTask: function(task){
            return !!task.IS_TASK_DISPLAY;
        },

        _isShowMilestone: function(milestone){
              return !!milestone.IS_MILESTONE_DISPLAY;
        },

        handleInfinity: function(){
            var self = this;
            // read source data ;
            var source = this.getProperty('tasks') && this.getProperty('tasks').sort(function(a,b){return a.SEQUENCE_NO - b.SEQUENCE_NO;});
            // clean data , remove not display task ;
            var tasks = source.filter(this._isShowTask);
            if(!tasks && !tasks.length){
                return false;
            }
            tasks.forEach(function(item){
                // clean data, remove not display milestone.
                item.Milestones = item.Milestones.filter(self._isShowMilestone);
            });
            
            // filter normal task group ;
            var cleanGroup = tasks.filter(this._isClean);
            // filter infinity task group ;
            var infinityGroup = tasks.filter(this._isInfinity);
            var allMilestone = [], buildTask = [];
            var now = new Date(this.nowTime);
            
            // if infinity group does not exist , return source data ;
            if(!infinityGroup || !infinityGroup.length){
                return this.setProperty('tasks', tasks);
            }
            tasks.forEach(function(value){
                // group all milestone .
                allMilestone = allMilestone.concat(value.Milestones);
            });
            
            // select max time of all milestones ;
            var maxMilestone = allMilestone.length && d3.max(allMilestone, function(v) { return v.MILESTONE_DATE;});
            
            // select max time of task end date ;
            var maxTaskEndDate = cleanGroup && cleanGroup.length && d3.max(cleanGroup, function(v) { return v.END_DATE;});
            
            // Replace infinity date of infinity gourp ;
            infinityGroup.forEach(function(value){
                if(!maxMilestone && !maxMilestone){
                    value.END_DATE = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
                }
                if(maxMilestone && maxTaskEndDate){
                    var maxEndDate = maxMilestone.getTime() > maxTaskEndDate.getTime() ?  maxMilestone : maxTaskEndDate;
                    value.END_DATE = new Date(maxEndDate);
                }
                if(maxMilestone && !maxTaskEndDate){
                    value.END_DATE = new Date( maxMilestone.getTime() * 1.01);
                }
                if(!maxMilestone && maxTaskEndDate){
                    value.END_DATE = new Date( maxTaskEndDate.getTime() * 1.01);
                }
                value.IS_INFINITY = true;
            });
            
            // build clean group and infinity group ;
            buildTask = cleanGroup.concat(infinityGroup);
            
            this.setProperty('tasks', buildTask.sort(function(a,b){return a.SEQUENCE_NO - b.SEQUENCE_NO;}));
        },

        dataMixin: function(){
            var source = this.getProperty('tasks');
            if(!source){
                return false ;
            }
            // var self = this;
            var now = this.nowTime, task, point, nextPoint, prePoint;
            var maxPoints = this.controlConfig.maxPoints;
            var config = this.controlConfig;
            for(var i = 0; i < source.length; i++){
                task = source[i];
                task.TASK_INDEX = i;
                task.LINEGAP = 0;
                task.left = [];
                task.right = [];
                this.getTemplateText(task);
                if(!task.Milestones || !task.Milestones.length){
                    continue;
                }
                task.Milestones.sort(this._timeSort);
                for(var x = 0; x < task.Milestones.length; x++){
                    point = task.Milestones[x];
                    nextPoint = task.Milestones[x + 1];
                    prePoint = task.Milestones[x - 1];
                    
                    point.INDEX = i;
                    point.yAxis = 0;
                    if(point.MILESTONE_IS_MERGE){
                        task.HAS_MERGE = true;
                    }
                    if(nextPoint){
                        point.NEXT = nextPoint.MILESTONE_DATE;    
                    }else{
                        point.NEXT = task.END_DATE;
                    }
                    if(prePoint){
                        point.PRE = prePoint.MILESTONE_DATE;    
                    }else{
                        point.PRE = task.START_DATE;
                    }
                    
                    // if milestone color is not defined . set default color . 
                    if(!point.MILESTONE_COLOR_CODE){
                        point.MILESTONE_COLOR_CODE = config.defaultThemeColor;    
                    }
                    
                    // spite today brefore and today after ;
                    if(point.MILESTONE_DATE.getTime() <= now ){
                        task.left.push(point);
                    }
                    if(point.MILESTONE_DATE.getTime() > now){
                        task.right.push(point);
                    }
                }
                // if milestones number of task  greater than max point number , then merge point .
                if(task.left.length > maxPoints && !task.HAS_MERGE){
                    this._mergeToLeft(task.left);
                }
                if(task.right.length > maxPoints  && !task.HAS_MERGE){
                    this._mergeToRight(task.right);
                }
    
                // build today before group and today after group;
                task.Milestones = task.left.concat(task.right);
            }
            this.setProperty('tasks', source);
        },
        
        getTemplateText: function(task){
            if(!task){
                return false;
            }
            var self = this;
            $.extend(task, {
                TEMPLATE_TEXT:{
                    TASK: self._oRB.getText('MILESTONE_TASK'),
                    START: self._oRB.getText('MILESTONE_START'),
                    END: self._oRB.getText('MILESTONE_END'),
                    INFINITY: self._oRB.getText('MILESTONE_INFINITY')
                }
            });
        },
        
        _mergeToLeft: function(arr){
            if(!arr) {
                return false ;
            }
            // create a merge milestone point ;
            var left = new this._mileStoneMerge(this);
            var taskIndex = arr[0].INDEX;
            var maxPoints = this.controlConfig.maxPoints;
            var taskArray = this.getProperty('tasks');
            for(var i = 0; i < arr.length; i ++ ){
                // push merge milestone to merge milestone point . 
                if(i < arr.length - maxPoints){
                    left.MILESTONE_MERGE.push(arr[i]);    
                }
            }
            // set merge milestone point date .
            left.MILESTONE_DATE = taskArray[taskIndex].START_DATE;
            left.INDEX = taskIndex;
            left.NEXT = taskArray[taskIndex].Milestones[arr.length - maxPoints].NEXT;
            arr[arr.length - maxPoints].PRE = left.MILESTONE_DATE;
            
            // delete is merged milestone point , and push merge milestone point to today before group ;
            arr.splice(0, arr.length - maxPoints, left);
        },
    
        _mergeToRight: function(arr){
            if(!arr) { 
                return false ;
            }
            // create a new milestone point ;
            var right = new this._mileStoneMerge(this);
            var taskIndex = arr[0].INDEX;
            var maxPoints = this.controlConfig.maxPoints;
            var taskArray = this.getProperty('tasks');
            for(var i = 0; i < arr.length; i ++ ){
                 // push merge milestone to merge milestone point . 
                if(i + 1 > maxPoints){
                    right.MILESTONE_MERGE.push(arr[i]);
                }
            }
             // set merge milestone point date .
            right.MILESTONE_DATE = taskArray[taskIndex].END_DATE;
            right.INDEX = taskIndex;
            right.NEXT = taskArray[taskIndex].Milestones[arr.length - maxPoints].NEXT;
            right.PRE = arr[maxPoints - 1].MILESTONE_DATE;
            
             // delete merged milestone point , and push merge milestone point to today after group ;
            arr.splice(maxPoints , arr.length - maxPoints, right);
        },
        
         _getTextWidth: function(text, textSize) {
            var config = this.controlConfig;
            var textSize = textSize || config.fontSizeM;
            
            //creat a new temporary element to store the text
            var spanElement = document.createElement("span");
            document.body.appendChild(spanElement);
            
            var svg = d3.select(spanElement).append("svg");
            var textSVG = svg.append("text").text(text)
                .attr("style", "font-size:" + textSize + "px");
            var bBox = textSVG.node().getBBox();
            // remove the temp element
            spanElement.parentNode.removeChild(spanElement);
            
            return bBox.width > config.milestoneMaxLength ? config.milestoneMaxLength : Math.round(bBox.width);
        },
        
        // draw milestone 
        drawMileStone: function(){
            var categories = new Array();
            var taskArray = this.getProperty('tasks');
            var width = this.controlConfig.width;
            var height = this.controlConfig.height;
            var minWidth = this.controlConfig.minWidth;
            
            if(width < minWidth){
                return false;
            }
            
            if(!taskArray || !taskArray.length){
                return false;
            }
            
            for (var i = 0; i < taskArray.length; i++) {
                categories.push(taskArray[i].TASK_NAME);
            }
        
            this.categories = categories;
            
            this.makeGant(taskArray, width, height);
        },
        
        makeGant: function(tasks, pageWidth, pageHeight) {
            var config = this.controlConfig;

            var barHeight = config.barHeight;
            var gap = config.gap;
            var topPadding = config.topPadding;
            var sidePadding = config.sidePadding;
    
            this.drawRects(tasks, gap, topPadding, sidePadding, barHeight, pageWidth, pageHeight);
            this.vertLabels(gap, topPadding);
        },
            
        drawRects: function(theArray, theGap, theTopPad, theSidePad, theBarHeight, w, h) {
            var svg = this.svg;
            var that = this;
            var timeScale = this.timeScale;
            var nowTime = this.nowTime;
            var config = this.controlConfig;
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({style: "medium"}); 
            var maxTime = d3.max(theArray, function(value) { return value.END_DATE;});
            var minTime = d3.min(theArray, function(value) { return value.START_DATE;});
            
            if(!svg || !svg.length){
                return false;
            }
            
            var bigRects = svg.append("g")
                .selectAll(".bar")
                .data(theArray)
                .enter()
                .append("rect");

            var rectangles = svg.append('g')
                .selectAll(".bar")
                .data(theArray)
                .enter();
                
            // draw the vertical current time line
            if(nowTime < maxTime && nowTime > minTime){
                var currentLine = rectangles.append('line')
                .attr('class','now')
                .attr('x1', function(){
                    var today = nowTime < maxTime ? nowTime : maxTime; 
                    return timeScale(new Date(today)) + theSidePad;
                })
                .attr('y1', theTopPad)
                .attr('x2', function(){
                    var today = nowTime < maxTime ? nowTime : maxTime; 
                    return timeScale(new Date(today)) + theSidePad;
                })
                .attr('y2', function(){
                    return theArray.length * config.gap + theTopPad + 15;
                })
                .attr('stroke',  '#' + config.defaultThemeColor);
                var currentText = rectangles.append('text')
                    .text(function(){
                        var sToday = oDateFormat.format(new Date(nowTime));
                        return  that._oRB.getText('MILESTONE_TODAY') + ': ' +  sToday;
                    })
                    .attr('class', 'now-date')
                    .attr('x', function(){
                        var today = nowTime < maxTime ? nowTime : maxTime; 
                        return timeScale(new Date(today)) + theSidePad ;
                    })
                    .attr('y', function(){
                       return theArray.length * 90 + theTopPad + 15;
                    })
                    .attr("font-size", config.fontSizeX)
                    .attr("text-height", theBarHeight)
                    .attr("fill", '#' + config.defaultThemeColor)
                    .attr('text-anchor', function(){
                        var interval = timeScale(new Date(maxTime)) - timeScale(new Date(nowTime));
                        var textWidth = this.textContent.length * config.fontSizeX;
                        if(interval - textWidth > 0) {
                            return 'start';
                        }
                        return 'end';
                    });
            }
                
            var innerPonits = rectangles.append('g')
                .attr('class', 'points')
                .selectAll(".point")
                .data(function(d){
                    return d.Milestones;
                })
                .enter();
                
            //set white rectangle background to each milestone names to avoid the names overlapped by the vertical current line 
            var milestoneBG = innerPonits.append('rect')
                .attr("x", function(d) {
                    return timeScale(d.MILESTONE_DATE) + theSidePad + 10;
                })
                .attr("y", function(d, i) {
                    var normalAxis =  d.INDEX * theGap + theTopPad + theBarHeight + config.fontSizeM * 1.4;
                    var isLineGap = true;
                    if(d.INDEX > 0){normalAxis = that.getLineGapYAxis(d.INDEX, normalAxis, theArray);}
                    return that.setPointYAxis(d, i, normalAxis, isLineGap) - config.fontSizeM + 2;
                })
                .attr('width', function(d){
                    if(d.MILESTONE_IS_MERGE){
                        return 12;
                    }
                    var nameWidth = that._getTextWidth(d.MILESTONE_NAME, config.fontSizeM);
                    return timeScale(maxTime) - timeScale(d.MILESTONE_DATE) < nameWidth ?  timeScale(maxTime) - timeScale(d.MILESTONE_DATE) : nameWidth;
                })
                .attr('height', function(){
                    return config.fontSizeM; 
                })
                .attr("fill", '#FFFFFF');
              
    
            var milestoneName = innerPonits.append('text')
                .attr('class', 'point-text')
                .text(function(d){
                    if(config.width < config.minWidth){
                        return '...';
                    }
                    if(!d.NEXT) {
                        return d.MILESTONE_NAME;    
                    }

                    var endInterval = timeScale(maxTime) - timeScale(d.MILESTONE_DATE);
                    var textWidth = that._getTextWidth(d.MILESTONE_NAME, config.fontSizeM) + 15;
                    //handle the case when milestone is close to max time
                    if(endInterval < textWidth){
                        // To calculate the length of each local factor
        				var localTextFactor = Math.round(that._getTextWidth(d.MILESTONE_NAME, config.fontSizeM) / d.MILESTONE_NAME.length);
        				// To calculate the number of factors can hold till the end of bar
        				var localLengthText = Math.floor(endInterval / localTextFactor);
        				
        				if(d.MILESTONE_NAME.length > localLengthText + 8){
        				    var localMaxLengthText = localLengthText + 8;
        				    var text = d.MILESTONE_NAME.slice(0, localMaxLengthText);
                            return text + '...';
        				} else{
        				    var text = d.MILESTONE_NAME;
        				    return text;
        				}
                    }
                    //handle the case when name of milestone is too long
                    if(d.MILESTONE_NAME.length <= config.milestoneNameMaxFactorLength) {
                        return d.MILESTONE_NAME;
                    } else {
                        // cut the original text to the max number of factors can hold till the end of bar
                        var text = d.MILESTONE_NAME.slice(0 , config.milestoneNameMaxFactorLength - 1); 
                        return text + '...';
                    } 

                })
                .attr("x", function(d) {
                    return timeScale(d.MILESTONE_DATE) + theSidePad + 10;
                })
                .attr("y", function(d, i) {
                    var normalAxis =  d.INDEX * theGap + theTopPad + theBarHeight + config.fontSizeM * 1.4;
                    // var isLineGap = true;
                    if(d.INDEX > 0){normalAxis = that.getLineGapYAxis(d.INDEX, normalAxis, theArray);}
                    d.yAxis = that.setPointYAxis(d, i, normalAxis);
                    return  d.yAxis;
                })
                .attr("font-size", function(d){
                    return d.MILESTONE_IS_MERGE ? config.fontSizeX : config.fontSizeM ;
                })
                .attr("text-anchor", "start")
                .attr("text-height", theBarHeight)
                .attr("fill", function(d){
                    return d.MILESTONE_IS_MERGE ? '#' + config.defaultThemeColor : '#' + config.defaultFontColor ;
                });    
            
            var pointItem = innerPonits.append('rect')
                .attr('class', 'point')
                .attr('rx', 2)
                .attr('ry', 2)
                .attr('width', 10)
                .attr('height', 10)
                .attr("x", function(d) {
                    return timeScale(d.MILESTONE_DATE) + theSidePad;
                })
                .attr("y", function(d) {
                    return d.yAxis - config.fontSizeM;
                })
                .attr("fill", function(d) {
                    return  '#' + d.MILESTONE_COLOR_CODE ;
                })
                .attr("stroke", "none")
                .attr('transform', function(){
                    return 'rotate(45 ' + this.getAttribute('x') + ' ' + this.getAttribute('y') + ')';
                });
                
            var backgroundBar = rectangles.append("rect")
                .attr('class', 'backgroundBar')
                .attr("rx", 10)
                .attr("ry", 10)
                .attr("x", config.sidePadding)
                .attr("y", function(d, i) {
                    var taskYAsix = i * theGap + theTopPad;
                    if(i > 0){taskYAsix = that.getLineGapYAxis(i, taskYAsix, theArray);}
                    return taskYAsix;
                })
                .attr("width", function(){
                    return timeScale(maxTime);
                })
                .attr("height", theBarHeight)
                .attr("stroke", "none")
                .attr("fill",'#' + config.defaultBgColor);
    
            var innerRects = rectangles.append("rect")
                .attr('class', 'bar')
                .attr("rx", 10)
                .attr("ry", 10)
                .attr("x", function(d) {
                    return timeScale(d.START_DATE) + theSidePad;
                })
                .attr("y", function(d, i) {
                    var taskYAsix = i * theGap + theTopPad;
                    if(i > 0){taskYAsix = that.getLineGapYAxis(i, taskYAsix, theArray);}
                    return taskYAsix;
                })
                .attr("width", function(d) {
                    return timeScale(d.END_DATE) - timeScale(d.START_DATE);
                })
                .attr("height", theBarHeight)
                .attr("stroke", "none")
                .attr("fill", function(d) {
                    return '#' + (d.TASK_COLOR_CODE || config.defaultBarColor);
                });
            
            var passed = rectangles.append('rect')
                .attr('class', 'passed')
                .attr("rx", 10)
                .attr("ry", 10)
                .attr("x", function(d) {
                    return timeScale(d.START_DATE) + theSidePad;
                })
                .attr("y", function(d, i) {
                    var taskYAsix = i * theGap + theTopPad;
                    if(i > 0){taskYAsix = that.getLineGapYAxis(i, taskYAsix, theArray);}
                    return taskYAsix;
                })
                .attr("width", function(d) {
                    var endDate = timeScale(d.END_DATE);
                    var today = timeScale(new Date(nowTime));
                    var maxLength = today < endDate ? today : endDate;
                    var drawLength = maxLength - timeScale(d.START_DATE) > 0 ? maxLength - timeScale(d.START_DATE) : 0;  
                    return drawLength;
                })
                .attr("height", theBarHeight)
                .attr("stroke", "none")
                .attr("fill", "#ffffff")
                .attr('opacity', 0.5);
            
            // complete the vertical current time-line which overlapped by task bar
            if(nowTime < maxTime && nowTime > minTime){
                var addLine = rectangles.append('line')
                .attr('class','now')
                .attr('x1', function(){
                    var today = nowTime < maxTime ? nowTime : maxTime; 
                    return timeScale(new Date(today)) + theSidePad;
                })
                .attr("y1", function(d, i) {
                    var taskYAsix = i * theGap + theTopPad;
                    if(i > 0){taskYAsix = that.getLineGapYAxis(i, taskYAsix, theArray);}
                    return taskYAsix;
                })
                .attr('x2', function(){
                    var today = nowTime < maxTime ? nowTime : maxTime; 
                    return timeScale(new Date(today)) + theSidePad;
                })
                .attr("y2", function(d, i) {
                    var taskYAsix = i * theGap + theTopPad;
                   if(i > 0){taskYAsix = that.getLineGapYAxis(i, taskYAsix, theArray);}
                    return taskYAsix + theBarHeight;
                })
                .attr('stroke',  '#' + config.defaultThemeColor);
            }
            
            //reset the length of current line
            if(nowTime < maxTime && nowTime > minTime){
                currentLine.attr('y2', function(){
                    var yAsix = theArray.length * theGap + theTopPad + 20;
                    for(var k = 0;k < theArray.length; k++){
                        yAsix += theArray[k].LINEGAP;
                    }
                    return yAsix;
                });
                currentText.attr('y', function(){
                    var yAsix = theArray.length * theGap + theTopPad + 20;
                    for(var k = 0;k < theArray.length; k++){
                        yAsix += theArray[k].LINEGAP;
                    }
                    return yAsix;
                });
                
            }
            //reset the height of the whole svg picture
            var yAsix = theArray.length * theGap + theTopPad;
            for(var k = 0;k < theArray.length; k++){
                yAsix += theArray[k].LINEGAP;
            }
            svg.attr('height',yAsix + config.bottomPadding);
            
            innerRects.on('mouseenter', this.showPopUp).on('mouseleave', this.hidePopUp);
            passed.on('mouseenter', this.showPopUp).on('mouseleave', this.hidePopUp);
    
            pointItem.on('click', this.showMileStone);
            
            d3.select('.mile-stone-screen-cover').on('click', this.hideMileStone);
    
        },
        
        getLineGapYAxis: function(i, normal, theArray){
            var normalAxis =  normal;
            for(var j = i - 1; j >= 0; j--){ 
                normalAxis += theArray[j].LINEGAP; 
            }
            return normalAxis;
        },
        
        // set yAxis of every milestone with new line considered
        setPointYAxis: function(obj, i ,normal, isLineGap){
            var tasks = this.getProperty('tasks');
            var timeScale = this.timeScale;
            var config = this.controlConfig;
            var pointGap = timeScale(obj.MILESTONE_DATE) - timeScale(obj.PRE);
            var normalAxis =  normal;
            var prePoint = tasks[obj.INDEX].Milestones[i - 1] || undefined;
            var preYAxis = prePoint ? prePoint.yAxis : normalAxis;
            obj.yAxis = normalAxis; 
            //if two neighbor milestones are too close, new line is necessary 
            if(prePoint && pointGap < this._getTextWidth(prePoint.MILESTONE_NAME, config.fontSizeM) + 15){
                obj.yAxis = preYAxis + config.fontSizeM * 1.4; 
                //if yAixs of the new line is larger than previous milestone, then add the LINEGAP variable.
                if(isLineGap){
                    for(var k = i - 1; k >= 0; k--) {
                        if(tasks[obj.INDEX].Milestones[k].yAxis >= obj.yAxis){
                            continue;
                        }else{
                            tasks[obj.INDEX].LINEGAP +=  config.fontSizeM * 1.4;
                            break;
                        }
                    }
                }
                
            }
            return  obj.yAxis;  
        },
        
        vertLabels: function(theGap, theTopPad) {
            var prevGap = 0;
            var svg = this.svg;
            var taskArray = this.getProperty('tasks');
            var categories = this.categories;
            var config = this.controlConfig;
            var textParts = [];
         
            /**TODO: handle overflow task name**/
            for (var i = 0; i < categories.length; i++) {
                var bLineBreak = false;
                if(categories[i].length > config.labelMaxLength){
                    textParts = categories[i].split(" ") || [];
                    for (var k = 0; k < textParts.length; k++) {
                        //if single parts of the text are too small add them back together
                        if(textParts[k + 1]){
                        var tempTexts = textParts[k] + " " + textParts[k + 1];
                            if (tempTexts.length < config.labelMaxLength){
                                textParts[k] = textParts[k] + " " + textParts[k + 1];
                                textParts.splice(k + 1, 1);
                                k--;
                            }
                        }
                    }
                    bLineBreak = true;
                }
                
                var taskYAsix = i * theGap + theTopPad + 15;
                if(i > 0){ 
                    for(var j = i - 1; j >= 0; j--){ 
                        taskYAsix += taskArray[j].LINEGAP; 
                    } 
                }
                
                if (bLineBreak) {
                //if there are line breaks, it is necessary to create tspan elements
                    var textSVG = this.svg.append("g") 
                        .append("text")
                        .attr('class', 'milestone-label')
                        .attr("font-size", config.fontSizeM)
                        .attr("text-anchor", "start")
                        .attr("text-height", config.fontSizeX)
                        .attr('fill', '#' + config.defaultFontColor);
                        
                    var iLines = textParts.length;
                    //if task name needs longer than three lines to display, reserve the first three lines and add '...' in the end
                    if(iLines > 3){
                        textParts = textParts.slice(0,3);
                        textParts[2] += '...'; 
                    }
    
                   for (var k = 0; k < iLines; k++) {
                        textSVG.append("tspan").text(textParts[k])
                            .attr("x", 20)
                            .attr("y", taskYAsix + k * config.fontSizeX); 
                    }
                    
            } else {
                var textSVG = this.svg.append("g") 
                    .append("text")
                    .text(categories[i])
                    .attr('class', 'milestone-label')
                    .attr("font-size", config.fontSizeM)
                    .attr("text-anchor", "start")
                    .attr("text-height", config.fontSizeX)
                    .attr('fill', '#' + config.defaultFontColor)
                    .attr("x", 20)
                    .attr("y", taskYAsix);
                }
            }
        },
        
        
        showPopUp: function(){
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({style: "medium"}); 
            var data = d3.select(this).data()[0];
            var output = document.getElementsByClassName("mile-stone-tag")[0];
    
            if(output.style.display === "block"){
                return false;
            }
    
            var x = (this.x.animVal.value + this.width.animVal.value / 2) + "px";
            var y = this.y.animVal.value + 40 + "px";
            
            var start, end;
            
            switch(data.DATE_TYPE_CODE){
                case 'MONTH':
                    start = data.START_MONTH + '  ' + data.START_YEAR;
                    end =  data.END_MONTH + '  ' + data.END_YEAR;
                    break;
                case 'YEAR':
                    start = data.START_YEAR;
                    end =  data.END_YEAR;
                    break;
                case 'DAY':
                    start = oDateFormat.format(data.START_DATE);
                    end = oDateFormat.format(data.END_DATE);
                    break;
                case 'QUARTER':
                    start = data.START_QUARTER + '  ' +  data.START_YEAR;
                    end = data.END_QUARTER + '  ' +  data.END_YEAR;
                    break;
                default:
                
                    break;
            }
            
            if(data.IS_INFINITY){
                end = data.TEMPLATE_TEXT.INFINITY;
            }
            var tag = "<span class='mile-stone-task'>" + data.TEMPLATE_TEXT.TASK + data.TASK_NAME +  "</span>" +  "<br/>" +
                    "<span class='mile-stone-task'>" +  data.TEMPLATE_TEXT.START + start +  "</span>" +  "<br/>" +
                    "<span class='mile-stone-task'>" +  data.TEMPLATE_TEXT.END + end + "</span>";
           
            output.innerHTML = tag;
            output.style.top = y;
            output.style.left = x;
            output.style.display = "block";
            d3.select('.svg-content').on('click', this.hideMileStone);
        },
    
        hidePopUp: function(){
            var output = document.getElementsByClassName("mile-stone-tag")[0];
            
            if(output.style.display === "none"){
                return false;
            }
            output.style.display = "none";
        },
    
        showMileStone: function(){
            var tag ,data = d3.select(this).data()[0];
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({style: "medium"}); 
            var output = document.getElementsByClassName("mile-stone")[0];
            
            if(output.style.display === "block"){
                return false;
            }
    
            var x = (this.x.animVal.value + this.width.animVal.value / 2) + "px";
            var y = this.y.animVal.value + 40 + "px";
            var milestoneDate;
            if(!data.MILESTONE_MERGE || !data.MILESTONE_MERGE.length){
                switch (data.DATE_TYPE_CODE){
                    case 'MONTH':
                        milestoneDate = data.MILESTONE_MONTH + '  ' + data.MILESTONE_YEAR; 
                        break;
                    case 'YEAR':
                        milestoneDate = data.MILESTONE_YEAR;
                        break;
                    case 'DAY':
                        milestoneDate = oDateFormat.format(data.MILESTONE_DATE);
                        break;
                    case 'QUARTER':
                        milestoneDate = data.MILESTONE_QUARTER + '  ' +  data.MILESTONE_YEAR;
                        break;
                    default :
                    
                        break;
                }
                tag = "<p><span class='tag-point' style='background:#" + data.MILESTONE_COLOR_CODE + "'></span><span style='color:#" + data.MILESTONE_COLOR_CODE + "'>" + milestoneDate + "</span></p>" +
                  "<p class='mile-stone-date'>" + data.MILESTONE_NAME  + "</p>";
            }
            if(data.Attachment && data.Attachment.length){
                for(var i = 0; i < data.Attachment.length;i++){
                 
                tag += '<a class="mile-stone-attachment" target="_blank" rel="' + data.Attachment[i].LABEL + '" href="' + data.Attachment[i].ATTACHMENT_URL + '">' + data.Attachment[i].LABEL + '</a>';
                    
                }
            }
            if(data.MILESTONE_MERGE && data.MILESTONE_MERGE.length){
                tag = '';
                for(var i = 0; i < data.MILESTONE_MERGE.length; i ++){
                    switch(data.MILESTONE_MERGE[i].DATE_TYPE_CODE){
                        case 'MONTH':
                            milestoneDate = data.MILESTONE_MERGE[i].MILESTONE_MONTH + '  ' + data.MILESTONE_MERGE[i].MILESTONE_YEAR;
                            break;
                        case 'YEAR':
                            milestoneDate = data.MILESTONE_MERGE[i].MILESTONE_YEAR;
                            break;
                        case 'DAY':
                            milestoneDate = oDateFormat.format(data.MILESTONE_MERGE[i].MILESTONE_DATE);
                            break;
                        case 'QUARTER':
                            milestoneDate = data.MILESTONE_MERGE[i].MILESTONE_QUARTER + '  ' +  data.MILESTONE_MERGE[i].MILESTONE_YEAR;
                            break;
                        default:
                        
                            break;
                    }

                    tag += "<p><span class='tag-point' style='background:#" + data.MILESTONE_MERGE[i].MILESTONE_COLOR_CODE + "'></span><span style='color:#" + data.MILESTONE_MERGE[i].MILESTONE_COLOR_CODE + "'>" + milestoneDate + "</span></p>" +
                            "<p class='mile-stone-date'>" + data.MILESTONE_MERGE[i].MILESTONE_NAME + "</p>";
                    if(data.MILESTONE_MERGE[i].Attachment && data.MILESTONE_MERGE[i].Attachment.length){
                        tag += '<a class="mile-stone-attachment" target="_blank" rel="' + data.MILESTONE_MERGE[i].Attachment[0].LABEL + '" href="' + data.MILESTONE_MERGE[i].Attachment[0].ATTACHMENT_URL + '">' + data.MILESTONE_MERGE[i].Attachment[0].LABEL + '</a>';
                    } 
                }
            }
    
            output.innerHTML = tag;
            output.style.top = y;
            output.style.left = x;
            output.style.display = "block";
            d3.select('.mile-stone-screen-cover').style({'display':'block'});
        },
    
        hideMileStone: function(){
            var output = document.getElementsByClassName("mile-stone")[0];
    
            if(output.style.display === "none"){
                return false;
            }
    
            output.style.display = "none";
            d3.select('.mile-stone-screen-cover').style({'display':'none'});
        },
        
        
        renderer: function(oRM, oControl) {
            // write Container
            oRM.write('<div') ;
            oRM.addClass('mile-stone-container');
            oRM.writeClasses();
            oRM.write('>');
            
            // write SVG
            oRM.write('<div');
            oRM.addClass('mile-stone-svg');
            oRM.writeClasses();
            oRM.write('>');
            oRM.write("</div>");
            
            //
            oRM.write('<div');
            oRM.addClass('mile-stone-screen-cover');
            oRM.writeClasses();
            oRM.write('>');
            oRM.write("</div>");
            
            // 
            oRM.write('<div');
            oRM.addClass('mile-stone-tag');
            oRM.writeClasses();
            oRM.write('>');
            oRM.write("</div>");
            //
            oRM.write('<div');
            oRM.addClass('mile-stone');
            oRM.writeClasses();
            oRM.write('>');
            oRM.write("</div>");
            
            oRM.write("</div>");
        }
    });

});