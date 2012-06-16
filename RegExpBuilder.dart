class RegExpBuilder {
  
  StringBuffer literal;
  bool ignoreCase;
  bool multiLine;
  int _min;
  int _max;
  String _of;
  bool _ofAny;
  String _from;
  String _notFrom;
  String _like;
  String _behind;
  String _either;
  bool _reluctant;
  bool _capture;
  
  RegExpBuilder() {
    literal = new StringBuffer();
    ignoreCase = false;
    multiLine = false;
    clear();
  }
  
  void clear() {
    this._min = -1;
    this._max = -1;
    this._of = "";
    this._ofAny = false;
    this._from = "";
    this._notFrom = "";
    this._like = "";
    this._behind = "";
    this._either = "";
    this._reluctant = false;
    this._capture = false;
  }
  
  void flushState() {
    if (_of != "" || _ofAny || _from != "" || _notFrom != "" || _like != "") {
      var captureLiteral = _capture ? "" : "?:";
      var quantityLiteral = getQuantityLiteral();
      var characterLiteral = getCharacterLiteral();
      var reluctantLiteral = _reluctant ? "?" : "";
      var behindLiteral = _behind != "" ? "(?=$_behind)" : "";
      literal.add("($captureLiteral(?:$characterLiteral)$quantityLiteral$reluctantLiteral)$behindLiteral");
      clear();
    }
  }
  
  String getQuantityLiteral() {
    if (_min != -1) {
      if (_max != -1) {
        return "{$_min,$_max}";
      }
      return "{$_min,}";
    }
    return "{0,$_max}";
  }
  
  String getCharacterLiteral() {
    if (_of != "") {
      return _of;
    }
    if (_ofAny) {
      return ".";
    }
    if (_from != "") {
      return "[$_from]";
    }
    if (_notFrom != "") {
      return "[^$_notFrom]";
    }
    if (_like != "") {
      return _like;
    }
  }
  
  String getLiteral() {
    flushState();
    return literal.toString();
  }
  
  RegExp getRegExp() {
    flushState();
    return new RegExp(literal.toString(), ignoreCase, multiLine);
  }
  
  Iterable range(int start, int end, [Dynamic f(int)]) {
    var r = new List();
    for (var i = start; i < end + 1; i++) {
      f != null ? r.add(f(i)) : r.add(i);
    }
    return r;
  }
  
  RegExpBuilder start() {
    literal.add("(?:^)");
    return this;
  }
  
  RegExpBuilder end() {
    literal.add(@"(?:$)");
    return this;
  }
  
  RegExpBuilder either(Function r) {
    flushState();
    _either = r(new RegExpBuilder()).getLiteral();
    return this;
  }
  
  RegExpBuilder or(Function r) {
    var either = _either;
    var or = r(new RegExpBuilder()).getLiteral();
    literal.add("(?:(?:$either)|(?:$or))");
    clear();
    return this;
  }
  
  RegExpBuilder exactly(int n) {
    flushState();
    _min = n;
    _max = n;
    return this;
  }
  
  RegExpBuilder min(int n) {
    flushState();
    _min = n;
    return this;
  }
  
  RegExpBuilder max(int n) {
    flushState();
    _max = n;
    return this;
  }
  
  RegExpBuilder of(String s) {
    _of = _escapeOutsideCharacterClass(s);
    return this;
  }
  
  RegExpBuilder ofAny() {
    _ofAny = true;
    return this;
  }
  
  RegExpBuilder from(Set<String> s) {
    _from = _escapeInsideCharacterClass(Strings.concatAll(new List.from(s)));
    return this;
  }
  
  RegExpBuilder notFrom(Set<String> s) {
    _notFrom = _escapeInsideCharacterClass(Strings.concatAll(new List.from(s)));
    return this;
  }
  
  RegExpBuilder like(Function r) {
    _like = r(new RegExpBuilder()).getLiteral();
    return this;
  }
  
  RegExpBuilder reluctant() {
    _reluctant = true;
    return this;
  }
  
  RegExpBuilder behind(Function r) {
    _behind = r(new RegExpBuilder()).getLiteral();
    return this;
  }
  
  RegExpBuilder asCapturingGroup() {
    _capture = true;
    return this;
  }
  
  String _escapeInsideCharacterClass(String s) {
    return _escapeSpecialCharacters(s, new HashSet.from([@"\", @"^", @"-", @"]"]));
  }

  String _escapeOutsideCharacterClass(String s) {
    return _escapeSpecialCharacters(s, new HashSet.from([@"\", @".", @"^", @"$", @"*", @"+", @"?", @"(", @")", @"[", @"{"]));
  }
  
  String _escapeSpecialCharacters(String s, Set<String> specialCharacters) {
    var escapedString = new StringBuffer();
    for (var i = 0; i < s.length; i++) {
      var character = s[i];
      if (specialCharacters.contains(character)) {
        escapedString.add("\\$character");
      }
      else {
        escapedString.add(character);
      }
    }
    return escapedString.toString();
  }
}
