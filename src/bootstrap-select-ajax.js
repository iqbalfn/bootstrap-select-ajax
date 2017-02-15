/**
 * Bootstrap select ajax
 * @package bootstrap-select-ajax
 * @version 0.0.1
 */

+function($){
    'use strict';
    
    var Plugin;
    
    Plugin = {
        hs: function(val){
            return val.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },
        
        skipKeys: [9,13,16,17,18,27,37,38,39,40,91],
        
        clearSOption: function(select, refresh){
            var options = select.find('option');
            
            for(var i=0; i<options.length; i++){
                var option = options[i];
                var $option = $(option);
                
                if(option.selected || $option.hasClass('bs-title-option'))
                    continue;
                
                var parent = $option.parent();
                $option.remove();
                
                if(parent.get(0).tagName.toLowerCase() !== 'optgroup')
                    continue;
                
                if(!parent.children().length)
                    parent.remove();
            }
            
            if(refresh)
                select.selectpicker('refresh');
        },
        
        callAjax: function(qValue, callback, el, ajaxURL, qName){
            ajaxURL+= /\?/.test(ajaxURL) ? '&' : '?';
            ajaxURL+= qName + '=' + encodeURI(qValue);
            $.get(ajaxURL, callback);
        },
        
        fillSOptions: function(select, options, refresh){
            var existsValues = [];
            
            var existsChilds = select.find('option');
            for(var i=0; i<existsChilds.length; i++)
                existsValues.push(existsChilds[i].value);
            
            // TODO
            // make this readable by human
            for(var val in options){
                var opts = options[val];
                var val_sf = Plugin.hs(val);
                
                if(typeof opts === 'object'){
                    var optgroup = select.children('optgroup[label="'+val_sf+'"]');
                    if(!optgroup.get(0)){
                        optgroup = $('<optgroup label="'+val_sf+'"></optgroup>');
                        select.append(optgroup);
                    }
                    
                    for(var oval in opts){
                        if(!~existsValues.indexOf(oval)){
                            var oval_sf = Plugin.hs(oval);
                            var opts_val_sf = Plugin.hs(opts[oval]);
                            optgroup.append('<option value="'+oval_sf+'">'+opts_val_sf+'</option>');
                            existsValues.push(oval);
                        }
                    }
                    
                }else if(!~existsValues.indexOf(val)){
                    var opts_sf = Plugin.hs(opts);
                    select.append('<option value="'+val_sf+'">'+opts_sf+'</option>');
                    existsValues.push(val);
                }
            }
            if(refresh)
                select.selectpicker('refresh');
        },
        
        applyAjaxIdentity: function($this, options){
            $this.selectpicker({liveSearch: true});
            var picker      = $this.data('selectpicker');
            var ajaxTimer   = null;
            var ajaxCKey    = '';
            
            if(options){
                if(typeof options === 'string')
                    $this.data('selectpicker').options.ajax = options;
                else{
                    for(var k in options)
                        $this.data('selectpicker').options[k] = options[k];
                }
            }
            
            picker.options.noneResultsTextOriginal = picker.options.noneResultsText;
            picker.options.noneResultsText = '';
            
            if(picker.options.ajaxBinded)
                return;
            picker.options.ajaxBinded = true;
            
            picker.$searchbox.on('keyup paste change', function(e){
                if(~Plugin.skipKeys.indexOf(e.keyCode))
                    return;
                var $input  = $(this);
                var qValue = $input.val().trim();
                
                if(ajaxCKey == qValue)
                    return;
                
                if(ajaxTimer)
                    clearTimeout(ajaxTimer);
                
                // remove all unselected options if query is empty
                if(!qValue){
                    ajaxCKey = qValue;
                    return Plugin.clearSOption($this, true);
                }
                
                ajaxCKey = qValue;
                
                var delay = $this.data('selectpicker').options.ajaxDelay || 300;
                
                ajaxTimer = setTimeout(function($this, picker, qValue){
                    if(qValue != ajaxCKey)
                        return;
                    
                    var qName = picker.options.ajaxQName || 'q';
                    
                    (picker.options.ajaxCallback||Plugin.callAjax)(qValue, function(res){
                        if(qValue != ajaxCKey)
                            return;
                        
                        if(picker.options.ajaxPreProcess)
                            res = picker.options.ajaxPreProcess(res);
                        
                        Plugin.clearSOption($this);
                        Plugin.fillSOptions($this, res, true);
                        
                    }, $this.get(0), picker.options.ajax, qName);
                    
                }, delay, $this, picker, qValue);
            });
        }
    }
    
    $('.selectpicker[data-ajax]').each(function(){
        Plugin.applyAjaxIdentity($(this));
    });
    
    $.fn.selectpickerAjax = function(options){
        this.each(function(){
            Plugin.applyAjaxIdentity($(this), options);
        });
    }
}(jQuery);