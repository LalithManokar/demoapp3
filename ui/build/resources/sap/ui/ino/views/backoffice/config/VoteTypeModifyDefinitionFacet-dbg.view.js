/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.commons.DropdownBox");

var VoteType = {
	Star: "STAR",
	Like: "LIKE",
	LikeDislike: "LIKE_DISLIKE"
};

var CommentType = {
	Default: "",
	Text: "TEXT",
	List: "LIST"
};
var VotedByGroupType = {
    Default:"",
    Company:"COM",
    Organization:"ORG",
    CostCenter:"COST",
    Office: "OFF"
};

sap.ui.jsview("sap.ui.ino.views.backoffice.config.VoteTypeModifyDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.VoteTypeModifyDefinitionFacet";
	},

	createFacetContent: function(oController) {
		var bEdit = oController.isInEditMode();

		var oGroupGeneral = this.createLayoutGeneral(bEdit);
		var oGroupDetail = this.createLayoutDetail(bEdit);

		return [oGroupGeneral, oGroupDetail];
	},

	createLayoutGeneral: function(bEdit) {
		var oVoteTypeLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['200px', '200px', '100px', '40%']
		});

		var oNameLabel = this.createControl({
			Type: "label",
			Text: "BO_VOTE_TYPE_FLD_DEFAULT_TEXT",
			Tooltip: "BO_VOTE_TYPEFLD_DEFAULT_TEXT"
		});
		var oNameField = this.createControl({
			Type: "textfield",
			Text: "/DEFAULT_TEXT",
			Editable: bEdit,
			LabelControl: oNameLabel
		});

		var oDescriptionLabel = this.createControl({
			Type: "label",
			Text: "BO_VOTE_TYPE_FLD_DEFAULT_LONG_TEXT",
			Tooltip: "BO_VOTE_TYPE_FLD_DEFAULT_LONG_TEXT"
		});
		var oDescriptionField = this.createControl({
			Type: "textarea",
			Text: "/DEFAULT_LONG_TEXT",
			Editable: bEdit,
			LabelControl: oDescriptionLabel
		});
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oNameLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oNameField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescriptionLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Center,
				rowSpan: 2
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescriptionField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin,
				rowSpan: 2
			})]
		});
		oVoteTypeLayout.addRow(oRow);

		var oCodeLabel = this.createControl({
			Type: "label",
			Text: "BO_VOTE_TYPE_FLD_PLAIN_CODE",
			Tooltip: "BO_VOTE_TYPE_FLD_PLAIN_CODE"
		});

		var oCodeField = this.createControl({
			Type: "textfield",
			Text: "/PLAIN_CODE",
			Editable: bEdit,
			LabelControl: oCodeLabel
		});
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oCodeLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oCodeField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oVoteTypeLayout.addRow(oRow);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_VOTE_TYPE_GENERAL_INFO_TIT"),
			content: [oVoteTypeLayout, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	createLayoutDetail: function(bEdit) {
		var oController = this.getController();
		var that = this;
		var oContent = new sap.ui.commons.layout.MatrixLayout({
			columns: 4,
			widths: ['200px', '200px', '100px', '40%']
		});

		this.oDetail = oContent;

		var oTypeCodeField = new sap.ui.commons.DropdownBox({
			selectedKey: this.getBoundPath("TYPE_CODE", true),
			editable: bEdit,
			required: true,
			width: "100%",
			change: function(oEvent) {
				oController.onTypeCodeChange(oEvent);
			}
		});
		oTypeCodeField.addItem(new sap.ui.core.ListItem({
			key: "",
			text: ""
		}));
		oTypeCodeField.addItem(new sap.ui.core.ListItem({
			key: VoteType.Like,
			text: "{i18n>BO_VOTE_TYPE_TYPE_LIKE}"
		}));
		oTypeCodeField.addItem(new sap.ui.core.ListItem({
			key: VoteType.LikeDislike,
			text: "{i18n>BO_VOTE_TYPE_TYPE_LIKE_DISLIKE}"
		}));

		oTypeCodeField.addItem(new sap.ui.core.ListItem({
			key: VoteType.Star,
			text: "{i18n>BO_VOTE_TYPE_TYPE_STAR}"
		}));

		var oRowTypeCode = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_VOTE_TYPE_FLD_TYPE_CODE",
					LabelControl: oTypeCodeField
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oTypeCodeField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oContent.addRow(oRowTypeCode);

		var oMaxStar = new sap.ui.commons.DropdownBox({
			selectedKey: this.getBoundPath("MAX_STAR_NO", true),
			editable: bEdit,
			required: true,
			width: "100%"
		});
		oMaxStar.addItem(new sap.ui.core.ListItem({
			key: 0,
			text: ""
		}));
		oMaxStar.addItem(new sap.ui.core.ListItem({
			key: 1,
			text: 1
		}));
		oMaxStar.addItem(new sap.ui.core.ListItem({
			key: 2,
			text: 2
		}));

		oMaxStar.addItem(new sap.ui.core.ListItem({
			key: 3,
			text: 3
		}));

		oMaxStar.addItem(new sap.ui.core.ListItem({
			key: 4,
			text: 4
		}));

		oMaxStar.addItem(new sap.ui.core.ListItem({
			key: 5,
			text: 5
		}));

		var oRowMaxStar = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_VOTE_TYPE_FLD_MAX_STAR",
					LabelControl: oMaxStar
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oMaxStar,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		this.oRowMaxStar = oRowMaxStar;

		var oPublicField = this.createControl({
			Type: "checkbox",
			Text: "/PUBLIC_VOTE",
			Editable: bEdit,
			Tooltip: ""
		});

		var oRowPublic = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_VOTE_TYPE_FLD_PUBLIC_VOTE",
					LabelControl: oPublicField,
			        Tooltip: "VOTE_TYPE_PUBLIC_FLD_TOOLTIP"
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oPublicField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oContent.addRow(oRowPublic);

		var oPublishField = this.createControl({
			Type: "checkbox",
			Text: "/PUBLISH_VOTE",
			Editable: bEdit
		});

		var oRowPublish = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_VOTE_TYPE_FLD_PUBLISH_VOTE",
					LabelControl: oPublishField,
			        Tooltip: "VOTE_TYPE_PUBLISH_FLD_TOOLTIP"
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oPublishField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oContent.addRow(oRowPublish);

		var oCommentType = new sap.ui.commons.DropdownBox({
			selectedKey: this.getBoundPath("VOTE_COMMENT_TYPE", true),
			editable: bEdit,
			width: "100%",
			change: function(oEvent) {
				oController.onCommentTypeChange(oEvent);
			}
		});

		oCommentType.addItem(new sap.ui.core.ListItem({
			key: CommentType.Default,
			text: ""
		}));
		oCommentType.addItem(new sap.ui.core.ListItem({
			key: CommentType.Text,
			text: "{i18n>BO_VOTE_TYPE_COMMENT_TEXT}"
		}));
		oCommentType.addItem(new sap.ui.core.ListItem({
			key: CommentType.List,
			text: "{i18n>BO_VOTE_TYPE_COMMENT_LIST}"
		}));

		var oRowCommentType = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_VOTE_TYPE_FLD_COMMENT_TYPE",
					LabelControl: oCommentType
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oCommentType,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oContent.addRow(oRowCommentType);

		var oAutoVote = this.createControl({
			Type: "checkbox",
			Text: "/AUTO_VOTE",
			Editable: bEdit,
			Tooltip: ""
		});

		var oRowAutoVote = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_VOTE_TYPE_FLD_AUTO_VOTE",
					LabelControl: oAutoVote,
			        Tooltip: "VOTE_TYPE_AUTO_VOTE_FLD_TOOLTIP"
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oAutoVote,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		this.oRowAutoVote = oRowAutoVote;		
		//oContent.addRow(oRowAutoVote);
		var oAutoFollow = this.createControl({
			Type: "checkbox",
			Text: "/AUTO_FOLLOW",
			Editable: bEdit,
			Tooltip: ""
		});

		var oRowAutoFollow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_VOTE_TYPE_FLD_AUTO_FOLLOW",
					LabelControl: oAutoFollow,
			        Tooltip: "VOTE_TYPE_AUTO_FOLLOW_FLD_TOOLTIP"
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oAutoFollow,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		this.oRowAutoFollow = oRowAutoFollow;
		//oContent.addRow(oRowAutoFollow);

		var aValueListFilters = this.createFilterForValueList("TEXT");
		var oValueListSettings = {
			Path: "/VOTE_REASON_CODE",
			CodeTable: "sap.ino.xs.object.basis.ValueOptionList.Root",
			Editable: bEdit,
			Visible: true,
			WithEmpty: true,
			Filters: aValueListFilters
		};

		var oReasonCode = this.createDropDownBoxForCode(oValueListSettings);
		oReasonCode.setRequired(true);
		this.oReasonCode = oReasonCode;

		var oRowReasonCode = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_VOTE_TYPE_FLD_REASON_LIST",
					LabelControl: oReasonCode
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oReasonCode,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		this.oRowReasonCode = oRowReasonCode;
		var oVotedByGroup = new sap.ui.commons.DropdownBox({
			selectedKey: this.getBoundPath("VOTED_BY_GROUP", true),
			editable: bEdit,
			width: "100%"
		});
		oVotedByGroup.addItem(new sap.ui.core.ListItem({
			key: VotedByGroupType.Default,
			text: ""
		}));
		oVotedByGroup.addItem(new sap.ui.core.ListItem({
			key: VotedByGroupType.Company,
			text: "{i18n>BO_VOTE_TYPE_VOTED_BY_COMPANY}"
		}));
		oVotedByGroup.addItem(new sap.ui.core.ListItem({
			key: VotedByGroupType.Organization,
			text: "{i18n>BO_VOTE_TYPE_VOTED_BY_ORGANIZATION}"
		}));
		oVotedByGroup.addItem(new sap.ui.core.ListItem({
			key: VotedByGroupType.CostCenter,
			text: "{i18n>BO_VOTE_TYPE_VOTED_BY_COST_CENTER}"
		}));
		oVotedByGroup.addItem(new sap.ui.core.ListItem({
			key: VotedByGroupType.Office,
			text: "{i18n>BO_VOTE_TYPE_VOTED_BY_OFFICE}"
		}));		

		var oRowVotedByGroup = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.createControl({
					Type: "label",
					Text: "BO_VOTE_TYPE_FLD_VOTED_BY_GROUP",
					LabelControl: oVotedByGroup
				}),
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oVotedByGroup,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		this.oRowVotedByGroup = oRowVotedByGroup;
		
		oController.getModel().getDataInitializedPromise().done(function(oVoteType) {
			if (oVoteType && oVoteType.TYPE_CODE === VoteType.Star) {
				oContent.insertRow(oRowMaxStar, 1);
			}
			
			if (oVoteType && oVoteType.VOTE_COMMENT_TYPE === CommentType.List && oVoteType.TYPE_CODE === VoteType.Star){
			     //If the Type Code == Star , need to add 1 lines for display the stars
			    oContent.insertRow(oRowReasonCode, 5);  
			}else if(oVoteType && oVoteType.VOTE_COMMENT_TYPE === CommentType.List){
			    oContent.insertRow(oRowReasonCode, 4); 
			}
			if (oVoteType && oVoteType.TYPE_CODE === VoteType.Like && oVoteType.VOTE_COMMENT_TYPE === CommentType.List) {
			    //if the it is the list, need to add 1 lines for reason code show
			    oContent.insertRow(oRowVotedByGroup,5);
			} else if(oVoteType && oVoteType.TYPE_CODE === VoteType.Like){
			    oContent.insertRow(oRowVotedByGroup,4);
			}
			oContent.addRow(oRowAutoFollow);
             oContent.addRow(oRowAutoVote);			
		});

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_VOTE_TYPE_DEFINITION_DETAIL_TIT"),
			content: [oContent, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	createFilterForValueList: function(sDataType) {
		var sCodeBoundPath = "CODE";
		var sFilterBoundPath = "DATATYPE_CODE";
		var aFilters = [];
		// Always add the empty code value
		var oEmptyFilter = new sap.ui.model.Filter(sCodeBoundPath, sap.ui.model.FilterOperator.EQ, "");
		aFilters.push(oEmptyFilter);
		// add the data type filter
		var oDataTypeFilter = new sap.ui.model.Filter(sFilterBoundPath, sap.ui.model.FilterOperator.EQ, sDataType);
		aFilters.push(oDataTypeFilter);
		// add an OR filter arround
		var oOrFilter = new sap.ui.model.Filter(aFilters, false);
		return oOrFilter;
	},

	createDropDownBoxForCode: function(oSettings) {
		if (!oSettings.View) {
			oSettings.View = this;
		}
		return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
	}

}));