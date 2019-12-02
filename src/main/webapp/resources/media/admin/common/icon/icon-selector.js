/**
 * 
 */
define(function(require, exports, module){
	function IconSelector(_param){
		var defParam = {
			openDialog	: _openDialog,
			ajax		: require('ajax').loadResource,
			iconsURL	: 'media/admin/common/icon/icons.json',
			tmplLoadURL	: 'media/admin/common/icon/icon-selector.tmpl',
			selectedClass	: 'icon-selector-selected',
			selectedData	: getSelectedClass,
			afterSelected	: function(selected){console.log(selected)}
		};
		var param = $.extend({}, defParam, _param);
		var _this = this;
		/**
		 * 打开选择器
		 * @return Deferred
		 */
		this.openSelector = function(){
			var deferred = $.Deferred();
			param.ajax(param.iconsURL).done(function(data){
				var icons = [];
				if(data.iconsTree){
					var node = data.iconsTree;
					appendIcons('', node, icons);
				}
				getIconsPageTmpl(param.tmplLoadURL).done(function($iconsPageTmpl){
					var $iconsPage = $iconsPageTmpl.tmpl({
						icons	: icons
					});
					var $iconSpans = $('.icon-selector-flex>span', $iconsPage);
					$iconSpans.click(function(){
						var $thisSpan = $(this);
						if(param.multiple){
							$thisSpan.toggleClass(param.selectedClass);
						}else{
							$iconSpans.removeClass(param.selectedClass);
							$thisSpan.addClass(param.selectedClass);
						}
					});
					var dialog = param.openDialog($iconsPage, '选择图标', 'dialog_selector', {
						width		: 400,
						height		: 400,
						contentType	: 'dom',
						onSubmit	: function(selected){
							param.afterSelected.apply(_this, [selected]);
							deferred.resolve(selected);
						}
					});
					dialog.getPage().bind('footer-submit', function(){
						var selected = [];
						$iconSpans.filter('.' + param.selectedClass).each(function(){
							selected.push(param.selectedData(this));
						});
						return selected;
					});
					
				});
			});
			return deferred.promise();
		}
	}
	
	function _openDialog(html, title, targetId, param){
		return require('dialog').openDialog(html, title, targetId, param);
	} 
	
	function getIconsPageTmpl(tmplLoadURL){
		return require('tmpl').load(tmplLoadURL);
	}
	
	function appendIcons(clazz, node, icons){
		if(node){
			if(node.clazz){
				clazz += ' ' + node.clazz;
			}
			if(node.icons){
				var nodeMeta = {
					clazz	: clazz,
					prefix	: node.prefix || ''
				};
				$.each(node.icons, function(i){
					var iconItem = toIconItem(nodeMeta, this);
					icons.push(iconItem);
				})
			}
			if(node.children){
				$.each(node.children, function(child){
					appendIcons(clazz, child, icons);
				});
			}
		}
	}
	
	function toIconItem(nodeMeta, icon){
		var item = {
			title	: icon.title || '',
			clazz	: nodeMeta.clazz || ''
		};
		if(icon.className){
			item.clazz += ' ' + icon.className;
		}else if(icon.clazz){
			item.clazz += ' ' + nodeMeta.prefix + icon.clazz;
		}else{
			return null;
		}
		return item;
	}
	
	function getSelectedClass(span){
		return $('i', span).attr('class').trim();
	}
	
	IconSelector.bind = function($dom, param){
		var selector = new IconSelector($.extend({
			
		}, param));
		$($dom).click(function(){
			selector.openSelector();
		});
	}
	
	module.exports = IconSelector;
});