package cho.carbon.hc.hydrocarbon.common.interceptor;

import java.text.ParseException;
import java.util.Date;

import org.apache.commons.lang.time.DateUtils;
import org.springframework.core.convert.converter.Converter;
import org.springframework.util.StringUtils;

public class DateParameterConverter implements Converter<String, Date>{

	/** date format 格式*/
    private static final String[] PATTERNS = {"yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd", "HH:mm:ss"};
    @Override
    public Date convert(String s) {
        if(StringUtils.hasText(s)) {
            try {
                return DateUtils.parseDateStrictly(s, PATTERNS);
            } catch (ParseException e) {
            }
        }
        return null;
    }
	

}
