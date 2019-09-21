package cho.carbon.hc.hydrocarbon.model.config.service;

import java.util.List;
import java.util.function.Consumer;

import cho.carbon.hc.hydrocarbon.model.config.pojo.CustomPage;

public interface CustomPageService {

	List<CustomPage> getCustomPageList();

	void save(CustomPage customPage);
	
	void remove(Long customPageId);

	CustomPage getCustomPage(Long customPageId);

	void bindCustomPageReloadEvent(Consumer<CustomPage> consumer);

	
}
