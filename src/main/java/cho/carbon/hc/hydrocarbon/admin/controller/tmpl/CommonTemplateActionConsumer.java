package cho.carbon.hc.hydrocarbon.admin.controller.tmpl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import javax.annotation.Resource;

import org.springframework.stereotype.Component;
import org.springframework.ui.Model;

import cho.carbon.hc.dataserver.model.tmpl.pojo.Cachable;
import cho.carbon.hc.dataserver.model.tmpl.service.OpenTemplateService;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.common.choose.ChooseTablePage;
import cn.sowell.copframe.utils.FormatUtils;
import cn.sowell.copframe.utils.TextUtils;
import cn.sowell.copframe.utils.date.FrameDateFormat;

@Component
public class CommonTemplateActionConsumer {
	
	@Resource
	private FrameDateFormat dateFormat;
	
	public static class ChooseRequestParam<T extends Cachable>{
		private String moduleName;
		private String except;
		private Model model;
		private OpenTemplateService<T> templateService;
		private String pageId;
		private String keyPrefix;
		private String URI;
		private boolean multi;
		private Predicate<T> selectedPredicate;
		public static <TAT extends Cachable> ChooseRequestParam<TAT> create(String moduleName, OpenTemplateService<TAT> templateService, Model model){
			return (new ChooseRequestParam<TAT>())
					.setModuleName(moduleName)
					.setTemplateService(templateService)
					.setModel(model);
		}
		public String getModuleName() {
			return moduleName;
		}
		public String getExcept() {
			return except;
		}
		public Model getModel() {
			return model;
		}
		public OpenTemplateService<T> getTemplateService() {
			return templateService;
		}
		public String getPageId() {
			return pageId;
		}
		public ChooseRequestParam<T> setPageId(String pageId) {
			this.pageId = pageId;
			return this;
		}
		public String getKeyPrefix() {
			return keyPrefix;
		}
		public ChooseRequestParam<T> setKeyPrefix(String keyPrefix) {
			this.keyPrefix = keyPrefix;
			return this;
		}
		public String getURI() {
			return URI;
		}
		public ChooseRequestParam<T> setURI(String uRI) {
			URI = uRI;
			return this;
		}
		public ChooseRequestParam<T> setModuleName(String moduleName) {
			this.moduleName = moduleName;
			return this;
		}
		public ChooseRequestParam<T> setExcept(String except) {
			this.except = except;
			return this;
		}
		public ChooseRequestParam<T> setModel(Model model) {
			this.model = model;
			return this;
		}
		public ChooseRequestParam<T> setTemplateService(OpenTemplateService<T> templateService) {
			this.templateService = templateService;
			return this;
		}
		public boolean isMulti() {
			return multi;
		}
		public ChooseRequestParam<T> setMulti(boolean multi) {
			this.multi = multi;
			return this;
		}
		public ChooseRequestParam<T> setSelectedPredicate(Predicate<T> selectedPredicate) {
			this.selectedPredicate = selectedPredicate;
			return this;
		}
		public Predicate<T> getSelectedPredicate() {
			return selectedPredicate;
		} 
	}
	
	public <T extends Cachable> String choose(List<T> tmplList, ChooseRequestParam<T> crp) {
		if(TextUtils.hasText(crp.getExcept())) {
			Set<Long> excepts = TextUtils.split(crp.getExcept(), ",", HashSet::new, FormatUtils::toLong);
			tmplList = tmplList.stream().filter(tmpl->!excepts.contains(tmpl.getId())).collect(Collectors.toList());
		}
		String keyPrefix = FormatUtils.coalesce(crp.getKeyPrefix(), TextUtils.uuid(5, 62));
		ChooseTablePage<T> tpage = new ChooseTablePage<T>(
				FormatUtils.coalesce(crp.getPageId(), TextUtils.uuid(5, 62)), 
				keyPrefix);
		tpage
			.setPageInfo(null)
			.setAction(crp.getURI())
			.setIsMulti(crp.isMulti())
			.setSelectedPredicate(crp.getSelectedPredicate())
			.setTableData(tmplList, handler->{
				handler
					.setDataKeyGetter(data->keyPrefix + data.getId())
					.addColumn("模板名", (cell, data)->cell.setText(data.getTitle()))
					.addColumn("创建时间", (cell, data)->cell.setText(dateFormat.formatDateTime(data.getCreateTime())))
					;
			})
			;
		
		crp.getModel().addAttribute("tpage", tpage);
		return AdminConstants.PATH_CHOOSE_TABLE;
	}
	
	public <T extends Cachable> String choose(ChooseRequestParam<T> crp) {
		return choose(crp.getTemplateService().queryAll(crp.getModuleName()), crp);
	}
}
