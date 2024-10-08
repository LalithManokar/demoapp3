VBI.addSceneLassoTrackingFunctions=
function(s){"use strict";s.LassoTracking=function(){this.m_PosMoves=[];this.m_bTrack=false;this.m_keycode=0;};s.LassoTracking.prototype.onsapkeydown=function(e){if(e.keyCode==this.m_keycode){this.ExitMode();e.preventDefault();return true;}};s.LassoTracking.prototype.onsapdown=function(e){var r=s.m_Canvas[s.m_nOverlayIndex].getBoundingClientRect();var z=s.GetStretchFactor4Mode();this.m_PosMoves.push([(e.clientX-r.left)/z[0],(e.clientY-r.top)/z[1]]);this.m_bTrack=true;if(e.type=="mousedown"){document.addEventListener('mouseup',this,true);}else if(e.type=="touchstart"){document.addEventListener('touchend',this,true);}else if(e.type=="pointerdown"){document.addEventListener('pointerup',this,true);}e.preventDefault();s.m_Canvas[s.m_nLabelIndex].focus({preventScroll:true});return true;};s.LassoTracking.prototype.handleEvent=function(e){if(e.type=="mouseup"){document.removeEventListener('mouseup',this,true);}else if(e.type=="touchend"){document.removeEventListener('touchend',this,true);}else if(e.type=="pointerup"){document.removeEventListener('pointerup',this,true);if(s.m_Gesture){s.m_Gesture.pointerCount--;if(!s.m_Gesture.pointerCount){s.m_Gesture.target=null;s.m_Gesture=null;}}}this.TrackEnd(e);};s.LassoTracking.prototype.TrackEnd=function(e){if(!this.m_bTrack){return false;}if(this.m_PosMoves.length>2){this.execute(e);}this.m_PosMoves=[];this.m_bTrack=false;s.RenderAsync(true);e.preventDefault();e.stopPropagation();return true;};s.LassoTracking.prototype.onsapmove=function(e){if(this.m_bTrack){var z=s.GetStretchFactor4Mode();var r=s.m_Canvas[s.m_nOverlayIndex].getBoundingClientRect();this.m_PosMoves.push([(e.clientX-r.left)/z[0],(e.clientY-r.top)/z[1]]);}s.SetCursor('crosshair');s.RenderAsync(true);e.preventDefault();return true;};s.LassoTracking.prototype.onsapout=function(e){};s.LassoTracking.prototype.execute=function(e){};s.LassoTracking.prototype.Hook=function(){s.SetInputMode(VBI.InputModeLassoSelect);s.m_Ctx.m_Control.setLassoSelection(true);s.m_DesignVO=this;s.SetCursor('crosshair');s.RenderAsync(true);};s.LassoTracking.prototype.UnHook=function(){if(s.m_nInputMode==VBI.InputModeLassoSelect){s.m_Ctx.onChangeTrackingMode(s.m_nInputMode,false);s.SetInputMode(VBI.InputModeDefault);s.m_Ctx.m_Control.setLassoSelection(false);}else{jQuery.sap.log.error("Wrong InputMode in UnHook: "+s.m_nInputMode);}this.m_PosMoves=[];this.m_bTrack=false;s.m_DesignVO=null;s.RenderAsync(true);};s.LassoTracking.prototype.ExitMode=function(){this.UnHook();s.SetCursor('default');s.RenderAsync(true);};s.LassoSelection=function(){s.LassoTracking.call(this);this.m_keycode=65;this.Hook();};s.LassoSelection.prototype=Object.create(s.LassoTracking.prototype);s.LassoSelection.prototype.constructor=s.LassoSelection;s.LassoSelection.prototype.execute=function(e){s.PerFormMultiSelect(e,this);};s.LassoSelection.prototype.Render=function(c,d){if(!this.m_bTrack){return false;}if(this.m_PosMoves.length){VBI.Utilities.DrawTrackingLasso(d,this.m_PosMoves);}};}
;
