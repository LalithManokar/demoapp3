const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.2.0.01_update_report_config.xsjslib';

function error(line) {
    trace.error(whoAmI, line);
}
function info(line) {
    trace.info(whoAmI, line);
}

function check(oConnection) {
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);

    var bSuccess = true;
    var sStatement = "select id, config from \"SAP_INO\".\"sap.ino.db.analytics::t_custom_report\"";
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length > 0) {
        _.each(aResult, function(oReportConfiguration) {
            try {
                oReportConfiguration.CONFIG = $.util.stringify(oReportConfiguration.CONFIG);
                oReportConfiguration.CONFIG = JSON.parse(oReportConfiguration.CONFIG);
            } catch (e) {
                error("Failed to update report configuration with ID " + oReportConfiguration.ID + ".");
                error("Please execute the following SQL statement: 'delete from \"SAP_INO\".\"sap.ino.db.analytics::t_custom_report\" where id = " + oReportConfiguration.ID + ";'");
                bSuccess = false;
            }
            
            var oConfig = oReportConfiguration.CONFIG;
            if(oConfig.Tile && oConfig.Tile.Measure) {
                if(oConfig.Measure &&
                        oConfig.Measure[oReportConfiguration.CONFIG.Tile.Measure]) {
                    oConfig.Tile.Measure = 
                        oConfig.Measure[oConfig.Tile.Measure].Path;
                }
            }
            if(oConfig.Tile && oConfig.Tile.Dimension) {
                if(oConfig.Dimension && 
                        oConfig.Dimension[oConfig.Tile.Dimension]) {
                    oConfig.Tile.Dimension = 
                        oConfig.Dimension[oConfig.Tile.Dimension].Path;
                }
            }
    
            if(oConfig.Views && oConfig.Views.length > 0) {
                _.each(oConfig.Views, function(oViewConfig) {
                    var aVisibleDimensions = [];
                    var aVisibleMeasures = [];
    
                    var aDimensions = oViewConfig.Dimensions;
                    var aMeasures = oViewConfig.Measures;
                    
                    if(aDimensions && aDimensions.length > 0) {
                        _.each(aDimensions, function(sDimension) {
                            if(oConfig.Dimensions) {
                                var oDimension = oConfig.Dimensions[sDimension]; 
                                if(oDimension) {
                                    aVisibleDimensions.push(oDimension.Path);
                                } else {
                                    aVisibleDimensions.push(sDimension);
                                }
                            } else {
                                aVisibleDimensions.push(sDimension);
                            }
                        });
                    }
        
                    if(aMeasures && aMeasures.length > 0) {
                        _.each(aMeasures, function(sMeasure) {
                            if(oConfig.Measures) {
                                var oMeasure = oConfig.Measures[sMeasure]; 
                                if(oMeasure) {
                                    aVisibleMeasures.push(oMeasure.Path);
                                } else {
                                    aVisibleMeasures.push(sMeasure);
                                }
                            } else {
                                aVisibleMeasures.push(sMeasure);
                            }
                        });
                    }
    
                    oViewConfig.Dimensions = aVisibleDimensions;
                    oViewConfig.Measures = aVisibleMeasures;
    
                    if(oViewConfig.Tile && oViewConfig.Tile.Measure) {
                        if(oConfig.Measure && 
                                oConfig.Measure[oViewConfig.Tile.Measure]) {
                            oViewConfig.Tile.Measure = oConfig.Measure[oViewConfig.Tile.Measure].Path;
                        }
                    }
                    if(oViewConfig.Tile && oViewConfig.Tile.Dimension) {
                        if(oConfig.Dimension && 
                                oConfig.Dimension[oViewConfig.Tile.Dimension]) {
                            oViewConfig.Tile.Dimension = 
                                oConfig.Dimension[oViewConfig.Tile.Dimension].Path;
                        }
                    }  
    
                    if(oViewConfig.Chart &&
                            oViewConfig.Chart.Type.indexOf("viz/") !== 0) {
                        switch (oViewConfig.Chart.Type) {
                            case "StackedColumn":
                                oViewConfig.Chart.Type = "viz/stacked_column";
                                break;
                            case "Line":
                                oViewConfig.Chart.Type =  "viz/line";
                                break;
                            case "Pie":
                                oViewConfig.Chart.Type = "viz/pie";
                                break;
                            default:
                                oViewConfig.Chart.Type = "viz/column";
                                break;
                        }
                    }
                });
            }
    
            delete oConfig.Dimensions;
            delete oConfig.Measures;
        
            try {
                oConfig = JSON.stringify(oConfig);
            } catch(e) {
                error("Failed to update report configuration with ID " + oReportConfiguration.ID + ".");
                error("Please execute the following SQL statement: 'delete from \"SAP_INO\".\"sap.ino.db.analytics::t_custom_report\" where id = " + oReportConfiguration.ID + ";'");
                bSuccess = false;
            }
    
            var sUpdateStatement = "update \"SAP_INO\".\"sap.ino.db.analytics::t_custom_report\" set config = ? where id = ?";
            oHQ.statement(sUpdateStatement).execute(oConfig, oReportConfiguration.ID);
        });
    }
    return bSuccess;
}

function clean(oConnection) {
    return true;
}