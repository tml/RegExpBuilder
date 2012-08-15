var RegExpBuilder = function () {
    var self = this;

    self._literal = [];
    self._specialCharactersInsideCharacterClass = { "\^": true, "\-": true, "\]": true };
    self._specialCharactersOutsideCharacterClass = { "\.": true, "\^": true, "\$": true, "\*": true, "\+": true, "\?": true, "\(": true, "\)": true, "\[": true, "\{": true };
    self._escapedString = [];

    self._clear = function () {
        self._ignoreCase = "";
        self._multiLine = "";
        self._min = -1;
        self._max = -1;
        self._of = "";
        self._ofAny = false;
        self._from = "";
        self._notFrom = "";
        self._like = "";
        self._behind = "";
        self._notBehind = "";
        self._either = "";
        self._reluctant = false;
        self._capture = false;
    }

    self._clear();

    self._flushState = function () {
        if (self._of != "" || self._ofAny || self._from != "" || self._notFrom != "" || self._like != "") {
            var captureLiteral = self._capture ? "" : "?:";
            var quantityLiteral = self._getQuantityLiteral();
            var characterLiteral = self._getCharacterLiteral();
            var reluctantLiteral = self._reluctant ? "?" : "";
            var behindLiteral = self._behind != "" ? "(?=" + self._behind + ")" : "";
            var notBehindLiteral = self._notBehind != "" ? "(?!" + self._notBehind + ")" : "";
            self._literal.push("(" + captureLiteral + "(?:" + characterLiteral + ")" + quantityLiteral + reluctantLiteral + ")" + behindLiteral + notBehindLiteral);
            self._clear();
        }
    }

    self._getQuantityLiteral = function () {
        if (self._min != -1) {
            if (self._max != -1) {
                return "{" + self._min + "," + self._max + "}";
            }
            return "{" + self._min + ",}";
        }
        return "{0," + self._max + "}";
    }

    self._getCharacterLiteral = function () {
        if (self._of != "") {
            return self._of;
        }
        if (self._ofAny) {
            return ".";
        }
        if (self._from != "") {
            return "[" + self._from + "]";
        }
        if (self._notFrom != "") {
            return "[^" + self._notFrom + "]";
        }
        if (self._like != "") {
            return self._like;
        }
    }

    self.getLiteral = function () {
        self._flushState();
        return self._literal.join("");
    }

    self.getRegExp = function () {
        self._flushState();

        return new RegExp(self._literal.join(""), self._ignoreCase + self._multiLine);
    }

    self.ignoreCase = function () {
        self._ignoreCase = "i";
        return self;
    }

    self.multiLine = function () {
        self._multiLine = "m";
        return self;
    }

    self.start = function () {
        self._literal.push("(?:^)");
        return self;
    }

    self.end = function () {
        self._flushState();
        self._literal.push("(?:$)");
        return self;
    }

    self.either = function (r) {
        self._flushState();
        self._either = r(new RegExpBuilder()).getLiteral();
        return self;
    }

    self.or = function (r) {
        var either = self._either;
        var or = r(new RegExpBuilder()).getLiteral();
        self._literal.push("(?:(?:" + either + ")|(?:" + or + "))");
        self._clear();
        return self;
    }

    self.exactly = function (n) {
        self._flushState();
        self._min = n;
        self._max = n;
        return self;
    }

    self.min = function (n) {
        self._flushState();
        self._min = n;
        return self;
    }

    self.max = function (n) {
        self._flushState();
        self._max = n;
        return self;
    }

    self.of = function (s) {
        self._of = self._escapeOutsideCharacterClass(s);
        return self;
    }

    self.ofAny = function () {
        self._ofAny = true;
        return self;
    }

    self.from = function (s) {
        self._from = self._escapeInsideCharacterClass(s.join(""));
        return self;
    }

    self.notFrom = function (s) {
        self._notFrom = self._escapeInsideCharacterClass(s.join(""));
        return self;
    }

    self.like = function (r) {
        self._like = r(new RegExpBuilder()).getLiteral();
        return self;
    }

    self.reluctantly = function () {
        self._reluctant = true;
        return self;
    }

    self.behind = function (r) {
        self._behind = r(new RegExpBuilder()).getLiteral();
        return self;
    }

    self.notBehind = function (r) {
        self._notBehind = r(new RegExpBuilder()).getLiteral();
        return self;
    }

    self.asCapturingGroup = function () {
        self._capture = true;
        return self;
    }

    self._escapeInsideCharacterClass = function (s) {
        return self._escapeSpecialCharacters(s, self._specialCharactersInsideCharacterClass);
    }

    self._escapeOutsideCharacterClass = function (s) {
        return self._escapeSpecialCharacters(s, self._specialCharactersOutsideCharacterClass);
    }

    self._escapeSpecialCharacters = function (s, specialCharacters) {
        self._escapedString.length = 0;
        for (var i = 0; i < s.length; i++) {
            var character = s[i];
            if (specialCharacters[character]) {
                self._escapedString.push("\\" + character);
            }
            else {
                self._escapedString.push(character);
            }
        }
        return self._escapedString.join("");
    }
}