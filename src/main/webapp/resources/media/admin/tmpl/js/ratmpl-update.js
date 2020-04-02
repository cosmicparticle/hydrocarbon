define(function(require, exports, module) {
	
	var Utils = require('utils');
	var $CPF = require('$CPF');
	exports.init = function($page, moduleName,  data) {
		
		var context = Utils.createContext({
			
		});
//
//		$CPF.showLoading();
		
		require('event').prepareToContext($page, context);
		
		var $form = $('form', $page);
		$('.btn-save', $page).click(function(){
			require('dialog').confirm('确认提交？', function(yes){
				$form.trigger('submit');
			});
		});
		$form.on(
				'cpf-submit',
				function(e, formData) {
					var $form = $(this);
					
				}
				
		
		);

		
	}
	
	
	

});