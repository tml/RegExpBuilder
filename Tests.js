var TestRunner = function (tests) {
    var self = this;

    self._tests = tests;
    self._failed = 0;

    self.run = function () {
        for (var i = 0; i < self._tests.length; i++) {
            var test = self._tests[i];
            test.run();
            self._printResult(test);
        }
        self._printSummary();
    }

    self._printResult = function (test) {
        if (test.passed == true) {
            console.log("PASS: " + test.name);
        }
        else {
            self._failed++;
            console.log("FAIL: " + test.name);
        }
    }

    self._printSummary = function () {
        console.log("");
        if (self._failed == 0) {
            console.log("All " + self._tests.length + " tests passed.");
        }
        else {
            console.log(self._failed + " of " + self._tests.length + " tests failed.");
        }
    }
}

var Test = function (name, test) {
    var self = this;

    self.name = name;
    self.test = test;
    self.passed = true;

    self.expect = function (result) {
        if (result != true) {
            self.passed = false;
        }
    }

    self.run = function () {
        self.test(self);
    }
}

var tests = [];
tests.push(new Test("start", function (self) {
    var regex = new RegExpBuilder()
        .start()
        .exactly(1).of("p")
        .getRegExp();

    self.expect(regex.test("p"));
    self.expect(!regex.test("qp"));
}));

tests.push(new Test("end", function (self) {
    var regex = new RegExpBuilder()
        .exactly(1).of("p")
        .end()
        .getRegExp();

    self.expect(regex.test("p"));
    self.expect(!regex.test("pq"));
}));

tests.push(new Test("either or", function (self) {
    var regex = new RegExpBuilder()
        .start()
        .either(function (r) { return r.exactly(1).of("p"); })
        .or(function (r) { return r.exactly(2).of("q"); })
        .end()
        .getRegExp();

    self.expect(regex.test("p"));
    self.expect(regex.test("qq"));
    self.expect(!regex.test("pqq"));
    self.expect(!regex.test("qqp"));
}));

tests.push(new Test("exactly", function (self) {
    var regex = new RegExpBuilder()
        .start()
        .exactly(3).of("p")
        .end()
        .getRegExp();

    self.expect(regex.test("ppp"));
    self.expect(!regex.test("pp"));
    self.expect(!regex.test("pppp"));
}));

tests.push(new Test("min", function (self) {
    var regex = new RegExpBuilder()
        .start()
        .min(2).of("p")
        .end()
        .getRegExp();

    self.expect(regex.test("pp"));
    self.expect(regex.test("ppp"));
    self.expect(regex.test("ppppppp"));
    self.expect(!regex.test("p"));
}));

tests.push(new Test("max", function (self) {
    var regex = new RegExpBuilder()
        .start()
        .max(3).of("p")
        .end()
        .getRegExp();

    self.expect(regex.test("p"));
    self.expect(regex.test("pp"));
    self.expect(regex.test("ppp"));
    self.expect(!regex.test("pppp"));
    self.expect(!regex.test("pppppppp"));
}));

tests.push(new Test("min max", function (self) {
    var regex = new RegExpBuilder()
        .start()
        .min(3).max(7).of("p")
        .end()
        .getRegExp();

    self.expect(regex.test("ppp"));
    self.expect(regex.test("ppppp"));
    self.expect(regex.test("ppppppp"));
    self.expect(!regex.test("pp"));
    self.expect(!regex.test("p"));
    self.expect(!regex.test("pppppppp"));
    self.expect(!regex.test("pppppppppppp"));
}));

tests.push(new Test("of", function (self) {
    var regex = new RegExpBuilder()
        .start()
        .exactly(2).of("p p p ")
        .end()
        .getRegExp();

    self.expect(regex.test("p p p p p p "));
    self.expect(!regex.test("p p p p pp"));
}));

tests.push(new Test("ofAny", function (self) {
    var regex = new RegExpBuilder()
        .start()
        .exactly(3).ofAny()
        .end()
        .getRegExp();

    self.expect(regex.test("pqr"));
}));

tests.push(new Test("from", function (self) {
    var someLetters = ["p", "q", "r"];
    var regex = new RegExpBuilder()
        .start()
        .exactly(3).from(someLetters)
        .end()
        .getRegExp();

    self.expect(regex.test("ppp"));
    self.expect(regex.test("qqq"));
    self.expect(regex.test("ppq"));
    self.expect(regex.test("rqp"));
    self.expect(!regex.test("pyy"));
}));

tests.push(new Test("notFrom", function (self) {
    var someLetters = ["p", "q", "r"];
    var regex = new RegExpBuilder()
        .start()
        .exactly(3).notFrom(someLetters)
        .end()
        .getRegExp();

    self.expect(regex.test("lmn"));
    self.expect(!regex.test("mnq"));
}));

tests.push(new Test("like", function (self) {
    var pattern = function (r) {
        return r.min(1).of("p").min(2).of("q");
    }

    var regex = new RegExpBuilder()
        .start()
        .exactly(2).like(pattern)
        .end()
        .getRegExp();

    self.expect(regex.test("pqqpqq"));
    self.expect(!regex.test("qppqpp"));
}));

tests.push(new Test("reluctantly", function (self) {
    var regex = new RegExpBuilder()
        .exactly(2).of("p")
        .min(2).ofAny().reluctantly()
        .exactly(2).of("p")
        .getRegExp();

    self.expect(regex.exec("pprrrrpprrpp")[0] == "pprrrrpp");
}));

tests.push(new Test("behind", function (self) {
    var regex = new RegExpBuilder()
        .exactly(1).of("dart")
        .behind(function (r) { return r.exactly(1).of("lang"); })
        .getRegExp();

    self.expect(regex.exec("dartlang")[0] == "dart");
    self.expect(!regex.test("dartpqr"));
}));

tests.push(new Test("notBehind", function (self) {
    var regex = new RegExpBuilder()
        .exactly(1).of("dart")
        .notBehind(function (r) { return r.exactly(1).of("pqr"); })
        .getRegExp();

    self.expect(regex.test("dartlang"));
    self.expect(!regex.test("dartpqr"));
}));

tests.push(new Test("asCapturingGroup", function (self) {
    var regex = new RegExpBuilder()
        .min(1).max(3).of("p")
        .exactly(1).of("dart").asCapturingGroup()
        .exactly(1).from(["p", "q", "r"])
        .getRegExp();

    self.expect(regex.exec("pdartq")[1] == "dart");
}));

tests.push(new Test("special characters are escaped", function (self) {
    var shouldBeEscaped = ["\\", "\.", "*"];
    var regex = new RegExpBuilder()
        .min(1).from(shouldBeEscaped)
        .min(1).of("s")
        .min(1).of("+")
        .getRegExp();

    self.expect(regex.test("\\s+"));
}));

var testRunner = new TestRunner(tests);
testRunner.run();
