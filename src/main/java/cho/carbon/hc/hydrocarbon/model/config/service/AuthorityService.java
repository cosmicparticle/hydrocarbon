package cho.carbon.hc.hydrocarbon.model.config.service;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;

import cho.carbon.auth.pojo.AuthorityVO;
import cho.carbon.hc.dataserver.model.karuiserv.pojo.KaruiServ;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailField;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroupAction;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.model.config.bean.ValidateDetailParamter;
import cho.carbon.hc.hydrocarbon.model.config.bean.ValidateDetailResult;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuBlock;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel1Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.criteria.AuthorityCriteria;

public interface AuthorityService {
	SideMenuLevel2Menu validateL2MenuAccessable(Long level2MenuId) throws NonAuthorityException;

	SideMenuLevel1Menu validateL1MenuAccessable(Long level1MenuId) throws NonAuthorityException;
	
	List<AuthorityVO> queryAuthorities(AuthorityCriteria criteria);

	AuthorityVO getAuthority(String authCode);

	SideMenuBlock validateUserBlockAccessable(UserDetails user, Long blockId) throws NonAuthorityException;
	
	SideMenuLevel1Menu validateUserL1MenuAccessable(UserDetails user, Long level1MenuId) throws NonAuthorityException;

	SideMenuLevel2Menu validateUserL2MenuAccessable(UserDetails user, Long level2MenuId) throws NonAuthorityException;

	void validateGroupAction(TemplateGroupAction groupAction, TemplateGroup tmplGroup, String codes);

	TemplateDetailFieldGroup  validateSelectionAuth(String validateSign, Long groupId, ApiUser user);
	
	TemplateDetailField  validateSelectionAuth4RField(String validateSign, Long groupId, ApiUser user);
	

	ValidateDetailResult validateDetailAuth(ValidateDetailParamter param);

	void validateUserAccessable(UserDetails user, String validateSign);

	void validateAdminAuth(UserDetails user);

	void validateKsAccess(KaruiServ ks, ApiUser user);

	

}
