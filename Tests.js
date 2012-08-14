var test = function (testName, test) {
    var self = this;

    var testName = testName;
    var failed = false;

    self.expect = function (result) {
        if (result != true) {
            console.log("FAIL: " + testName);
            failed = true;
        }
    }
    test();
    if (!failed) {
        console.log("PASS: " + testName);
    }
}

test("start", function () {
    var regex = new RegExpBuilder()
        .start()
        .exactly(1).of("p")
        .getRegExp();

    expect(regex.test("p"));
    expect(!regex.test("qp"));
});

test("end", function () {
    var regex = new RegExpBuilder()
        .exactly(1).of("p")
        .end()
        .getRegExp();

    expect(regex.test("p"));
    expect(!regex.test("pq"));
});

test("either or", function () {
    var regex = new RegExpBuilder()
        .start()
        .either(function (r) { return r.exactly(1).of("p"); })
        .or(function (r) { return r.exactly(2).of("q"); })
        .end()
        .getRegExp();

    expect(regex.test("p"));
    expect(regex.test("qq"));
    expect(!regex.test("pqq"));
    expect(!regex.test("qqp"));
});

test("exactly", function () {
    var regex = new RegExpBuilder()
        .start()
        .exactly(3).of("p")
        .end()
        .getRegExp();

    expect(regex.test("ppp"));
    expect(!regex.test("pp"));
    expect(!regex.test("pppp"));
});

test("min", function () {
    var regex = new RegExpBuilder()
        .start()
        .min(2).of("p")
        .end()
        .getRegExp();

    expect(regex.test("pp"));
    expect(regex.test("ppp"));
    expect(regex.test("ppppppp"));
    expect(!regex.test("p"));
});

test("max", function () {
    var regex = new RegExpBuilder()
        .start()
        .max(3).of("p")
        .end()
        .getRegExp();

    expect(regex.test("p"));
    expect(regex.test("pp"));
    expect(regex.test("ppp"));
    expect(!regex.test("pppp"));
    expect(!regex.test("pppppppp"));
});

test("min max", function () {
    var regex = new RegExpBuilder()
        .start()
        .min(3).max(7).of("p")
        .end()
        .getRegExp();

    expect(regex.test("ppp"));
    expect(regex.test("ppppp"));
    expect(regex.test("ppppppp"));
    expect(!regex.test("pp"));
    expect(!regex.test("p"));
    expect(!regex.test("pppppppp"));
    expect(!regex.test("pppppppppppp"));
});

test("of", function () {
    var regex = new RegExpBuilder()
        .start()
        .exactly(2).of("p p p ")
        .end()
        .getRegExp();

    expect(regex.test("p p p p p p "));
    expect(!regex.test("p p p p pp"));
});

test("ofAny", function () {
    var regex = new RegExpBuilder()
        .start()
        .exactly(3).ofAny()
        .end()
        .getRegExp();

    expect(regex.test("pqr"));
});

test("from", function () {
    var someLetters = ["p", "q", "r"];
    var regex = new RegExpBuilder()
        .start()
        .exactly(3).from(someLetters)
        .end()
        .getRegExp();

    expect(regex.test("ppp"));
    expect(regex.test("qqq"));
    expect(regex.test("ppq"));
    expect(regex.test("rqp"));
    expect(!regex.test("pyy"));
});

test("notFrom", function () {
    var someLetters = ["p", "q", "r"];
    var regex = new RegExpBuilder()
        .start()
        .exactly(3).notFrom(someLetters)
        .end()
        .getRegExp();

    expect(regex.test("lmn"));
    expect(!regex.test("mnq"));
});

test("like", function () {
    var pattern = function (r) {
        return r.min(1).of("p").min(2).of("q");
    }

    var regex = new RegExpBuilder()
        .start()
        .exactly(2).like(pattern)
        .end()
        .getRegExp();

    expect(regex.test("pqqpqq"));
    expect(!regex.test("qppqpp"));
});

test("reluctantly", function () {
    var regex = new RegExpBuilder()
        .exactly(2).of("p")
        .min(2).ofAny().reluctantly()
        .exactly(2).of("p")
        .getRegExp();

    expect(regex.exec("pprrrrpprrpp")[0] == "pprrrrpp");
});

test("behind", function () {
    var regex = new RegExpBuilder()
        .exactly(1).of("dart")
        .behind(function (r) { return r.exactly(1).of("lang"); })
        .getRegExp();

    expect(regex.exec("dartlang")[0] == "dart");
    expect(!regex.test("dartpqr"));
});

test("notBehind", function () {
    var regex = new RegExpBuilder()
        .exactly(1).of("dart")
        .notBehind(function (r) { return r.exactly(1).of("pqr"); })
        .getRegExp();

    expect(regex.test("dartlang"));
    expect(!regex.test("dartpqr"));
});

test("asCapturingGroup", function () {
    var regex = new RegExpBuilder()
        .min(1).max(3).of("p")
        .exactly(1).of("dart").asCapturingGroup()
        .exactly(1).from(["p", "q", "r"])
        .getRegExp();

    expect(regex.exec("pdartq")[1] == "dart");
});

test("special characters are escaped", function () {
    var shouldBeEscaped = ["\\", "\.", "*"];
    var regex = new RegExpBuilder()
        .min(1).from(shouldBeEscaped)
        .min(1).of("s")
        .min(1).of("+")
        .getRegExp();

    expect(regex.test("\\s+"));
});