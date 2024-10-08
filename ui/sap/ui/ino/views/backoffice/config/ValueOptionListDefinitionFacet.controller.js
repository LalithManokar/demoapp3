/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");

sap.ui.controller("sap.ui.ino.views.backoffice.config.ValueOptionListDefinitionFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {

		onValueOptionSelectionChanged: function(oSelectedRowContext, iSelectedIndex, oTable) {
			var oView = this.getView();
			var aSelectedIndices = oTable.getSelectedIndices();
			var oModel = this.getModel();
			var aValueOption = oModel.getData() ? oModel.getData().ValueOptions : [];
			if (iSelectedIndex >= 0) {
				if (this.isInEditMode()) {
					oView._oDeleteButton.setEnabled(true);
					//for up and down button visible attribute
					if(aSelectedIndices.length > 1){
			    	   oView._oUpButton.setEnabled(false);
				       oView._oDownButton.setEnabled(false);					    
					} else {
					    var bUpEnable = iSelectedIndex === 0 ? false : true;
					    var bDownEnable = aValueOption.length === iSelectedIndex + 1 ? false : true;
			    	   oView._oUpButton.setEnabled(bUpEnable);
				       oView._oDownButton.setEnabled(bDownEnable);					    
					}
				} else {
					oView._oDeleteButton.setEnabled(false);
			    	oView._oUpButton.setEnabled(false);
				    oView._oDownButton.setEnabled(false);					
				}
			} else {
				oView._oDeleteButton.setEnabled(false);
				oView._oUpButton.setEnabled(false);
				oView._oDownButton.setEnabled(false);				
				
			}
		},

		onValueOptionCreatePressed: function() {
			this.getModel().addValueOption();
			var oView = this.getView();
			var iLength = oView.oTable.getBindingInfo("rows").binding.getLength();
			// timeout required due to rendering delay
			setTimeout(function() {
				oView.oTable.setFirstVisibleRow(iLength - 1);
				oView.oTable.setSelectedIndex(iLength - 1);
				var aRows = oView.oTable.getRows();
				if (aRows && aRows[iLength - 1]) {
					aRows[iLength - 1].getCells()[0].focus();
				}
			}, 100);
		},

		onValueOptionDeletePressed: function(oEvent) {
			var aSelectedRowContext = this.getView().getSelectedRowContexts();
			var aValueOption = [];
			jQuery.each(aSelectedRowContext, function(i, selectedRowContext) {
				aValueOption.push(selectedRowContext.getObject());
			});
			var oValueOptionList = this.getModel();
			jQuery.each(aValueOption, function(i, oValueOption) {
				oValueOptionList.removeValueOption(oValueOption);
			});
			this.getView().oTable.clearSelection();
		},
		
		moveUpValueOption: function(oEvent){
		   var oView = this.getView(); 
           var oRowContext = this.getSelectedIndexContext();	 
        var oValueOption = oRowContext.getObject();
        var oModel = this.getModel();
        oModel.moveUpValueOption(oValueOption);
        this.setFieldContextByID(oValueOption.ID);             
           
		},
		moveDownValueOption: function(oEvent){
		   var oView = this.getView(); 
           var oRowContext = this.getSelectedIndexContext();
        var oValueOption = oRowContext.getObject();
        var oModel = this.getModel();
        oModel.moveDownValueOption(oValueOption);
        this.setFieldContextByID(oValueOption.ID);               
		},	
		
	    getSelectedIndexContext: function() {
		   var oView = this.getView(); 
		   var selectedIndex = oView.oTable.getSelectedIndex();
		    if (selectedIndex > -1 &&  oView.oTable.getContextByIndex(selectedIndex) !== null) {
			return oView.oTable.getContextByIndex(selectedIndex);
		    }
		    return null;
	    },	
	setFieldContextByID: function(iValueOptionID) {
		var oModel = this.getModel();
		var oView = this.getView();
		var aRows = oModel.getProperty("/ValueOptions");
		for (var i = 0; i < aRows.length; i++) {
			var oRowContext = oView.oTable.getContextByIndex(i);
			var iID = oModel.getProperty("ID", oRowContext);
			if (iID === iValueOptionID) {
				oView.oTable.setBindingContext(oRowContext, this.getModelName());
				oView.oTable.setSelectedIndex(i);
				return;
			}
		}
	},	
	    sortByNameDesc: function(oEvent){
	        var oModel = this.getModel();
	       oModel.sortValueOptionByName("DESC");
	    },
	    sortByNameAsc: function(oEvent){
	        var oModel = this.getModel();
	        oModel.sortValueOptionByName("ASC");
	    },	    
		checkBoxValueChange: function(oEvent) {
         var oSource = oEvent.getSource();
         var oBindingInfo = oSource.getBindingInfo("checked");
         var oBindingPath = oBindingInfo.binding.getContext().sPath;
         if(oSource.getChecked())
         {
             this.getModel("applicationObject").setProperty(oBindingPath + "/ACTIVE", 1);
         }
         else {
             this.getModel("applicationObject").setProperty(oBindingPath + "/ACTIVE", 0);
         }
		}
	}));