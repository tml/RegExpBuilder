

import java.util.Arrays;
import java.util.HashSet;
import java.util.regex.Pattern;

public class RegExpBuilder {
	private StringBuffer _literal;
	private Boolean _ignoreCase;
	private Boolean _multiLine;
	private HashSet<Character> _specialCharactersInsideCharacterClass;
	private HashSet<Character> _specialCharactersOutsideCharacterClass;
	private StringBuffer _escapedString;
	private int _min;
	private int _max;
	private String _of;
	private Boolean _ofAny;
	private String _from;
	private String _notFrom;
	private String _like;
	private String _behind;
	private String _notBehind;
	private String _either;
	private Boolean _reluctant;
	private Boolean _capture;
  
	public RegExpBuilder() {
		_literal = new StringBuffer();
		_specialCharactersInsideCharacterClass = new HashSet<Character>(Arrays.asList(new Character[]{ '^', '-', ']' }));
		_specialCharactersOutsideCharacterClass = new HashSet<Character>(Arrays.asList(new Character[]{ '.', '^', '$', '*', '+', '?', '(', ')', '[', '{' }));
		_escapedString = new StringBuffer();
		_clear();
	}
  
	private void _clear() {
		_ignoreCase = false;
		_multiLine = false;
		_min = -1;
		_max = -1;
		_of = "";
		_ofAny = false;
		_from = "";
		_notFrom = "";
		_like = "";
		_behind = "";
		_notBehind = "";
		_either = "";
		_reluctant = false;
		_capture = false;
	}
  
  	private void _flushState() {
  		if (_of != "" || _ofAny || _from != "" || _notFrom != "" || _like != "") {
  			String captureLiteral = _capture ? "" : "?:";
  			String quantityLiteral = getQuantityLiteral();
  			String characterLiteral = getCharacterLiteral();
  			String reluctantLiteral = _reluctant ? "?" : "";
  			String behindLiteral = _behind != "" ? "(?=" + _behind + ")" : "";
  			String notBehindLiteral = _notBehind != "" ? "(?!" + _notBehind + ")" : "";
  			_literal.append("(" + captureLiteral + "(?:" + characterLiteral + ")" + quantityLiteral + reluctantLiteral + ")" + behindLiteral + notBehindLiteral);
  			_clear();
    	}
  	}
  
  	private String getQuantityLiteral() {
  		if (_min != -1) {
  			if (_max != -1) {
  				return "{" + _min + "," + _max + "}";
  			}
  			return "{" + _min + ",}";
  		}
  		return "{0," + _max + "}";
  	}
  
  	private String getCharacterLiteral() {
  		if (_of != "") {
  			return _of;
  		}
  		if (_ofAny) {
  			return ".";
  		}
  		if (_from != "") {
  			return "[" + _from + "]";
  		}
  		if (_notFrom != "") {
  			return "[^" + _notFrom + "]";
  		}
  		if (_like != "") {
  			return _like;
  		}
  		return "";
  	}
  
  	public String getLiteral() {
  		_flushState();
  		return _literal.toString();
  	}
  
  	public Pattern getRegExp() {
  		_flushState();
  		int flags = 0;
  		if (_ignoreCase) {
  			flags = flags | Pattern.CASE_INSENSITIVE;
  		}
  		if (_multiLine) {
  			flags = flags | Pattern.MULTILINE;
  		}
  		return Pattern.compile(_literal.toString(), flags);
  	}
  
  	public RegExpBuilder ignoreCase() {
  		_ignoreCase = true;
  		return this;
  	}
  
  	public RegExpBuilder multiLine() {
  		_multiLine = true;
  		return this;
  	}
  
  	public RegExpBuilder start() {
  		_literal.append("(?:^)");
  		return this;
  	}
  
  	public RegExpBuilder end() {
  		_flushState();
  		_literal.append("(?:$)");
  		return this;
  	}
  
  	public RegExpBuilder either(RegExpBuilder r) {
  		_flushState();
  		_either = r.getLiteral();
  		return this;
  	}
  
  	public RegExpBuilder or(RegExpBuilder r) {
  		String either = _either;
  		String or = r.getLiteral();
  		_literal.append("(?:(?:" + either + ")|(?:" + or + "))");
  		_clear();
  		return this;
  	}
  
  	public RegExpBuilder exactly(int n) {
  		_flushState();
  		_min = n;
  		_max = n;
  		return this;
  	}
  
  	public RegExpBuilder min(int n) {
  		_flushState();
  		_min = n;
  		return this;
  	}
  
  	public RegExpBuilder max(int n) {
  		_flushState();
  		_max = n;
  		return this;
  	}
  
  	public RegExpBuilder of(String s) {
  		_of = _escapeOutsideCharacterClass(s);
  		return this;
  	}
  
  	public RegExpBuilder ofAny() {
  		_ofAny = true;
  		return this;
  	}
  
  	public RegExpBuilder from(char[] s) {
  		_from = _escapeInsideCharacterClass(new String(s));
  		return this;
  	}
  
  	public RegExpBuilder notFrom(char[] s) {
  		_notFrom = _escapeInsideCharacterClass(new String(s));
  		return this;
  	}
  
  	public RegExpBuilder like(RegExpBuilder r) {
  		_like = r.getLiteral();
  		return this;
  	}
  
  	public RegExpBuilder reluctantly() {
  		_reluctant = true;
  		return this;
  	}
  
  	public RegExpBuilder behind(RegExpBuilder r) {
  		_behind = r.getLiteral();
  		return this;
  	}
  
  	public RegExpBuilder notBehind(RegExpBuilder r) {
  		_notBehind = r.getLiteral();
  		return this;
  	}
  
  	public RegExpBuilder asCapturingGroup() {
  		_capture = true;
  		return this;
  	}
  
  	private String _escapeInsideCharacterClass(String s) {
  		return _escapeSpecialCharacters(s, _specialCharactersInsideCharacterClass);
  	}

  	private String _escapeOutsideCharacterClass(String s) {
  		return _escapeSpecialCharacters(s, _specialCharactersOutsideCharacterClass);
  	}
  
  	private String _escapeSpecialCharacters(String s, HashSet<Character> specialCharacters) {
  		_escapedString = new StringBuffer();
  		for (int i = 0; i < s.length(); i++) {
  			char character = s.charAt(i);
  			if (specialCharacters.contains(character)) {
  				_escapedString.append("\\" + character);
  			}
  			else {
  				_escapedString.append(character);
  			}
  		}
  		return _escapedString.toString();
  	}
}
