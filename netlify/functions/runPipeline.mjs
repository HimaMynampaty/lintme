var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/js-yaml/dist/js-yaml.mjs
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index2, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index2 = 0, length = sourceKeys.length; index2 < length; index2 += 1) {
      key = sourceKeys[index2];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string3, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string3;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark) return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
function getLine(buffer, lineStart, lineEnd, position3, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position3 - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position3 - maxHalfLength + head.length;
  }
  if (lineEnd - position3 > maxHalfLength) {
    tail = " ...";
    lineEnd = position3 + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position3 - lineStart + head.length
    // relative position
  };
}
function padStart(string3, max) {
  return common.repeat(" ", max - string3.length) + string3;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== "number") options.indent = 1;
  if (typeof options.linesBefore !== "number") options.linesBefore = 3;
  if (typeof options.linesAfter !== "number") options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index2, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index2 = 0, length = arguments.length; index2 < length; index2 += 1) {
    arguments[index2].forEach(collectType);
  }
  return result;
}
function Schema$1(definition2) {
  return this.extend(definition2);
}
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index2 = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index2];
  if (ch === "-" || ch === "+") {
    ch = data[++index2];
  }
  if (ch === "0") {
    if (index2 + 1 === max) return true;
    ch = data[++index2];
    if (ch === "b") {
      index2++;
      for (; index2 < max; index2++) {
        ch = data[index2];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index2++;
      for (; index2 < max; index2++) {
        ch = data[index2];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index2))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index2++;
      for (; index2 < max; index2++) {
        ch = data[index2];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index2))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_") return false;
  for (; index2 < max; index2++) {
    ch = data[index2];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index2))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code2, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code2 = map2.indexOf(data.charAt(idx));
    if (code2 > 64) continue;
    if (code2 < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index2, length, pair, pairKey, pairHasKey, object = data;
  for (index2 = 0, length = object.length; index2 < length; index2 += 1) {
    pair = object[index2];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index2, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index2 = 0, length = object.length; index2 < length; index2 += 1) {
    pair = object[index2];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index2] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index2, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index2 = 0, length = object.length; index2 < length; index2 += 1) {
    pair = object[index2];
    keys = Object.keys(pair);
    result[index2] = [keys[0], pair[keys[0]]];
  }
  return result;
}
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index2, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index2 = 0, quantity = sourceKeys.length; index2 < quantity; index2 += 1) {
    key = sourceKeys[index2];
    if (!_hasOwnProperty$1.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index2, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index2 = 0, quantity = keyNode.length; index2 < quantity; index2 += 1) {
      if (Array.isArray(keyNode[index2])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index2]) === "[object Object]") {
        keyNode[index2] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index2 = 0, quantity = valueNode.length; index2 < quantity; index2 += 1) {
        mergeMappings(state, _result, valueNode[index2], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    if (keyNode === "__proto__") {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index2 = 0, length = documents.length; index2 < length; index2 += 1) {
    iterator(documents[index2]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
function compileStyleMap(schema2, map2) {
  var result, keys, index2, length, tag, style, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index2 = 0, length = keys.length; index2 < length; index2 += 1) {
    tag = keys[index2];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string3, handle, length;
  string3 = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string3.length) + string3;
}
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string3, spaces) {
  var ind = common.repeat(" ", spaces), position3 = 0, next = -1, result = "", line, length = string3.length;
  while (position3 < length) {
    next = string3.indexOf("\n", position3);
    if (next === -1) {
      line = string3.slice(position3);
      position3 = length;
    } else {
      line = string3.slice(position3, next + 1);
      position3 = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index2, length, type2;
  for (index2 = 0, length = state.implicitTypes.length; index2 < length; index2 += 1) {
    type2 = state.implicitTypes[index2];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string3, pos) {
  var first = string3.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string3.length) {
    second = string3.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string3) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string3);
}
function chooseScalarStyle(string3, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string3, 0)) && isPlainSafeLast(codePointAt(string3, string3.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string3.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string3, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string3.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string3, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string3[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string3[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string3)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string3)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string3, level, iskey, inblock) {
  state.dump = function() {
    if (string3.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string3) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string3)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string3 + '"' : "'" + string3 + "'";
      }
    }
    var indent2 = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent2);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string4) {
      return testImplicitResolving(state, string4);
    }
    switch (chooseScalarStyle(
      string3,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string3;
      case STYLE_SINGLE:
        return "'" + string3.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string3, state.indent) + dropEndingNewline(indentString(string3, indent2));
      case STYLE_FOLDED:
        return ">" + blockHeader(string3, state.indent) + dropEndingNewline(indentString(foldString(string3, lineWidth), indent2));
      case STYLE_DOUBLE:
        return '"' + escapeString(string3) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  }();
}
function blockHeader(string3, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string3) ? String(indentPerLevel) : "";
  var clip = string3[string3.length - 1] === "\n";
  var keep = clip && (string3[string3.length - 2] === "\n" || string3 === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string3) {
  return string3[string3.length - 1] === "\n" ? string3.slice(0, -1) : string3;
}
function foldString(string3, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = function() {
    var nextLF = string3.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string3.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string3.slice(0, nextLF), width);
  }();
  var prevMoreIndented = string3[0] === "\n" || string3[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string3)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string3) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string3.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string3, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string3[i];
      if (char >= 65536) result += string3[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index2, length, value;
  for (index2 = 0, length = object.length; index2 < length; index2 += 1) {
    value = object[index2];
    if (state.replacer) {
      value = state.replacer.call(object, String(index2), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index2, length, value;
  for (index2 = 0, length = object.length; index2 < length; index2 += 1) {
    value = object[index2];
    if (state.replacer) {
      value = state.replacer.call(object, String(index2), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index2, length, objectKey, objectValue, pairBuffer;
  for (index2 = 0, length = objectKeyList.length; index2 < length; index2 += 1) {
    pairBuffer = "";
    if (_result !== "") pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index2];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index2, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index2 = 0, length = objectKeyList.length; index2 < length; index2 += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index2];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index2, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index2 = 0, length = typeList.length; index2 < length; index2 += 1) {
    type2 = typeList[index2];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index2, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index2 = 0, length = duplicatesIndexes.length; index2 < length; index2 += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index2]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index2, length;
  if (object !== null && typeof object === "object") {
    index2 = objects.indexOf(object);
    if (index2 !== -1) {
      if (duplicatesIndexes.indexOf(index2) === -1) {
        duplicatesIndexes.push(index2);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index2 = 0, length = object.length; index2 < length; index2 += 1) {
          inspectNode(object[index2], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index2 = 0, length = objectKeyList.length; index2 < length; index2 += 1) {
          inspectNode(object[objectKeyList[index2]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
  return "";
}
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var isNothing_1, isObject_1, toArray_1, repeat_1, isNegativeZero_1, extend_1, common, exception, snippet, TYPE_CONSTRUCTOR_OPTIONS, YAML_NODE_KINDS, type, schema, str, seq, map, failsafe, _null, bool, int, YAML_FLOAT_PATTERN, SCIENTIFIC_WITHOUT_DOT, float, json, core, YAML_DATE_REGEXP, YAML_TIMESTAMP_REGEXP, timestamp, merge, BASE64_MAP, binary, _hasOwnProperty$3, _toString$2, omap, _toString$1, pairs, _hasOwnProperty$2, set, _default, _hasOwnProperty$1, CONTEXT_FLOW_IN, CONTEXT_FLOW_OUT, CONTEXT_BLOCK_IN, CONTEXT_BLOCK_OUT, CHOMPING_CLIP, CHOMPING_STRIP, CHOMPING_KEEP, PATTERN_NON_PRINTABLE, PATTERN_NON_ASCII_LINE_BREAKS, PATTERN_FLOW_INDICATORS, PATTERN_TAG_HANDLE, PATTERN_TAG_URI, simpleEscapeCheck, simpleEscapeMap, i, directiveHandlers, loadAll_1, load_1, loader, _toString, _hasOwnProperty, CHAR_BOM, CHAR_TAB, CHAR_LINE_FEED, CHAR_CARRIAGE_RETURN, CHAR_SPACE, CHAR_EXCLAMATION, CHAR_DOUBLE_QUOTE, CHAR_SHARP, CHAR_PERCENT, CHAR_AMPERSAND, CHAR_SINGLE_QUOTE, CHAR_ASTERISK, CHAR_COMMA, CHAR_MINUS, CHAR_COLON, CHAR_EQUALS, CHAR_GREATER_THAN, CHAR_QUESTION, CHAR_COMMERCIAL_AT, CHAR_LEFT_SQUARE_BRACKET, CHAR_RIGHT_SQUARE_BRACKET, CHAR_GRAVE_ACCENT, CHAR_LEFT_CURLY_BRACKET, CHAR_VERTICAL_LINE, CHAR_RIGHT_CURLY_BRACKET, ESCAPE_SEQUENCES, DEPRECATED_BOOLEANS_SYNTAX, DEPRECATED_BASE60_SYNTAX, QUOTING_TYPE_SINGLE, QUOTING_TYPE_DOUBLE, STYLE_PLAIN, STYLE_SINGLE, STYLE_LITERAL, STYLE_FOLDED, STYLE_DOUBLE, dump_1, dumper, Type, Schema, FAILSAFE_SCHEMA, JSON_SCHEMA, CORE_SCHEMA, DEFAULT_SCHEMA, load, loadAll, dump, YAMLException, types, safeLoad, safeLoadAll, safeDump, jsYaml, js_yaml_default;
var init_js_yaml = __esm({
  "node_modules/js-yaml/dist/js-yaml.mjs"() {
    isNothing_1 = isNothing;
    isObject_1 = isObject;
    toArray_1 = toArray;
    repeat_1 = repeat;
    isNegativeZero_1 = isNegativeZero;
    extend_1 = extend;
    common = {
      isNothing: isNothing_1,
      isObject: isObject_1,
      toArray: toArray_1,
      repeat: repeat_1,
      isNegativeZero: isNegativeZero_1,
      extend: extend_1
    };
    YAMLException$1.prototype = Object.create(Error.prototype);
    YAMLException$1.prototype.constructor = YAMLException$1;
    YAMLException$1.prototype.toString = function toString(compact) {
      return this.name + ": " + formatError(this, compact);
    };
    exception = YAMLException$1;
    snippet = makeSnippet;
    TYPE_CONSTRUCTOR_OPTIONS = [
      "kind",
      "multi",
      "resolve",
      "construct",
      "instanceOf",
      "predicate",
      "represent",
      "representName",
      "defaultStyle",
      "styleAliases"
    ];
    YAML_NODE_KINDS = [
      "scalar",
      "sequence",
      "mapping"
    ];
    type = Type$1;
    Schema$1.prototype.extend = function extend2(definition2) {
      var implicit = [];
      var explicit = [];
      if (definition2 instanceof type) {
        explicit.push(definition2);
      } else if (Array.isArray(definition2)) {
        explicit = explicit.concat(definition2);
      } else if (definition2 && (Array.isArray(definition2.implicit) || Array.isArray(definition2.explicit))) {
        if (definition2.implicit) implicit = implicit.concat(definition2.implicit);
        if (definition2.explicit) explicit = explicit.concat(definition2.explicit);
      } else {
        throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
      }
      implicit.forEach(function(type$1) {
        if (!(type$1 instanceof type)) {
          throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
        }
        if (type$1.loadKind && type$1.loadKind !== "scalar") {
          throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
        }
        if (type$1.multi) {
          throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
        }
      });
      explicit.forEach(function(type$1) {
        if (!(type$1 instanceof type)) {
          throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
        }
      });
      var result = Object.create(Schema$1.prototype);
      result.implicit = (this.implicit || []).concat(implicit);
      result.explicit = (this.explicit || []).concat(explicit);
      result.compiledImplicit = compileList(result, "implicit");
      result.compiledExplicit = compileList(result, "explicit");
      result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
      return result;
    };
    schema = Schema$1;
    str = new type("tag:yaml.org,2002:str", {
      kind: "scalar",
      construct: function(data) {
        return data !== null ? data : "";
      }
    });
    seq = new type("tag:yaml.org,2002:seq", {
      kind: "sequence",
      construct: function(data) {
        return data !== null ? data : [];
      }
    });
    map = new type("tag:yaml.org,2002:map", {
      kind: "mapping",
      construct: function(data) {
        return data !== null ? data : {};
      }
    });
    failsafe = new schema({
      explicit: [
        str,
        seq,
        map
      ]
    });
    _null = new type("tag:yaml.org,2002:null", {
      kind: "scalar",
      resolve: resolveYamlNull,
      construct: constructYamlNull,
      predicate: isNull,
      represent: {
        canonical: function() {
          return "~";
        },
        lowercase: function() {
          return "null";
        },
        uppercase: function() {
          return "NULL";
        },
        camelcase: function() {
          return "Null";
        },
        empty: function() {
          return "";
        }
      },
      defaultStyle: "lowercase"
    });
    bool = new type("tag:yaml.org,2002:bool", {
      kind: "scalar",
      resolve: resolveYamlBoolean,
      construct: constructYamlBoolean,
      predicate: isBoolean,
      represent: {
        lowercase: function(object) {
          return object ? "true" : "false";
        },
        uppercase: function(object) {
          return object ? "TRUE" : "FALSE";
        },
        camelcase: function(object) {
          return object ? "True" : "False";
        }
      },
      defaultStyle: "lowercase"
    });
    int = new type("tag:yaml.org,2002:int", {
      kind: "scalar",
      resolve: resolveYamlInteger,
      construct: constructYamlInteger,
      predicate: isInteger,
      represent: {
        binary: function(obj) {
          return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
        },
        octal: function(obj) {
          return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
        },
        decimal: function(obj) {
          return obj.toString(10);
        },
        /* eslint-disable max-len */
        hexadecimal: function(obj) {
          return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
        }
      },
      defaultStyle: "decimal",
      styleAliases: {
        binary: [2, "bin"],
        octal: [8, "oct"],
        decimal: [10, "dec"],
        hexadecimal: [16, "hex"]
      }
    });
    YAML_FLOAT_PATTERN = new RegExp(
      // 2.5e4, 2.5 and integers
      "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
    );
    SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
    float = new type("tag:yaml.org,2002:float", {
      kind: "scalar",
      resolve: resolveYamlFloat,
      construct: constructYamlFloat,
      predicate: isFloat,
      represent: representYamlFloat,
      defaultStyle: "lowercase"
    });
    json = failsafe.extend({
      implicit: [
        _null,
        bool,
        int,
        float
      ]
    });
    core = json;
    YAML_DATE_REGEXP = new RegExp(
      "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
    );
    YAML_TIMESTAMP_REGEXP = new RegExp(
      "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
    );
    timestamp = new type("tag:yaml.org,2002:timestamp", {
      kind: "scalar",
      resolve: resolveYamlTimestamp,
      construct: constructYamlTimestamp,
      instanceOf: Date,
      represent: representYamlTimestamp
    });
    merge = new type("tag:yaml.org,2002:merge", {
      kind: "scalar",
      resolve: resolveYamlMerge
    });
    BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
    binary = new type("tag:yaml.org,2002:binary", {
      kind: "scalar",
      resolve: resolveYamlBinary,
      construct: constructYamlBinary,
      predicate: isBinary,
      represent: representYamlBinary
    });
    _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
    _toString$2 = Object.prototype.toString;
    omap = new type("tag:yaml.org,2002:omap", {
      kind: "sequence",
      resolve: resolveYamlOmap,
      construct: constructYamlOmap
    });
    _toString$1 = Object.prototype.toString;
    pairs = new type("tag:yaml.org,2002:pairs", {
      kind: "sequence",
      resolve: resolveYamlPairs,
      construct: constructYamlPairs
    });
    _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
    set = new type("tag:yaml.org,2002:set", {
      kind: "mapping",
      resolve: resolveYamlSet,
      construct: constructYamlSet
    });
    _default = core.extend({
      implicit: [
        timestamp,
        merge
      ],
      explicit: [
        binary,
        omap,
        pairs,
        set
      ]
    });
    _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
    CONTEXT_FLOW_IN = 1;
    CONTEXT_FLOW_OUT = 2;
    CONTEXT_BLOCK_IN = 3;
    CONTEXT_BLOCK_OUT = 4;
    CHOMPING_CLIP = 1;
    CHOMPING_STRIP = 2;
    CHOMPING_KEEP = 3;
    PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
    PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
    PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
    PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
    PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
    simpleEscapeCheck = new Array(256);
    simpleEscapeMap = new Array(256);
    for (i = 0; i < 256; i++) {
      simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
      simpleEscapeMap[i] = simpleEscapeSequence(i);
    }
    directiveHandlers = {
      YAML: function handleYamlDirective(state, name, args) {
        var match, major, minor;
        if (state.version !== null) {
          throwError(state, "duplication of %YAML directive");
        }
        if (args.length !== 1) {
          throwError(state, "YAML directive accepts exactly one argument");
        }
        match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
        if (match === null) {
          throwError(state, "ill-formed argument of the YAML directive");
        }
        major = parseInt(match[1], 10);
        minor = parseInt(match[2], 10);
        if (major !== 1) {
          throwError(state, "unacceptable YAML version of the document");
        }
        state.version = args[0];
        state.checkLineBreaks = minor < 2;
        if (minor !== 1 && minor !== 2) {
          throwWarning(state, "unsupported YAML version of the document");
        }
      },
      TAG: function handleTagDirective(state, name, args) {
        var handle, prefix;
        if (args.length !== 2) {
          throwError(state, "TAG directive accepts exactly two arguments");
        }
        handle = args[0];
        prefix = args[1];
        if (!PATTERN_TAG_HANDLE.test(handle)) {
          throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
        }
        if (_hasOwnProperty$1.call(state.tagMap, handle)) {
          throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
        }
        if (!PATTERN_TAG_URI.test(prefix)) {
          throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
        }
        try {
          prefix = decodeURIComponent(prefix);
        } catch (err) {
          throwError(state, "tag prefix is malformed: " + prefix);
        }
        state.tagMap[handle] = prefix;
      }
    };
    loadAll_1 = loadAll$1;
    load_1 = load$1;
    loader = {
      loadAll: loadAll_1,
      load: load_1
    };
    _toString = Object.prototype.toString;
    _hasOwnProperty = Object.prototype.hasOwnProperty;
    CHAR_BOM = 65279;
    CHAR_TAB = 9;
    CHAR_LINE_FEED = 10;
    CHAR_CARRIAGE_RETURN = 13;
    CHAR_SPACE = 32;
    CHAR_EXCLAMATION = 33;
    CHAR_DOUBLE_QUOTE = 34;
    CHAR_SHARP = 35;
    CHAR_PERCENT = 37;
    CHAR_AMPERSAND = 38;
    CHAR_SINGLE_QUOTE = 39;
    CHAR_ASTERISK = 42;
    CHAR_COMMA = 44;
    CHAR_MINUS = 45;
    CHAR_COLON = 58;
    CHAR_EQUALS = 61;
    CHAR_GREATER_THAN = 62;
    CHAR_QUESTION = 63;
    CHAR_COMMERCIAL_AT = 64;
    CHAR_LEFT_SQUARE_BRACKET = 91;
    CHAR_RIGHT_SQUARE_BRACKET = 93;
    CHAR_GRAVE_ACCENT = 96;
    CHAR_LEFT_CURLY_BRACKET = 123;
    CHAR_VERTICAL_LINE = 124;
    CHAR_RIGHT_CURLY_BRACKET = 125;
    ESCAPE_SEQUENCES = {};
    ESCAPE_SEQUENCES[0] = "\\0";
    ESCAPE_SEQUENCES[7] = "\\a";
    ESCAPE_SEQUENCES[8] = "\\b";
    ESCAPE_SEQUENCES[9] = "\\t";
    ESCAPE_SEQUENCES[10] = "\\n";
    ESCAPE_SEQUENCES[11] = "\\v";
    ESCAPE_SEQUENCES[12] = "\\f";
    ESCAPE_SEQUENCES[13] = "\\r";
    ESCAPE_SEQUENCES[27] = "\\e";
    ESCAPE_SEQUENCES[34] = '\\"';
    ESCAPE_SEQUENCES[92] = "\\\\";
    ESCAPE_SEQUENCES[133] = "\\N";
    ESCAPE_SEQUENCES[160] = "\\_";
    ESCAPE_SEQUENCES[8232] = "\\L";
    ESCAPE_SEQUENCES[8233] = "\\P";
    DEPRECATED_BOOLEANS_SYNTAX = [
      "y",
      "Y",
      "yes",
      "Yes",
      "YES",
      "on",
      "On",
      "ON",
      "n",
      "N",
      "no",
      "No",
      "NO",
      "off",
      "Off",
      "OFF"
    ];
    DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
    QUOTING_TYPE_SINGLE = 1;
    QUOTING_TYPE_DOUBLE = 2;
    STYLE_PLAIN = 1;
    STYLE_SINGLE = 2;
    STYLE_LITERAL = 3;
    STYLE_FOLDED = 4;
    STYLE_DOUBLE = 5;
    dump_1 = dump$1;
    dumper = {
      dump: dump_1
    };
    Type = type;
    Schema = schema;
    FAILSAFE_SCHEMA = failsafe;
    JSON_SCHEMA = json;
    CORE_SCHEMA = core;
    DEFAULT_SCHEMA = _default;
    load = loader.load;
    loadAll = loader.loadAll;
    dump = dumper.dump;
    YAMLException = exception;
    types = {
      binary,
      float,
      map,
      null: _null,
      pairs,
      set,
      timestamp,
      bool,
      int,
      merge,
      omap,
      seq,
      str
    };
    safeLoad = renamed("safeLoad", "load");
    safeLoadAll = renamed("safeLoadAll", "loadAll");
    safeDump = renamed("safeDump", "dump");
    jsYaml = {
      Type,
      Schema,
      FAILSAFE_SCHEMA,
      JSON_SCHEMA,
      CORE_SCHEMA,
      DEFAULT_SCHEMA,
      load,
      loadAll,
      dump,
      YAMLException,
      types,
      safeLoad,
      safeLoadAll,
      safeDump
    };
    js_yaml_default = jsYaml;
  }
});

// node_modules/mdast-util-to-string/lib/index.js
function toString2(value, options) {
  const settings = options || emptyOptions;
  const includeImageAlt = typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true;
  const includeHtml = typeof settings.includeHtml === "boolean" ? settings.includeHtml : true;
  return one(value, includeImageAlt, includeHtml);
}
function one(value, includeImageAlt, includeHtml) {
  if (node(value)) {
    if ("value" in value) {
      return value.type === "html" && !includeHtml ? "" : value.value;
    }
    if (includeImageAlt && "alt" in value && value.alt) {
      return value.alt;
    }
    if ("children" in value) {
      return all(value.children, includeImageAlt, includeHtml);
    }
  }
  if (Array.isArray(value)) {
    return all(value, includeImageAlt, includeHtml);
  }
  return "";
}
function all(values, includeImageAlt, includeHtml) {
  const result = [];
  let index2 = -1;
  while (++index2 < values.length) {
    result[index2] = one(values[index2], includeImageAlt, includeHtml);
  }
  return result.join("");
}
function node(value) {
  return Boolean(value && typeof value === "object");
}
var emptyOptions;
var init_lib = __esm({
  "node_modules/mdast-util-to-string/lib/index.js"() {
    emptyOptions = {};
  }
});

// node_modules/mdast-util-to-string/index.js
var init_mdast_util_to_string = __esm({
  "node_modules/mdast-util-to-string/index.js"() {
    init_lib();
  }
});

// node_modules/character-entities/index.js
var characterEntities;
var init_character_entities = __esm({
  "node_modules/character-entities/index.js"() {
    characterEntities = {
      AElig: "\xC6",
      AMP: "&",
      Aacute: "\xC1",
      Abreve: "\u0102",
      Acirc: "\xC2",
      Acy: "\u0410",
      Afr: "\u{1D504}",
      Agrave: "\xC0",
      Alpha: "\u0391",
      Amacr: "\u0100",
      And: "\u2A53",
      Aogon: "\u0104",
      Aopf: "\u{1D538}",
      ApplyFunction: "\u2061",
      Aring: "\xC5",
      Ascr: "\u{1D49C}",
      Assign: "\u2254",
      Atilde: "\xC3",
      Auml: "\xC4",
      Backslash: "\u2216",
      Barv: "\u2AE7",
      Barwed: "\u2306",
      Bcy: "\u0411",
      Because: "\u2235",
      Bernoullis: "\u212C",
      Beta: "\u0392",
      Bfr: "\u{1D505}",
      Bopf: "\u{1D539}",
      Breve: "\u02D8",
      Bscr: "\u212C",
      Bumpeq: "\u224E",
      CHcy: "\u0427",
      COPY: "\xA9",
      Cacute: "\u0106",
      Cap: "\u22D2",
      CapitalDifferentialD: "\u2145",
      Cayleys: "\u212D",
      Ccaron: "\u010C",
      Ccedil: "\xC7",
      Ccirc: "\u0108",
      Cconint: "\u2230",
      Cdot: "\u010A",
      Cedilla: "\xB8",
      CenterDot: "\xB7",
      Cfr: "\u212D",
      Chi: "\u03A7",
      CircleDot: "\u2299",
      CircleMinus: "\u2296",
      CirclePlus: "\u2295",
      CircleTimes: "\u2297",
      ClockwiseContourIntegral: "\u2232",
      CloseCurlyDoubleQuote: "\u201D",
      CloseCurlyQuote: "\u2019",
      Colon: "\u2237",
      Colone: "\u2A74",
      Congruent: "\u2261",
      Conint: "\u222F",
      ContourIntegral: "\u222E",
      Copf: "\u2102",
      Coproduct: "\u2210",
      CounterClockwiseContourIntegral: "\u2233",
      Cross: "\u2A2F",
      Cscr: "\u{1D49E}",
      Cup: "\u22D3",
      CupCap: "\u224D",
      DD: "\u2145",
      DDotrahd: "\u2911",
      DJcy: "\u0402",
      DScy: "\u0405",
      DZcy: "\u040F",
      Dagger: "\u2021",
      Darr: "\u21A1",
      Dashv: "\u2AE4",
      Dcaron: "\u010E",
      Dcy: "\u0414",
      Del: "\u2207",
      Delta: "\u0394",
      Dfr: "\u{1D507}",
      DiacriticalAcute: "\xB4",
      DiacriticalDot: "\u02D9",
      DiacriticalDoubleAcute: "\u02DD",
      DiacriticalGrave: "`",
      DiacriticalTilde: "\u02DC",
      Diamond: "\u22C4",
      DifferentialD: "\u2146",
      Dopf: "\u{1D53B}",
      Dot: "\xA8",
      DotDot: "\u20DC",
      DotEqual: "\u2250",
      DoubleContourIntegral: "\u222F",
      DoubleDot: "\xA8",
      DoubleDownArrow: "\u21D3",
      DoubleLeftArrow: "\u21D0",
      DoubleLeftRightArrow: "\u21D4",
      DoubleLeftTee: "\u2AE4",
      DoubleLongLeftArrow: "\u27F8",
      DoubleLongLeftRightArrow: "\u27FA",
      DoubleLongRightArrow: "\u27F9",
      DoubleRightArrow: "\u21D2",
      DoubleRightTee: "\u22A8",
      DoubleUpArrow: "\u21D1",
      DoubleUpDownArrow: "\u21D5",
      DoubleVerticalBar: "\u2225",
      DownArrow: "\u2193",
      DownArrowBar: "\u2913",
      DownArrowUpArrow: "\u21F5",
      DownBreve: "\u0311",
      DownLeftRightVector: "\u2950",
      DownLeftTeeVector: "\u295E",
      DownLeftVector: "\u21BD",
      DownLeftVectorBar: "\u2956",
      DownRightTeeVector: "\u295F",
      DownRightVector: "\u21C1",
      DownRightVectorBar: "\u2957",
      DownTee: "\u22A4",
      DownTeeArrow: "\u21A7",
      Downarrow: "\u21D3",
      Dscr: "\u{1D49F}",
      Dstrok: "\u0110",
      ENG: "\u014A",
      ETH: "\xD0",
      Eacute: "\xC9",
      Ecaron: "\u011A",
      Ecirc: "\xCA",
      Ecy: "\u042D",
      Edot: "\u0116",
      Efr: "\u{1D508}",
      Egrave: "\xC8",
      Element: "\u2208",
      Emacr: "\u0112",
      EmptySmallSquare: "\u25FB",
      EmptyVerySmallSquare: "\u25AB",
      Eogon: "\u0118",
      Eopf: "\u{1D53C}",
      Epsilon: "\u0395",
      Equal: "\u2A75",
      EqualTilde: "\u2242",
      Equilibrium: "\u21CC",
      Escr: "\u2130",
      Esim: "\u2A73",
      Eta: "\u0397",
      Euml: "\xCB",
      Exists: "\u2203",
      ExponentialE: "\u2147",
      Fcy: "\u0424",
      Ffr: "\u{1D509}",
      FilledSmallSquare: "\u25FC",
      FilledVerySmallSquare: "\u25AA",
      Fopf: "\u{1D53D}",
      ForAll: "\u2200",
      Fouriertrf: "\u2131",
      Fscr: "\u2131",
      GJcy: "\u0403",
      GT: ">",
      Gamma: "\u0393",
      Gammad: "\u03DC",
      Gbreve: "\u011E",
      Gcedil: "\u0122",
      Gcirc: "\u011C",
      Gcy: "\u0413",
      Gdot: "\u0120",
      Gfr: "\u{1D50A}",
      Gg: "\u22D9",
      Gopf: "\u{1D53E}",
      GreaterEqual: "\u2265",
      GreaterEqualLess: "\u22DB",
      GreaterFullEqual: "\u2267",
      GreaterGreater: "\u2AA2",
      GreaterLess: "\u2277",
      GreaterSlantEqual: "\u2A7E",
      GreaterTilde: "\u2273",
      Gscr: "\u{1D4A2}",
      Gt: "\u226B",
      HARDcy: "\u042A",
      Hacek: "\u02C7",
      Hat: "^",
      Hcirc: "\u0124",
      Hfr: "\u210C",
      HilbertSpace: "\u210B",
      Hopf: "\u210D",
      HorizontalLine: "\u2500",
      Hscr: "\u210B",
      Hstrok: "\u0126",
      HumpDownHump: "\u224E",
      HumpEqual: "\u224F",
      IEcy: "\u0415",
      IJlig: "\u0132",
      IOcy: "\u0401",
      Iacute: "\xCD",
      Icirc: "\xCE",
      Icy: "\u0418",
      Idot: "\u0130",
      Ifr: "\u2111",
      Igrave: "\xCC",
      Im: "\u2111",
      Imacr: "\u012A",
      ImaginaryI: "\u2148",
      Implies: "\u21D2",
      Int: "\u222C",
      Integral: "\u222B",
      Intersection: "\u22C2",
      InvisibleComma: "\u2063",
      InvisibleTimes: "\u2062",
      Iogon: "\u012E",
      Iopf: "\u{1D540}",
      Iota: "\u0399",
      Iscr: "\u2110",
      Itilde: "\u0128",
      Iukcy: "\u0406",
      Iuml: "\xCF",
      Jcirc: "\u0134",
      Jcy: "\u0419",
      Jfr: "\u{1D50D}",
      Jopf: "\u{1D541}",
      Jscr: "\u{1D4A5}",
      Jsercy: "\u0408",
      Jukcy: "\u0404",
      KHcy: "\u0425",
      KJcy: "\u040C",
      Kappa: "\u039A",
      Kcedil: "\u0136",
      Kcy: "\u041A",
      Kfr: "\u{1D50E}",
      Kopf: "\u{1D542}",
      Kscr: "\u{1D4A6}",
      LJcy: "\u0409",
      LT: "<",
      Lacute: "\u0139",
      Lambda: "\u039B",
      Lang: "\u27EA",
      Laplacetrf: "\u2112",
      Larr: "\u219E",
      Lcaron: "\u013D",
      Lcedil: "\u013B",
      Lcy: "\u041B",
      LeftAngleBracket: "\u27E8",
      LeftArrow: "\u2190",
      LeftArrowBar: "\u21E4",
      LeftArrowRightArrow: "\u21C6",
      LeftCeiling: "\u2308",
      LeftDoubleBracket: "\u27E6",
      LeftDownTeeVector: "\u2961",
      LeftDownVector: "\u21C3",
      LeftDownVectorBar: "\u2959",
      LeftFloor: "\u230A",
      LeftRightArrow: "\u2194",
      LeftRightVector: "\u294E",
      LeftTee: "\u22A3",
      LeftTeeArrow: "\u21A4",
      LeftTeeVector: "\u295A",
      LeftTriangle: "\u22B2",
      LeftTriangleBar: "\u29CF",
      LeftTriangleEqual: "\u22B4",
      LeftUpDownVector: "\u2951",
      LeftUpTeeVector: "\u2960",
      LeftUpVector: "\u21BF",
      LeftUpVectorBar: "\u2958",
      LeftVector: "\u21BC",
      LeftVectorBar: "\u2952",
      Leftarrow: "\u21D0",
      Leftrightarrow: "\u21D4",
      LessEqualGreater: "\u22DA",
      LessFullEqual: "\u2266",
      LessGreater: "\u2276",
      LessLess: "\u2AA1",
      LessSlantEqual: "\u2A7D",
      LessTilde: "\u2272",
      Lfr: "\u{1D50F}",
      Ll: "\u22D8",
      Lleftarrow: "\u21DA",
      Lmidot: "\u013F",
      LongLeftArrow: "\u27F5",
      LongLeftRightArrow: "\u27F7",
      LongRightArrow: "\u27F6",
      Longleftarrow: "\u27F8",
      Longleftrightarrow: "\u27FA",
      Longrightarrow: "\u27F9",
      Lopf: "\u{1D543}",
      LowerLeftArrow: "\u2199",
      LowerRightArrow: "\u2198",
      Lscr: "\u2112",
      Lsh: "\u21B0",
      Lstrok: "\u0141",
      Lt: "\u226A",
      Map: "\u2905",
      Mcy: "\u041C",
      MediumSpace: "\u205F",
      Mellintrf: "\u2133",
      Mfr: "\u{1D510}",
      MinusPlus: "\u2213",
      Mopf: "\u{1D544}",
      Mscr: "\u2133",
      Mu: "\u039C",
      NJcy: "\u040A",
      Nacute: "\u0143",
      Ncaron: "\u0147",
      Ncedil: "\u0145",
      Ncy: "\u041D",
      NegativeMediumSpace: "\u200B",
      NegativeThickSpace: "\u200B",
      NegativeThinSpace: "\u200B",
      NegativeVeryThinSpace: "\u200B",
      NestedGreaterGreater: "\u226B",
      NestedLessLess: "\u226A",
      NewLine: "\n",
      Nfr: "\u{1D511}",
      NoBreak: "\u2060",
      NonBreakingSpace: "\xA0",
      Nopf: "\u2115",
      Not: "\u2AEC",
      NotCongruent: "\u2262",
      NotCupCap: "\u226D",
      NotDoubleVerticalBar: "\u2226",
      NotElement: "\u2209",
      NotEqual: "\u2260",
      NotEqualTilde: "\u2242\u0338",
      NotExists: "\u2204",
      NotGreater: "\u226F",
      NotGreaterEqual: "\u2271",
      NotGreaterFullEqual: "\u2267\u0338",
      NotGreaterGreater: "\u226B\u0338",
      NotGreaterLess: "\u2279",
      NotGreaterSlantEqual: "\u2A7E\u0338",
      NotGreaterTilde: "\u2275",
      NotHumpDownHump: "\u224E\u0338",
      NotHumpEqual: "\u224F\u0338",
      NotLeftTriangle: "\u22EA",
      NotLeftTriangleBar: "\u29CF\u0338",
      NotLeftTriangleEqual: "\u22EC",
      NotLess: "\u226E",
      NotLessEqual: "\u2270",
      NotLessGreater: "\u2278",
      NotLessLess: "\u226A\u0338",
      NotLessSlantEqual: "\u2A7D\u0338",
      NotLessTilde: "\u2274",
      NotNestedGreaterGreater: "\u2AA2\u0338",
      NotNestedLessLess: "\u2AA1\u0338",
      NotPrecedes: "\u2280",
      NotPrecedesEqual: "\u2AAF\u0338",
      NotPrecedesSlantEqual: "\u22E0",
      NotReverseElement: "\u220C",
      NotRightTriangle: "\u22EB",
      NotRightTriangleBar: "\u29D0\u0338",
      NotRightTriangleEqual: "\u22ED",
      NotSquareSubset: "\u228F\u0338",
      NotSquareSubsetEqual: "\u22E2",
      NotSquareSuperset: "\u2290\u0338",
      NotSquareSupersetEqual: "\u22E3",
      NotSubset: "\u2282\u20D2",
      NotSubsetEqual: "\u2288",
      NotSucceeds: "\u2281",
      NotSucceedsEqual: "\u2AB0\u0338",
      NotSucceedsSlantEqual: "\u22E1",
      NotSucceedsTilde: "\u227F\u0338",
      NotSuperset: "\u2283\u20D2",
      NotSupersetEqual: "\u2289",
      NotTilde: "\u2241",
      NotTildeEqual: "\u2244",
      NotTildeFullEqual: "\u2247",
      NotTildeTilde: "\u2249",
      NotVerticalBar: "\u2224",
      Nscr: "\u{1D4A9}",
      Ntilde: "\xD1",
      Nu: "\u039D",
      OElig: "\u0152",
      Oacute: "\xD3",
      Ocirc: "\xD4",
      Ocy: "\u041E",
      Odblac: "\u0150",
      Ofr: "\u{1D512}",
      Ograve: "\xD2",
      Omacr: "\u014C",
      Omega: "\u03A9",
      Omicron: "\u039F",
      Oopf: "\u{1D546}",
      OpenCurlyDoubleQuote: "\u201C",
      OpenCurlyQuote: "\u2018",
      Or: "\u2A54",
      Oscr: "\u{1D4AA}",
      Oslash: "\xD8",
      Otilde: "\xD5",
      Otimes: "\u2A37",
      Ouml: "\xD6",
      OverBar: "\u203E",
      OverBrace: "\u23DE",
      OverBracket: "\u23B4",
      OverParenthesis: "\u23DC",
      PartialD: "\u2202",
      Pcy: "\u041F",
      Pfr: "\u{1D513}",
      Phi: "\u03A6",
      Pi: "\u03A0",
      PlusMinus: "\xB1",
      Poincareplane: "\u210C",
      Popf: "\u2119",
      Pr: "\u2ABB",
      Precedes: "\u227A",
      PrecedesEqual: "\u2AAF",
      PrecedesSlantEqual: "\u227C",
      PrecedesTilde: "\u227E",
      Prime: "\u2033",
      Product: "\u220F",
      Proportion: "\u2237",
      Proportional: "\u221D",
      Pscr: "\u{1D4AB}",
      Psi: "\u03A8",
      QUOT: '"',
      Qfr: "\u{1D514}",
      Qopf: "\u211A",
      Qscr: "\u{1D4AC}",
      RBarr: "\u2910",
      REG: "\xAE",
      Racute: "\u0154",
      Rang: "\u27EB",
      Rarr: "\u21A0",
      Rarrtl: "\u2916",
      Rcaron: "\u0158",
      Rcedil: "\u0156",
      Rcy: "\u0420",
      Re: "\u211C",
      ReverseElement: "\u220B",
      ReverseEquilibrium: "\u21CB",
      ReverseUpEquilibrium: "\u296F",
      Rfr: "\u211C",
      Rho: "\u03A1",
      RightAngleBracket: "\u27E9",
      RightArrow: "\u2192",
      RightArrowBar: "\u21E5",
      RightArrowLeftArrow: "\u21C4",
      RightCeiling: "\u2309",
      RightDoubleBracket: "\u27E7",
      RightDownTeeVector: "\u295D",
      RightDownVector: "\u21C2",
      RightDownVectorBar: "\u2955",
      RightFloor: "\u230B",
      RightTee: "\u22A2",
      RightTeeArrow: "\u21A6",
      RightTeeVector: "\u295B",
      RightTriangle: "\u22B3",
      RightTriangleBar: "\u29D0",
      RightTriangleEqual: "\u22B5",
      RightUpDownVector: "\u294F",
      RightUpTeeVector: "\u295C",
      RightUpVector: "\u21BE",
      RightUpVectorBar: "\u2954",
      RightVector: "\u21C0",
      RightVectorBar: "\u2953",
      Rightarrow: "\u21D2",
      Ropf: "\u211D",
      RoundImplies: "\u2970",
      Rrightarrow: "\u21DB",
      Rscr: "\u211B",
      Rsh: "\u21B1",
      RuleDelayed: "\u29F4",
      SHCHcy: "\u0429",
      SHcy: "\u0428",
      SOFTcy: "\u042C",
      Sacute: "\u015A",
      Sc: "\u2ABC",
      Scaron: "\u0160",
      Scedil: "\u015E",
      Scirc: "\u015C",
      Scy: "\u0421",
      Sfr: "\u{1D516}",
      ShortDownArrow: "\u2193",
      ShortLeftArrow: "\u2190",
      ShortRightArrow: "\u2192",
      ShortUpArrow: "\u2191",
      Sigma: "\u03A3",
      SmallCircle: "\u2218",
      Sopf: "\u{1D54A}",
      Sqrt: "\u221A",
      Square: "\u25A1",
      SquareIntersection: "\u2293",
      SquareSubset: "\u228F",
      SquareSubsetEqual: "\u2291",
      SquareSuperset: "\u2290",
      SquareSupersetEqual: "\u2292",
      SquareUnion: "\u2294",
      Sscr: "\u{1D4AE}",
      Star: "\u22C6",
      Sub: "\u22D0",
      Subset: "\u22D0",
      SubsetEqual: "\u2286",
      Succeeds: "\u227B",
      SucceedsEqual: "\u2AB0",
      SucceedsSlantEqual: "\u227D",
      SucceedsTilde: "\u227F",
      SuchThat: "\u220B",
      Sum: "\u2211",
      Sup: "\u22D1",
      Superset: "\u2283",
      SupersetEqual: "\u2287",
      Supset: "\u22D1",
      THORN: "\xDE",
      TRADE: "\u2122",
      TSHcy: "\u040B",
      TScy: "\u0426",
      Tab: "	",
      Tau: "\u03A4",
      Tcaron: "\u0164",
      Tcedil: "\u0162",
      Tcy: "\u0422",
      Tfr: "\u{1D517}",
      Therefore: "\u2234",
      Theta: "\u0398",
      ThickSpace: "\u205F\u200A",
      ThinSpace: "\u2009",
      Tilde: "\u223C",
      TildeEqual: "\u2243",
      TildeFullEqual: "\u2245",
      TildeTilde: "\u2248",
      Topf: "\u{1D54B}",
      TripleDot: "\u20DB",
      Tscr: "\u{1D4AF}",
      Tstrok: "\u0166",
      Uacute: "\xDA",
      Uarr: "\u219F",
      Uarrocir: "\u2949",
      Ubrcy: "\u040E",
      Ubreve: "\u016C",
      Ucirc: "\xDB",
      Ucy: "\u0423",
      Udblac: "\u0170",
      Ufr: "\u{1D518}",
      Ugrave: "\xD9",
      Umacr: "\u016A",
      UnderBar: "_",
      UnderBrace: "\u23DF",
      UnderBracket: "\u23B5",
      UnderParenthesis: "\u23DD",
      Union: "\u22C3",
      UnionPlus: "\u228E",
      Uogon: "\u0172",
      Uopf: "\u{1D54C}",
      UpArrow: "\u2191",
      UpArrowBar: "\u2912",
      UpArrowDownArrow: "\u21C5",
      UpDownArrow: "\u2195",
      UpEquilibrium: "\u296E",
      UpTee: "\u22A5",
      UpTeeArrow: "\u21A5",
      Uparrow: "\u21D1",
      Updownarrow: "\u21D5",
      UpperLeftArrow: "\u2196",
      UpperRightArrow: "\u2197",
      Upsi: "\u03D2",
      Upsilon: "\u03A5",
      Uring: "\u016E",
      Uscr: "\u{1D4B0}",
      Utilde: "\u0168",
      Uuml: "\xDC",
      VDash: "\u22AB",
      Vbar: "\u2AEB",
      Vcy: "\u0412",
      Vdash: "\u22A9",
      Vdashl: "\u2AE6",
      Vee: "\u22C1",
      Verbar: "\u2016",
      Vert: "\u2016",
      VerticalBar: "\u2223",
      VerticalLine: "|",
      VerticalSeparator: "\u2758",
      VerticalTilde: "\u2240",
      VeryThinSpace: "\u200A",
      Vfr: "\u{1D519}",
      Vopf: "\u{1D54D}",
      Vscr: "\u{1D4B1}",
      Vvdash: "\u22AA",
      Wcirc: "\u0174",
      Wedge: "\u22C0",
      Wfr: "\u{1D51A}",
      Wopf: "\u{1D54E}",
      Wscr: "\u{1D4B2}",
      Xfr: "\u{1D51B}",
      Xi: "\u039E",
      Xopf: "\u{1D54F}",
      Xscr: "\u{1D4B3}",
      YAcy: "\u042F",
      YIcy: "\u0407",
      YUcy: "\u042E",
      Yacute: "\xDD",
      Ycirc: "\u0176",
      Ycy: "\u042B",
      Yfr: "\u{1D51C}",
      Yopf: "\u{1D550}",
      Yscr: "\u{1D4B4}",
      Yuml: "\u0178",
      ZHcy: "\u0416",
      Zacute: "\u0179",
      Zcaron: "\u017D",
      Zcy: "\u0417",
      Zdot: "\u017B",
      ZeroWidthSpace: "\u200B",
      Zeta: "\u0396",
      Zfr: "\u2128",
      Zopf: "\u2124",
      Zscr: "\u{1D4B5}",
      aacute: "\xE1",
      abreve: "\u0103",
      ac: "\u223E",
      acE: "\u223E\u0333",
      acd: "\u223F",
      acirc: "\xE2",
      acute: "\xB4",
      acy: "\u0430",
      aelig: "\xE6",
      af: "\u2061",
      afr: "\u{1D51E}",
      agrave: "\xE0",
      alefsym: "\u2135",
      aleph: "\u2135",
      alpha: "\u03B1",
      amacr: "\u0101",
      amalg: "\u2A3F",
      amp: "&",
      and: "\u2227",
      andand: "\u2A55",
      andd: "\u2A5C",
      andslope: "\u2A58",
      andv: "\u2A5A",
      ang: "\u2220",
      ange: "\u29A4",
      angle: "\u2220",
      angmsd: "\u2221",
      angmsdaa: "\u29A8",
      angmsdab: "\u29A9",
      angmsdac: "\u29AA",
      angmsdad: "\u29AB",
      angmsdae: "\u29AC",
      angmsdaf: "\u29AD",
      angmsdag: "\u29AE",
      angmsdah: "\u29AF",
      angrt: "\u221F",
      angrtvb: "\u22BE",
      angrtvbd: "\u299D",
      angsph: "\u2222",
      angst: "\xC5",
      angzarr: "\u237C",
      aogon: "\u0105",
      aopf: "\u{1D552}",
      ap: "\u2248",
      apE: "\u2A70",
      apacir: "\u2A6F",
      ape: "\u224A",
      apid: "\u224B",
      apos: "'",
      approx: "\u2248",
      approxeq: "\u224A",
      aring: "\xE5",
      ascr: "\u{1D4B6}",
      ast: "*",
      asymp: "\u2248",
      asympeq: "\u224D",
      atilde: "\xE3",
      auml: "\xE4",
      awconint: "\u2233",
      awint: "\u2A11",
      bNot: "\u2AED",
      backcong: "\u224C",
      backepsilon: "\u03F6",
      backprime: "\u2035",
      backsim: "\u223D",
      backsimeq: "\u22CD",
      barvee: "\u22BD",
      barwed: "\u2305",
      barwedge: "\u2305",
      bbrk: "\u23B5",
      bbrktbrk: "\u23B6",
      bcong: "\u224C",
      bcy: "\u0431",
      bdquo: "\u201E",
      becaus: "\u2235",
      because: "\u2235",
      bemptyv: "\u29B0",
      bepsi: "\u03F6",
      bernou: "\u212C",
      beta: "\u03B2",
      beth: "\u2136",
      between: "\u226C",
      bfr: "\u{1D51F}",
      bigcap: "\u22C2",
      bigcirc: "\u25EF",
      bigcup: "\u22C3",
      bigodot: "\u2A00",
      bigoplus: "\u2A01",
      bigotimes: "\u2A02",
      bigsqcup: "\u2A06",
      bigstar: "\u2605",
      bigtriangledown: "\u25BD",
      bigtriangleup: "\u25B3",
      biguplus: "\u2A04",
      bigvee: "\u22C1",
      bigwedge: "\u22C0",
      bkarow: "\u290D",
      blacklozenge: "\u29EB",
      blacksquare: "\u25AA",
      blacktriangle: "\u25B4",
      blacktriangledown: "\u25BE",
      blacktriangleleft: "\u25C2",
      blacktriangleright: "\u25B8",
      blank: "\u2423",
      blk12: "\u2592",
      blk14: "\u2591",
      blk34: "\u2593",
      block: "\u2588",
      bne: "=\u20E5",
      bnequiv: "\u2261\u20E5",
      bnot: "\u2310",
      bopf: "\u{1D553}",
      bot: "\u22A5",
      bottom: "\u22A5",
      bowtie: "\u22C8",
      boxDL: "\u2557",
      boxDR: "\u2554",
      boxDl: "\u2556",
      boxDr: "\u2553",
      boxH: "\u2550",
      boxHD: "\u2566",
      boxHU: "\u2569",
      boxHd: "\u2564",
      boxHu: "\u2567",
      boxUL: "\u255D",
      boxUR: "\u255A",
      boxUl: "\u255C",
      boxUr: "\u2559",
      boxV: "\u2551",
      boxVH: "\u256C",
      boxVL: "\u2563",
      boxVR: "\u2560",
      boxVh: "\u256B",
      boxVl: "\u2562",
      boxVr: "\u255F",
      boxbox: "\u29C9",
      boxdL: "\u2555",
      boxdR: "\u2552",
      boxdl: "\u2510",
      boxdr: "\u250C",
      boxh: "\u2500",
      boxhD: "\u2565",
      boxhU: "\u2568",
      boxhd: "\u252C",
      boxhu: "\u2534",
      boxminus: "\u229F",
      boxplus: "\u229E",
      boxtimes: "\u22A0",
      boxuL: "\u255B",
      boxuR: "\u2558",
      boxul: "\u2518",
      boxur: "\u2514",
      boxv: "\u2502",
      boxvH: "\u256A",
      boxvL: "\u2561",
      boxvR: "\u255E",
      boxvh: "\u253C",
      boxvl: "\u2524",
      boxvr: "\u251C",
      bprime: "\u2035",
      breve: "\u02D8",
      brvbar: "\xA6",
      bscr: "\u{1D4B7}",
      bsemi: "\u204F",
      bsim: "\u223D",
      bsime: "\u22CD",
      bsol: "\\",
      bsolb: "\u29C5",
      bsolhsub: "\u27C8",
      bull: "\u2022",
      bullet: "\u2022",
      bump: "\u224E",
      bumpE: "\u2AAE",
      bumpe: "\u224F",
      bumpeq: "\u224F",
      cacute: "\u0107",
      cap: "\u2229",
      capand: "\u2A44",
      capbrcup: "\u2A49",
      capcap: "\u2A4B",
      capcup: "\u2A47",
      capdot: "\u2A40",
      caps: "\u2229\uFE00",
      caret: "\u2041",
      caron: "\u02C7",
      ccaps: "\u2A4D",
      ccaron: "\u010D",
      ccedil: "\xE7",
      ccirc: "\u0109",
      ccups: "\u2A4C",
      ccupssm: "\u2A50",
      cdot: "\u010B",
      cedil: "\xB8",
      cemptyv: "\u29B2",
      cent: "\xA2",
      centerdot: "\xB7",
      cfr: "\u{1D520}",
      chcy: "\u0447",
      check: "\u2713",
      checkmark: "\u2713",
      chi: "\u03C7",
      cir: "\u25CB",
      cirE: "\u29C3",
      circ: "\u02C6",
      circeq: "\u2257",
      circlearrowleft: "\u21BA",
      circlearrowright: "\u21BB",
      circledR: "\xAE",
      circledS: "\u24C8",
      circledast: "\u229B",
      circledcirc: "\u229A",
      circleddash: "\u229D",
      cire: "\u2257",
      cirfnint: "\u2A10",
      cirmid: "\u2AEF",
      cirscir: "\u29C2",
      clubs: "\u2663",
      clubsuit: "\u2663",
      colon: ":",
      colone: "\u2254",
      coloneq: "\u2254",
      comma: ",",
      commat: "@",
      comp: "\u2201",
      compfn: "\u2218",
      complement: "\u2201",
      complexes: "\u2102",
      cong: "\u2245",
      congdot: "\u2A6D",
      conint: "\u222E",
      copf: "\u{1D554}",
      coprod: "\u2210",
      copy: "\xA9",
      copysr: "\u2117",
      crarr: "\u21B5",
      cross: "\u2717",
      cscr: "\u{1D4B8}",
      csub: "\u2ACF",
      csube: "\u2AD1",
      csup: "\u2AD0",
      csupe: "\u2AD2",
      ctdot: "\u22EF",
      cudarrl: "\u2938",
      cudarrr: "\u2935",
      cuepr: "\u22DE",
      cuesc: "\u22DF",
      cularr: "\u21B6",
      cularrp: "\u293D",
      cup: "\u222A",
      cupbrcap: "\u2A48",
      cupcap: "\u2A46",
      cupcup: "\u2A4A",
      cupdot: "\u228D",
      cupor: "\u2A45",
      cups: "\u222A\uFE00",
      curarr: "\u21B7",
      curarrm: "\u293C",
      curlyeqprec: "\u22DE",
      curlyeqsucc: "\u22DF",
      curlyvee: "\u22CE",
      curlywedge: "\u22CF",
      curren: "\xA4",
      curvearrowleft: "\u21B6",
      curvearrowright: "\u21B7",
      cuvee: "\u22CE",
      cuwed: "\u22CF",
      cwconint: "\u2232",
      cwint: "\u2231",
      cylcty: "\u232D",
      dArr: "\u21D3",
      dHar: "\u2965",
      dagger: "\u2020",
      daleth: "\u2138",
      darr: "\u2193",
      dash: "\u2010",
      dashv: "\u22A3",
      dbkarow: "\u290F",
      dblac: "\u02DD",
      dcaron: "\u010F",
      dcy: "\u0434",
      dd: "\u2146",
      ddagger: "\u2021",
      ddarr: "\u21CA",
      ddotseq: "\u2A77",
      deg: "\xB0",
      delta: "\u03B4",
      demptyv: "\u29B1",
      dfisht: "\u297F",
      dfr: "\u{1D521}",
      dharl: "\u21C3",
      dharr: "\u21C2",
      diam: "\u22C4",
      diamond: "\u22C4",
      diamondsuit: "\u2666",
      diams: "\u2666",
      die: "\xA8",
      digamma: "\u03DD",
      disin: "\u22F2",
      div: "\xF7",
      divide: "\xF7",
      divideontimes: "\u22C7",
      divonx: "\u22C7",
      djcy: "\u0452",
      dlcorn: "\u231E",
      dlcrop: "\u230D",
      dollar: "$",
      dopf: "\u{1D555}",
      dot: "\u02D9",
      doteq: "\u2250",
      doteqdot: "\u2251",
      dotminus: "\u2238",
      dotplus: "\u2214",
      dotsquare: "\u22A1",
      doublebarwedge: "\u2306",
      downarrow: "\u2193",
      downdownarrows: "\u21CA",
      downharpoonleft: "\u21C3",
      downharpoonright: "\u21C2",
      drbkarow: "\u2910",
      drcorn: "\u231F",
      drcrop: "\u230C",
      dscr: "\u{1D4B9}",
      dscy: "\u0455",
      dsol: "\u29F6",
      dstrok: "\u0111",
      dtdot: "\u22F1",
      dtri: "\u25BF",
      dtrif: "\u25BE",
      duarr: "\u21F5",
      duhar: "\u296F",
      dwangle: "\u29A6",
      dzcy: "\u045F",
      dzigrarr: "\u27FF",
      eDDot: "\u2A77",
      eDot: "\u2251",
      eacute: "\xE9",
      easter: "\u2A6E",
      ecaron: "\u011B",
      ecir: "\u2256",
      ecirc: "\xEA",
      ecolon: "\u2255",
      ecy: "\u044D",
      edot: "\u0117",
      ee: "\u2147",
      efDot: "\u2252",
      efr: "\u{1D522}",
      eg: "\u2A9A",
      egrave: "\xE8",
      egs: "\u2A96",
      egsdot: "\u2A98",
      el: "\u2A99",
      elinters: "\u23E7",
      ell: "\u2113",
      els: "\u2A95",
      elsdot: "\u2A97",
      emacr: "\u0113",
      empty: "\u2205",
      emptyset: "\u2205",
      emptyv: "\u2205",
      emsp13: "\u2004",
      emsp14: "\u2005",
      emsp: "\u2003",
      eng: "\u014B",
      ensp: "\u2002",
      eogon: "\u0119",
      eopf: "\u{1D556}",
      epar: "\u22D5",
      eparsl: "\u29E3",
      eplus: "\u2A71",
      epsi: "\u03B5",
      epsilon: "\u03B5",
      epsiv: "\u03F5",
      eqcirc: "\u2256",
      eqcolon: "\u2255",
      eqsim: "\u2242",
      eqslantgtr: "\u2A96",
      eqslantless: "\u2A95",
      equals: "=",
      equest: "\u225F",
      equiv: "\u2261",
      equivDD: "\u2A78",
      eqvparsl: "\u29E5",
      erDot: "\u2253",
      erarr: "\u2971",
      escr: "\u212F",
      esdot: "\u2250",
      esim: "\u2242",
      eta: "\u03B7",
      eth: "\xF0",
      euml: "\xEB",
      euro: "\u20AC",
      excl: "!",
      exist: "\u2203",
      expectation: "\u2130",
      exponentiale: "\u2147",
      fallingdotseq: "\u2252",
      fcy: "\u0444",
      female: "\u2640",
      ffilig: "\uFB03",
      fflig: "\uFB00",
      ffllig: "\uFB04",
      ffr: "\u{1D523}",
      filig: "\uFB01",
      fjlig: "fj",
      flat: "\u266D",
      fllig: "\uFB02",
      fltns: "\u25B1",
      fnof: "\u0192",
      fopf: "\u{1D557}",
      forall: "\u2200",
      fork: "\u22D4",
      forkv: "\u2AD9",
      fpartint: "\u2A0D",
      frac12: "\xBD",
      frac13: "\u2153",
      frac14: "\xBC",
      frac15: "\u2155",
      frac16: "\u2159",
      frac18: "\u215B",
      frac23: "\u2154",
      frac25: "\u2156",
      frac34: "\xBE",
      frac35: "\u2157",
      frac38: "\u215C",
      frac45: "\u2158",
      frac56: "\u215A",
      frac58: "\u215D",
      frac78: "\u215E",
      frasl: "\u2044",
      frown: "\u2322",
      fscr: "\u{1D4BB}",
      gE: "\u2267",
      gEl: "\u2A8C",
      gacute: "\u01F5",
      gamma: "\u03B3",
      gammad: "\u03DD",
      gap: "\u2A86",
      gbreve: "\u011F",
      gcirc: "\u011D",
      gcy: "\u0433",
      gdot: "\u0121",
      ge: "\u2265",
      gel: "\u22DB",
      geq: "\u2265",
      geqq: "\u2267",
      geqslant: "\u2A7E",
      ges: "\u2A7E",
      gescc: "\u2AA9",
      gesdot: "\u2A80",
      gesdoto: "\u2A82",
      gesdotol: "\u2A84",
      gesl: "\u22DB\uFE00",
      gesles: "\u2A94",
      gfr: "\u{1D524}",
      gg: "\u226B",
      ggg: "\u22D9",
      gimel: "\u2137",
      gjcy: "\u0453",
      gl: "\u2277",
      glE: "\u2A92",
      gla: "\u2AA5",
      glj: "\u2AA4",
      gnE: "\u2269",
      gnap: "\u2A8A",
      gnapprox: "\u2A8A",
      gne: "\u2A88",
      gneq: "\u2A88",
      gneqq: "\u2269",
      gnsim: "\u22E7",
      gopf: "\u{1D558}",
      grave: "`",
      gscr: "\u210A",
      gsim: "\u2273",
      gsime: "\u2A8E",
      gsiml: "\u2A90",
      gt: ">",
      gtcc: "\u2AA7",
      gtcir: "\u2A7A",
      gtdot: "\u22D7",
      gtlPar: "\u2995",
      gtquest: "\u2A7C",
      gtrapprox: "\u2A86",
      gtrarr: "\u2978",
      gtrdot: "\u22D7",
      gtreqless: "\u22DB",
      gtreqqless: "\u2A8C",
      gtrless: "\u2277",
      gtrsim: "\u2273",
      gvertneqq: "\u2269\uFE00",
      gvnE: "\u2269\uFE00",
      hArr: "\u21D4",
      hairsp: "\u200A",
      half: "\xBD",
      hamilt: "\u210B",
      hardcy: "\u044A",
      harr: "\u2194",
      harrcir: "\u2948",
      harrw: "\u21AD",
      hbar: "\u210F",
      hcirc: "\u0125",
      hearts: "\u2665",
      heartsuit: "\u2665",
      hellip: "\u2026",
      hercon: "\u22B9",
      hfr: "\u{1D525}",
      hksearow: "\u2925",
      hkswarow: "\u2926",
      hoarr: "\u21FF",
      homtht: "\u223B",
      hookleftarrow: "\u21A9",
      hookrightarrow: "\u21AA",
      hopf: "\u{1D559}",
      horbar: "\u2015",
      hscr: "\u{1D4BD}",
      hslash: "\u210F",
      hstrok: "\u0127",
      hybull: "\u2043",
      hyphen: "\u2010",
      iacute: "\xED",
      ic: "\u2063",
      icirc: "\xEE",
      icy: "\u0438",
      iecy: "\u0435",
      iexcl: "\xA1",
      iff: "\u21D4",
      ifr: "\u{1D526}",
      igrave: "\xEC",
      ii: "\u2148",
      iiiint: "\u2A0C",
      iiint: "\u222D",
      iinfin: "\u29DC",
      iiota: "\u2129",
      ijlig: "\u0133",
      imacr: "\u012B",
      image: "\u2111",
      imagline: "\u2110",
      imagpart: "\u2111",
      imath: "\u0131",
      imof: "\u22B7",
      imped: "\u01B5",
      in: "\u2208",
      incare: "\u2105",
      infin: "\u221E",
      infintie: "\u29DD",
      inodot: "\u0131",
      int: "\u222B",
      intcal: "\u22BA",
      integers: "\u2124",
      intercal: "\u22BA",
      intlarhk: "\u2A17",
      intprod: "\u2A3C",
      iocy: "\u0451",
      iogon: "\u012F",
      iopf: "\u{1D55A}",
      iota: "\u03B9",
      iprod: "\u2A3C",
      iquest: "\xBF",
      iscr: "\u{1D4BE}",
      isin: "\u2208",
      isinE: "\u22F9",
      isindot: "\u22F5",
      isins: "\u22F4",
      isinsv: "\u22F3",
      isinv: "\u2208",
      it: "\u2062",
      itilde: "\u0129",
      iukcy: "\u0456",
      iuml: "\xEF",
      jcirc: "\u0135",
      jcy: "\u0439",
      jfr: "\u{1D527}",
      jmath: "\u0237",
      jopf: "\u{1D55B}",
      jscr: "\u{1D4BF}",
      jsercy: "\u0458",
      jukcy: "\u0454",
      kappa: "\u03BA",
      kappav: "\u03F0",
      kcedil: "\u0137",
      kcy: "\u043A",
      kfr: "\u{1D528}",
      kgreen: "\u0138",
      khcy: "\u0445",
      kjcy: "\u045C",
      kopf: "\u{1D55C}",
      kscr: "\u{1D4C0}",
      lAarr: "\u21DA",
      lArr: "\u21D0",
      lAtail: "\u291B",
      lBarr: "\u290E",
      lE: "\u2266",
      lEg: "\u2A8B",
      lHar: "\u2962",
      lacute: "\u013A",
      laemptyv: "\u29B4",
      lagran: "\u2112",
      lambda: "\u03BB",
      lang: "\u27E8",
      langd: "\u2991",
      langle: "\u27E8",
      lap: "\u2A85",
      laquo: "\xAB",
      larr: "\u2190",
      larrb: "\u21E4",
      larrbfs: "\u291F",
      larrfs: "\u291D",
      larrhk: "\u21A9",
      larrlp: "\u21AB",
      larrpl: "\u2939",
      larrsim: "\u2973",
      larrtl: "\u21A2",
      lat: "\u2AAB",
      latail: "\u2919",
      late: "\u2AAD",
      lates: "\u2AAD\uFE00",
      lbarr: "\u290C",
      lbbrk: "\u2772",
      lbrace: "{",
      lbrack: "[",
      lbrke: "\u298B",
      lbrksld: "\u298F",
      lbrkslu: "\u298D",
      lcaron: "\u013E",
      lcedil: "\u013C",
      lceil: "\u2308",
      lcub: "{",
      lcy: "\u043B",
      ldca: "\u2936",
      ldquo: "\u201C",
      ldquor: "\u201E",
      ldrdhar: "\u2967",
      ldrushar: "\u294B",
      ldsh: "\u21B2",
      le: "\u2264",
      leftarrow: "\u2190",
      leftarrowtail: "\u21A2",
      leftharpoondown: "\u21BD",
      leftharpoonup: "\u21BC",
      leftleftarrows: "\u21C7",
      leftrightarrow: "\u2194",
      leftrightarrows: "\u21C6",
      leftrightharpoons: "\u21CB",
      leftrightsquigarrow: "\u21AD",
      leftthreetimes: "\u22CB",
      leg: "\u22DA",
      leq: "\u2264",
      leqq: "\u2266",
      leqslant: "\u2A7D",
      les: "\u2A7D",
      lescc: "\u2AA8",
      lesdot: "\u2A7F",
      lesdoto: "\u2A81",
      lesdotor: "\u2A83",
      lesg: "\u22DA\uFE00",
      lesges: "\u2A93",
      lessapprox: "\u2A85",
      lessdot: "\u22D6",
      lesseqgtr: "\u22DA",
      lesseqqgtr: "\u2A8B",
      lessgtr: "\u2276",
      lesssim: "\u2272",
      lfisht: "\u297C",
      lfloor: "\u230A",
      lfr: "\u{1D529}",
      lg: "\u2276",
      lgE: "\u2A91",
      lhard: "\u21BD",
      lharu: "\u21BC",
      lharul: "\u296A",
      lhblk: "\u2584",
      ljcy: "\u0459",
      ll: "\u226A",
      llarr: "\u21C7",
      llcorner: "\u231E",
      llhard: "\u296B",
      lltri: "\u25FA",
      lmidot: "\u0140",
      lmoust: "\u23B0",
      lmoustache: "\u23B0",
      lnE: "\u2268",
      lnap: "\u2A89",
      lnapprox: "\u2A89",
      lne: "\u2A87",
      lneq: "\u2A87",
      lneqq: "\u2268",
      lnsim: "\u22E6",
      loang: "\u27EC",
      loarr: "\u21FD",
      lobrk: "\u27E6",
      longleftarrow: "\u27F5",
      longleftrightarrow: "\u27F7",
      longmapsto: "\u27FC",
      longrightarrow: "\u27F6",
      looparrowleft: "\u21AB",
      looparrowright: "\u21AC",
      lopar: "\u2985",
      lopf: "\u{1D55D}",
      loplus: "\u2A2D",
      lotimes: "\u2A34",
      lowast: "\u2217",
      lowbar: "_",
      loz: "\u25CA",
      lozenge: "\u25CA",
      lozf: "\u29EB",
      lpar: "(",
      lparlt: "\u2993",
      lrarr: "\u21C6",
      lrcorner: "\u231F",
      lrhar: "\u21CB",
      lrhard: "\u296D",
      lrm: "\u200E",
      lrtri: "\u22BF",
      lsaquo: "\u2039",
      lscr: "\u{1D4C1}",
      lsh: "\u21B0",
      lsim: "\u2272",
      lsime: "\u2A8D",
      lsimg: "\u2A8F",
      lsqb: "[",
      lsquo: "\u2018",
      lsquor: "\u201A",
      lstrok: "\u0142",
      lt: "<",
      ltcc: "\u2AA6",
      ltcir: "\u2A79",
      ltdot: "\u22D6",
      lthree: "\u22CB",
      ltimes: "\u22C9",
      ltlarr: "\u2976",
      ltquest: "\u2A7B",
      ltrPar: "\u2996",
      ltri: "\u25C3",
      ltrie: "\u22B4",
      ltrif: "\u25C2",
      lurdshar: "\u294A",
      luruhar: "\u2966",
      lvertneqq: "\u2268\uFE00",
      lvnE: "\u2268\uFE00",
      mDDot: "\u223A",
      macr: "\xAF",
      male: "\u2642",
      malt: "\u2720",
      maltese: "\u2720",
      map: "\u21A6",
      mapsto: "\u21A6",
      mapstodown: "\u21A7",
      mapstoleft: "\u21A4",
      mapstoup: "\u21A5",
      marker: "\u25AE",
      mcomma: "\u2A29",
      mcy: "\u043C",
      mdash: "\u2014",
      measuredangle: "\u2221",
      mfr: "\u{1D52A}",
      mho: "\u2127",
      micro: "\xB5",
      mid: "\u2223",
      midast: "*",
      midcir: "\u2AF0",
      middot: "\xB7",
      minus: "\u2212",
      minusb: "\u229F",
      minusd: "\u2238",
      minusdu: "\u2A2A",
      mlcp: "\u2ADB",
      mldr: "\u2026",
      mnplus: "\u2213",
      models: "\u22A7",
      mopf: "\u{1D55E}",
      mp: "\u2213",
      mscr: "\u{1D4C2}",
      mstpos: "\u223E",
      mu: "\u03BC",
      multimap: "\u22B8",
      mumap: "\u22B8",
      nGg: "\u22D9\u0338",
      nGt: "\u226B\u20D2",
      nGtv: "\u226B\u0338",
      nLeftarrow: "\u21CD",
      nLeftrightarrow: "\u21CE",
      nLl: "\u22D8\u0338",
      nLt: "\u226A\u20D2",
      nLtv: "\u226A\u0338",
      nRightarrow: "\u21CF",
      nVDash: "\u22AF",
      nVdash: "\u22AE",
      nabla: "\u2207",
      nacute: "\u0144",
      nang: "\u2220\u20D2",
      nap: "\u2249",
      napE: "\u2A70\u0338",
      napid: "\u224B\u0338",
      napos: "\u0149",
      napprox: "\u2249",
      natur: "\u266E",
      natural: "\u266E",
      naturals: "\u2115",
      nbsp: "\xA0",
      nbump: "\u224E\u0338",
      nbumpe: "\u224F\u0338",
      ncap: "\u2A43",
      ncaron: "\u0148",
      ncedil: "\u0146",
      ncong: "\u2247",
      ncongdot: "\u2A6D\u0338",
      ncup: "\u2A42",
      ncy: "\u043D",
      ndash: "\u2013",
      ne: "\u2260",
      neArr: "\u21D7",
      nearhk: "\u2924",
      nearr: "\u2197",
      nearrow: "\u2197",
      nedot: "\u2250\u0338",
      nequiv: "\u2262",
      nesear: "\u2928",
      nesim: "\u2242\u0338",
      nexist: "\u2204",
      nexists: "\u2204",
      nfr: "\u{1D52B}",
      ngE: "\u2267\u0338",
      nge: "\u2271",
      ngeq: "\u2271",
      ngeqq: "\u2267\u0338",
      ngeqslant: "\u2A7E\u0338",
      nges: "\u2A7E\u0338",
      ngsim: "\u2275",
      ngt: "\u226F",
      ngtr: "\u226F",
      nhArr: "\u21CE",
      nharr: "\u21AE",
      nhpar: "\u2AF2",
      ni: "\u220B",
      nis: "\u22FC",
      nisd: "\u22FA",
      niv: "\u220B",
      njcy: "\u045A",
      nlArr: "\u21CD",
      nlE: "\u2266\u0338",
      nlarr: "\u219A",
      nldr: "\u2025",
      nle: "\u2270",
      nleftarrow: "\u219A",
      nleftrightarrow: "\u21AE",
      nleq: "\u2270",
      nleqq: "\u2266\u0338",
      nleqslant: "\u2A7D\u0338",
      nles: "\u2A7D\u0338",
      nless: "\u226E",
      nlsim: "\u2274",
      nlt: "\u226E",
      nltri: "\u22EA",
      nltrie: "\u22EC",
      nmid: "\u2224",
      nopf: "\u{1D55F}",
      not: "\xAC",
      notin: "\u2209",
      notinE: "\u22F9\u0338",
      notindot: "\u22F5\u0338",
      notinva: "\u2209",
      notinvb: "\u22F7",
      notinvc: "\u22F6",
      notni: "\u220C",
      notniva: "\u220C",
      notnivb: "\u22FE",
      notnivc: "\u22FD",
      npar: "\u2226",
      nparallel: "\u2226",
      nparsl: "\u2AFD\u20E5",
      npart: "\u2202\u0338",
      npolint: "\u2A14",
      npr: "\u2280",
      nprcue: "\u22E0",
      npre: "\u2AAF\u0338",
      nprec: "\u2280",
      npreceq: "\u2AAF\u0338",
      nrArr: "\u21CF",
      nrarr: "\u219B",
      nrarrc: "\u2933\u0338",
      nrarrw: "\u219D\u0338",
      nrightarrow: "\u219B",
      nrtri: "\u22EB",
      nrtrie: "\u22ED",
      nsc: "\u2281",
      nsccue: "\u22E1",
      nsce: "\u2AB0\u0338",
      nscr: "\u{1D4C3}",
      nshortmid: "\u2224",
      nshortparallel: "\u2226",
      nsim: "\u2241",
      nsime: "\u2244",
      nsimeq: "\u2244",
      nsmid: "\u2224",
      nspar: "\u2226",
      nsqsube: "\u22E2",
      nsqsupe: "\u22E3",
      nsub: "\u2284",
      nsubE: "\u2AC5\u0338",
      nsube: "\u2288",
      nsubset: "\u2282\u20D2",
      nsubseteq: "\u2288",
      nsubseteqq: "\u2AC5\u0338",
      nsucc: "\u2281",
      nsucceq: "\u2AB0\u0338",
      nsup: "\u2285",
      nsupE: "\u2AC6\u0338",
      nsupe: "\u2289",
      nsupset: "\u2283\u20D2",
      nsupseteq: "\u2289",
      nsupseteqq: "\u2AC6\u0338",
      ntgl: "\u2279",
      ntilde: "\xF1",
      ntlg: "\u2278",
      ntriangleleft: "\u22EA",
      ntrianglelefteq: "\u22EC",
      ntriangleright: "\u22EB",
      ntrianglerighteq: "\u22ED",
      nu: "\u03BD",
      num: "#",
      numero: "\u2116",
      numsp: "\u2007",
      nvDash: "\u22AD",
      nvHarr: "\u2904",
      nvap: "\u224D\u20D2",
      nvdash: "\u22AC",
      nvge: "\u2265\u20D2",
      nvgt: ">\u20D2",
      nvinfin: "\u29DE",
      nvlArr: "\u2902",
      nvle: "\u2264\u20D2",
      nvlt: "<\u20D2",
      nvltrie: "\u22B4\u20D2",
      nvrArr: "\u2903",
      nvrtrie: "\u22B5\u20D2",
      nvsim: "\u223C\u20D2",
      nwArr: "\u21D6",
      nwarhk: "\u2923",
      nwarr: "\u2196",
      nwarrow: "\u2196",
      nwnear: "\u2927",
      oS: "\u24C8",
      oacute: "\xF3",
      oast: "\u229B",
      ocir: "\u229A",
      ocirc: "\xF4",
      ocy: "\u043E",
      odash: "\u229D",
      odblac: "\u0151",
      odiv: "\u2A38",
      odot: "\u2299",
      odsold: "\u29BC",
      oelig: "\u0153",
      ofcir: "\u29BF",
      ofr: "\u{1D52C}",
      ogon: "\u02DB",
      ograve: "\xF2",
      ogt: "\u29C1",
      ohbar: "\u29B5",
      ohm: "\u03A9",
      oint: "\u222E",
      olarr: "\u21BA",
      olcir: "\u29BE",
      olcross: "\u29BB",
      oline: "\u203E",
      olt: "\u29C0",
      omacr: "\u014D",
      omega: "\u03C9",
      omicron: "\u03BF",
      omid: "\u29B6",
      ominus: "\u2296",
      oopf: "\u{1D560}",
      opar: "\u29B7",
      operp: "\u29B9",
      oplus: "\u2295",
      or: "\u2228",
      orarr: "\u21BB",
      ord: "\u2A5D",
      order: "\u2134",
      orderof: "\u2134",
      ordf: "\xAA",
      ordm: "\xBA",
      origof: "\u22B6",
      oror: "\u2A56",
      orslope: "\u2A57",
      orv: "\u2A5B",
      oscr: "\u2134",
      oslash: "\xF8",
      osol: "\u2298",
      otilde: "\xF5",
      otimes: "\u2297",
      otimesas: "\u2A36",
      ouml: "\xF6",
      ovbar: "\u233D",
      par: "\u2225",
      para: "\xB6",
      parallel: "\u2225",
      parsim: "\u2AF3",
      parsl: "\u2AFD",
      part: "\u2202",
      pcy: "\u043F",
      percnt: "%",
      period: ".",
      permil: "\u2030",
      perp: "\u22A5",
      pertenk: "\u2031",
      pfr: "\u{1D52D}",
      phi: "\u03C6",
      phiv: "\u03D5",
      phmmat: "\u2133",
      phone: "\u260E",
      pi: "\u03C0",
      pitchfork: "\u22D4",
      piv: "\u03D6",
      planck: "\u210F",
      planckh: "\u210E",
      plankv: "\u210F",
      plus: "+",
      plusacir: "\u2A23",
      plusb: "\u229E",
      pluscir: "\u2A22",
      plusdo: "\u2214",
      plusdu: "\u2A25",
      pluse: "\u2A72",
      plusmn: "\xB1",
      plussim: "\u2A26",
      plustwo: "\u2A27",
      pm: "\xB1",
      pointint: "\u2A15",
      popf: "\u{1D561}",
      pound: "\xA3",
      pr: "\u227A",
      prE: "\u2AB3",
      prap: "\u2AB7",
      prcue: "\u227C",
      pre: "\u2AAF",
      prec: "\u227A",
      precapprox: "\u2AB7",
      preccurlyeq: "\u227C",
      preceq: "\u2AAF",
      precnapprox: "\u2AB9",
      precneqq: "\u2AB5",
      precnsim: "\u22E8",
      precsim: "\u227E",
      prime: "\u2032",
      primes: "\u2119",
      prnE: "\u2AB5",
      prnap: "\u2AB9",
      prnsim: "\u22E8",
      prod: "\u220F",
      profalar: "\u232E",
      profline: "\u2312",
      profsurf: "\u2313",
      prop: "\u221D",
      propto: "\u221D",
      prsim: "\u227E",
      prurel: "\u22B0",
      pscr: "\u{1D4C5}",
      psi: "\u03C8",
      puncsp: "\u2008",
      qfr: "\u{1D52E}",
      qint: "\u2A0C",
      qopf: "\u{1D562}",
      qprime: "\u2057",
      qscr: "\u{1D4C6}",
      quaternions: "\u210D",
      quatint: "\u2A16",
      quest: "?",
      questeq: "\u225F",
      quot: '"',
      rAarr: "\u21DB",
      rArr: "\u21D2",
      rAtail: "\u291C",
      rBarr: "\u290F",
      rHar: "\u2964",
      race: "\u223D\u0331",
      racute: "\u0155",
      radic: "\u221A",
      raemptyv: "\u29B3",
      rang: "\u27E9",
      rangd: "\u2992",
      range: "\u29A5",
      rangle: "\u27E9",
      raquo: "\xBB",
      rarr: "\u2192",
      rarrap: "\u2975",
      rarrb: "\u21E5",
      rarrbfs: "\u2920",
      rarrc: "\u2933",
      rarrfs: "\u291E",
      rarrhk: "\u21AA",
      rarrlp: "\u21AC",
      rarrpl: "\u2945",
      rarrsim: "\u2974",
      rarrtl: "\u21A3",
      rarrw: "\u219D",
      ratail: "\u291A",
      ratio: "\u2236",
      rationals: "\u211A",
      rbarr: "\u290D",
      rbbrk: "\u2773",
      rbrace: "}",
      rbrack: "]",
      rbrke: "\u298C",
      rbrksld: "\u298E",
      rbrkslu: "\u2990",
      rcaron: "\u0159",
      rcedil: "\u0157",
      rceil: "\u2309",
      rcub: "}",
      rcy: "\u0440",
      rdca: "\u2937",
      rdldhar: "\u2969",
      rdquo: "\u201D",
      rdquor: "\u201D",
      rdsh: "\u21B3",
      real: "\u211C",
      realine: "\u211B",
      realpart: "\u211C",
      reals: "\u211D",
      rect: "\u25AD",
      reg: "\xAE",
      rfisht: "\u297D",
      rfloor: "\u230B",
      rfr: "\u{1D52F}",
      rhard: "\u21C1",
      rharu: "\u21C0",
      rharul: "\u296C",
      rho: "\u03C1",
      rhov: "\u03F1",
      rightarrow: "\u2192",
      rightarrowtail: "\u21A3",
      rightharpoondown: "\u21C1",
      rightharpoonup: "\u21C0",
      rightleftarrows: "\u21C4",
      rightleftharpoons: "\u21CC",
      rightrightarrows: "\u21C9",
      rightsquigarrow: "\u219D",
      rightthreetimes: "\u22CC",
      ring: "\u02DA",
      risingdotseq: "\u2253",
      rlarr: "\u21C4",
      rlhar: "\u21CC",
      rlm: "\u200F",
      rmoust: "\u23B1",
      rmoustache: "\u23B1",
      rnmid: "\u2AEE",
      roang: "\u27ED",
      roarr: "\u21FE",
      robrk: "\u27E7",
      ropar: "\u2986",
      ropf: "\u{1D563}",
      roplus: "\u2A2E",
      rotimes: "\u2A35",
      rpar: ")",
      rpargt: "\u2994",
      rppolint: "\u2A12",
      rrarr: "\u21C9",
      rsaquo: "\u203A",
      rscr: "\u{1D4C7}",
      rsh: "\u21B1",
      rsqb: "]",
      rsquo: "\u2019",
      rsquor: "\u2019",
      rthree: "\u22CC",
      rtimes: "\u22CA",
      rtri: "\u25B9",
      rtrie: "\u22B5",
      rtrif: "\u25B8",
      rtriltri: "\u29CE",
      ruluhar: "\u2968",
      rx: "\u211E",
      sacute: "\u015B",
      sbquo: "\u201A",
      sc: "\u227B",
      scE: "\u2AB4",
      scap: "\u2AB8",
      scaron: "\u0161",
      sccue: "\u227D",
      sce: "\u2AB0",
      scedil: "\u015F",
      scirc: "\u015D",
      scnE: "\u2AB6",
      scnap: "\u2ABA",
      scnsim: "\u22E9",
      scpolint: "\u2A13",
      scsim: "\u227F",
      scy: "\u0441",
      sdot: "\u22C5",
      sdotb: "\u22A1",
      sdote: "\u2A66",
      seArr: "\u21D8",
      searhk: "\u2925",
      searr: "\u2198",
      searrow: "\u2198",
      sect: "\xA7",
      semi: ";",
      seswar: "\u2929",
      setminus: "\u2216",
      setmn: "\u2216",
      sext: "\u2736",
      sfr: "\u{1D530}",
      sfrown: "\u2322",
      sharp: "\u266F",
      shchcy: "\u0449",
      shcy: "\u0448",
      shortmid: "\u2223",
      shortparallel: "\u2225",
      shy: "\xAD",
      sigma: "\u03C3",
      sigmaf: "\u03C2",
      sigmav: "\u03C2",
      sim: "\u223C",
      simdot: "\u2A6A",
      sime: "\u2243",
      simeq: "\u2243",
      simg: "\u2A9E",
      simgE: "\u2AA0",
      siml: "\u2A9D",
      simlE: "\u2A9F",
      simne: "\u2246",
      simplus: "\u2A24",
      simrarr: "\u2972",
      slarr: "\u2190",
      smallsetminus: "\u2216",
      smashp: "\u2A33",
      smeparsl: "\u29E4",
      smid: "\u2223",
      smile: "\u2323",
      smt: "\u2AAA",
      smte: "\u2AAC",
      smtes: "\u2AAC\uFE00",
      softcy: "\u044C",
      sol: "/",
      solb: "\u29C4",
      solbar: "\u233F",
      sopf: "\u{1D564}",
      spades: "\u2660",
      spadesuit: "\u2660",
      spar: "\u2225",
      sqcap: "\u2293",
      sqcaps: "\u2293\uFE00",
      sqcup: "\u2294",
      sqcups: "\u2294\uFE00",
      sqsub: "\u228F",
      sqsube: "\u2291",
      sqsubset: "\u228F",
      sqsubseteq: "\u2291",
      sqsup: "\u2290",
      sqsupe: "\u2292",
      sqsupset: "\u2290",
      sqsupseteq: "\u2292",
      squ: "\u25A1",
      square: "\u25A1",
      squarf: "\u25AA",
      squf: "\u25AA",
      srarr: "\u2192",
      sscr: "\u{1D4C8}",
      ssetmn: "\u2216",
      ssmile: "\u2323",
      sstarf: "\u22C6",
      star: "\u2606",
      starf: "\u2605",
      straightepsilon: "\u03F5",
      straightphi: "\u03D5",
      strns: "\xAF",
      sub: "\u2282",
      subE: "\u2AC5",
      subdot: "\u2ABD",
      sube: "\u2286",
      subedot: "\u2AC3",
      submult: "\u2AC1",
      subnE: "\u2ACB",
      subne: "\u228A",
      subplus: "\u2ABF",
      subrarr: "\u2979",
      subset: "\u2282",
      subseteq: "\u2286",
      subseteqq: "\u2AC5",
      subsetneq: "\u228A",
      subsetneqq: "\u2ACB",
      subsim: "\u2AC7",
      subsub: "\u2AD5",
      subsup: "\u2AD3",
      succ: "\u227B",
      succapprox: "\u2AB8",
      succcurlyeq: "\u227D",
      succeq: "\u2AB0",
      succnapprox: "\u2ABA",
      succneqq: "\u2AB6",
      succnsim: "\u22E9",
      succsim: "\u227F",
      sum: "\u2211",
      sung: "\u266A",
      sup1: "\xB9",
      sup2: "\xB2",
      sup3: "\xB3",
      sup: "\u2283",
      supE: "\u2AC6",
      supdot: "\u2ABE",
      supdsub: "\u2AD8",
      supe: "\u2287",
      supedot: "\u2AC4",
      suphsol: "\u27C9",
      suphsub: "\u2AD7",
      suplarr: "\u297B",
      supmult: "\u2AC2",
      supnE: "\u2ACC",
      supne: "\u228B",
      supplus: "\u2AC0",
      supset: "\u2283",
      supseteq: "\u2287",
      supseteqq: "\u2AC6",
      supsetneq: "\u228B",
      supsetneqq: "\u2ACC",
      supsim: "\u2AC8",
      supsub: "\u2AD4",
      supsup: "\u2AD6",
      swArr: "\u21D9",
      swarhk: "\u2926",
      swarr: "\u2199",
      swarrow: "\u2199",
      swnwar: "\u292A",
      szlig: "\xDF",
      target: "\u2316",
      tau: "\u03C4",
      tbrk: "\u23B4",
      tcaron: "\u0165",
      tcedil: "\u0163",
      tcy: "\u0442",
      tdot: "\u20DB",
      telrec: "\u2315",
      tfr: "\u{1D531}",
      there4: "\u2234",
      therefore: "\u2234",
      theta: "\u03B8",
      thetasym: "\u03D1",
      thetav: "\u03D1",
      thickapprox: "\u2248",
      thicksim: "\u223C",
      thinsp: "\u2009",
      thkap: "\u2248",
      thksim: "\u223C",
      thorn: "\xFE",
      tilde: "\u02DC",
      times: "\xD7",
      timesb: "\u22A0",
      timesbar: "\u2A31",
      timesd: "\u2A30",
      tint: "\u222D",
      toea: "\u2928",
      top: "\u22A4",
      topbot: "\u2336",
      topcir: "\u2AF1",
      topf: "\u{1D565}",
      topfork: "\u2ADA",
      tosa: "\u2929",
      tprime: "\u2034",
      trade: "\u2122",
      triangle: "\u25B5",
      triangledown: "\u25BF",
      triangleleft: "\u25C3",
      trianglelefteq: "\u22B4",
      triangleq: "\u225C",
      triangleright: "\u25B9",
      trianglerighteq: "\u22B5",
      tridot: "\u25EC",
      trie: "\u225C",
      triminus: "\u2A3A",
      triplus: "\u2A39",
      trisb: "\u29CD",
      tritime: "\u2A3B",
      trpezium: "\u23E2",
      tscr: "\u{1D4C9}",
      tscy: "\u0446",
      tshcy: "\u045B",
      tstrok: "\u0167",
      twixt: "\u226C",
      twoheadleftarrow: "\u219E",
      twoheadrightarrow: "\u21A0",
      uArr: "\u21D1",
      uHar: "\u2963",
      uacute: "\xFA",
      uarr: "\u2191",
      ubrcy: "\u045E",
      ubreve: "\u016D",
      ucirc: "\xFB",
      ucy: "\u0443",
      udarr: "\u21C5",
      udblac: "\u0171",
      udhar: "\u296E",
      ufisht: "\u297E",
      ufr: "\u{1D532}",
      ugrave: "\xF9",
      uharl: "\u21BF",
      uharr: "\u21BE",
      uhblk: "\u2580",
      ulcorn: "\u231C",
      ulcorner: "\u231C",
      ulcrop: "\u230F",
      ultri: "\u25F8",
      umacr: "\u016B",
      uml: "\xA8",
      uogon: "\u0173",
      uopf: "\u{1D566}",
      uparrow: "\u2191",
      updownarrow: "\u2195",
      upharpoonleft: "\u21BF",
      upharpoonright: "\u21BE",
      uplus: "\u228E",
      upsi: "\u03C5",
      upsih: "\u03D2",
      upsilon: "\u03C5",
      upuparrows: "\u21C8",
      urcorn: "\u231D",
      urcorner: "\u231D",
      urcrop: "\u230E",
      uring: "\u016F",
      urtri: "\u25F9",
      uscr: "\u{1D4CA}",
      utdot: "\u22F0",
      utilde: "\u0169",
      utri: "\u25B5",
      utrif: "\u25B4",
      uuarr: "\u21C8",
      uuml: "\xFC",
      uwangle: "\u29A7",
      vArr: "\u21D5",
      vBar: "\u2AE8",
      vBarv: "\u2AE9",
      vDash: "\u22A8",
      vangrt: "\u299C",
      varepsilon: "\u03F5",
      varkappa: "\u03F0",
      varnothing: "\u2205",
      varphi: "\u03D5",
      varpi: "\u03D6",
      varpropto: "\u221D",
      varr: "\u2195",
      varrho: "\u03F1",
      varsigma: "\u03C2",
      varsubsetneq: "\u228A\uFE00",
      varsubsetneqq: "\u2ACB\uFE00",
      varsupsetneq: "\u228B\uFE00",
      varsupsetneqq: "\u2ACC\uFE00",
      vartheta: "\u03D1",
      vartriangleleft: "\u22B2",
      vartriangleright: "\u22B3",
      vcy: "\u0432",
      vdash: "\u22A2",
      vee: "\u2228",
      veebar: "\u22BB",
      veeeq: "\u225A",
      vellip: "\u22EE",
      verbar: "|",
      vert: "|",
      vfr: "\u{1D533}",
      vltri: "\u22B2",
      vnsub: "\u2282\u20D2",
      vnsup: "\u2283\u20D2",
      vopf: "\u{1D567}",
      vprop: "\u221D",
      vrtri: "\u22B3",
      vscr: "\u{1D4CB}",
      vsubnE: "\u2ACB\uFE00",
      vsubne: "\u228A\uFE00",
      vsupnE: "\u2ACC\uFE00",
      vsupne: "\u228B\uFE00",
      vzigzag: "\u299A",
      wcirc: "\u0175",
      wedbar: "\u2A5F",
      wedge: "\u2227",
      wedgeq: "\u2259",
      weierp: "\u2118",
      wfr: "\u{1D534}",
      wopf: "\u{1D568}",
      wp: "\u2118",
      wr: "\u2240",
      wreath: "\u2240",
      wscr: "\u{1D4CC}",
      xcap: "\u22C2",
      xcirc: "\u25EF",
      xcup: "\u22C3",
      xdtri: "\u25BD",
      xfr: "\u{1D535}",
      xhArr: "\u27FA",
      xharr: "\u27F7",
      xi: "\u03BE",
      xlArr: "\u27F8",
      xlarr: "\u27F5",
      xmap: "\u27FC",
      xnis: "\u22FB",
      xodot: "\u2A00",
      xopf: "\u{1D569}",
      xoplus: "\u2A01",
      xotime: "\u2A02",
      xrArr: "\u27F9",
      xrarr: "\u27F6",
      xscr: "\u{1D4CD}",
      xsqcup: "\u2A06",
      xuplus: "\u2A04",
      xutri: "\u25B3",
      xvee: "\u22C1",
      xwedge: "\u22C0",
      yacute: "\xFD",
      yacy: "\u044F",
      ycirc: "\u0177",
      ycy: "\u044B",
      yen: "\xA5",
      yfr: "\u{1D536}",
      yicy: "\u0457",
      yopf: "\u{1D56A}",
      yscr: "\u{1D4CE}",
      yucy: "\u044E",
      yuml: "\xFF",
      zacute: "\u017A",
      zcaron: "\u017E",
      zcy: "\u0437",
      zdot: "\u017C",
      zeetrf: "\u2128",
      zeta: "\u03B6",
      zfr: "\u{1D537}",
      zhcy: "\u0436",
      zigrarr: "\u21DD",
      zopf: "\u{1D56B}",
      zscr: "\u{1D4CF}",
      zwj: "\u200D",
      zwnj: "\u200C"
    };
  }
});

// node_modules/decode-named-character-reference/index.js
function decodeNamedCharacterReference(value) {
  return own.call(characterEntities, value) ? characterEntities[value] : false;
}
var own;
var init_decode_named_character_reference = __esm({
  "node_modules/decode-named-character-reference/index.js"() {
    init_character_entities();
    own = {}.hasOwnProperty;
  }
});

// node_modules/micromark-util-chunked/index.js
function splice(list2, start, remove, items) {
  const end = list2.length;
  let chunkStart = 0;
  let parameters;
  if (start < 0) {
    start = -start > end ? 0 : end + start;
  } else {
    start = start > end ? end : start;
  }
  remove = remove > 0 ? remove : 0;
  if (items.length < 1e4) {
    parameters = Array.from(items);
    parameters.unshift(start, remove);
    list2.splice(...parameters);
  } else {
    if (remove) list2.splice(start, remove);
    while (chunkStart < items.length) {
      parameters = items.slice(chunkStart, chunkStart + 1e4);
      parameters.unshift(start, 0);
      list2.splice(...parameters);
      chunkStart += 1e4;
      start += 1e4;
    }
  }
}
function push(list2, items) {
  if (list2.length > 0) {
    splice(list2, list2.length, 0, items);
    return list2;
  }
  return items;
}
var init_micromark_util_chunked = __esm({
  "node_modules/micromark-util-chunked/index.js"() {
  }
});

// node_modules/micromark-util-combine-extensions/index.js
function combineExtensions(extensions) {
  const all2 = {};
  let index2 = -1;
  while (++index2 < extensions.length) {
    syntaxExtension(all2, extensions[index2]);
  }
  return all2;
}
function syntaxExtension(all2, extension2) {
  let hook;
  for (hook in extension2) {
    const maybe = hasOwnProperty.call(all2, hook) ? all2[hook] : void 0;
    const left = maybe || (all2[hook] = {});
    const right = extension2[hook];
    let code2;
    if (right) {
      for (code2 in right) {
        if (!hasOwnProperty.call(left, code2)) left[code2] = [];
        const value = right[code2];
        constructs(
          // @ts-expect-error Looks like a list.
          left[code2],
          Array.isArray(value) ? value : value ? [value] : []
        );
      }
    }
  }
}
function constructs(existing, list2) {
  let index2 = -1;
  const before = [];
  while (++index2 < list2.length) {
    ;
    (list2[index2].add === "after" ? existing : before).push(list2[index2]);
  }
  splice(existing, 0, 0, before);
}
var hasOwnProperty;
var init_micromark_util_combine_extensions = __esm({
  "node_modules/micromark-util-combine-extensions/index.js"() {
    init_micromark_util_chunked();
    hasOwnProperty = {}.hasOwnProperty;
  }
});

// node_modules/micromark-util-decode-numeric-character-reference/index.js
function decodeNumericCharacterReference(value, base) {
  const code2 = Number.parseInt(value, base);
  if (
    // C0 except for HT, LF, FF, CR, space.
    code2 < 9 || code2 === 11 || code2 > 13 && code2 < 32 || // Control character (DEL) of C0, and C1 controls.
    code2 > 126 && code2 < 160 || // Lone high surrogates and low surrogates.
    code2 > 55295 && code2 < 57344 || // Noncharacters.
    code2 > 64975 && code2 < 65008 || /* eslint-disable no-bitwise */
    (code2 & 65535) === 65535 || (code2 & 65535) === 65534 || /* eslint-enable no-bitwise */
    // Out of range
    code2 > 1114111
  ) {
    return "\uFFFD";
  }
  return String.fromCodePoint(code2);
}
var init_micromark_util_decode_numeric_character_reference = __esm({
  "node_modules/micromark-util-decode-numeric-character-reference/index.js"() {
  }
});

// node_modules/micromark-util-normalize-identifier/index.js
function normalizeIdentifier(value) {
  return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
var init_micromark_util_normalize_identifier = __esm({
  "node_modules/micromark-util-normalize-identifier/index.js"() {
  }
});

// node_modules/micromark-util-character/index.js
function asciiControl(code2) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    code2 !== null && (code2 < 32 || code2 === 127)
  );
}
function markdownLineEnding(code2) {
  return code2 !== null && code2 < -2;
}
function markdownLineEndingOrSpace(code2) {
  return code2 !== null && (code2 < 0 || code2 === 32);
}
function markdownSpace(code2) {
  return code2 === -2 || code2 === -1 || code2 === 32;
}
function regexCheck(regex) {
  return check;
  function check(code2) {
    return code2 !== null && code2 > -1 && regex.test(String.fromCharCode(code2));
  }
}
var asciiAlpha, asciiAlphanumeric, asciiAtext, asciiDigit, asciiHexDigit, asciiPunctuation, unicodePunctuation, unicodeWhitespace;
var init_micromark_util_character = __esm({
  "node_modules/micromark-util-character/index.js"() {
    asciiAlpha = regexCheck(/[A-Za-z]/);
    asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
    asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
    asciiDigit = regexCheck(/\d/);
    asciiHexDigit = regexCheck(/[\dA-Fa-f]/);
    asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
    unicodePunctuation = regexCheck(/\p{P}|\p{S}/u);
    unicodeWhitespace = regexCheck(/\s/);
  }
});

// node_modules/micromark-factory-space/index.js
function factorySpace(effects, ok3, type2, max) {
  const limit = max ? max - 1 : Number.POSITIVE_INFINITY;
  let size = 0;
  return start;
  function start(code2) {
    if (markdownSpace(code2)) {
      effects.enter(type2);
      return prefix(code2);
    }
    return ok3(code2);
  }
  function prefix(code2) {
    if (markdownSpace(code2) && size++ < limit) {
      effects.consume(code2);
      return prefix;
    }
    effects.exit(type2);
    return ok3(code2);
  }
}
var init_micromark_factory_space = __esm({
  "node_modules/micromark-factory-space/index.js"() {
    init_micromark_util_character();
  }
});

// node_modules/micromark/lib/initialize/content.js
function initializeContent(effects) {
  const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
  let previous3;
  return contentStart;
  function afterContentStartConstruct(code2) {
    if (code2 === null) {
      effects.consume(code2);
      return;
    }
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return factorySpace(effects, contentStart, "linePrefix");
  }
  function paragraphInitial(code2) {
    effects.enter("paragraph");
    return lineStart(code2);
  }
  function lineStart(code2) {
    const token = effects.enter("chunkText", {
      contentType: "text",
      previous: previous3
    });
    if (previous3) {
      previous3.next = token;
    }
    previous3 = token;
    return data(code2);
  }
  function data(code2) {
    if (code2 === null) {
      effects.exit("chunkText");
      effects.exit("paragraph");
      effects.consume(code2);
      return;
    }
    if (markdownLineEnding(code2)) {
      effects.consume(code2);
      effects.exit("chunkText");
      return lineStart;
    }
    effects.consume(code2);
    return data;
  }
}
var content;
var init_content = __esm({
  "node_modules/micromark/lib/initialize/content.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    content = {
      tokenize: initializeContent
    };
  }
});

// node_modules/micromark/lib/initialize/document.js
function initializeDocument(effects) {
  const self = this;
  const stack = [];
  let continued = 0;
  let childFlow;
  let childToken;
  let lineStartOffset;
  return start;
  function start(code2) {
    if (continued < stack.length) {
      const item = stack[continued];
      self.containerState = item[1];
      return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code2);
    }
    return checkNewContainers(code2);
  }
  function documentContinue(code2) {
    continued++;
    if (self.containerState._closeFlow) {
      self.containerState._closeFlow = void 0;
      if (childFlow) {
        closeFlow();
      }
      const indexBeforeExits = self.events.length;
      let indexBeforeFlow = indexBeforeExits;
      let point4;
      while (indexBeforeFlow--) {
        if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
          point4 = self.events[indexBeforeFlow][1].end;
          break;
        }
      }
      exitContainers(continued);
      let index2 = indexBeforeExits;
      while (index2 < self.events.length) {
        self.events[index2][1].end = {
          ...point4
        };
        index2++;
      }
      splice(self.events, indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
      self.events.length = index2;
      return checkNewContainers(code2);
    }
    return start(code2);
  }
  function checkNewContainers(code2) {
    if (continued === stack.length) {
      if (!childFlow) {
        return documentContinued(code2);
      }
      if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) {
        return flowStart(code2);
      }
      self.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
    }
    self.containerState = {};
    return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code2);
  }
  function thereIsANewContainer(code2) {
    if (childFlow) closeFlow();
    exitContainers(continued);
    return documentContinued(code2);
  }
  function thereIsNoNewContainer(code2) {
    self.parser.lazy[self.now().line] = continued !== stack.length;
    lineStartOffset = self.now().offset;
    return flowStart(code2);
  }
  function documentContinued(code2) {
    self.containerState = {};
    return effects.attempt(containerConstruct, containerContinue, flowStart)(code2);
  }
  function containerContinue(code2) {
    continued++;
    stack.push([self.currentConstruct, self.containerState]);
    return documentContinued(code2);
  }
  function flowStart(code2) {
    if (code2 === null) {
      if (childFlow) closeFlow();
      exitContainers(0);
      effects.consume(code2);
      return;
    }
    childFlow = childFlow || self.parser.flow(self.now());
    effects.enter("chunkFlow", {
      _tokenizer: childFlow,
      contentType: "flow",
      previous: childToken
    });
    return flowContinue(code2);
  }
  function flowContinue(code2) {
    if (code2 === null) {
      writeToChild(effects.exit("chunkFlow"), true);
      exitContainers(0);
      effects.consume(code2);
      return;
    }
    if (markdownLineEnding(code2)) {
      effects.consume(code2);
      writeToChild(effects.exit("chunkFlow"));
      continued = 0;
      self.interrupt = void 0;
      return start;
    }
    effects.consume(code2);
    return flowContinue;
  }
  function writeToChild(token, endOfFile) {
    const stream = self.sliceStream(token);
    if (endOfFile) stream.push(null);
    token.previous = childToken;
    if (childToken) childToken.next = token;
    childToken = token;
    childFlow.defineSkip(token.start);
    childFlow.write(stream);
    if (self.parser.lazy[token.start.line]) {
      let index2 = childFlow.events.length;
      while (index2--) {
        if (
          // The token starts before the line ending…
          childFlow.events[index2][1].start.offset < lineStartOffset && // …and either is not ended yet…
          (!childFlow.events[index2][1].end || // …or ends after it.
          childFlow.events[index2][1].end.offset > lineStartOffset)
        ) {
          return;
        }
      }
      const indexBeforeExits = self.events.length;
      let indexBeforeFlow = indexBeforeExits;
      let seen;
      let point4;
      while (indexBeforeFlow--) {
        if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
          if (seen) {
            point4 = self.events[indexBeforeFlow][1].end;
            break;
          }
          seen = true;
        }
      }
      exitContainers(continued);
      index2 = indexBeforeExits;
      while (index2 < self.events.length) {
        self.events[index2][1].end = {
          ...point4
        };
        index2++;
      }
      splice(self.events, indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
      self.events.length = index2;
    }
  }
  function exitContainers(size) {
    let index2 = stack.length;
    while (index2-- > size) {
      const entry = stack[index2];
      self.containerState = entry[1];
      entry[0].exit.call(self, effects);
    }
    stack.length = size;
  }
  function closeFlow() {
    childFlow.write([null]);
    childToken = void 0;
    childFlow = void 0;
    self.containerState._closeFlow = void 0;
  }
}
function tokenizeContainer(effects, ok3, nok) {
  return factorySpace(effects, effects.attempt(this.parser.constructs.document, ok3, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
var document, containerConstruct;
var init_document = __esm({
  "node_modules/micromark/lib/initialize/document.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    init_micromark_util_chunked();
    document = {
      tokenize: initializeDocument
    };
    containerConstruct = {
      tokenize: tokenizeContainer
    };
  }
});

// node_modules/micromark-util-classify-character/index.js
function classifyCharacter(code2) {
  if (code2 === null || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2)) {
    return 1;
  }
  if (unicodePunctuation(code2)) {
    return 2;
  }
}
var init_micromark_util_classify_character = __esm({
  "node_modules/micromark-util-classify-character/index.js"() {
    init_micromark_util_character();
  }
});

// node_modules/micromark-util-resolve-all/index.js
function resolveAll(constructs2, events, context) {
  const called = [];
  let index2 = -1;
  while (++index2 < constructs2.length) {
    const resolve = constructs2[index2].resolveAll;
    if (resolve && !called.includes(resolve)) {
      events = resolve(events, context);
      called.push(resolve);
    }
  }
  return events;
}
var init_micromark_util_resolve_all = __esm({
  "node_modules/micromark-util-resolve-all/index.js"() {
  }
});

// node_modules/micromark-core-commonmark/lib/attention.js
function resolveAllAttention(events, context) {
  let index2 = -1;
  let open2;
  let group;
  let text4;
  let openingSequence;
  let closingSequence;
  let use;
  let nextEvents;
  let offset;
  while (++index2 < events.length) {
    if (events[index2][0] === "enter" && events[index2][1].type === "attentionSequence" && events[index2][1]._close) {
      open2 = index2;
      while (open2--) {
        if (events[open2][0] === "exit" && events[open2][1].type === "attentionSequence" && events[open2][1]._open && // If the markers are the same:
        context.sliceSerialize(events[open2][1]).charCodeAt(0) === context.sliceSerialize(events[index2][1]).charCodeAt(0)) {
          if ((events[open2][1]._close || events[index2][1]._open) && (events[index2][1].end.offset - events[index2][1].start.offset) % 3 && !((events[open2][1].end.offset - events[open2][1].start.offset + events[index2][1].end.offset - events[index2][1].start.offset) % 3)) {
            continue;
          }
          use = events[open2][1].end.offset - events[open2][1].start.offset > 1 && events[index2][1].end.offset - events[index2][1].start.offset > 1 ? 2 : 1;
          const start = {
            ...events[open2][1].end
          };
          const end = {
            ...events[index2][1].start
          };
          movePoint(start, -use);
          movePoint(end, use);
          openingSequence = {
            type: use > 1 ? "strongSequence" : "emphasisSequence",
            start,
            end: {
              ...events[open2][1].end
            }
          };
          closingSequence = {
            type: use > 1 ? "strongSequence" : "emphasisSequence",
            start: {
              ...events[index2][1].start
            },
            end
          };
          text4 = {
            type: use > 1 ? "strongText" : "emphasisText",
            start: {
              ...events[open2][1].end
            },
            end: {
              ...events[index2][1].start
            }
          };
          group = {
            type: use > 1 ? "strong" : "emphasis",
            start: {
              ...openingSequence.start
            },
            end: {
              ...closingSequence.end
            }
          };
          events[open2][1].end = {
            ...openingSequence.start
          };
          events[index2][1].start = {
            ...closingSequence.end
          };
          nextEvents = [];
          if (events[open2][1].end.offset - events[open2][1].start.offset) {
            nextEvents = push(nextEvents, [["enter", events[open2][1], context], ["exit", events[open2][1], context]]);
          }
          nextEvents = push(nextEvents, [["enter", group, context], ["enter", openingSequence, context], ["exit", openingSequence, context], ["enter", text4, context]]);
          nextEvents = push(nextEvents, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open2 + 1, index2), context));
          nextEvents = push(nextEvents, [["exit", text4, context], ["enter", closingSequence, context], ["exit", closingSequence, context], ["exit", group, context]]);
          if (events[index2][1].end.offset - events[index2][1].start.offset) {
            offset = 2;
            nextEvents = push(nextEvents, [["enter", events[index2][1], context], ["exit", events[index2][1], context]]);
          } else {
            offset = 0;
          }
          splice(events, open2 - 1, index2 - open2 + 3, nextEvents);
          index2 = open2 + nextEvents.length - offset - 2;
          break;
        }
      }
    }
  }
  index2 = -1;
  while (++index2 < events.length) {
    if (events[index2][1].type === "attentionSequence") {
      events[index2][1].type = "data";
    }
  }
  return events;
}
function tokenizeAttention(effects, ok3) {
  const attentionMarkers2 = this.parser.constructs.attentionMarkers.null;
  const previous3 = this.previous;
  const before = classifyCharacter(previous3);
  let marker;
  return start;
  function start(code2) {
    marker = code2;
    effects.enter("attentionSequence");
    return inside(code2);
  }
  function inside(code2) {
    if (code2 === marker) {
      effects.consume(code2);
      return inside;
    }
    const token = effects.exit("attentionSequence");
    const after = classifyCharacter(code2);
    const open2 = !after || after === 2 && before || attentionMarkers2.includes(code2);
    const close = !before || before === 2 && after || attentionMarkers2.includes(previous3);
    token._open = Boolean(marker === 42 ? open2 : open2 && (before || !close));
    token._close = Boolean(marker === 42 ? close : close && (after || !open2));
    return ok3(code2);
  }
}
function movePoint(point4, offset) {
  point4.column += offset;
  point4.offset += offset;
  point4._bufferIndex += offset;
}
var attention;
var init_attention = __esm({
  "node_modules/micromark-core-commonmark/lib/attention.js"() {
    init_micromark_util_chunked();
    init_micromark_util_classify_character();
    init_micromark_util_resolve_all();
    attention = {
      name: "attention",
      resolveAll: resolveAllAttention,
      tokenize: tokenizeAttention
    };
  }
});

// node_modules/micromark-core-commonmark/lib/autolink.js
function tokenizeAutolink(effects, ok3, nok) {
  let size = 0;
  return start;
  function start(code2) {
    effects.enter("autolink");
    effects.enter("autolinkMarker");
    effects.consume(code2);
    effects.exit("autolinkMarker");
    effects.enter("autolinkProtocol");
    return open2;
  }
  function open2(code2) {
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      return schemeOrEmailAtext;
    }
    if (code2 === 64) {
      return nok(code2);
    }
    return emailAtext(code2);
  }
  function schemeOrEmailAtext(code2) {
    if (code2 === 43 || code2 === 45 || code2 === 46 || asciiAlphanumeric(code2)) {
      size = 1;
      return schemeInsideOrEmailAtext(code2);
    }
    return emailAtext(code2);
  }
  function schemeInsideOrEmailAtext(code2) {
    if (code2 === 58) {
      effects.consume(code2);
      size = 0;
      return urlInside;
    }
    if ((code2 === 43 || code2 === 45 || code2 === 46 || asciiAlphanumeric(code2)) && size++ < 32) {
      effects.consume(code2);
      return schemeInsideOrEmailAtext;
    }
    size = 0;
    return emailAtext(code2);
  }
  function urlInside(code2) {
    if (code2 === 62) {
      effects.exit("autolinkProtocol");
      effects.enter("autolinkMarker");
      effects.consume(code2);
      effects.exit("autolinkMarker");
      effects.exit("autolink");
      return ok3;
    }
    if (code2 === null || code2 === 32 || code2 === 60 || asciiControl(code2)) {
      return nok(code2);
    }
    effects.consume(code2);
    return urlInside;
  }
  function emailAtext(code2) {
    if (code2 === 64) {
      effects.consume(code2);
      return emailAtSignOrDot;
    }
    if (asciiAtext(code2)) {
      effects.consume(code2);
      return emailAtext;
    }
    return nok(code2);
  }
  function emailAtSignOrDot(code2) {
    return asciiAlphanumeric(code2) ? emailLabel(code2) : nok(code2);
  }
  function emailLabel(code2) {
    if (code2 === 46) {
      effects.consume(code2);
      size = 0;
      return emailAtSignOrDot;
    }
    if (code2 === 62) {
      effects.exit("autolinkProtocol").type = "autolinkEmail";
      effects.enter("autolinkMarker");
      effects.consume(code2);
      effects.exit("autolinkMarker");
      effects.exit("autolink");
      return ok3;
    }
    return emailValue(code2);
  }
  function emailValue(code2) {
    if ((code2 === 45 || asciiAlphanumeric(code2)) && size++ < 63) {
      const next = code2 === 45 ? emailValue : emailLabel;
      effects.consume(code2);
      return next;
    }
    return nok(code2);
  }
}
var autolink;
var init_autolink = __esm({
  "node_modules/micromark-core-commonmark/lib/autolink.js"() {
    init_micromark_util_character();
    autolink = {
      name: "autolink",
      tokenize: tokenizeAutolink
    };
  }
});

// node_modules/micromark-core-commonmark/lib/blank-line.js
function tokenizeBlankLine(effects, ok3, nok) {
  return start;
  function start(code2) {
    return markdownSpace(code2) ? factorySpace(effects, after, "linePrefix")(code2) : after(code2);
  }
  function after(code2) {
    return code2 === null || markdownLineEnding(code2) ? ok3(code2) : nok(code2);
  }
}
var blankLine;
var init_blank_line = __esm({
  "node_modules/micromark-core-commonmark/lib/blank-line.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    blankLine = {
      partial: true,
      tokenize: tokenizeBlankLine
    };
  }
});

// node_modules/micromark-core-commonmark/lib/block-quote.js
function tokenizeBlockQuoteStart(effects, ok3, nok) {
  const self = this;
  return start;
  function start(code2) {
    if (code2 === 62) {
      const state = self.containerState;
      if (!state.open) {
        effects.enter("blockQuote", {
          _container: true
        });
        state.open = true;
      }
      effects.enter("blockQuotePrefix");
      effects.enter("blockQuoteMarker");
      effects.consume(code2);
      effects.exit("blockQuoteMarker");
      return after;
    }
    return nok(code2);
  }
  function after(code2) {
    if (markdownSpace(code2)) {
      effects.enter("blockQuotePrefixWhitespace");
      effects.consume(code2);
      effects.exit("blockQuotePrefixWhitespace");
      effects.exit("blockQuotePrefix");
      return ok3;
    }
    effects.exit("blockQuotePrefix");
    return ok3(code2);
  }
}
function tokenizeBlockQuoteContinuation(effects, ok3, nok) {
  const self = this;
  return contStart;
  function contStart(code2) {
    if (markdownSpace(code2)) {
      return factorySpace(effects, contBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2);
    }
    return contBefore(code2);
  }
  function contBefore(code2) {
    return effects.attempt(blockQuote, ok3, nok)(code2);
  }
}
function exit(effects) {
  effects.exit("blockQuote");
}
var blockQuote;
var init_block_quote = __esm({
  "node_modules/micromark-core-commonmark/lib/block-quote.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    blockQuote = {
      continuation: {
        tokenize: tokenizeBlockQuoteContinuation
      },
      exit,
      name: "blockQuote",
      tokenize: tokenizeBlockQuoteStart
    };
  }
});

// node_modules/micromark-core-commonmark/lib/character-escape.js
function tokenizeCharacterEscape(effects, ok3, nok) {
  return start;
  function start(code2) {
    effects.enter("characterEscape");
    effects.enter("escapeMarker");
    effects.consume(code2);
    effects.exit("escapeMarker");
    return inside;
  }
  function inside(code2) {
    if (asciiPunctuation(code2)) {
      effects.enter("characterEscapeValue");
      effects.consume(code2);
      effects.exit("characterEscapeValue");
      effects.exit("characterEscape");
      return ok3;
    }
    return nok(code2);
  }
}
var characterEscape;
var init_character_escape = __esm({
  "node_modules/micromark-core-commonmark/lib/character-escape.js"() {
    init_micromark_util_character();
    characterEscape = {
      name: "characterEscape",
      tokenize: tokenizeCharacterEscape
    };
  }
});

// node_modules/micromark-core-commonmark/lib/character-reference.js
function tokenizeCharacterReference(effects, ok3, nok) {
  const self = this;
  let size = 0;
  let max;
  let test;
  return start;
  function start(code2) {
    effects.enter("characterReference");
    effects.enter("characterReferenceMarker");
    effects.consume(code2);
    effects.exit("characterReferenceMarker");
    return open2;
  }
  function open2(code2) {
    if (code2 === 35) {
      effects.enter("characterReferenceMarkerNumeric");
      effects.consume(code2);
      effects.exit("characterReferenceMarkerNumeric");
      return numeric;
    }
    effects.enter("characterReferenceValue");
    max = 31;
    test = asciiAlphanumeric;
    return value(code2);
  }
  function numeric(code2) {
    if (code2 === 88 || code2 === 120) {
      effects.enter("characterReferenceMarkerHexadecimal");
      effects.consume(code2);
      effects.exit("characterReferenceMarkerHexadecimal");
      effects.enter("characterReferenceValue");
      max = 6;
      test = asciiHexDigit;
      return value;
    }
    effects.enter("characterReferenceValue");
    max = 7;
    test = asciiDigit;
    return value(code2);
  }
  function value(code2) {
    if (code2 === 59 && size) {
      const token = effects.exit("characterReferenceValue");
      if (test === asciiAlphanumeric && !decodeNamedCharacterReference(self.sliceSerialize(token))) {
        return nok(code2);
      }
      effects.enter("characterReferenceMarker");
      effects.consume(code2);
      effects.exit("characterReferenceMarker");
      effects.exit("characterReference");
      return ok3;
    }
    if (test(code2) && size++ < max) {
      effects.consume(code2);
      return value;
    }
    return nok(code2);
  }
}
var characterReference;
var init_character_reference = __esm({
  "node_modules/micromark-core-commonmark/lib/character-reference.js"() {
    init_decode_named_character_reference();
    init_micromark_util_character();
    characterReference = {
      name: "characterReference",
      tokenize: tokenizeCharacterReference
    };
  }
});

// node_modules/micromark-core-commonmark/lib/code-fenced.js
function tokenizeCodeFenced(effects, ok3, nok) {
  const self = this;
  const closeStart = {
    partial: true,
    tokenize: tokenizeCloseStart
  };
  let initialPrefix = 0;
  let sizeOpen = 0;
  let marker;
  return start;
  function start(code2) {
    return beforeSequenceOpen(code2);
  }
  function beforeSequenceOpen(code2) {
    const tail = self.events[self.events.length - 1];
    initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
    marker = code2;
    effects.enter("codeFenced");
    effects.enter("codeFencedFence");
    effects.enter("codeFencedFenceSequence");
    return sequenceOpen(code2);
  }
  function sequenceOpen(code2) {
    if (code2 === marker) {
      sizeOpen++;
      effects.consume(code2);
      return sequenceOpen;
    }
    if (sizeOpen < 3) {
      return nok(code2);
    }
    effects.exit("codeFencedFenceSequence");
    return markdownSpace(code2) ? factorySpace(effects, infoBefore, "whitespace")(code2) : infoBefore(code2);
  }
  function infoBefore(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("codeFencedFence");
      return self.interrupt ? ok3(code2) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code2);
    }
    effects.enter("codeFencedFenceInfo");
    effects.enter("chunkString", {
      contentType: "string"
    });
    return info(code2);
  }
  function info(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("chunkString");
      effects.exit("codeFencedFenceInfo");
      return infoBefore(code2);
    }
    if (markdownSpace(code2)) {
      effects.exit("chunkString");
      effects.exit("codeFencedFenceInfo");
      return factorySpace(effects, metaBefore, "whitespace")(code2);
    }
    if (code2 === 96 && code2 === marker) {
      return nok(code2);
    }
    effects.consume(code2);
    return info;
  }
  function metaBefore(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      return infoBefore(code2);
    }
    effects.enter("codeFencedFenceMeta");
    effects.enter("chunkString", {
      contentType: "string"
    });
    return meta(code2);
  }
  function meta(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("chunkString");
      effects.exit("codeFencedFenceMeta");
      return infoBefore(code2);
    }
    if (code2 === 96 && code2 === marker) {
      return nok(code2);
    }
    effects.consume(code2);
    return meta;
  }
  function atNonLazyBreak(code2) {
    return effects.attempt(closeStart, after, contentBefore)(code2);
  }
  function contentBefore(code2) {
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return contentStart;
  }
  function contentStart(code2) {
    return initialPrefix > 0 && markdownSpace(code2) ? factorySpace(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code2) : beforeContentChunk(code2);
  }
  function beforeContentChunk(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code2);
    }
    effects.enter("codeFlowValue");
    return contentChunk(code2);
  }
  function contentChunk(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("codeFlowValue");
      return beforeContentChunk(code2);
    }
    effects.consume(code2);
    return contentChunk;
  }
  function after(code2) {
    effects.exit("codeFenced");
    return ok3(code2);
  }
  function tokenizeCloseStart(effects2, ok4, nok2) {
    let size = 0;
    return startBefore;
    function startBefore(code2) {
      effects2.enter("lineEnding");
      effects2.consume(code2);
      effects2.exit("lineEnding");
      return start2;
    }
    function start2(code2) {
      effects2.enter("codeFencedFence");
      return markdownSpace(code2) ? factorySpace(effects2, beforeSequenceClose, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2) : beforeSequenceClose(code2);
    }
    function beforeSequenceClose(code2) {
      if (code2 === marker) {
        effects2.enter("codeFencedFenceSequence");
        return sequenceClose(code2);
      }
      return nok2(code2);
    }
    function sequenceClose(code2) {
      if (code2 === marker) {
        size++;
        effects2.consume(code2);
        return sequenceClose;
      }
      if (size >= sizeOpen) {
        effects2.exit("codeFencedFenceSequence");
        return markdownSpace(code2) ? factorySpace(effects2, sequenceCloseAfter, "whitespace")(code2) : sequenceCloseAfter(code2);
      }
      return nok2(code2);
    }
    function sequenceCloseAfter(code2) {
      if (code2 === null || markdownLineEnding(code2)) {
        effects2.exit("codeFencedFence");
        return ok4(code2);
      }
      return nok2(code2);
    }
  }
}
function tokenizeNonLazyContinuation(effects, ok3, nok) {
  const self = this;
  return start;
  function start(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return lineStart;
  }
  function lineStart(code2) {
    return self.parser.lazy[self.now().line] ? nok(code2) : ok3(code2);
  }
}
var nonLazyContinuation, codeFenced;
var init_code_fenced = __esm({
  "node_modules/micromark-core-commonmark/lib/code-fenced.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    nonLazyContinuation = {
      partial: true,
      tokenize: tokenizeNonLazyContinuation
    };
    codeFenced = {
      concrete: true,
      name: "codeFenced",
      tokenize: tokenizeCodeFenced
    };
  }
});

// node_modules/micromark-core-commonmark/lib/code-indented.js
function tokenizeCodeIndented(effects, ok3, nok) {
  const self = this;
  return start;
  function start(code2) {
    effects.enter("codeIndented");
    return factorySpace(effects, afterPrefix, "linePrefix", 4 + 1)(code2);
  }
  function afterPrefix(code2) {
    const tail = self.events[self.events.length - 1];
    return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? atBreak(code2) : nok(code2);
  }
  function atBreak(code2) {
    if (code2 === null) {
      return after(code2);
    }
    if (markdownLineEnding(code2)) {
      return effects.attempt(furtherStart, atBreak, after)(code2);
    }
    effects.enter("codeFlowValue");
    return inside(code2);
  }
  function inside(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("codeFlowValue");
      return atBreak(code2);
    }
    effects.consume(code2);
    return inside;
  }
  function after(code2) {
    effects.exit("codeIndented");
    return ok3(code2);
  }
}
function tokenizeFurtherStart(effects, ok3, nok) {
  const self = this;
  return furtherStart2;
  function furtherStart2(code2) {
    if (self.parser.lazy[self.now().line]) {
      return nok(code2);
    }
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      return furtherStart2;
    }
    return factorySpace(effects, afterPrefix, "linePrefix", 4 + 1)(code2);
  }
  function afterPrefix(code2) {
    const tail = self.events[self.events.length - 1];
    return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? ok3(code2) : markdownLineEnding(code2) ? furtherStart2(code2) : nok(code2);
  }
}
var codeIndented, furtherStart;
var init_code_indented = __esm({
  "node_modules/micromark-core-commonmark/lib/code-indented.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    codeIndented = {
      name: "codeIndented",
      tokenize: tokenizeCodeIndented
    };
    furtherStart = {
      partial: true,
      tokenize: tokenizeFurtherStart
    };
  }
});

// node_modules/micromark-core-commonmark/lib/code-text.js
function resolveCodeText(events) {
  let tailExitIndex = events.length - 4;
  let headEnterIndex = 3;
  let index2;
  let enter;
  if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
    index2 = headEnterIndex;
    while (++index2 < tailExitIndex) {
      if (events[index2][1].type === "codeTextData") {
        events[headEnterIndex][1].type = "codeTextPadding";
        events[tailExitIndex][1].type = "codeTextPadding";
        headEnterIndex += 2;
        tailExitIndex -= 2;
        break;
      }
    }
  }
  index2 = headEnterIndex - 1;
  tailExitIndex++;
  while (++index2 <= tailExitIndex) {
    if (enter === void 0) {
      if (index2 !== tailExitIndex && events[index2][1].type !== "lineEnding") {
        enter = index2;
      }
    } else if (index2 === tailExitIndex || events[index2][1].type === "lineEnding") {
      events[enter][1].type = "codeTextData";
      if (index2 !== enter + 2) {
        events[enter][1].end = events[index2 - 1][1].end;
        events.splice(enter + 2, index2 - enter - 2);
        tailExitIndex -= index2 - enter - 2;
        index2 = enter + 2;
      }
      enter = void 0;
    }
  }
  return events;
}
function previous(code2) {
  return code2 !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function tokenizeCodeText(effects, ok3, nok) {
  const self = this;
  let sizeOpen = 0;
  let size;
  let token;
  return start;
  function start(code2) {
    effects.enter("codeText");
    effects.enter("codeTextSequence");
    return sequenceOpen(code2);
  }
  function sequenceOpen(code2) {
    if (code2 === 96) {
      effects.consume(code2);
      sizeOpen++;
      return sequenceOpen;
    }
    effects.exit("codeTextSequence");
    return between(code2);
  }
  function between(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    if (code2 === 32) {
      effects.enter("space");
      effects.consume(code2);
      effects.exit("space");
      return between;
    }
    if (code2 === 96) {
      token = effects.enter("codeTextSequence");
      size = 0;
      return sequenceClose(code2);
    }
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      return between;
    }
    effects.enter("codeTextData");
    return data(code2);
  }
  function data(code2) {
    if (code2 === null || code2 === 32 || code2 === 96 || markdownLineEnding(code2)) {
      effects.exit("codeTextData");
      return between(code2);
    }
    effects.consume(code2);
    return data;
  }
  function sequenceClose(code2) {
    if (code2 === 96) {
      effects.consume(code2);
      size++;
      return sequenceClose;
    }
    if (size === sizeOpen) {
      effects.exit("codeTextSequence");
      effects.exit("codeText");
      return ok3(code2);
    }
    token.type = "codeTextData";
    return data(code2);
  }
}
var codeText;
var init_code_text = __esm({
  "node_modules/micromark-core-commonmark/lib/code-text.js"() {
    init_micromark_util_character();
    codeText = {
      name: "codeText",
      previous,
      resolve: resolveCodeText,
      tokenize: tokenizeCodeText
    };
  }
});

// node_modules/micromark-util-subtokenize/lib/splice-buffer.js
function chunkedPush(list2, right) {
  let chunkStart = 0;
  if (right.length < 1e4) {
    list2.push(...right);
  } else {
    while (chunkStart < right.length) {
      list2.push(...right.slice(chunkStart, chunkStart + 1e4));
      chunkStart += 1e4;
    }
  }
}
var SpliceBuffer;
var init_splice_buffer = __esm({
  "node_modules/micromark-util-subtokenize/lib/splice-buffer.js"() {
    SpliceBuffer = class {
      /**
       * @param {ReadonlyArray<T> | null | undefined} [initial]
       *   Initial items (optional).
       * @returns
       *   Splice buffer.
       */
      constructor(initial) {
        this.left = initial ? [...initial] : [];
        this.right = [];
      }
      /**
       * Array access;
       * does not move the cursor.
       *
       * @param {number} index
       *   Index.
       * @return {T}
       *   Item.
       */
      get(index2) {
        if (index2 < 0 || index2 >= this.left.length + this.right.length) {
          throw new RangeError("Cannot access index `" + index2 + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
        }
        if (index2 < this.left.length) return this.left[index2];
        return this.right[this.right.length - index2 + this.left.length - 1];
      }
      /**
       * The length of the splice buffer, one greater than the largest index in the
       * array.
       */
      get length() {
        return this.left.length + this.right.length;
      }
      /**
       * Remove and return `list[0]`;
       * moves the cursor to `0`.
       *
       * @returns {T | undefined}
       *   Item, optional.
       */
      shift() {
        this.setCursor(0);
        return this.right.pop();
      }
      /**
       * Slice the buffer to get an array;
       * does not move the cursor.
       *
       * @param {number} start
       *   Start.
       * @param {number | null | undefined} [end]
       *   End (optional).
       * @returns {Array<T>}
       *   Array of items.
       */
      slice(start, end) {
        const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
        if (stop < this.left.length) {
          return this.left.slice(start, stop);
        }
        if (start > this.left.length) {
          return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start + this.left.length).reverse();
        }
        return this.left.slice(start).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
      }
      /**
       * Mimics the behavior of Array.prototype.splice() except for the change of
       * interface necessary to avoid segfaults when patching in very large arrays.
       *
       * This operation moves cursor is moved to `start` and results in the cursor
       * placed after any inserted items.
       *
       * @param {number} start
       *   Start;
       *   zero-based index at which to start changing the array;
       *   negative numbers count backwards from the end of the array and values
       *   that are out-of bounds are clamped to the appropriate end of the array.
       * @param {number | null | undefined} [deleteCount=0]
       *   Delete count (default: `0`);
       *   maximum number of elements to delete, starting from start.
       * @param {Array<T> | null | undefined} [items=[]]
       *   Items to include in place of the deleted items (default: `[]`).
       * @return {Array<T>}
       *   Any removed items.
       */
      splice(start, deleteCount, items) {
        const count = deleteCount || 0;
        this.setCursor(Math.trunc(start));
        const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
        if (items) chunkedPush(this.left, items);
        return removed.reverse();
      }
      /**
       * Remove and return the highest-numbered item in the array, so
       * `list[list.length - 1]`;
       * Moves the cursor to `length`.
       *
       * @returns {T | undefined}
       *   Item, optional.
       */
      pop() {
        this.setCursor(Number.POSITIVE_INFINITY);
        return this.left.pop();
      }
      /**
       * Inserts a single item to the high-numbered side of the array;
       * moves the cursor to `length`.
       *
       * @param {T} item
       *   Item.
       * @returns {undefined}
       *   Nothing.
       */
      push(item) {
        this.setCursor(Number.POSITIVE_INFINITY);
        this.left.push(item);
      }
      /**
       * Inserts many items to the high-numbered side of the array.
       * Moves the cursor to `length`.
       *
       * @param {Array<T>} items
       *   Items.
       * @returns {undefined}
       *   Nothing.
       */
      pushMany(items) {
        this.setCursor(Number.POSITIVE_INFINITY);
        chunkedPush(this.left, items);
      }
      /**
       * Inserts a single item to the low-numbered side of the array;
       * Moves the cursor to `0`.
       *
       * @param {T} item
       *   Item.
       * @returns {undefined}
       *   Nothing.
       */
      unshift(item) {
        this.setCursor(0);
        this.right.push(item);
      }
      /**
       * Inserts many items to the low-numbered side of the array;
       * moves the cursor to `0`.
       *
       * @param {Array<T>} items
       *   Items.
       * @returns {undefined}
       *   Nothing.
       */
      unshiftMany(items) {
        this.setCursor(0);
        chunkedPush(this.right, items.reverse());
      }
      /**
       * Move the cursor to a specific position in the array. Requires
       * time proportional to the distance moved.
       *
       * If `n < 0`, the cursor will end up at the beginning.
       * If `n > length`, the cursor will end up at the end.
       *
       * @param {number} n
       *   Position.
       * @return {undefined}
       *   Nothing.
       */
      setCursor(n) {
        if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
        if (n < this.left.length) {
          const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
          chunkedPush(this.right, removed.reverse());
        } else {
          const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
          chunkedPush(this.left, removed.reverse());
        }
      }
    };
  }
});

// node_modules/micromark-util-subtokenize/index.js
function subtokenize(eventsArray) {
  const jumps = {};
  let index2 = -1;
  let event;
  let lineIndex;
  let otherIndex;
  let otherEvent;
  let parameters;
  let subevents;
  let more;
  const events = new SpliceBuffer(eventsArray);
  while (++index2 < events.length) {
    while (index2 in jumps) {
      index2 = jumps[index2];
    }
    event = events.get(index2);
    if (index2 && event[1].type === "chunkFlow" && events.get(index2 - 1)[1].type === "listItemPrefix") {
      subevents = event[1]._tokenizer.events;
      otherIndex = 0;
      if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") {
        otherIndex += 2;
      }
      if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") {
        while (++otherIndex < subevents.length) {
          if (subevents[otherIndex][1].type === "content") {
            break;
          }
          if (subevents[otherIndex][1].type === "chunkText") {
            subevents[otherIndex][1]._isInFirstContentOfListItem = true;
            otherIndex++;
          }
        }
      }
    }
    if (event[0] === "enter") {
      if (event[1].contentType) {
        Object.assign(jumps, subcontent(events, index2));
        index2 = jumps[index2];
        more = true;
      }
    } else if (event[1]._container) {
      otherIndex = index2;
      lineIndex = void 0;
      while (otherIndex--) {
        otherEvent = events.get(otherIndex);
        if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
          if (otherEvent[0] === "enter") {
            if (lineIndex) {
              events.get(lineIndex)[1].type = "lineEndingBlank";
            }
            otherEvent[1].type = "lineEnding";
            lineIndex = otherIndex;
          }
        } else if (otherEvent[1].type === "linePrefix" || otherEvent[1].type === "listItemIndent") {
        } else {
          break;
        }
      }
      if (lineIndex) {
        event[1].end = {
          ...events.get(lineIndex)[1].start
        };
        parameters = events.slice(lineIndex, index2);
        parameters.unshift(event);
        events.splice(lineIndex, index2 - lineIndex + 1, parameters);
      }
    }
  }
  splice(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
  return !more;
}
function subcontent(events, eventIndex) {
  const token = events.get(eventIndex)[1];
  const context = events.get(eventIndex)[2];
  let startPosition = eventIndex - 1;
  const startPositions = [];
  let tokenizer = token._tokenizer;
  if (!tokenizer) {
    tokenizer = context.parser[token.contentType](token.start);
    if (token._contentTypeTextTrailing) {
      tokenizer._contentTypeTextTrailing = true;
    }
  }
  const childEvents = tokenizer.events;
  const jumps = [];
  const gaps = {};
  let stream;
  let previous3;
  let index2 = -1;
  let current = token;
  let adjust = 0;
  let start = 0;
  const breaks = [start];
  while (current) {
    while (events.get(++startPosition)[1] !== current) {
    }
    startPositions.push(startPosition);
    if (!current._tokenizer) {
      stream = context.sliceStream(current);
      if (!current.next) {
        stream.push(null);
      }
      if (previous3) {
        tokenizer.defineSkip(current.start);
      }
      if (current._isInFirstContentOfListItem) {
        tokenizer._gfmTasklistFirstContentOfListItem = true;
      }
      tokenizer.write(stream);
      if (current._isInFirstContentOfListItem) {
        tokenizer._gfmTasklistFirstContentOfListItem = void 0;
      }
    }
    previous3 = current;
    current = current.next;
  }
  current = token;
  while (++index2 < childEvents.length) {
    if (
      // Find a void token that includes a break.
      childEvents[index2][0] === "exit" && childEvents[index2 - 1][0] === "enter" && childEvents[index2][1].type === childEvents[index2 - 1][1].type && childEvents[index2][1].start.line !== childEvents[index2][1].end.line
    ) {
      start = index2 + 1;
      breaks.push(start);
      current._tokenizer = void 0;
      current.previous = void 0;
      current = current.next;
    }
  }
  tokenizer.events = [];
  if (current) {
    current._tokenizer = void 0;
    current.previous = void 0;
  } else {
    breaks.pop();
  }
  index2 = breaks.length;
  while (index2--) {
    const slice = childEvents.slice(breaks[index2], breaks[index2 + 1]);
    const start2 = startPositions.pop();
    jumps.push([start2, start2 + slice.length - 1]);
    events.splice(start2, 2, slice);
  }
  jumps.reverse();
  index2 = -1;
  while (++index2 < jumps.length) {
    gaps[adjust + jumps[index2][0]] = adjust + jumps[index2][1];
    adjust += jumps[index2][1] - jumps[index2][0] - 1;
  }
  return gaps;
}
var init_micromark_util_subtokenize = __esm({
  "node_modules/micromark-util-subtokenize/index.js"() {
    init_micromark_util_chunked();
    init_splice_buffer();
  }
});

// node_modules/micromark-core-commonmark/lib/content.js
function resolveContent(events) {
  subtokenize(events);
  return events;
}
function tokenizeContent(effects, ok3) {
  let previous3;
  return chunkStart;
  function chunkStart(code2) {
    effects.enter("content");
    previous3 = effects.enter("chunkContent", {
      contentType: "content"
    });
    return chunkInside(code2);
  }
  function chunkInside(code2) {
    if (code2 === null) {
      return contentEnd(code2);
    }
    if (markdownLineEnding(code2)) {
      return effects.check(continuationConstruct, contentContinue, contentEnd)(code2);
    }
    effects.consume(code2);
    return chunkInside;
  }
  function contentEnd(code2) {
    effects.exit("chunkContent");
    effects.exit("content");
    return ok3(code2);
  }
  function contentContinue(code2) {
    effects.consume(code2);
    effects.exit("chunkContent");
    previous3.next = effects.enter("chunkContent", {
      contentType: "content",
      previous: previous3
    });
    previous3 = previous3.next;
    return chunkInside;
  }
}
function tokenizeContinuation(effects, ok3, nok) {
  const self = this;
  return startLookahead;
  function startLookahead(code2) {
    effects.exit("chunkContent");
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return factorySpace(effects, prefixed, "linePrefix");
  }
  function prefixed(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      return nok(code2);
    }
    const tail = self.events[self.events.length - 1];
    if (!self.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) {
      return ok3(code2);
    }
    return effects.interrupt(self.parser.constructs.flow, nok, ok3)(code2);
  }
}
var content2, continuationConstruct;
var init_content2 = __esm({
  "node_modules/micromark-core-commonmark/lib/content.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    init_micromark_util_subtokenize();
    content2 = {
      resolve: resolveContent,
      tokenize: tokenizeContent
    };
    continuationConstruct = {
      partial: true,
      tokenize: tokenizeContinuation
    };
  }
});

// node_modules/micromark-factory-destination/index.js
function factoryDestination(effects, ok3, nok, type2, literalType, literalMarkerType, rawType, stringType, max) {
  const limit = max || Number.POSITIVE_INFINITY;
  let balance = 0;
  return start;
  function start(code2) {
    if (code2 === 60) {
      effects.enter(type2);
      effects.enter(literalType);
      effects.enter(literalMarkerType);
      effects.consume(code2);
      effects.exit(literalMarkerType);
      return enclosedBefore;
    }
    if (code2 === null || code2 === 32 || code2 === 41 || asciiControl(code2)) {
      return nok(code2);
    }
    effects.enter(type2);
    effects.enter(rawType);
    effects.enter(stringType);
    effects.enter("chunkString", {
      contentType: "string"
    });
    return raw(code2);
  }
  function enclosedBefore(code2) {
    if (code2 === 62) {
      effects.enter(literalMarkerType);
      effects.consume(code2);
      effects.exit(literalMarkerType);
      effects.exit(literalType);
      effects.exit(type2);
      return ok3;
    }
    effects.enter(stringType);
    effects.enter("chunkString", {
      contentType: "string"
    });
    return enclosed(code2);
  }
  function enclosed(code2) {
    if (code2 === 62) {
      effects.exit("chunkString");
      effects.exit(stringType);
      return enclosedBefore(code2);
    }
    if (code2 === null || code2 === 60 || markdownLineEnding(code2)) {
      return nok(code2);
    }
    effects.consume(code2);
    return code2 === 92 ? enclosedEscape : enclosed;
  }
  function enclosedEscape(code2) {
    if (code2 === 60 || code2 === 62 || code2 === 92) {
      effects.consume(code2);
      return enclosed;
    }
    return enclosed(code2);
  }
  function raw(code2) {
    if (!balance && (code2 === null || code2 === 41 || markdownLineEndingOrSpace(code2))) {
      effects.exit("chunkString");
      effects.exit(stringType);
      effects.exit(rawType);
      effects.exit(type2);
      return ok3(code2);
    }
    if (balance < limit && code2 === 40) {
      effects.consume(code2);
      balance++;
      return raw;
    }
    if (code2 === 41) {
      effects.consume(code2);
      balance--;
      return raw;
    }
    if (code2 === null || code2 === 32 || code2 === 40 || asciiControl(code2)) {
      return nok(code2);
    }
    effects.consume(code2);
    return code2 === 92 ? rawEscape : raw;
  }
  function rawEscape(code2) {
    if (code2 === 40 || code2 === 41 || code2 === 92) {
      effects.consume(code2);
      return raw;
    }
    return raw(code2);
  }
}
var init_micromark_factory_destination = __esm({
  "node_modules/micromark-factory-destination/index.js"() {
    init_micromark_util_character();
  }
});

// node_modules/micromark-factory-label/index.js
function factoryLabel(effects, ok3, nok, type2, markerType, stringType) {
  const self = this;
  let size = 0;
  let seen;
  return start;
  function start(code2) {
    effects.enter(type2);
    effects.enter(markerType);
    effects.consume(code2);
    effects.exit(markerType);
    effects.enter(stringType);
    return atBreak;
  }
  function atBreak(code2) {
    if (size > 999 || code2 === null || code2 === 91 || code2 === 93 && !seen || // To do: remove in the future once we’ve switched from
    // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
    // which doesn’t need this.
    // Hidden footnotes hook.
    /* c8 ignore next 3 */
    code2 === 94 && !size && "_hiddenFootnoteSupport" in self.parser.constructs) {
      return nok(code2);
    }
    if (code2 === 93) {
      effects.exit(stringType);
      effects.enter(markerType);
      effects.consume(code2);
      effects.exit(markerType);
      effects.exit(type2);
      return ok3;
    }
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      return atBreak;
    }
    effects.enter("chunkString", {
      contentType: "string"
    });
    return labelInside(code2);
  }
  function labelInside(code2) {
    if (code2 === null || code2 === 91 || code2 === 93 || markdownLineEnding(code2) || size++ > 999) {
      effects.exit("chunkString");
      return atBreak(code2);
    }
    effects.consume(code2);
    if (!seen) seen = !markdownSpace(code2);
    return code2 === 92 ? labelEscape : labelInside;
  }
  function labelEscape(code2) {
    if (code2 === 91 || code2 === 92 || code2 === 93) {
      effects.consume(code2);
      size++;
      return labelInside;
    }
    return labelInside(code2);
  }
}
var init_micromark_factory_label = __esm({
  "node_modules/micromark-factory-label/index.js"() {
    init_micromark_util_character();
  }
});

// node_modules/micromark-factory-title/index.js
function factoryTitle(effects, ok3, nok, type2, markerType, stringType) {
  let marker;
  return start;
  function start(code2) {
    if (code2 === 34 || code2 === 39 || code2 === 40) {
      effects.enter(type2);
      effects.enter(markerType);
      effects.consume(code2);
      effects.exit(markerType);
      marker = code2 === 40 ? 41 : code2;
      return begin;
    }
    return nok(code2);
  }
  function begin(code2) {
    if (code2 === marker) {
      effects.enter(markerType);
      effects.consume(code2);
      effects.exit(markerType);
      effects.exit(type2);
      return ok3;
    }
    effects.enter(stringType);
    return atBreak(code2);
  }
  function atBreak(code2) {
    if (code2 === marker) {
      effects.exit(stringType);
      return begin(marker);
    }
    if (code2 === null) {
      return nok(code2);
    }
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      return factorySpace(effects, atBreak, "linePrefix");
    }
    effects.enter("chunkString", {
      contentType: "string"
    });
    return inside(code2);
  }
  function inside(code2) {
    if (code2 === marker || code2 === null || markdownLineEnding(code2)) {
      effects.exit("chunkString");
      return atBreak(code2);
    }
    effects.consume(code2);
    return code2 === 92 ? escape : inside;
  }
  function escape(code2) {
    if (code2 === marker || code2 === 92) {
      effects.consume(code2);
      return inside;
    }
    return inside(code2);
  }
}
var init_micromark_factory_title = __esm({
  "node_modules/micromark-factory-title/index.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
  }
});

// node_modules/micromark-factory-whitespace/index.js
function factoryWhitespace(effects, ok3) {
  let seen;
  return start;
  function start(code2) {
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      seen = true;
      return start;
    }
    if (markdownSpace(code2)) {
      return factorySpace(effects, start, seen ? "linePrefix" : "lineSuffix")(code2);
    }
    return ok3(code2);
  }
}
var init_micromark_factory_whitespace = __esm({
  "node_modules/micromark-factory-whitespace/index.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
  }
});

// node_modules/micromark-core-commonmark/lib/definition.js
function tokenizeDefinition(effects, ok3, nok) {
  const self = this;
  let identifier;
  return start;
  function start(code2) {
    effects.enter("definition");
    return before(code2);
  }
  function before(code2) {
    return factoryLabel.call(
      self,
      effects,
      labelAfter,
      // Note: we don’t need to reset the way `markdown-rs` does.
      nok,
      "definitionLabel",
      "definitionLabelMarker",
      "definitionLabelString"
    )(code2);
  }
  function labelAfter(code2) {
    identifier = normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1));
    if (code2 === 58) {
      effects.enter("definitionMarker");
      effects.consume(code2);
      effects.exit("definitionMarker");
      return markerAfter;
    }
    return nok(code2);
  }
  function markerAfter(code2) {
    return markdownLineEndingOrSpace(code2) ? factoryWhitespace(effects, destinationBefore)(code2) : destinationBefore(code2);
  }
  function destinationBefore(code2) {
    return factoryDestination(
      effects,
      destinationAfter,
      // Note: we don’t need to reset the way `markdown-rs` does.
      nok,
      "definitionDestination",
      "definitionDestinationLiteral",
      "definitionDestinationLiteralMarker",
      "definitionDestinationRaw",
      "definitionDestinationString"
    )(code2);
  }
  function destinationAfter(code2) {
    return effects.attempt(titleBefore, after, after)(code2);
  }
  function after(code2) {
    return markdownSpace(code2) ? factorySpace(effects, afterWhitespace, "whitespace")(code2) : afterWhitespace(code2);
  }
  function afterWhitespace(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("definition");
      self.parser.defined.push(identifier);
      return ok3(code2);
    }
    return nok(code2);
  }
}
function tokenizeTitleBefore(effects, ok3, nok) {
  return titleBefore2;
  function titleBefore2(code2) {
    return markdownLineEndingOrSpace(code2) ? factoryWhitespace(effects, beforeMarker)(code2) : nok(code2);
  }
  function beforeMarker(code2) {
    return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code2);
  }
  function titleAfter(code2) {
    return markdownSpace(code2) ? factorySpace(effects, titleAfterOptionalWhitespace, "whitespace")(code2) : titleAfterOptionalWhitespace(code2);
  }
  function titleAfterOptionalWhitespace(code2) {
    return code2 === null || markdownLineEnding(code2) ? ok3(code2) : nok(code2);
  }
}
var definition, titleBefore;
var init_definition = __esm({
  "node_modules/micromark-core-commonmark/lib/definition.js"() {
    init_micromark_factory_destination();
    init_micromark_factory_label();
    init_micromark_factory_space();
    init_micromark_factory_title();
    init_micromark_factory_whitespace();
    init_micromark_util_character();
    init_micromark_util_normalize_identifier();
    definition = {
      name: "definition",
      tokenize: tokenizeDefinition
    };
    titleBefore = {
      partial: true,
      tokenize: tokenizeTitleBefore
    };
  }
});

// node_modules/micromark-core-commonmark/lib/hard-break-escape.js
function tokenizeHardBreakEscape(effects, ok3, nok) {
  return start;
  function start(code2) {
    effects.enter("hardBreakEscape");
    effects.consume(code2);
    return after;
  }
  function after(code2) {
    if (markdownLineEnding(code2)) {
      effects.exit("hardBreakEscape");
      return ok3(code2);
    }
    return nok(code2);
  }
}
var hardBreakEscape;
var init_hard_break_escape = __esm({
  "node_modules/micromark-core-commonmark/lib/hard-break-escape.js"() {
    init_micromark_util_character();
    hardBreakEscape = {
      name: "hardBreakEscape",
      tokenize: tokenizeHardBreakEscape
    };
  }
});

// node_modules/micromark-core-commonmark/lib/heading-atx.js
function resolveHeadingAtx(events, context) {
  let contentEnd = events.length - 2;
  let contentStart = 3;
  let content3;
  let text4;
  if (events[contentStart][1].type === "whitespace") {
    contentStart += 2;
  }
  if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") {
    contentEnd -= 2;
  }
  if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) {
    contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
  }
  if (contentEnd > contentStart) {
    content3 = {
      type: "atxHeadingText",
      start: events[contentStart][1].start,
      end: events[contentEnd][1].end
    };
    text4 = {
      type: "chunkText",
      start: events[contentStart][1].start,
      end: events[contentEnd][1].end,
      contentType: "text"
    };
    splice(events, contentStart, contentEnd - contentStart + 1, [["enter", content3, context], ["enter", text4, context], ["exit", text4, context], ["exit", content3, context]]);
  }
  return events;
}
function tokenizeHeadingAtx(effects, ok3, nok) {
  let size = 0;
  return start;
  function start(code2) {
    effects.enter("atxHeading");
    return before(code2);
  }
  function before(code2) {
    effects.enter("atxHeadingSequence");
    return sequenceOpen(code2);
  }
  function sequenceOpen(code2) {
    if (code2 === 35 && size++ < 6) {
      effects.consume(code2);
      return sequenceOpen;
    }
    if (code2 === null || markdownLineEndingOrSpace(code2)) {
      effects.exit("atxHeadingSequence");
      return atBreak(code2);
    }
    return nok(code2);
  }
  function atBreak(code2) {
    if (code2 === 35) {
      effects.enter("atxHeadingSequence");
      return sequenceFurther(code2);
    }
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("atxHeading");
      return ok3(code2);
    }
    if (markdownSpace(code2)) {
      return factorySpace(effects, atBreak, "whitespace")(code2);
    }
    effects.enter("atxHeadingText");
    return data(code2);
  }
  function sequenceFurther(code2) {
    if (code2 === 35) {
      effects.consume(code2);
      return sequenceFurther;
    }
    effects.exit("atxHeadingSequence");
    return atBreak(code2);
  }
  function data(code2) {
    if (code2 === null || code2 === 35 || markdownLineEndingOrSpace(code2)) {
      effects.exit("atxHeadingText");
      return atBreak(code2);
    }
    effects.consume(code2);
    return data;
  }
}
var headingAtx;
var init_heading_atx = __esm({
  "node_modules/micromark-core-commonmark/lib/heading-atx.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    init_micromark_util_chunked();
    headingAtx = {
      name: "headingAtx",
      resolve: resolveHeadingAtx,
      tokenize: tokenizeHeadingAtx
    };
  }
});

// node_modules/micromark-util-html-tag-name/index.js
var htmlBlockNames, htmlRawNames;
var init_micromark_util_html_tag_name = __esm({
  "node_modules/micromark-util-html-tag-name/index.js"() {
    htmlBlockNames = [
      "address",
      "article",
      "aside",
      "base",
      "basefont",
      "blockquote",
      "body",
      "caption",
      "center",
      "col",
      "colgroup",
      "dd",
      "details",
      "dialog",
      "dir",
      "div",
      "dl",
      "dt",
      "fieldset",
      "figcaption",
      "figure",
      "footer",
      "form",
      "frame",
      "frameset",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "head",
      "header",
      "hr",
      "html",
      "iframe",
      "legend",
      "li",
      "link",
      "main",
      "menu",
      "menuitem",
      "nav",
      "noframes",
      "ol",
      "optgroup",
      "option",
      "p",
      "param",
      "search",
      "section",
      "summary",
      "table",
      "tbody",
      "td",
      "tfoot",
      "th",
      "thead",
      "title",
      "tr",
      "track",
      "ul"
    ];
    htmlRawNames = ["pre", "script", "style", "textarea"];
  }
});

// node_modules/micromark-core-commonmark/lib/html-flow.js
function resolveToHtmlFlow(events) {
  let index2 = events.length;
  while (index2--) {
    if (events[index2][0] === "enter" && events[index2][1].type === "htmlFlow") {
      break;
    }
  }
  if (index2 > 1 && events[index2 - 2][1].type === "linePrefix") {
    events[index2][1].start = events[index2 - 2][1].start;
    events[index2 + 1][1].start = events[index2 - 2][1].start;
    events.splice(index2 - 2, 2);
  }
  return events;
}
function tokenizeHtmlFlow(effects, ok3, nok) {
  const self = this;
  let marker;
  let closingTag;
  let buffer;
  let index2;
  let markerB;
  return start;
  function start(code2) {
    return before(code2);
  }
  function before(code2) {
    effects.enter("htmlFlow");
    effects.enter("htmlFlowData");
    effects.consume(code2);
    return open2;
  }
  function open2(code2) {
    if (code2 === 33) {
      effects.consume(code2);
      return declarationOpen;
    }
    if (code2 === 47) {
      effects.consume(code2);
      closingTag = true;
      return tagCloseStart;
    }
    if (code2 === 63) {
      effects.consume(code2);
      marker = 3;
      return self.interrupt ? ok3 : continuationDeclarationInside;
    }
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      buffer = String.fromCharCode(code2);
      return tagName;
    }
    return nok(code2);
  }
  function declarationOpen(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      marker = 2;
      return commentOpenInside;
    }
    if (code2 === 91) {
      effects.consume(code2);
      marker = 5;
      index2 = 0;
      return cdataOpenInside;
    }
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      marker = 4;
      return self.interrupt ? ok3 : continuationDeclarationInside;
    }
    return nok(code2);
  }
  function commentOpenInside(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return self.interrupt ? ok3 : continuationDeclarationInside;
    }
    return nok(code2);
  }
  function cdataOpenInside(code2) {
    const value = "CDATA[";
    if (code2 === value.charCodeAt(index2++)) {
      effects.consume(code2);
      if (index2 === value.length) {
        return self.interrupt ? ok3 : continuation;
      }
      return cdataOpenInside;
    }
    return nok(code2);
  }
  function tagCloseStart(code2) {
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      buffer = String.fromCharCode(code2);
      return tagName;
    }
    return nok(code2);
  }
  function tagName(code2) {
    if (code2 === null || code2 === 47 || code2 === 62 || markdownLineEndingOrSpace(code2)) {
      const slash = code2 === 47;
      const name = buffer.toLowerCase();
      if (!slash && !closingTag && htmlRawNames.includes(name)) {
        marker = 1;
        return self.interrupt ? ok3(code2) : continuation(code2);
      }
      if (htmlBlockNames.includes(buffer.toLowerCase())) {
        marker = 6;
        if (slash) {
          effects.consume(code2);
          return basicSelfClosing;
        }
        return self.interrupt ? ok3(code2) : continuation(code2);
      }
      marker = 7;
      return self.interrupt && !self.parser.lazy[self.now().line] ? nok(code2) : closingTag ? completeClosingTagAfter(code2) : completeAttributeNameBefore(code2);
    }
    if (code2 === 45 || asciiAlphanumeric(code2)) {
      effects.consume(code2);
      buffer += String.fromCharCode(code2);
      return tagName;
    }
    return nok(code2);
  }
  function basicSelfClosing(code2) {
    if (code2 === 62) {
      effects.consume(code2);
      return self.interrupt ? ok3 : continuation;
    }
    return nok(code2);
  }
  function completeClosingTagAfter(code2) {
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return completeClosingTagAfter;
    }
    return completeEnd(code2);
  }
  function completeAttributeNameBefore(code2) {
    if (code2 === 47) {
      effects.consume(code2);
      return completeEnd;
    }
    if (code2 === 58 || code2 === 95 || asciiAlpha(code2)) {
      effects.consume(code2);
      return completeAttributeName;
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return completeAttributeNameBefore;
    }
    return completeEnd(code2);
  }
  function completeAttributeName(code2) {
    if (code2 === 45 || code2 === 46 || code2 === 58 || code2 === 95 || asciiAlphanumeric(code2)) {
      effects.consume(code2);
      return completeAttributeName;
    }
    return completeAttributeNameAfter(code2);
  }
  function completeAttributeNameAfter(code2) {
    if (code2 === 61) {
      effects.consume(code2);
      return completeAttributeValueBefore;
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return completeAttributeNameAfter;
    }
    return completeAttributeNameBefore(code2);
  }
  function completeAttributeValueBefore(code2) {
    if (code2 === null || code2 === 60 || code2 === 61 || code2 === 62 || code2 === 96) {
      return nok(code2);
    }
    if (code2 === 34 || code2 === 39) {
      effects.consume(code2);
      markerB = code2;
      return completeAttributeValueQuoted;
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return completeAttributeValueBefore;
    }
    return completeAttributeValueUnquoted(code2);
  }
  function completeAttributeValueQuoted(code2) {
    if (code2 === markerB) {
      effects.consume(code2);
      markerB = null;
      return completeAttributeValueQuotedAfter;
    }
    if (code2 === null || markdownLineEnding(code2)) {
      return nok(code2);
    }
    effects.consume(code2);
    return completeAttributeValueQuoted;
  }
  function completeAttributeValueUnquoted(code2) {
    if (code2 === null || code2 === 34 || code2 === 39 || code2 === 47 || code2 === 60 || code2 === 61 || code2 === 62 || code2 === 96 || markdownLineEndingOrSpace(code2)) {
      return completeAttributeNameAfter(code2);
    }
    effects.consume(code2);
    return completeAttributeValueUnquoted;
  }
  function completeAttributeValueQuotedAfter(code2) {
    if (code2 === 47 || code2 === 62 || markdownSpace(code2)) {
      return completeAttributeNameBefore(code2);
    }
    return nok(code2);
  }
  function completeEnd(code2) {
    if (code2 === 62) {
      effects.consume(code2);
      return completeAfter;
    }
    return nok(code2);
  }
  function completeAfter(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      return continuation(code2);
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return completeAfter;
    }
    return nok(code2);
  }
  function continuation(code2) {
    if (code2 === 45 && marker === 2) {
      effects.consume(code2);
      return continuationCommentInside;
    }
    if (code2 === 60 && marker === 1) {
      effects.consume(code2);
      return continuationRawTagOpen;
    }
    if (code2 === 62 && marker === 4) {
      effects.consume(code2);
      return continuationClose;
    }
    if (code2 === 63 && marker === 3) {
      effects.consume(code2);
      return continuationDeclarationInside;
    }
    if (code2 === 93 && marker === 5) {
      effects.consume(code2);
      return continuationCdataInside;
    }
    if (markdownLineEnding(code2) && (marker === 6 || marker === 7)) {
      effects.exit("htmlFlowData");
      return effects.check(blankLineBefore, continuationAfter, continuationStart)(code2);
    }
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("htmlFlowData");
      return continuationStart(code2);
    }
    effects.consume(code2);
    return continuation;
  }
  function continuationStart(code2) {
    return effects.check(nonLazyContinuationStart, continuationStartNonLazy, continuationAfter)(code2);
  }
  function continuationStartNonLazy(code2) {
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return continuationBefore;
  }
  function continuationBefore(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      return continuationStart(code2);
    }
    effects.enter("htmlFlowData");
    return continuation(code2);
  }
  function continuationCommentInside(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return continuationDeclarationInside;
    }
    return continuation(code2);
  }
  function continuationRawTagOpen(code2) {
    if (code2 === 47) {
      effects.consume(code2);
      buffer = "";
      return continuationRawEndTag;
    }
    return continuation(code2);
  }
  function continuationRawEndTag(code2) {
    if (code2 === 62) {
      const name = buffer.toLowerCase();
      if (htmlRawNames.includes(name)) {
        effects.consume(code2);
        return continuationClose;
      }
      return continuation(code2);
    }
    if (asciiAlpha(code2) && buffer.length < 8) {
      effects.consume(code2);
      buffer += String.fromCharCode(code2);
      return continuationRawEndTag;
    }
    return continuation(code2);
  }
  function continuationCdataInside(code2) {
    if (code2 === 93) {
      effects.consume(code2);
      return continuationDeclarationInside;
    }
    return continuation(code2);
  }
  function continuationDeclarationInside(code2) {
    if (code2 === 62) {
      effects.consume(code2);
      return continuationClose;
    }
    if (code2 === 45 && marker === 2) {
      effects.consume(code2);
      return continuationDeclarationInside;
    }
    return continuation(code2);
  }
  function continuationClose(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("htmlFlowData");
      return continuationAfter(code2);
    }
    effects.consume(code2);
    return continuationClose;
  }
  function continuationAfter(code2) {
    effects.exit("htmlFlow");
    return ok3(code2);
  }
}
function tokenizeNonLazyContinuationStart(effects, ok3, nok) {
  const self = this;
  return start;
  function start(code2) {
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      return after;
    }
    return nok(code2);
  }
  function after(code2) {
    return self.parser.lazy[self.now().line] ? nok(code2) : ok3(code2);
  }
}
function tokenizeBlankLineBefore(effects, ok3, nok) {
  return start;
  function start(code2) {
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return effects.attempt(blankLine, ok3, nok);
  }
}
var htmlFlow, blankLineBefore, nonLazyContinuationStart;
var init_html_flow = __esm({
  "node_modules/micromark-core-commonmark/lib/html-flow.js"() {
    init_micromark_util_character();
    init_micromark_util_html_tag_name();
    init_blank_line();
    htmlFlow = {
      concrete: true,
      name: "htmlFlow",
      resolveTo: resolveToHtmlFlow,
      tokenize: tokenizeHtmlFlow
    };
    blankLineBefore = {
      partial: true,
      tokenize: tokenizeBlankLineBefore
    };
    nonLazyContinuationStart = {
      partial: true,
      tokenize: tokenizeNonLazyContinuationStart
    };
  }
});

// node_modules/micromark-core-commonmark/lib/html-text.js
function tokenizeHtmlText(effects, ok3, nok) {
  const self = this;
  let marker;
  let index2;
  let returnState;
  return start;
  function start(code2) {
    effects.enter("htmlText");
    effects.enter("htmlTextData");
    effects.consume(code2);
    return open2;
  }
  function open2(code2) {
    if (code2 === 33) {
      effects.consume(code2);
      return declarationOpen;
    }
    if (code2 === 47) {
      effects.consume(code2);
      return tagCloseStart;
    }
    if (code2 === 63) {
      effects.consume(code2);
      return instruction;
    }
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      return tagOpen;
    }
    return nok(code2);
  }
  function declarationOpen(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return commentOpenInside;
    }
    if (code2 === 91) {
      effects.consume(code2);
      index2 = 0;
      return cdataOpenInside;
    }
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      return declaration;
    }
    return nok(code2);
  }
  function commentOpenInside(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return commentEnd;
    }
    return nok(code2);
  }
  function comment(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    if (code2 === 45) {
      effects.consume(code2);
      return commentClose;
    }
    if (markdownLineEnding(code2)) {
      returnState = comment;
      return lineEndingBefore(code2);
    }
    effects.consume(code2);
    return comment;
  }
  function commentClose(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return commentEnd;
    }
    return comment(code2);
  }
  function commentEnd(code2) {
    return code2 === 62 ? end(code2) : code2 === 45 ? commentClose(code2) : comment(code2);
  }
  function cdataOpenInside(code2) {
    const value = "CDATA[";
    if (code2 === value.charCodeAt(index2++)) {
      effects.consume(code2);
      return index2 === value.length ? cdata : cdataOpenInside;
    }
    return nok(code2);
  }
  function cdata(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    if (code2 === 93) {
      effects.consume(code2);
      return cdataClose;
    }
    if (markdownLineEnding(code2)) {
      returnState = cdata;
      return lineEndingBefore(code2);
    }
    effects.consume(code2);
    return cdata;
  }
  function cdataClose(code2) {
    if (code2 === 93) {
      effects.consume(code2);
      return cdataEnd;
    }
    return cdata(code2);
  }
  function cdataEnd(code2) {
    if (code2 === 62) {
      return end(code2);
    }
    if (code2 === 93) {
      effects.consume(code2);
      return cdataEnd;
    }
    return cdata(code2);
  }
  function declaration(code2) {
    if (code2 === null || code2 === 62) {
      return end(code2);
    }
    if (markdownLineEnding(code2)) {
      returnState = declaration;
      return lineEndingBefore(code2);
    }
    effects.consume(code2);
    return declaration;
  }
  function instruction(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    if (code2 === 63) {
      effects.consume(code2);
      return instructionClose;
    }
    if (markdownLineEnding(code2)) {
      returnState = instruction;
      return lineEndingBefore(code2);
    }
    effects.consume(code2);
    return instruction;
  }
  function instructionClose(code2) {
    return code2 === 62 ? end(code2) : instruction(code2);
  }
  function tagCloseStart(code2) {
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      return tagClose;
    }
    return nok(code2);
  }
  function tagClose(code2) {
    if (code2 === 45 || asciiAlphanumeric(code2)) {
      effects.consume(code2);
      return tagClose;
    }
    return tagCloseBetween(code2);
  }
  function tagCloseBetween(code2) {
    if (markdownLineEnding(code2)) {
      returnState = tagCloseBetween;
      return lineEndingBefore(code2);
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return tagCloseBetween;
    }
    return end(code2);
  }
  function tagOpen(code2) {
    if (code2 === 45 || asciiAlphanumeric(code2)) {
      effects.consume(code2);
      return tagOpen;
    }
    if (code2 === 47 || code2 === 62 || markdownLineEndingOrSpace(code2)) {
      return tagOpenBetween(code2);
    }
    return nok(code2);
  }
  function tagOpenBetween(code2) {
    if (code2 === 47) {
      effects.consume(code2);
      return end;
    }
    if (code2 === 58 || code2 === 95 || asciiAlpha(code2)) {
      effects.consume(code2);
      return tagOpenAttributeName;
    }
    if (markdownLineEnding(code2)) {
      returnState = tagOpenBetween;
      return lineEndingBefore(code2);
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return tagOpenBetween;
    }
    return end(code2);
  }
  function tagOpenAttributeName(code2) {
    if (code2 === 45 || code2 === 46 || code2 === 58 || code2 === 95 || asciiAlphanumeric(code2)) {
      effects.consume(code2);
      return tagOpenAttributeName;
    }
    return tagOpenAttributeNameAfter(code2);
  }
  function tagOpenAttributeNameAfter(code2) {
    if (code2 === 61) {
      effects.consume(code2);
      return tagOpenAttributeValueBefore;
    }
    if (markdownLineEnding(code2)) {
      returnState = tagOpenAttributeNameAfter;
      return lineEndingBefore(code2);
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return tagOpenAttributeNameAfter;
    }
    return tagOpenBetween(code2);
  }
  function tagOpenAttributeValueBefore(code2) {
    if (code2 === null || code2 === 60 || code2 === 61 || code2 === 62 || code2 === 96) {
      return nok(code2);
    }
    if (code2 === 34 || code2 === 39) {
      effects.consume(code2);
      marker = code2;
      return tagOpenAttributeValueQuoted;
    }
    if (markdownLineEnding(code2)) {
      returnState = tagOpenAttributeValueBefore;
      return lineEndingBefore(code2);
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return tagOpenAttributeValueBefore;
    }
    effects.consume(code2);
    return tagOpenAttributeValueUnquoted;
  }
  function tagOpenAttributeValueQuoted(code2) {
    if (code2 === marker) {
      effects.consume(code2);
      marker = void 0;
      return tagOpenAttributeValueQuotedAfter;
    }
    if (code2 === null) {
      return nok(code2);
    }
    if (markdownLineEnding(code2)) {
      returnState = tagOpenAttributeValueQuoted;
      return lineEndingBefore(code2);
    }
    effects.consume(code2);
    return tagOpenAttributeValueQuoted;
  }
  function tagOpenAttributeValueUnquoted(code2) {
    if (code2 === null || code2 === 34 || code2 === 39 || code2 === 60 || code2 === 61 || code2 === 96) {
      return nok(code2);
    }
    if (code2 === 47 || code2 === 62 || markdownLineEndingOrSpace(code2)) {
      return tagOpenBetween(code2);
    }
    effects.consume(code2);
    return tagOpenAttributeValueUnquoted;
  }
  function tagOpenAttributeValueQuotedAfter(code2) {
    if (code2 === 47 || code2 === 62 || markdownLineEndingOrSpace(code2)) {
      return tagOpenBetween(code2);
    }
    return nok(code2);
  }
  function end(code2) {
    if (code2 === 62) {
      effects.consume(code2);
      effects.exit("htmlTextData");
      effects.exit("htmlText");
      return ok3;
    }
    return nok(code2);
  }
  function lineEndingBefore(code2) {
    effects.exit("htmlTextData");
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return lineEndingAfter;
  }
  function lineEndingAfter(code2) {
    return markdownSpace(code2) ? factorySpace(effects, lineEndingAfterPrefix, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2) : lineEndingAfterPrefix(code2);
  }
  function lineEndingAfterPrefix(code2) {
    effects.enter("htmlTextData");
    return returnState(code2);
  }
}
var htmlText;
var init_html_text = __esm({
  "node_modules/micromark-core-commonmark/lib/html-text.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    htmlText = {
      name: "htmlText",
      tokenize: tokenizeHtmlText
    };
  }
});

// node_modules/micromark-core-commonmark/lib/label-end.js
function resolveAllLabelEnd(events) {
  let index2 = -1;
  const newEvents = [];
  while (++index2 < events.length) {
    const token = events[index2][1];
    newEvents.push(events[index2]);
    if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
      const offset = token.type === "labelImage" ? 4 : 2;
      token.type = "data";
      index2 += offset;
    }
  }
  if (events.length !== newEvents.length) {
    splice(events, 0, events.length, newEvents);
  }
  return events;
}
function resolveToLabelEnd(events, context) {
  let index2 = events.length;
  let offset = 0;
  let token;
  let open2;
  let close;
  let media;
  while (index2--) {
    token = events[index2][1];
    if (open2) {
      if (token.type === "link" || token.type === "labelLink" && token._inactive) {
        break;
      }
      if (events[index2][0] === "enter" && token.type === "labelLink") {
        token._inactive = true;
      }
    } else if (close) {
      if (events[index2][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
        open2 = index2;
        if (token.type !== "labelLink") {
          offset = 2;
          break;
        }
      }
    } else if (token.type === "labelEnd") {
      close = index2;
    }
  }
  const group = {
    type: events[open2][1].type === "labelLink" ? "link" : "image",
    start: {
      ...events[open2][1].start
    },
    end: {
      ...events[events.length - 1][1].end
    }
  };
  const label = {
    type: "label",
    start: {
      ...events[open2][1].start
    },
    end: {
      ...events[close][1].end
    }
  };
  const text4 = {
    type: "labelText",
    start: {
      ...events[open2 + offset + 2][1].end
    },
    end: {
      ...events[close - 2][1].start
    }
  };
  media = [["enter", group, context], ["enter", label, context]];
  media = push(media, events.slice(open2 + 1, open2 + offset + 3));
  media = push(media, [["enter", text4, context]]);
  media = push(media, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open2 + offset + 4, close - 3), context));
  media = push(media, [["exit", text4, context], events[close - 2], events[close - 1], ["exit", label, context]]);
  media = push(media, events.slice(close + 1));
  media = push(media, [["exit", group, context]]);
  splice(events, open2, events.length, media);
  return events;
}
function tokenizeLabelEnd(effects, ok3, nok) {
  const self = this;
  let index2 = self.events.length;
  let labelStart;
  let defined;
  while (index2--) {
    if ((self.events[index2][1].type === "labelImage" || self.events[index2][1].type === "labelLink") && !self.events[index2][1]._balanced) {
      labelStart = self.events[index2][1];
      break;
    }
  }
  return start;
  function start(code2) {
    if (!labelStart) {
      return nok(code2);
    }
    if (labelStart._inactive) {
      return labelEndNok(code2);
    }
    defined = self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize({
      start: labelStart.end,
      end: self.now()
    })));
    effects.enter("labelEnd");
    effects.enter("labelMarker");
    effects.consume(code2);
    effects.exit("labelMarker");
    effects.exit("labelEnd");
    return after;
  }
  function after(code2) {
    if (code2 === 40) {
      return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code2);
    }
    if (code2 === 91) {
      return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code2);
    }
    return defined ? labelEndOk(code2) : labelEndNok(code2);
  }
  function referenceNotFull(code2) {
    return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code2);
  }
  function labelEndOk(code2) {
    return ok3(code2);
  }
  function labelEndNok(code2) {
    labelStart._balanced = true;
    return nok(code2);
  }
}
function tokenizeResource(effects, ok3, nok) {
  return resourceStart;
  function resourceStart(code2) {
    effects.enter("resource");
    effects.enter("resourceMarker");
    effects.consume(code2);
    effects.exit("resourceMarker");
    return resourceBefore;
  }
  function resourceBefore(code2) {
    return markdownLineEndingOrSpace(code2) ? factoryWhitespace(effects, resourceOpen)(code2) : resourceOpen(code2);
  }
  function resourceOpen(code2) {
    if (code2 === 41) {
      return resourceEnd(code2);
    }
    return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code2);
  }
  function resourceDestinationAfter(code2) {
    return markdownLineEndingOrSpace(code2) ? factoryWhitespace(effects, resourceBetween)(code2) : resourceEnd(code2);
  }
  function resourceDestinationMissing(code2) {
    return nok(code2);
  }
  function resourceBetween(code2) {
    if (code2 === 34 || code2 === 39 || code2 === 40) {
      return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code2);
    }
    return resourceEnd(code2);
  }
  function resourceTitleAfter(code2) {
    return markdownLineEndingOrSpace(code2) ? factoryWhitespace(effects, resourceEnd)(code2) : resourceEnd(code2);
  }
  function resourceEnd(code2) {
    if (code2 === 41) {
      effects.enter("resourceMarker");
      effects.consume(code2);
      effects.exit("resourceMarker");
      effects.exit("resource");
      return ok3;
    }
    return nok(code2);
  }
}
function tokenizeReferenceFull(effects, ok3, nok) {
  const self = this;
  return referenceFull;
  function referenceFull(code2) {
    return factoryLabel.call(self, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code2);
  }
  function referenceFullAfter(code2) {
    return self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1))) ? ok3(code2) : nok(code2);
  }
  function referenceFullMissing(code2) {
    return nok(code2);
  }
}
function tokenizeReferenceCollapsed(effects, ok3, nok) {
  return referenceCollapsedStart;
  function referenceCollapsedStart(code2) {
    effects.enter("reference");
    effects.enter("referenceMarker");
    effects.consume(code2);
    effects.exit("referenceMarker");
    return referenceCollapsedOpen;
  }
  function referenceCollapsedOpen(code2) {
    if (code2 === 93) {
      effects.enter("referenceMarker");
      effects.consume(code2);
      effects.exit("referenceMarker");
      effects.exit("reference");
      return ok3;
    }
    return nok(code2);
  }
}
var labelEnd, resourceConstruct, referenceFullConstruct, referenceCollapsedConstruct;
var init_label_end = __esm({
  "node_modules/micromark-core-commonmark/lib/label-end.js"() {
    init_micromark_factory_destination();
    init_micromark_factory_label();
    init_micromark_factory_title();
    init_micromark_factory_whitespace();
    init_micromark_util_character();
    init_micromark_util_chunked();
    init_micromark_util_normalize_identifier();
    init_micromark_util_resolve_all();
    labelEnd = {
      name: "labelEnd",
      resolveAll: resolveAllLabelEnd,
      resolveTo: resolveToLabelEnd,
      tokenize: tokenizeLabelEnd
    };
    resourceConstruct = {
      tokenize: tokenizeResource
    };
    referenceFullConstruct = {
      tokenize: tokenizeReferenceFull
    };
    referenceCollapsedConstruct = {
      tokenize: tokenizeReferenceCollapsed
    };
  }
});

// node_modules/micromark-core-commonmark/lib/label-start-image.js
function tokenizeLabelStartImage(effects, ok3, nok) {
  const self = this;
  return start;
  function start(code2) {
    effects.enter("labelImage");
    effects.enter("labelImageMarker");
    effects.consume(code2);
    effects.exit("labelImageMarker");
    return open2;
  }
  function open2(code2) {
    if (code2 === 91) {
      effects.enter("labelMarker");
      effects.consume(code2);
      effects.exit("labelMarker");
      effects.exit("labelImage");
      return after;
    }
    return nok(code2);
  }
  function after(code2) {
    return code2 === 94 && "_hiddenFootnoteSupport" in self.parser.constructs ? nok(code2) : ok3(code2);
  }
}
var labelStartImage;
var init_label_start_image = __esm({
  "node_modules/micromark-core-commonmark/lib/label-start-image.js"() {
    init_label_end();
    labelStartImage = {
      name: "labelStartImage",
      resolveAll: labelEnd.resolveAll,
      tokenize: tokenizeLabelStartImage
    };
  }
});

// node_modules/micromark-core-commonmark/lib/label-start-link.js
function tokenizeLabelStartLink(effects, ok3, nok) {
  const self = this;
  return start;
  function start(code2) {
    effects.enter("labelLink");
    effects.enter("labelMarker");
    effects.consume(code2);
    effects.exit("labelMarker");
    effects.exit("labelLink");
    return after;
  }
  function after(code2) {
    return code2 === 94 && "_hiddenFootnoteSupport" in self.parser.constructs ? nok(code2) : ok3(code2);
  }
}
var labelStartLink;
var init_label_start_link = __esm({
  "node_modules/micromark-core-commonmark/lib/label-start-link.js"() {
    init_label_end();
    labelStartLink = {
      name: "labelStartLink",
      resolveAll: labelEnd.resolveAll,
      tokenize: tokenizeLabelStartLink
    };
  }
});

// node_modules/micromark-core-commonmark/lib/line-ending.js
function tokenizeLineEnding(effects, ok3) {
  return start;
  function start(code2) {
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return factorySpace(effects, ok3, "linePrefix");
  }
}
var lineEnding;
var init_line_ending = __esm({
  "node_modules/micromark-core-commonmark/lib/line-ending.js"() {
    init_micromark_factory_space();
    lineEnding = {
      name: "lineEnding",
      tokenize: tokenizeLineEnding
    };
  }
});

// node_modules/micromark-core-commonmark/lib/thematic-break.js
function tokenizeThematicBreak(effects, ok3, nok) {
  let size = 0;
  let marker;
  return start;
  function start(code2) {
    effects.enter("thematicBreak");
    return before(code2);
  }
  function before(code2) {
    marker = code2;
    return atBreak(code2);
  }
  function atBreak(code2) {
    if (code2 === marker) {
      effects.enter("thematicBreakSequence");
      return sequence(code2);
    }
    if (size >= 3 && (code2 === null || markdownLineEnding(code2))) {
      effects.exit("thematicBreak");
      return ok3(code2);
    }
    return nok(code2);
  }
  function sequence(code2) {
    if (code2 === marker) {
      effects.consume(code2);
      size++;
      return sequence;
    }
    effects.exit("thematicBreakSequence");
    return markdownSpace(code2) ? factorySpace(effects, atBreak, "whitespace")(code2) : atBreak(code2);
  }
}
var thematicBreak;
var init_thematic_break = __esm({
  "node_modules/micromark-core-commonmark/lib/thematic-break.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    thematicBreak = {
      name: "thematicBreak",
      tokenize: tokenizeThematicBreak
    };
  }
});

// node_modules/micromark-core-commonmark/lib/list.js
function tokenizeListStart(effects, ok3, nok) {
  const self = this;
  const tail = self.events[self.events.length - 1];
  let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
  let size = 0;
  return start;
  function start(code2) {
    const kind = self.containerState.type || (code2 === 42 || code2 === 43 || code2 === 45 ? "listUnordered" : "listOrdered");
    if (kind === "listUnordered" ? !self.containerState.marker || code2 === self.containerState.marker : asciiDigit(code2)) {
      if (!self.containerState.type) {
        self.containerState.type = kind;
        effects.enter(kind, {
          _container: true
        });
      }
      if (kind === "listUnordered") {
        effects.enter("listItemPrefix");
        return code2 === 42 || code2 === 45 ? effects.check(thematicBreak, nok, atMarker)(code2) : atMarker(code2);
      }
      if (!self.interrupt || code2 === 49) {
        effects.enter("listItemPrefix");
        effects.enter("listItemValue");
        return inside(code2);
      }
    }
    return nok(code2);
  }
  function inside(code2) {
    if (asciiDigit(code2) && ++size < 10) {
      effects.consume(code2);
      return inside;
    }
    if ((!self.interrupt || size < 2) && (self.containerState.marker ? code2 === self.containerState.marker : code2 === 41 || code2 === 46)) {
      effects.exit("listItemValue");
      return atMarker(code2);
    }
    return nok(code2);
  }
  function atMarker(code2) {
    effects.enter("listItemMarker");
    effects.consume(code2);
    effects.exit("listItemMarker");
    self.containerState.marker = self.containerState.marker || code2;
    return effects.check(
      blankLine,
      // Can’t be empty when interrupting.
      self.interrupt ? nok : onBlank,
      effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix)
    );
  }
  function onBlank(code2) {
    self.containerState.initialBlankLine = true;
    initialSize++;
    return endOfPrefix(code2);
  }
  function otherPrefix(code2) {
    if (markdownSpace(code2)) {
      effects.enter("listItemPrefixWhitespace");
      effects.consume(code2);
      effects.exit("listItemPrefixWhitespace");
      return endOfPrefix;
    }
    return nok(code2);
  }
  function endOfPrefix(code2) {
    self.containerState.size = initialSize + self.sliceSerialize(effects.exit("listItemPrefix"), true).length;
    return ok3(code2);
  }
}
function tokenizeListContinuation(effects, ok3, nok) {
  const self = this;
  self.containerState._closeFlow = void 0;
  return effects.check(blankLine, onBlank, notBlank);
  function onBlank(code2) {
    self.containerState.furtherBlankLines = self.containerState.furtherBlankLines || self.containerState.initialBlankLine;
    return factorySpace(effects, ok3, "listItemIndent", self.containerState.size + 1)(code2);
  }
  function notBlank(code2) {
    if (self.containerState.furtherBlankLines || !markdownSpace(code2)) {
      self.containerState.furtherBlankLines = void 0;
      self.containerState.initialBlankLine = void 0;
      return notInCurrentItem(code2);
    }
    self.containerState.furtherBlankLines = void 0;
    self.containerState.initialBlankLine = void 0;
    return effects.attempt(indentConstruct, ok3, notInCurrentItem)(code2);
  }
  function notInCurrentItem(code2) {
    self.containerState._closeFlow = true;
    self.interrupt = void 0;
    return factorySpace(effects, effects.attempt(list, ok3, nok), "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2);
  }
}
function tokenizeIndent(effects, ok3, nok) {
  const self = this;
  return factorySpace(effects, afterPrefix, "listItemIndent", self.containerState.size + 1);
  function afterPrefix(code2) {
    const tail = self.events[self.events.length - 1];
    return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self.containerState.size ? ok3(code2) : nok(code2);
  }
}
function tokenizeListEnd(effects) {
  effects.exit(this.containerState.type);
}
function tokenizeListItemPrefixWhitespace(effects, ok3, nok) {
  const self = this;
  return factorySpace(effects, afterPrefix, "listItemPrefixWhitespace", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4 + 1);
  function afterPrefix(code2) {
    const tail = self.events[self.events.length - 1];
    return !markdownSpace(code2) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok3(code2) : nok(code2);
  }
}
var list, listItemPrefixWhitespaceConstruct, indentConstruct;
var init_list = __esm({
  "node_modules/micromark-core-commonmark/lib/list.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    init_blank_line();
    init_thematic_break();
    list = {
      continuation: {
        tokenize: tokenizeListContinuation
      },
      exit: tokenizeListEnd,
      name: "list",
      tokenize: tokenizeListStart
    };
    listItemPrefixWhitespaceConstruct = {
      partial: true,
      tokenize: tokenizeListItemPrefixWhitespace
    };
    indentConstruct = {
      partial: true,
      tokenize: tokenizeIndent
    };
  }
});

// node_modules/micromark-core-commonmark/lib/setext-underline.js
function resolveToSetextUnderline(events, context) {
  let index2 = events.length;
  let content3;
  let text4;
  let definition2;
  while (index2--) {
    if (events[index2][0] === "enter") {
      if (events[index2][1].type === "content") {
        content3 = index2;
        break;
      }
      if (events[index2][1].type === "paragraph") {
        text4 = index2;
      }
    } else {
      if (events[index2][1].type === "content") {
        events.splice(index2, 1);
      }
      if (!definition2 && events[index2][1].type === "definition") {
        definition2 = index2;
      }
    }
  }
  const heading = {
    type: "setextHeading",
    start: {
      ...events[content3][1].start
    },
    end: {
      ...events[events.length - 1][1].end
    }
  };
  events[text4][1].type = "setextHeadingText";
  if (definition2) {
    events.splice(text4, 0, ["enter", heading, context]);
    events.splice(definition2 + 1, 0, ["exit", events[content3][1], context]);
    events[content3][1].end = {
      ...events[definition2][1].end
    };
  } else {
    events[content3][1] = heading;
  }
  events.push(["exit", heading, context]);
  return events;
}
function tokenizeSetextUnderline(effects, ok3, nok) {
  const self = this;
  let marker;
  return start;
  function start(code2) {
    let index2 = self.events.length;
    let paragraph;
    while (index2--) {
      if (self.events[index2][1].type !== "lineEnding" && self.events[index2][1].type !== "linePrefix" && self.events[index2][1].type !== "content") {
        paragraph = self.events[index2][1].type === "paragraph";
        break;
      }
    }
    if (!self.parser.lazy[self.now().line] && (self.interrupt || paragraph)) {
      effects.enter("setextHeadingLine");
      marker = code2;
      return before(code2);
    }
    return nok(code2);
  }
  function before(code2) {
    effects.enter("setextHeadingLineSequence");
    return inside(code2);
  }
  function inside(code2) {
    if (code2 === marker) {
      effects.consume(code2);
      return inside;
    }
    effects.exit("setextHeadingLineSequence");
    return markdownSpace(code2) ? factorySpace(effects, after, "lineSuffix")(code2) : after(code2);
  }
  function after(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("setextHeadingLine");
      return ok3(code2);
    }
    return nok(code2);
  }
}
var setextUnderline;
var init_setext_underline = __esm({
  "node_modules/micromark-core-commonmark/lib/setext-underline.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    setextUnderline = {
      name: "setextUnderline",
      resolveTo: resolveToSetextUnderline,
      tokenize: tokenizeSetextUnderline
    };
  }
});

// node_modules/micromark-core-commonmark/index.js
var init_micromark_core_commonmark = __esm({
  "node_modules/micromark-core-commonmark/index.js"() {
    init_attention();
    init_autolink();
    init_blank_line();
    init_block_quote();
    init_character_escape();
    init_character_reference();
    init_code_fenced();
    init_code_indented();
    init_code_text();
    init_content2();
    init_definition();
    init_hard_break_escape();
    init_heading_atx();
    init_html_flow();
    init_html_text();
    init_label_end();
    init_label_start_image();
    init_label_start_link();
    init_line_ending();
    init_list();
    init_setext_underline();
    init_thematic_break();
  }
});

// node_modules/micromark/lib/initialize/flow.js
function initializeFlow(effects) {
  const self = this;
  const initial = effects.attempt(
    // Try to parse a blank line.
    blankLine,
    atBlankEnding,
    // Try to parse initial flow (essentially, only code).
    effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content2, afterConstruct)), "linePrefix"))
  );
  return initial;
  function atBlankEnding(code2) {
    if (code2 === null) {
      effects.consume(code2);
      return;
    }
    effects.enter("lineEndingBlank");
    effects.consume(code2);
    effects.exit("lineEndingBlank");
    self.currentConstruct = void 0;
    return initial;
  }
  function afterConstruct(code2) {
    if (code2 === null) {
      effects.consume(code2);
      return;
    }
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    self.currentConstruct = void 0;
    return initial;
  }
}
var flow;
var init_flow = __esm({
  "node_modules/micromark/lib/initialize/flow.js"() {
    init_micromark_core_commonmark();
    init_micromark_factory_space();
    flow = {
      tokenize: initializeFlow
    };
  }
});

// node_modules/micromark/lib/initialize/text.js
function initializeFactory(field) {
  return {
    resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
    tokenize: initializeText
  };
  function initializeText(effects) {
    const self = this;
    const constructs2 = this.parser.constructs[field];
    const text4 = effects.attempt(constructs2, start, notText);
    return start;
    function start(code2) {
      return atBreak(code2) ? text4(code2) : notText(code2);
    }
    function notText(code2) {
      if (code2 === null) {
        effects.consume(code2);
        return;
      }
      effects.enter("data");
      effects.consume(code2);
      return data;
    }
    function data(code2) {
      if (atBreak(code2)) {
        effects.exit("data");
        return text4(code2);
      }
      effects.consume(code2);
      return data;
    }
    function atBreak(code2) {
      if (code2 === null) {
        return true;
      }
      const list2 = constructs2[code2];
      let index2 = -1;
      if (list2) {
        while (++index2 < list2.length) {
          const item = list2[index2];
          if (!item.previous || item.previous.call(self, self.previous)) {
            return true;
          }
        }
      }
      return false;
    }
  }
}
function createResolver(extraResolver) {
  return resolveAllText;
  function resolveAllText(events, context) {
    let index2 = -1;
    let enter;
    while (++index2 <= events.length) {
      if (enter === void 0) {
        if (events[index2] && events[index2][1].type === "data") {
          enter = index2;
          index2++;
        }
      } else if (!events[index2] || events[index2][1].type !== "data") {
        if (index2 !== enter + 2) {
          events[enter][1].end = events[index2 - 1][1].end;
          events.splice(enter + 2, index2 - enter - 2);
          index2 = enter + 2;
        }
        enter = void 0;
      }
    }
    return extraResolver ? extraResolver(events, context) : events;
  }
}
function resolveAllLineSuffixes(events, context) {
  let eventIndex = 0;
  while (++eventIndex <= events.length) {
    if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
      const data = events[eventIndex - 1][1];
      const chunks = context.sliceStream(data);
      let index2 = chunks.length;
      let bufferIndex = -1;
      let size = 0;
      let tabs;
      while (index2--) {
        const chunk = chunks[index2];
        if (typeof chunk === "string") {
          bufferIndex = chunk.length;
          while (chunk.charCodeAt(bufferIndex - 1) === 32) {
            size++;
            bufferIndex--;
          }
          if (bufferIndex) break;
          bufferIndex = -1;
        } else if (chunk === -2) {
          tabs = true;
          size++;
        } else if (chunk === -1) {
        } else {
          index2++;
          break;
        }
      }
      if (context._contentTypeTextTrailing && eventIndex === events.length) {
        size = 0;
      }
      if (size) {
        const token = {
          type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
          start: {
            _bufferIndex: index2 ? bufferIndex : data.start._bufferIndex + bufferIndex,
            _index: data.start._index + index2,
            line: data.end.line,
            column: data.end.column - size,
            offset: data.end.offset - size
          },
          end: {
            ...data.end
          }
        };
        data.end = {
          ...token.start
        };
        if (data.start.offset === data.end.offset) {
          Object.assign(data, token);
        } else {
          events.splice(eventIndex, 0, ["enter", token, context], ["exit", token, context]);
          eventIndex += 2;
        }
      }
      eventIndex++;
    }
  }
  return events;
}
var resolver, string, text;
var init_text = __esm({
  "node_modules/micromark/lib/initialize/text.js"() {
    resolver = {
      resolveAll: createResolver()
    };
    string = initializeFactory("string");
    text = initializeFactory("text");
  }
});

// node_modules/micromark/lib/constructs.js
var constructs_exports = {};
__export(constructs_exports, {
  attentionMarkers: () => attentionMarkers,
  contentInitial: () => contentInitial,
  disable: () => disable,
  document: () => document2,
  flow: () => flow2,
  flowInitial: () => flowInitial,
  insideSpan: () => insideSpan,
  string: () => string2,
  text: () => text2
});
var document2, contentInitial, flowInitial, flow2, string2, text2, insideSpan, attentionMarkers, disable;
var init_constructs = __esm({
  "node_modules/micromark/lib/constructs.js"() {
    init_micromark_core_commonmark();
    init_text();
    document2 = {
      [42]: list,
      [43]: list,
      [45]: list,
      [48]: list,
      [49]: list,
      [50]: list,
      [51]: list,
      [52]: list,
      [53]: list,
      [54]: list,
      [55]: list,
      [56]: list,
      [57]: list,
      [62]: blockQuote
    };
    contentInitial = {
      [91]: definition
    };
    flowInitial = {
      [-2]: codeIndented,
      [-1]: codeIndented,
      [32]: codeIndented
    };
    flow2 = {
      [35]: headingAtx,
      [42]: thematicBreak,
      [45]: [setextUnderline, thematicBreak],
      [60]: htmlFlow,
      [61]: setextUnderline,
      [95]: thematicBreak,
      [96]: codeFenced,
      [126]: codeFenced
    };
    string2 = {
      [38]: characterReference,
      [92]: characterEscape
    };
    text2 = {
      [-5]: lineEnding,
      [-4]: lineEnding,
      [-3]: lineEnding,
      [33]: labelStartImage,
      [38]: characterReference,
      [42]: attention,
      [60]: [autolink, htmlText],
      [91]: labelStartLink,
      [92]: [hardBreakEscape, characterEscape],
      [93]: labelEnd,
      [95]: attention,
      [96]: codeText
    };
    insideSpan = {
      null: [attention, resolver]
    };
    attentionMarkers = {
      null: [42, 95]
    };
    disable = {
      null: []
    };
  }
});

// node_modules/micromark/lib/create-tokenizer.js
function createTokenizer(parser, initialize, from) {
  let point4 = {
    _bufferIndex: -1,
    _index: 0,
    line: from && from.line || 1,
    column: from && from.column || 1,
    offset: from && from.offset || 0
  };
  const columnStart = {};
  const resolveAllConstructs = [];
  let chunks = [];
  let stack = [];
  let consumed = true;
  const effects = {
    attempt: constructFactory(onsuccessfulconstruct),
    check: constructFactory(onsuccessfulcheck),
    consume,
    enter,
    exit: exit3,
    interrupt: constructFactory(onsuccessfulcheck, {
      interrupt: true
    })
  };
  const context = {
    code: null,
    containerState: {},
    defineSkip,
    events: [],
    now,
    parser,
    previous: null,
    sliceSerialize,
    sliceStream,
    write
  };
  let state = initialize.tokenize.call(context, effects);
  let expectedCode;
  if (initialize.resolveAll) {
    resolveAllConstructs.push(initialize);
  }
  return context;
  function write(slice) {
    chunks = push(chunks, slice);
    main();
    if (chunks[chunks.length - 1] !== null) {
      return [];
    }
    addResult(initialize, 0);
    context.events = resolveAll(resolveAllConstructs, context.events, context);
    return context.events;
  }
  function sliceSerialize(token, expandTabs) {
    return serializeChunks(sliceStream(token), expandTabs);
  }
  function sliceStream(token) {
    return sliceChunks(chunks, token);
  }
  function now() {
    const {
      _bufferIndex,
      _index,
      line,
      column,
      offset
    } = point4;
    return {
      _bufferIndex,
      _index,
      line,
      column,
      offset
    };
  }
  function defineSkip(value) {
    columnStart[value.line] = value.column;
    accountForPotentialSkip();
  }
  function main() {
    let chunkIndex;
    while (point4._index < chunks.length) {
      const chunk = chunks[point4._index];
      if (typeof chunk === "string") {
        chunkIndex = point4._index;
        if (point4._bufferIndex < 0) {
          point4._bufferIndex = 0;
        }
        while (point4._index === chunkIndex && point4._bufferIndex < chunk.length) {
          go(chunk.charCodeAt(point4._bufferIndex));
        }
      } else {
        go(chunk);
      }
    }
  }
  function go(code2) {
    consumed = void 0;
    expectedCode = code2;
    state = state(code2);
  }
  function consume(code2) {
    if (markdownLineEnding(code2)) {
      point4.line++;
      point4.column = 1;
      point4.offset += code2 === -3 ? 2 : 1;
      accountForPotentialSkip();
    } else if (code2 !== -1) {
      point4.column++;
      point4.offset++;
    }
    if (point4._bufferIndex < 0) {
      point4._index++;
    } else {
      point4._bufferIndex++;
      if (point4._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
      // strings.
      /** @type {string} */
      chunks[point4._index].length) {
        point4._bufferIndex = -1;
        point4._index++;
      }
    }
    context.previous = code2;
    consumed = true;
  }
  function enter(type2, fields) {
    const token = fields || {};
    token.type = type2;
    token.start = now();
    context.events.push(["enter", token, context]);
    stack.push(token);
    return token;
  }
  function exit3(type2) {
    const token = stack.pop();
    token.end = now();
    context.events.push(["exit", token, context]);
    return token;
  }
  function onsuccessfulconstruct(construct, info) {
    addResult(construct, info.from);
  }
  function onsuccessfulcheck(_, info) {
    info.restore();
  }
  function constructFactory(onreturn, fields) {
    return hook;
    function hook(constructs2, returnState, bogusState) {
      let listOfConstructs;
      let constructIndex;
      let currentConstruct;
      let info;
      return Array.isArray(constructs2) ? (
        /* c8 ignore next 1 */
        handleListOfConstructs(constructs2)
      ) : "tokenize" in constructs2 ? (
        // Looks like a construct.
        handleListOfConstructs([
          /** @type {Construct} */
          constructs2
        ])
      ) : handleMapOfConstructs(constructs2);
      function handleMapOfConstructs(map2) {
        return start;
        function start(code2) {
          const left = code2 !== null && map2[code2];
          const all2 = code2 !== null && map2.null;
          const list2 = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(left) ? left : left ? [left] : [],
            ...Array.isArray(all2) ? all2 : all2 ? [all2] : []
          ];
          return handleListOfConstructs(list2)(code2);
        }
      }
      function handleListOfConstructs(list2) {
        listOfConstructs = list2;
        constructIndex = 0;
        if (list2.length === 0) {
          return bogusState;
        }
        return handleConstruct(list2[constructIndex]);
      }
      function handleConstruct(construct) {
        return start;
        function start(code2) {
          info = store();
          currentConstruct = construct;
          if (!construct.partial) {
            context.currentConstruct = construct;
          }
          if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) {
            return nok(code2);
          }
          return construct.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            fields ? Object.assign(Object.create(context), fields) : context,
            effects,
            ok3,
            nok
          )(code2);
        }
      }
      function ok3(code2) {
        consumed = true;
        onreturn(currentConstruct, info);
        return returnState;
      }
      function nok(code2) {
        consumed = true;
        info.restore();
        if (++constructIndex < listOfConstructs.length) {
          return handleConstruct(listOfConstructs[constructIndex]);
        }
        return bogusState;
      }
    }
  }
  function addResult(construct, from2) {
    if (construct.resolveAll && !resolveAllConstructs.includes(construct)) {
      resolveAllConstructs.push(construct);
    }
    if (construct.resolve) {
      splice(context.events, from2, context.events.length - from2, construct.resolve(context.events.slice(from2), context));
    }
    if (construct.resolveTo) {
      context.events = construct.resolveTo(context.events, context);
    }
  }
  function store() {
    const startPoint = now();
    const startPrevious = context.previous;
    const startCurrentConstruct = context.currentConstruct;
    const startEventsIndex = context.events.length;
    const startStack = Array.from(stack);
    return {
      from: startEventsIndex,
      restore
    };
    function restore() {
      point4 = startPoint;
      context.previous = startPrevious;
      context.currentConstruct = startCurrentConstruct;
      context.events.length = startEventsIndex;
      stack = startStack;
      accountForPotentialSkip();
    }
  }
  function accountForPotentialSkip() {
    if (point4.line in columnStart && point4.column < 2) {
      point4.column = columnStart[point4.line];
      point4.offset += columnStart[point4.line] - 1;
    }
  }
}
function sliceChunks(chunks, token) {
  const startIndex = token.start._index;
  const startBufferIndex = token.start._bufferIndex;
  const endIndex = token.end._index;
  const endBufferIndex = token.end._bufferIndex;
  let view;
  if (startIndex === endIndex) {
    view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
  } else {
    view = chunks.slice(startIndex, endIndex);
    if (startBufferIndex > -1) {
      const head = view[0];
      if (typeof head === "string") {
        view[0] = head.slice(startBufferIndex);
      } else {
        view.shift();
      }
    }
    if (endBufferIndex > 0) {
      view.push(chunks[endIndex].slice(0, endBufferIndex));
    }
  }
  return view;
}
function serializeChunks(chunks, expandTabs) {
  let index2 = -1;
  const result = [];
  let atTab;
  while (++index2 < chunks.length) {
    const chunk = chunks[index2];
    let value;
    if (typeof chunk === "string") {
      value = chunk;
    } else switch (chunk) {
      case -5: {
        value = "\r";
        break;
      }
      case -4: {
        value = "\n";
        break;
      }
      case -3: {
        value = "\r\n";
        break;
      }
      case -2: {
        value = expandTabs ? " " : "	";
        break;
      }
      case -1: {
        if (!expandTabs && atTab) continue;
        value = " ";
        break;
      }
      default: {
        value = String.fromCharCode(chunk);
      }
    }
    atTab = chunk === -2;
    result.push(value);
  }
  return result.join("");
}
var init_create_tokenizer = __esm({
  "node_modules/micromark/lib/create-tokenizer.js"() {
    init_micromark_util_character();
    init_micromark_util_chunked();
    init_micromark_util_resolve_all();
  }
});

// node_modules/micromark/lib/parse.js
function parse(options) {
  const settings = options || {};
  const constructs2 = (
    /** @type {FullNormalizedExtension} */
    combineExtensions([constructs_exports, ...settings.extensions || []])
  );
  const parser = {
    constructs: constructs2,
    content: create(content),
    defined: [],
    document: create(document),
    flow: create(flow),
    lazy: {},
    string: create(string),
    text: create(text)
  };
  return parser;
  function create(initial) {
    return creator;
    function creator(from) {
      return createTokenizer(parser, initial, from);
    }
  }
}
var init_parse = __esm({
  "node_modules/micromark/lib/parse.js"() {
    init_micromark_util_combine_extensions();
    init_content();
    init_document();
    init_flow();
    init_text();
    init_constructs();
    init_create_tokenizer();
  }
});

// node_modules/micromark/lib/postprocess.js
function postprocess(events) {
  while (!subtokenize(events)) {
  }
  return events;
}
var init_postprocess = __esm({
  "node_modules/micromark/lib/postprocess.js"() {
    init_micromark_util_subtokenize();
  }
});

// node_modules/micromark/lib/preprocess.js
function preprocess() {
  let column = 1;
  let buffer = "";
  let start = true;
  let atCarriageReturn;
  return preprocessor;
  function preprocessor(value, encoding, end) {
    const chunks = [];
    let match;
    let next;
    let startPosition;
    let endPosition;
    let code2;
    value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
    startPosition = 0;
    buffer = "";
    if (start) {
      if (value.charCodeAt(0) === 65279) {
        startPosition++;
      }
      start = void 0;
    }
    while (startPosition < value.length) {
      search.lastIndex = startPosition;
      match = search.exec(value);
      endPosition = match && match.index !== void 0 ? match.index : value.length;
      code2 = value.charCodeAt(endPosition);
      if (!match) {
        buffer = value.slice(startPosition);
        break;
      }
      if (code2 === 10 && startPosition === endPosition && atCarriageReturn) {
        chunks.push(-3);
        atCarriageReturn = void 0;
      } else {
        if (atCarriageReturn) {
          chunks.push(-5);
          atCarriageReturn = void 0;
        }
        if (startPosition < endPosition) {
          chunks.push(value.slice(startPosition, endPosition));
          column += endPosition - startPosition;
        }
        switch (code2) {
          case 0: {
            chunks.push(65533);
            column++;
            break;
          }
          case 9: {
            next = Math.ceil(column / 4) * 4;
            chunks.push(-2);
            while (column++ < next) chunks.push(-1);
            break;
          }
          case 10: {
            chunks.push(-4);
            column = 1;
            break;
          }
          default: {
            atCarriageReturn = true;
            column = 1;
          }
        }
      }
      startPosition = endPosition + 1;
    }
    if (end) {
      if (atCarriageReturn) chunks.push(-5);
      if (buffer) chunks.push(buffer);
      chunks.push(null);
    }
    return chunks;
  }
}
var search;
var init_preprocess = __esm({
  "node_modules/micromark/lib/preprocess.js"() {
    search = /[\0\t\n\r]/g;
  }
});

// node_modules/micromark/index.js
var init_micromark = __esm({
  "node_modules/micromark/index.js"() {
    init_parse();
    init_postprocess();
    init_preprocess();
  }
});

// node_modules/micromark-util-decode-string/index.js
function decodeString(value) {
  return value.replace(characterEscapeOrReference, decode);
}
function decode($0, $1, $2) {
  if ($1) {
    return $1;
  }
  const head = $2.charCodeAt(0);
  if (head === 35) {
    const head2 = $2.charCodeAt(1);
    const hex = head2 === 120 || head2 === 88;
    return decodeNumericCharacterReference($2.slice(hex ? 2 : 1), hex ? 16 : 10);
  }
  return decodeNamedCharacterReference($2) || $0;
}
var characterEscapeOrReference;
var init_micromark_util_decode_string = __esm({
  "node_modules/micromark-util-decode-string/index.js"() {
    init_decode_named_character_reference();
    init_micromark_util_decode_numeric_character_reference();
    characterEscapeOrReference = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
  }
});

// node_modules/unist-util-stringify-position/lib/index.js
function stringifyPosition(value) {
  if (!value || typeof value !== "object") {
    return "";
  }
  if ("position" in value || "type" in value) {
    return position(value.position);
  }
  if ("start" in value || "end" in value) {
    return position(value);
  }
  if ("line" in value || "column" in value) {
    return point(value);
  }
  return "";
}
function point(point4) {
  return index(point4 && point4.line) + ":" + index(point4 && point4.column);
}
function position(pos) {
  return point(pos && pos.start) + "-" + point(pos && pos.end);
}
function index(value) {
  return value && typeof value === "number" ? value : 1;
}
var init_lib2 = __esm({
  "node_modules/unist-util-stringify-position/lib/index.js"() {
  }
});

// node_modules/unist-util-stringify-position/index.js
var init_unist_util_stringify_position = __esm({
  "node_modules/unist-util-stringify-position/index.js"() {
    init_lib2();
  }
});

// node_modules/mdast-util-from-markdown/lib/index.js
function fromMarkdown(value, encoding, options) {
  if (typeof encoding !== "string") {
    options = encoding;
    encoding = void 0;
  }
  return compiler(options)(postprocess(parse(options).document().write(preprocess()(value, encoding, true))));
}
function compiler(options) {
  const config = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: opener(link),
      autolinkProtocol: onenterdata,
      autolinkEmail: onenterdata,
      atxHeading: opener(heading),
      blockQuote: opener(blockQuote2),
      characterEscape: onenterdata,
      characterReference: onenterdata,
      codeFenced: opener(codeFlow),
      codeFencedFenceInfo: buffer,
      codeFencedFenceMeta: buffer,
      codeIndented: opener(codeFlow, buffer),
      codeText: opener(codeText2, buffer),
      codeTextData: onenterdata,
      data: onenterdata,
      codeFlowValue: onenterdata,
      definition: opener(definition2),
      definitionDestinationString: buffer,
      definitionLabelString: buffer,
      definitionTitleString: buffer,
      emphasis: opener(emphasis),
      hardBreakEscape: opener(hardBreak),
      hardBreakTrailing: opener(hardBreak),
      htmlFlow: opener(html, buffer),
      htmlFlowData: onenterdata,
      htmlText: opener(html, buffer),
      htmlTextData: onenterdata,
      image: opener(image),
      label: buffer,
      link: opener(link),
      listItem: opener(listItem),
      listItemValue: onenterlistitemvalue,
      listOrdered: opener(list2, onenterlistordered),
      listUnordered: opener(list2),
      paragraph: opener(paragraph),
      reference: onenterreference,
      referenceString: buffer,
      resourceDestinationString: buffer,
      resourceTitleString: buffer,
      setextHeading: opener(heading),
      strong: opener(strong),
      thematicBreak: opener(thematicBreak2)
    },
    exit: {
      atxHeading: closer(),
      atxHeadingSequence: onexitatxheadingsequence,
      autolink: closer(),
      autolinkEmail: onexitautolinkemail,
      autolinkProtocol: onexitautolinkprotocol,
      blockQuote: closer(),
      characterEscapeValue: onexitdata,
      characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
      characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
      characterReferenceValue: onexitcharacterreferencevalue,
      characterReference: onexitcharacterreference,
      codeFenced: closer(onexitcodefenced),
      codeFencedFence: onexitcodefencedfence,
      codeFencedFenceInfo: onexitcodefencedfenceinfo,
      codeFencedFenceMeta: onexitcodefencedfencemeta,
      codeFlowValue: onexitdata,
      codeIndented: closer(onexitcodeindented),
      codeText: closer(onexitcodetext),
      codeTextData: onexitdata,
      data: onexitdata,
      definition: closer(),
      definitionDestinationString: onexitdefinitiondestinationstring,
      definitionLabelString: onexitdefinitionlabelstring,
      definitionTitleString: onexitdefinitiontitlestring,
      emphasis: closer(),
      hardBreakEscape: closer(onexithardbreak),
      hardBreakTrailing: closer(onexithardbreak),
      htmlFlow: closer(onexithtmlflow),
      htmlFlowData: onexitdata,
      htmlText: closer(onexithtmltext),
      htmlTextData: onexitdata,
      image: closer(onexitimage),
      label: onexitlabel,
      labelText: onexitlabeltext,
      lineEnding: onexitlineending,
      link: closer(onexitlink),
      listItem: closer(),
      listOrdered: closer(),
      listUnordered: closer(),
      paragraph: closer(),
      referenceString: onexitreferencestring,
      resourceDestinationString: onexitresourcedestinationstring,
      resourceTitleString: onexitresourcetitlestring,
      resource: onexitresource,
      setextHeading: closer(onexitsetextheading),
      setextHeadingLineSequence: onexitsetextheadinglinesequence,
      setextHeadingText: onexitsetextheadingtext,
      strong: closer(),
      thematicBreak: closer()
    }
  };
  configure(config, (options || {}).mdastExtensions || []);
  const data = {};
  return compile;
  function compile(events) {
    let tree = {
      type: "root",
      children: []
    };
    const context = {
      stack: [tree],
      tokenStack: [],
      config,
      enter,
      exit: exit3,
      buffer,
      resume,
      data
    };
    const listStack = [];
    let index2 = -1;
    while (++index2 < events.length) {
      if (events[index2][1].type === "listOrdered" || events[index2][1].type === "listUnordered") {
        if (events[index2][0] === "enter") {
          listStack.push(index2);
        } else {
          const tail = listStack.pop();
          index2 = prepareList(events, tail, index2);
        }
      }
    }
    index2 = -1;
    while (++index2 < events.length) {
      const handler2 = config[events[index2][0]];
      if (own2.call(handler2, events[index2][1].type)) {
        handler2[events[index2][1].type].call(Object.assign({
          sliceSerialize: events[index2][2].sliceSerialize
        }, context), events[index2][1]);
      }
    }
    if (context.tokenStack.length > 0) {
      const tail = context.tokenStack[context.tokenStack.length - 1];
      const handler2 = tail[1] || defaultOnError;
      handler2.call(context, void 0, tail[0]);
    }
    tree.position = {
      start: point2(events.length > 0 ? events[0][1].start : {
        line: 1,
        column: 1,
        offset: 0
      }),
      end: point2(events.length > 0 ? events[events.length - 2][1].end : {
        line: 1,
        column: 1,
        offset: 0
      })
    };
    index2 = -1;
    while (++index2 < config.transforms.length) {
      tree = config.transforms[index2](tree) || tree;
    }
    return tree;
  }
  function prepareList(events, start, length) {
    let index2 = start - 1;
    let containerBalance = -1;
    let listSpread = false;
    let listItem2;
    let lineIndex;
    let firstBlankLineIndex;
    let atMarker;
    while (++index2 <= length) {
      const event = events[index2];
      switch (event[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          if (event[0] === "enter") {
            containerBalance++;
          } else {
            containerBalance--;
          }
          atMarker = void 0;
          break;
        }
        case "lineEndingBlank": {
          if (event[0] === "enter") {
            if (listItem2 && !atMarker && !containerBalance && !firstBlankLineIndex) {
              firstBlankLineIndex = index2;
            }
            atMarker = void 0;
          }
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace": {
          break;
        }
        default: {
          atMarker = void 0;
        }
      }
      if (!containerBalance && event[0] === "enter" && event[1].type === "listItemPrefix" || containerBalance === -1 && event[0] === "exit" && (event[1].type === "listUnordered" || event[1].type === "listOrdered")) {
        if (listItem2) {
          let tailIndex = index2;
          lineIndex = void 0;
          while (tailIndex--) {
            const tailEvent = events[tailIndex];
            if (tailEvent[1].type === "lineEnding" || tailEvent[1].type === "lineEndingBlank") {
              if (tailEvent[0] === "exit") continue;
              if (lineIndex) {
                events[lineIndex][1].type = "lineEndingBlank";
                listSpread = true;
              }
              tailEvent[1].type = "lineEnding";
              lineIndex = tailIndex;
            } else if (tailEvent[1].type === "linePrefix" || tailEvent[1].type === "blockQuotePrefix" || tailEvent[1].type === "blockQuotePrefixWhitespace" || tailEvent[1].type === "blockQuoteMarker" || tailEvent[1].type === "listItemIndent") {
            } else {
              break;
            }
          }
          if (firstBlankLineIndex && (!lineIndex || firstBlankLineIndex < lineIndex)) {
            listItem2._spread = true;
          }
          listItem2.end = Object.assign({}, lineIndex ? events[lineIndex][1].start : event[1].end);
          events.splice(lineIndex || index2, 0, ["exit", listItem2, event[2]]);
          index2++;
          length++;
        }
        if (event[1].type === "listItemPrefix") {
          const item = {
            type: "listItem",
            _spread: false,
            start: Object.assign({}, event[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: void 0
          };
          listItem2 = item;
          events.splice(index2, 0, ["enter", item, event[2]]);
          index2++;
          length++;
          firstBlankLineIndex = void 0;
          atMarker = true;
        }
      }
    }
    events[start][1]._spread = listSpread;
    return length;
  }
  function opener(create, and) {
    return open2;
    function open2(token) {
      enter.call(this, create(token), token);
      if (and) and.call(this, token);
    }
  }
  function buffer() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function enter(node2, token, errorHandler) {
    const parent = this.stack[this.stack.length - 1];
    const siblings = parent.children;
    siblings.push(node2);
    this.stack.push(node2);
    this.tokenStack.push([token, errorHandler || void 0]);
    node2.position = {
      start: point2(token.start),
      // @ts-expect-error: `end` will be patched later.
      end: void 0
    };
  }
  function closer(and) {
    return close;
    function close(token) {
      if (and) and.call(this, token);
      exit3.call(this, token);
    }
  }
  function exit3(token, onExitError) {
    const node2 = this.stack.pop();
    const open2 = this.tokenStack.pop();
    if (!open2) {
      throw new Error("Cannot close `" + token.type + "` (" + stringifyPosition({
        start: token.start,
        end: token.end
      }) + "): it\u2019s not open");
    } else if (open2[0].type !== token.type) {
      if (onExitError) {
        onExitError.call(this, token, open2[0]);
      } else {
        const handler2 = open2[1] || defaultOnError;
        handler2.call(this, token, open2[0]);
      }
    }
    node2.position.end = point2(token.end);
  }
  function resume() {
    return toString2(this.stack.pop());
  }
  function onenterlistordered() {
    this.data.expectingFirstListItemValue = true;
  }
  function onenterlistitemvalue(token) {
    if (this.data.expectingFirstListItemValue) {
      const ancestor = this.stack[this.stack.length - 2];
      ancestor.start = Number.parseInt(this.sliceSerialize(token), 10);
      this.data.expectingFirstListItemValue = void 0;
    }
  }
  function onexitcodefencedfenceinfo() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.lang = data2;
  }
  function onexitcodefencedfencemeta() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.meta = data2;
  }
  function onexitcodefencedfence() {
    if (this.data.flowCodeInside) return;
    this.buffer();
    this.data.flowCodeInside = true;
  }
  function onexitcodefenced() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.value = data2.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
    this.data.flowCodeInside = void 0;
  }
  function onexitcodeindented() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.value = data2.replace(/(\r?\n|\r)$/g, "");
  }
  function onexitdefinitionlabelstring(token) {
    const label = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.label = label;
    node2.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
  }
  function onexitdefinitiontitlestring() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.title = data2;
  }
  function onexitdefinitiondestinationstring() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.url = data2;
  }
  function onexitatxheadingsequence(token) {
    const node2 = this.stack[this.stack.length - 1];
    if (!node2.depth) {
      const depth = this.sliceSerialize(token).length;
      node2.depth = depth;
    }
  }
  function onexitsetextheadingtext() {
    this.data.setextHeadingSlurpLineEnding = true;
  }
  function onexitsetextheadinglinesequence(token) {
    const node2 = this.stack[this.stack.length - 1];
    node2.depth = this.sliceSerialize(token).codePointAt(0) === 61 ? 1 : 2;
  }
  function onexitsetextheading() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function onenterdata(token) {
    const node2 = this.stack[this.stack.length - 1];
    const siblings = node2.children;
    let tail = siblings[siblings.length - 1];
    if (!tail || tail.type !== "text") {
      tail = text4();
      tail.position = {
        start: point2(token.start),
        // @ts-expect-error: we’ll add `end` later.
        end: void 0
      };
      siblings.push(tail);
    }
    this.stack.push(tail);
  }
  function onexitdata(token) {
    const tail = this.stack.pop();
    tail.value += this.sliceSerialize(token);
    tail.position.end = point2(token.end);
  }
  function onexitlineending(token) {
    const context = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const tail = context.children[context.children.length - 1];
      tail.position.end = point2(token.end);
      this.data.atHardBreak = void 0;
      return;
    }
    if (!this.data.setextHeadingSlurpLineEnding && config.canContainEols.includes(context.type)) {
      onenterdata.call(this, token);
      onexitdata.call(this, token);
    }
  }
  function onexithardbreak() {
    this.data.atHardBreak = true;
  }
  function onexithtmlflow() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.value = data2;
  }
  function onexithtmltext() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.value = data2;
  }
  function onexitcodetext() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.value = data2;
  }
  function onexitlink() {
    const node2 = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const referenceType = this.data.referenceType || "shortcut";
      node2.type += "Reference";
      node2.referenceType = referenceType;
      delete node2.url;
      delete node2.title;
    } else {
      delete node2.identifier;
      delete node2.label;
    }
    this.data.referenceType = void 0;
  }
  function onexitimage() {
    const node2 = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const referenceType = this.data.referenceType || "shortcut";
      node2.type += "Reference";
      node2.referenceType = referenceType;
      delete node2.url;
      delete node2.title;
    } else {
      delete node2.identifier;
      delete node2.label;
    }
    this.data.referenceType = void 0;
  }
  function onexitlabeltext(token) {
    const string3 = this.sliceSerialize(token);
    const ancestor = this.stack[this.stack.length - 2];
    ancestor.label = decodeString(string3);
    ancestor.identifier = normalizeIdentifier(string3).toLowerCase();
  }
  function onexitlabel() {
    const fragment = this.stack[this.stack.length - 1];
    const value = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    this.data.inReference = true;
    if (node2.type === "link") {
      const children = fragment.children;
      node2.children = children;
    } else {
      node2.alt = value;
    }
  }
  function onexitresourcedestinationstring() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.url = data2;
  }
  function onexitresourcetitlestring() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.title = data2;
  }
  function onexitresource() {
    this.data.inReference = void 0;
  }
  function onenterreference() {
    this.data.referenceType = "collapsed";
  }
  function onexitreferencestring(token) {
    const label = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.label = label;
    node2.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
    this.data.referenceType = "full";
  }
  function onexitcharacterreferencemarker(token) {
    this.data.characterReferenceType = token.type;
  }
  function onexitcharacterreferencevalue(token) {
    const data2 = this.sliceSerialize(token);
    const type2 = this.data.characterReferenceType;
    let value;
    if (type2) {
      value = decodeNumericCharacterReference(data2, type2 === "characterReferenceMarkerNumeric" ? 10 : 16);
      this.data.characterReferenceType = void 0;
    } else {
      const result = decodeNamedCharacterReference(data2);
      value = result;
    }
    const tail = this.stack[this.stack.length - 1];
    tail.value += value;
  }
  function onexitcharacterreference(token) {
    const tail = this.stack.pop();
    tail.position.end = point2(token.end);
  }
  function onexitautolinkprotocol(token) {
    onexitdata.call(this, token);
    const node2 = this.stack[this.stack.length - 1];
    node2.url = this.sliceSerialize(token);
  }
  function onexitautolinkemail(token) {
    onexitdata.call(this, token);
    const node2 = this.stack[this.stack.length - 1];
    node2.url = "mailto:" + this.sliceSerialize(token);
  }
  function blockQuote2() {
    return {
      type: "blockquote",
      children: []
    };
  }
  function codeFlow() {
    return {
      type: "code",
      lang: null,
      meta: null,
      value: ""
    };
  }
  function codeText2() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function definition2() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function emphasis() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function heading() {
    return {
      type: "heading",
      // @ts-expect-error `depth` will be set later.
      depth: 0,
      children: []
    };
  }
  function hardBreak() {
    return {
      type: "break"
    };
  }
  function html() {
    return {
      type: "html",
      value: ""
    };
  }
  function image() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function link() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function list2(token) {
    return {
      type: "list",
      ordered: token.type === "listOrdered",
      start: null,
      spread: token._spread,
      children: []
    };
  }
  function listItem(token) {
    return {
      type: "listItem",
      spread: token._spread,
      checked: null,
      children: []
    };
  }
  function paragraph() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function strong() {
    return {
      type: "strong",
      children: []
    };
  }
  function text4() {
    return {
      type: "text",
      value: ""
    };
  }
  function thematicBreak2() {
    return {
      type: "thematicBreak"
    };
  }
}
function point2(d) {
  return {
    line: d.line,
    column: d.column,
    offset: d.offset
  };
}
function configure(combined, extensions) {
  let index2 = -1;
  while (++index2 < extensions.length) {
    const value = extensions[index2];
    if (Array.isArray(value)) {
      configure(combined, value);
    } else {
      extension(combined, value);
    }
  }
}
function extension(combined, extension2) {
  let key;
  for (key in extension2) {
    if (own2.call(extension2, key)) {
      switch (key) {
        case "canContainEols": {
          const right = extension2[key];
          if (right) {
            combined[key].push(...right);
          }
          break;
        }
        case "transforms": {
          const right = extension2[key];
          if (right) {
            combined[key].push(...right);
          }
          break;
        }
        case "enter":
        case "exit": {
          const right = extension2[key];
          if (right) {
            Object.assign(combined[key], right);
          }
          break;
        }
      }
    }
  }
}
function defaultOnError(left, right) {
  if (left) {
    throw new Error("Cannot close `" + left.type + "` (" + stringifyPosition({
      start: left.start,
      end: left.end
    }) + "): a different token (`" + right.type + "`, " + stringifyPosition({
      start: right.start,
      end: right.end
    }) + ") is open");
  } else {
    throw new Error("Cannot close document, a token (`" + right.type + "`, " + stringifyPosition({
      start: right.start,
      end: right.end
    }) + ") is still open");
  }
}
var own2;
var init_lib3 = __esm({
  "node_modules/mdast-util-from-markdown/lib/index.js"() {
    init_mdast_util_to_string();
    init_micromark();
    init_micromark_util_decode_numeric_character_reference();
    init_micromark_util_decode_string();
    init_micromark_util_normalize_identifier();
    init_decode_named_character_reference();
    init_unist_util_stringify_position();
    own2 = {}.hasOwnProperty;
  }
});

// node_modules/mdast-util-from-markdown/index.js
var init_mdast_util_from_markdown = __esm({
  "node_modules/mdast-util-from-markdown/index.js"() {
    init_lib3();
  }
});

// node_modules/micromark-extension-gfm-autolink-literal/lib/syntax.js
function gfmAutolinkLiteral() {
  return {
    text: text3
  };
}
function tokenizeEmailAutolink(effects, ok3, nok) {
  const self = this;
  let dot;
  let data;
  return start;
  function start(code2) {
    if (!gfmAtext(code2) || !previousEmail.call(self, self.previous) || previousUnbalanced(self.events)) {
      return nok(code2);
    }
    effects.enter("literalAutolink");
    effects.enter("literalAutolinkEmail");
    return atext(code2);
  }
  function atext(code2) {
    if (gfmAtext(code2)) {
      effects.consume(code2);
      return atext;
    }
    if (code2 === 64) {
      effects.consume(code2);
      return emailDomain;
    }
    return nok(code2);
  }
  function emailDomain(code2) {
    if (code2 === 46) {
      return effects.check(emailDomainDotTrail, emailDomainAfter, emailDomainDot)(code2);
    }
    if (code2 === 45 || code2 === 95 || asciiAlphanumeric(code2)) {
      data = true;
      effects.consume(code2);
      return emailDomain;
    }
    return emailDomainAfter(code2);
  }
  function emailDomainDot(code2) {
    effects.consume(code2);
    dot = true;
    return emailDomain;
  }
  function emailDomainAfter(code2) {
    if (data && dot && asciiAlpha(self.previous)) {
      effects.exit("literalAutolinkEmail");
      effects.exit("literalAutolink");
      return ok3(code2);
    }
    return nok(code2);
  }
}
function tokenizeWwwAutolink(effects, ok3, nok) {
  const self = this;
  return wwwStart;
  function wwwStart(code2) {
    if (code2 !== 87 && code2 !== 119 || !previousWww.call(self, self.previous) || previousUnbalanced(self.events)) {
      return nok(code2);
    }
    effects.enter("literalAutolink");
    effects.enter("literalAutolinkWww");
    return effects.check(wwwPrefix, effects.attempt(domain, effects.attempt(path, wwwAfter), nok), nok)(code2);
  }
  function wwwAfter(code2) {
    effects.exit("literalAutolinkWww");
    effects.exit("literalAutolink");
    return ok3(code2);
  }
}
function tokenizeProtocolAutolink(effects, ok3, nok) {
  const self = this;
  let buffer = "";
  let seen = false;
  return protocolStart;
  function protocolStart(code2) {
    if ((code2 === 72 || code2 === 104) && previousProtocol.call(self, self.previous) && !previousUnbalanced(self.events)) {
      effects.enter("literalAutolink");
      effects.enter("literalAutolinkHttp");
      buffer += String.fromCodePoint(code2);
      effects.consume(code2);
      return protocolPrefixInside;
    }
    return nok(code2);
  }
  function protocolPrefixInside(code2) {
    if (asciiAlpha(code2) && buffer.length < 5) {
      buffer += String.fromCodePoint(code2);
      effects.consume(code2);
      return protocolPrefixInside;
    }
    if (code2 === 58) {
      const protocol = buffer.toLowerCase();
      if (protocol === "http" || protocol === "https") {
        effects.consume(code2);
        return protocolSlashesInside;
      }
    }
    return nok(code2);
  }
  function protocolSlashesInside(code2) {
    if (code2 === 47) {
      effects.consume(code2);
      if (seen) {
        return afterProtocol;
      }
      seen = true;
      return protocolSlashesInside;
    }
    return nok(code2);
  }
  function afterProtocol(code2) {
    return code2 === null || asciiControl(code2) || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2) || unicodePunctuation(code2) ? nok(code2) : effects.attempt(domain, effects.attempt(path, protocolAfter), nok)(code2);
  }
  function protocolAfter(code2) {
    effects.exit("literalAutolinkHttp");
    effects.exit("literalAutolink");
    return ok3(code2);
  }
}
function tokenizeWwwPrefix(effects, ok3, nok) {
  let size = 0;
  return wwwPrefixInside;
  function wwwPrefixInside(code2) {
    if ((code2 === 87 || code2 === 119) && size < 3) {
      size++;
      effects.consume(code2);
      return wwwPrefixInside;
    }
    if (code2 === 46 && size === 3) {
      effects.consume(code2);
      return wwwPrefixAfter;
    }
    return nok(code2);
  }
  function wwwPrefixAfter(code2) {
    return code2 === null ? nok(code2) : ok3(code2);
  }
}
function tokenizeDomain(effects, ok3, nok) {
  let underscoreInLastSegment;
  let underscoreInLastLastSegment;
  let seen;
  return domainInside;
  function domainInside(code2) {
    if (code2 === 46 || code2 === 95) {
      return effects.check(trail, domainAfter, domainAtPunctuation)(code2);
    }
    if (code2 === null || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2) || code2 !== 45 && unicodePunctuation(code2)) {
      return domainAfter(code2);
    }
    seen = true;
    effects.consume(code2);
    return domainInside;
  }
  function domainAtPunctuation(code2) {
    if (code2 === 95) {
      underscoreInLastSegment = true;
    } else {
      underscoreInLastLastSegment = underscoreInLastSegment;
      underscoreInLastSegment = void 0;
    }
    effects.consume(code2);
    return domainInside;
  }
  function domainAfter(code2) {
    if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) {
      return nok(code2);
    }
    return ok3(code2);
  }
}
function tokenizePath(effects, ok3) {
  let sizeOpen = 0;
  let sizeClose = 0;
  return pathInside;
  function pathInside(code2) {
    if (code2 === 40) {
      sizeOpen++;
      effects.consume(code2);
      return pathInside;
    }
    if (code2 === 41 && sizeClose < sizeOpen) {
      return pathAtPunctuation(code2);
    }
    if (code2 === 33 || code2 === 34 || code2 === 38 || code2 === 39 || code2 === 41 || code2 === 42 || code2 === 44 || code2 === 46 || code2 === 58 || code2 === 59 || code2 === 60 || code2 === 63 || code2 === 93 || code2 === 95 || code2 === 126) {
      return effects.check(trail, ok3, pathAtPunctuation)(code2);
    }
    if (code2 === null || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2)) {
      return ok3(code2);
    }
    effects.consume(code2);
    return pathInside;
  }
  function pathAtPunctuation(code2) {
    if (code2 === 41) {
      sizeClose++;
    }
    effects.consume(code2);
    return pathInside;
  }
}
function tokenizeTrail(effects, ok3, nok) {
  return trail2;
  function trail2(code2) {
    if (code2 === 33 || code2 === 34 || code2 === 39 || code2 === 41 || code2 === 42 || code2 === 44 || code2 === 46 || code2 === 58 || code2 === 59 || code2 === 63 || code2 === 95 || code2 === 126) {
      effects.consume(code2);
      return trail2;
    }
    if (code2 === 38) {
      effects.consume(code2);
      return trailCharacterReferenceStart;
    }
    if (code2 === 93) {
      effects.consume(code2);
      return trailBracketAfter;
    }
    if (
      // `<` is an end.
      code2 === 60 || // So is whitespace.
      code2 === null || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2)
    ) {
      return ok3(code2);
    }
    return nok(code2);
  }
  function trailBracketAfter(code2) {
    if (code2 === null || code2 === 40 || code2 === 91 || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2)) {
      return ok3(code2);
    }
    return trail2(code2);
  }
  function trailCharacterReferenceStart(code2) {
    return asciiAlpha(code2) ? trailCharacterReferenceInside(code2) : nok(code2);
  }
  function trailCharacterReferenceInside(code2) {
    if (code2 === 59) {
      effects.consume(code2);
      return trail2;
    }
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      return trailCharacterReferenceInside;
    }
    return nok(code2);
  }
}
function tokenizeEmailDomainDotTrail(effects, ok3, nok) {
  return start;
  function start(code2) {
    effects.consume(code2);
    return after;
  }
  function after(code2) {
    return asciiAlphanumeric(code2) ? nok(code2) : ok3(code2);
  }
}
function previousWww(code2) {
  return code2 === null || code2 === 40 || code2 === 42 || code2 === 95 || code2 === 91 || code2 === 93 || code2 === 126 || markdownLineEndingOrSpace(code2);
}
function previousProtocol(code2) {
  return !asciiAlpha(code2);
}
function previousEmail(code2) {
  return !(code2 === 47 || gfmAtext(code2));
}
function gfmAtext(code2) {
  return code2 === 43 || code2 === 45 || code2 === 46 || code2 === 95 || asciiAlphanumeric(code2);
}
function previousUnbalanced(events) {
  let index2 = events.length;
  let result = false;
  while (index2--) {
    const token = events[index2][1];
    if ((token.type === "labelLink" || token.type === "labelImage") && !token._balanced) {
      result = true;
      break;
    }
    if (token._gfmAutolinkLiteralWalkedInto) {
      result = false;
      break;
    }
  }
  if (events.length > 0 && !result) {
    events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true;
  }
  return result;
}
var wwwPrefix, domain, path, trail, emailDomainDotTrail, wwwAutolink, protocolAutolink, emailAutolink, text3, code;
var init_syntax = __esm({
  "node_modules/micromark-extension-gfm-autolink-literal/lib/syntax.js"() {
    init_micromark_util_character();
    wwwPrefix = {
      tokenize: tokenizeWwwPrefix,
      partial: true
    };
    domain = {
      tokenize: tokenizeDomain,
      partial: true
    };
    path = {
      tokenize: tokenizePath,
      partial: true
    };
    trail = {
      tokenize: tokenizeTrail,
      partial: true
    };
    emailDomainDotTrail = {
      tokenize: tokenizeEmailDomainDotTrail,
      partial: true
    };
    wwwAutolink = {
      name: "wwwAutolink",
      tokenize: tokenizeWwwAutolink,
      previous: previousWww
    };
    protocolAutolink = {
      name: "protocolAutolink",
      tokenize: tokenizeProtocolAutolink,
      previous: previousProtocol
    };
    emailAutolink = {
      name: "emailAutolink",
      tokenize: tokenizeEmailAutolink,
      previous: previousEmail
    };
    text3 = {};
    code = 48;
    while (code < 123) {
      text3[code] = emailAutolink;
      code++;
      if (code === 58) code = 65;
      else if (code === 91) code = 97;
    }
    text3[43] = emailAutolink;
    text3[45] = emailAutolink;
    text3[46] = emailAutolink;
    text3[95] = emailAutolink;
    text3[72] = [emailAutolink, protocolAutolink];
    text3[104] = [emailAutolink, protocolAutolink];
    text3[87] = [emailAutolink, wwwAutolink];
    text3[119] = [emailAutolink, wwwAutolink];
  }
});

// node_modules/micromark-extension-gfm-autolink-literal/index.js
var init_micromark_extension_gfm_autolink_literal = __esm({
  "node_modules/micromark-extension-gfm-autolink-literal/index.js"() {
    init_syntax();
  }
});

// node_modules/micromark-extension-gfm-footnote/lib/syntax.js
function gfmFootnote() {
  return {
    document: {
      [91]: {
        name: "gfmFootnoteDefinition",
        tokenize: tokenizeDefinitionStart,
        continuation: {
          tokenize: tokenizeDefinitionContinuation
        },
        exit: gfmFootnoteDefinitionEnd
      }
    },
    text: {
      [91]: {
        name: "gfmFootnoteCall",
        tokenize: tokenizeGfmFootnoteCall
      },
      [93]: {
        name: "gfmPotentialFootnoteCall",
        add: "after",
        tokenize: tokenizePotentialGfmFootnoteCall,
        resolveTo: resolveToPotentialGfmFootnoteCall
      }
    }
  };
}
function tokenizePotentialGfmFootnoteCall(effects, ok3, nok) {
  const self = this;
  let index2 = self.events.length;
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
  let labelStart;
  while (index2--) {
    const token = self.events[index2][1];
    if (token.type === "labelImage") {
      labelStart = token;
      break;
    }
    if (token.type === "gfmFootnoteCall" || token.type === "labelLink" || token.type === "label" || token.type === "image" || token.type === "link") {
      break;
    }
  }
  return start;
  function start(code2) {
    if (!labelStart || !labelStart._balanced) {
      return nok(code2);
    }
    const id = normalizeIdentifier(self.sliceSerialize({
      start: labelStart.end,
      end: self.now()
    }));
    if (id.codePointAt(0) !== 94 || !defined.includes(id.slice(1))) {
      return nok(code2);
    }
    effects.enter("gfmFootnoteCallLabelMarker");
    effects.consume(code2);
    effects.exit("gfmFootnoteCallLabelMarker");
    return ok3(code2);
  }
}
function resolveToPotentialGfmFootnoteCall(events, context) {
  let index2 = events.length;
  let labelStart;
  while (index2--) {
    if (events[index2][1].type === "labelImage" && events[index2][0] === "enter") {
      labelStart = events[index2][1];
      break;
    }
  }
  events[index2 + 1][1].type = "data";
  events[index2 + 3][1].type = "gfmFootnoteCallLabelMarker";
  const call = {
    type: "gfmFootnoteCall",
    start: Object.assign({}, events[index2 + 3][1].start),
    end: Object.assign({}, events[events.length - 1][1].end)
  };
  const marker = {
    type: "gfmFootnoteCallMarker",
    start: Object.assign({}, events[index2 + 3][1].end),
    end: Object.assign({}, events[index2 + 3][1].end)
  };
  marker.end.column++;
  marker.end.offset++;
  marker.end._bufferIndex++;
  const string3 = {
    type: "gfmFootnoteCallString",
    start: Object.assign({}, marker.end),
    end: Object.assign({}, events[events.length - 1][1].start)
  };
  const chunk = {
    type: "chunkString",
    contentType: "string",
    start: Object.assign({}, string3.start),
    end: Object.assign({}, string3.end)
  };
  const replacement = [
    // Take the `labelImageMarker` (now `data`, the `!`)
    events[index2 + 1],
    events[index2 + 2],
    ["enter", call, context],
    // The `[`
    events[index2 + 3],
    events[index2 + 4],
    // The `^`.
    ["enter", marker, context],
    ["exit", marker, context],
    // Everything in between.
    ["enter", string3, context],
    ["enter", chunk, context],
    ["exit", chunk, context],
    ["exit", string3, context],
    // The ending (`]`, properly parsed and labelled).
    events[events.length - 2],
    events[events.length - 1],
    ["exit", call, context]
  ];
  events.splice(index2, events.length - index2 + 1, ...replacement);
  return events;
}
function tokenizeGfmFootnoteCall(effects, ok3, nok) {
  const self = this;
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
  let size = 0;
  let data;
  return start;
  function start(code2) {
    effects.enter("gfmFootnoteCall");
    effects.enter("gfmFootnoteCallLabelMarker");
    effects.consume(code2);
    effects.exit("gfmFootnoteCallLabelMarker");
    return callStart;
  }
  function callStart(code2) {
    if (code2 !== 94) return nok(code2);
    effects.enter("gfmFootnoteCallMarker");
    effects.consume(code2);
    effects.exit("gfmFootnoteCallMarker");
    effects.enter("gfmFootnoteCallString");
    effects.enter("chunkString").contentType = "string";
    return callData;
  }
  function callData(code2) {
    if (
      // Too long.
      size > 999 || // Closing brace with nothing.
      code2 === 93 && !data || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      code2 === null || code2 === 91 || markdownLineEndingOrSpace(code2)
    ) {
      return nok(code2);
    }
    if (code2 === 93) {
      effects.exit("chunkString");
      const token = effects.exit("gfmFootnoteCallString");
      if (!defined.includes(normalizeIdentifier(self.sliceSerialize(token)))) {
        return nok(code2);
      }
      effects.enter("gfmFootnoteCallLabelMarker");
      effects.consume(code2);
      effects.exit("gfmFootnoteCallLabelMarker");
      effects.exit("gfmFootnoteCall");
      return ok3;
    }
    if (!markdownLineEndingOrSpace(code2)) {
      data = true;
    }
    size++;
    effects.consume(code2);
    return code2 === 92 ? callEscape : callData;
  }
  function callEscape(code2) {
    if (code2 === 91 || code2 === 92 || code2 === 93) {
      effects.consume(code2);
      size++;
      return callData;
    }
    return callData(code2);
  }
}
function tokenizeDefinitionStart(effects, ok3, nok) {
  const self = this;
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
  let identifier;
  let size = 0;
  let data;
  return start;
  function start(code2) {
    effects.enter("gfmFootnoteDefinition")._container = true;
    effects.enter("gfmFootnoteDefinitionLabel");
    effects.enter("gfmFootnoteDefinitionLabelMarker");
    effects.consume(code2);
    effects.exit("gfmFootnoteDefinitionLabelMarker");
    return labelAtMarker;
  }
  function labelAtMarker(code2) {
    if (code2 === 94) {
      effects.enter("gfmFootnoteDefinitionMarker");
      effects.consume(code2);
      effects.exit("gfmFootnoteDefinitionMarker");
      effects.enter("gfmFootnoteDefinitionLabelString");
      effects.enter("chunkString").contentType = "string";
      return labelInside;
    }
    return nok(code2);
  }
  function labelInside(code2) {
    if (
      // Too long.
      size > 999 || // Closing brace with nothing.
      code2 === 93 && !data || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      code2 === null || code2 === 91 || markdownLineEndingOrSpace(code2)
    ) {
      return nok(code2);
    }
    if (code2 === 93) {
      effects.exit("chunkString");
      const token = effects.exit("gfmFootnoteDefinitionLabelString");
      identifier = normalizeIdentifier(self.sliceSerialize(token));
      effects.enter("gfmFootnoteDefinitionLabelMarker");
      effects.consume(code2);
      effects.exit("gfmFootnoteDefinitionLabelMarker");
      effects.exit("gfmFootnoteDefinitionLabel");
      return labelAfter;
    }
    if (!markdownLineEndingOrSpace(code2)) {
      data = true;
    }
    size++;
    effects.consume(code2);
    return code2 === 92 ? labelEscape : labelInside;
  }
  function labelEscape(code2) {
    if (code2 === 91 || code2 === 92 || code2 === 93) {
      effects.consume(code2);
      size++;
      return labelInside;
    }
    return labelInside(code2);
  }
  function labelAfter(code2) {
    if (code2 === 58) {
      effects.enter("definitionMarker");
      effects.consume(code2);
      effects.exit("definitionMarker");
      if (!defined.includes(identifier)) {
        defined.push(identifier);
      }
      return factorySpace(effects, whitespaceAfter, "gfmFootnoteDefinitionWhitespace");
    }
    return nok(code2);
  }
  function whitespaceAfter(code2) {
    return ok3(code2);
  }
}
function tokenizeDefinitionContinuation(effects, ok3, nok) {
  return effects.check(blankLine, ok3, effects.attempt(indent, ok3, nok));
}
function gfmFootnoteDefinitionEnd(effects) {
  effects.exit("gfmFootnoteDefinition");
}
function tokenizeIndent2(effects, ok3, nok) {
  const self = this;
  return factorySpace(effects, afterPrefix, "gfmFootnoteDefinitionIndent", 4 + 1);
  function afterPrefix(code2) {
    const tail = self.events[self.events.length - 1];
    return tail && tail[1].type === "gfmFootnoteDefinitionIndent" && tail[2].sliceSerialize(tail[1], true).length === 4 ? ok3(code2) : nok(code2);
  }
}
var indent;
var init_syntax2 = __esm({
  "node_modules/micromark-extension-gfm-footnote/lib/syntax.js"() {
    init_micromark_core_commonmark();
    init_micromark_factory_space();
    init_micromark_util_character();
    init_micromark_util_normalize_identifier();
    indent = {
      tokenize: tokenizeIndent2,
      partial: true
    };
  }
});

// node_modules/micromark-extension-gfm-footnote/index.js
var init_micromark_extension_gfm_footnote = __esm({
  "node_modules/micromark-extension-gfm-footnote/index.js"() {
    init_syntax2();
  }
});

// node_modules/micromark-extension-gfm-strikethrough/lib/syntax.js
function gfmStrikethrough(options) {
  const options_ = options || {};
  let single2 = options_.singleTilde;
  const tokenizer = {
    name: "strikethrough",
    tokenize: tokenizeStrikethrough,
    resolveAll: resolveAllStrikethrough
  };
  if (single2 === null || single2 === void 0) {
    single2 = true;
  }
  return {
    text: {
      [126]: tokenizer
    },
    insideSpan: {
      null: [tokenizer]
    },
    attentionMarkers: {
      null: [126]
    }
  };
  function resolveAllStrikethrough(events, context) {
    let index2 = -1;
    while (++index2 < events.length) {
      if (events[index2][0] === "enter" && events[index2][1].type === "strikethroughSequenceTemporary" && events[index2][1]._close) {
        let open2 = index2;
        while (open2--) {
          if (events[open2][0] === "exit" && events[open2][1].type === "strikethroughSequenceTemporary" && events[open2][1]._open && // If the sizes are the same:
          events[index2][1].end.offset - events[index2][1].start.offset === events[open2][1].end.offset - events[open2][1].start.offset) {
            events[index2][1].type = "strikethroughSequence";
            events[open2][1].type = "strikethroughSequence";
            const strikethrough = {
              type: "strikethrough",
              start: Object.assign({}, events[open2][1].start),
              end: Object.assign({}, events[index2][1].end)
            };
            const text4 = {
              type: "strikethroughText",
              start: Object.assign({}, events[open2][1].end),
              end: Object.assign({}, events[index2][1].start)
            };
            const nextEvents = [["enter", strikethrough, context], ["enter", events[open2][1], context], ["exit", events[open2][1], context], ["enter", text4, context]];
            const insideSpan2 = context.parser.constructs.insideSpan.null;
            if (insideSpan2) {
              splice(nextEvents, nextEvents.length, 0, resolveAll(insideSpan2, events.slice(open2 + 1, index2), context));
            }
            splice(nextEvents, nextEvents.length, 0, [["exit", text4, context], ["enter", events[index2][1], context], ["exit", events[index2][1], context], ["exit", strikethrough, context]]);
            splice(events, open2 - 1, index2 - open2 + 3, nextEvents);
            index2 = open2 + nextEvents.length - 2;
            break;
          }
        }
      }
    }
    index2 = -1;
    while (++index2 < events.length) {
      if (events[index2][1].type === "strikethroughSequenceTemporary") {
        events[index2][1].type = "data";
      }
    }
    return events;
  }
  function tokenizeStrikethrough(effects, ok3, nok) {
    const previous3 = this.previous;
    const events = this.events;
    let size = 0;
    return start;
    function start(code2) {
      if (previous3 === 126 && events[events.length - 1][1].type !== "characterEscape") {
        return nok(code2);
      }
      effects.enter("strikethroughSequenceTemporary");
      return more(code2);
    }
    function more(code2) {
      const before = classifyCharacter(previous3);
      if (code2 === 126) {
        if (size > 1) return nok(code2);
        effects.consume(code2);
        size++;
        return more;
      }
      if (size < 2 && !single2) return nok(code2);
      const token = effects.exit("strikethroughSequenceTemporary");
      const after = classifyCharacter(code2);
      token._open = !after || after === 2 && Boolean(before);
      token._close = !before || before === 2 && Boolean(after);
      return ok3(code2);
    }
  }
}
var init_syntax3 = __esm({
  "node_modules/micromark-extension-gfm-strikethrough/lib/syntax.js"() {
    init_micromark_util_chunked();
    init_micromark_util_classify_character();
    init_micromark_util_resolve_all();
  }
});

// node_modules/micromark-extension-gfm-strikethrough/index.js
var init_micromark_extension_gfm_strikethrough = __esm({
  "node_modules/micromark-extension-gfm-strikethrough/index.js"() {
    init_syntax3();
  }
});

// node_modules/micromark-extension-gfm-table/lib/edit-map.js
function addImplementation(editMap, at, remove, add2) {
  let index2 = 0;
  if (remove === 0 && add2.length === 0) {
    return;
  }
  while (index2 < editMap.map.length) {
    if (editMap.map[index2][0] === at) {
      editMap.map[index2][1] += remove;
      editMap.map[index2][2].push(...add2);
      return;
    }
    index2 += 1;
  }
  editMap.map.push([at, remove, add2]);
}
var EditMap;
var init_edit_map = __esm({
  "node_modules/micromark-extension-gfm-table/lib/edit-map.js"() {
    EditMap = class {
      /**
       * Create a new edit map.
       */
      constructor() {
        this.map = [];
      }
      /**
       * Create an edit: a remove and/or add at a certain place.
       *
       * @param {number} index
       * @param {number} remove
       * @param {Array<Event>} add
       * @returns {undefined}
       */
      add(index2, remove, add2) {
        addImplementation(this, index2, remove, add2);
      }
      // To do: add this when moving to `micromark`.
      // /**
      //  * Create an edit: but insert `add` before existing additions.
      //  *
      //  * @param {number} index
      //  * @param {number} remove
      //  * @param {Array<Event>} add
      //  * @returns {undefined}
      //  */
      // addBefore(index, remove, add) {
      //   addImplementation(this, index, remove, add, true)
      // }
      /**
       * Done, change the events.
       *
       * @param {Array<Event>} events
       * @returns {undefined}
       */
      consume(events) {
        this.map.sort(function(a, b) {
          return a[0] - b[0];
        });
        if (this.map.length === 0) {
          return;
        }
        let index2 = this.map.length;
        const vecs = [];
        while (index2 > 0) {
          index2 -= 1;
          vecs.push(events.slice(this.map[index2][0] + this.map[index2][1]), this.map[index2][2]);
          events.length = this.map[index2][0];
        }
        vecs.push(events.slice());
        events.length = 0;
        let slice = vecs.pop();
        while (slice) {
          for (const element of slice) {
            events.push(element);
          }
          slice = vecs.pop();
        }
        this.map.length = 0;
      }
    };
  }
});

// node_modules/micromark-extension-gfm-table/lib/infer.js
function gfmTableAlign(events, index2) {
  let inDelimiterRow = false;
  const align = [];
  while (index2 < events.length) {
    const event = events[index2];
    if (inDelimiterRow) {
      if (event[0] === "enter") {
        if (event[1].type === "tableContent") {
          align.push(events[index2 + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
        }
      } else if (event[1].type === "tableContent") {
        if (events[index2 - 1][1].type === "tableDelimiterMarker") {
          const alignIndex = align.length - 1;
          align[alignIndex] = align[alignIndex] === "left" ? "center" : "right";
        }
      } else if (event[1].type === "tableDelimiterRow") {
        break;
      }
    } else if (event[0] === "enter" && event[1].type === "tableDelimiterRow") {
      inDelimiterRow = true;
    }
    index2 += 1;
  }
  return align;
}
var init_infer = __esm({
  "node_modules/micromark-extension-gfm-table/lib/infer.js"() {
  }
});

// node_modules/micromark-extension-gfm-table/lib/syntax.js
function gfmTable() {
  return {
    flow: {
      null: {
        name: "table",
        tokenize: tokenizeTable,
        resolveAll: resolveTable
      }
    }
  };
}
function tokenizeTable(effects, ok3, nok) {
  const self = this;
  let size = 0;
  let sizeB = 0;
  let seen;
  return start;
  function start(code2) {
    let index2 = self.events.length - 1;
    while (index2 > -1) {
      const type2 = self.events[index2][1].type;
      if (type2 === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
      type2 === "linePrefix") index2--;
      else break;
    }
    const tail = index2 > -1 ? self.events[index2][1].type : null;
    const next = tail === "tableHead" || tail === "tableRow" ? bodyRowStart : headRowBefore;
    if (next === bodyRowStart && self.parser.lazy[self.now().line]) {
      return nok(code2);
    }
    return next(code2);
  }
  function headRowBefore(code2) {
    effects.enter("tableHead");
    effects.enter("tableRow");
    return headRowStart(code2);
  }
  function headRowStart(code2) {
    if (code2 === 124) {
      return headRowBreak(code2);
    }
    seen = true;
    sizeB += 1;
    return headRowBreak(code2);
  }
  function headRowBreak(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    if (markdownLineEnding(code2)) {
      if (sizeB > 1) {
        sizeB = 0;
        self.interrupt = true;
        effects.exit("tableRow");
        effects.enter("lineEnding");
        effects.consume(code2);
        effects.exit("lineEnding");
        return headDelimiterStart;
      }
      return nok(code2);
    }
    if (markdownSpace(code2)) {
      return factorySpace(effects, headRowBreak, "whitespace")(code2);
    }
    sizeB += 1;
    if (seen) {
      seen = false;
      size += 1;
    }
    if (code2 === 124) {
      effects.enter("tableCellDivider");
      effects.consume(code2);
      effects.exit("tableCellDivider");
      seen = true;
      return headRowBreak;
    }
    effects.enter("data");
    return headRowData(code2);
  }
  function headRowData(code2) {
    if (code2 === null || code2 === 124 || markdownLineEndingOrSpace(code2)) {
      effects.exit("data");
      return headRowBreak(code2);
    }
    effects.consume(code2);
    return code2 === 92 ? headRowEscape : headRowData;
  }
  function headRowEscape(code2) {
    if (code2 === 92 || code2 === 124) {
      effects.consume(code2);
      return headRowData;
    }
    return headRowData(code2);
  }
  function headDelimiterStart(code2) {
    self.interrupt = false;
    if (self.parser.lazy[self.now().line]) {
      return nok(code2);
    }
    effects.enter("tableDelimiterRow");
    seen = false;
    if (markdownSpace(code2)) {
      return factorySpace(effects, headDelimiterBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2);
    }
    return headDelimiterBefore(code2);
  }
  function headDelimiterBefore(code2) {
    if (code2 === 45 || code2 === 58) {
      return headDelimiterValueBefore(code2);
    }
    if (code2 === 124) {
      seen = true;
      effects.enter("tableCellDivider");
      effects.consume(code2);
      effects.exit("tableCellDivider");
      return headDelimiterCellBefore;
    }
    return headDelimiterNok(code2);
  }
  function headDelimiterCellBefore(code2) {
    if (markdownSpace(code2)) {
      return factorySpace(effects, headDelimiterValueBefore, "whitespace")(code2);
    }
    return headDelimiterValueBefore(code2);
  }
  function headDelimiterValueBefore(code2) {
    if (code2 === 58) {
      sizeB += 1;
      seen = true;
      effects.enter("tableDelimiterMarker");
      effects.consume(code2);
      effects.exit("tableDelimiterMarker");
      return headDelimiterLeftAlignmentAfter;
    }
    if (code2 === 45) {
      sizeB += 1;
      return headDelimiterLeftAlignmentAfter(code2);
    }
    if (code2 === null || markdownLineEnding(code2)) {
      return headDelimiterCellAfter(code2);
    }
    return headDelimiterNok(code2);
  }
  function headDelimiterLeftAlignmentAfter(code2) {
    if (code2 === 45) {
      effects.enter("tableDelimiterFiller");
      return headDelimiterFiller(code2);
    }
    return headDelimiterNok(code2);
  }
  function headDelimiterFiller(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return headDelimiterFiller;
    }
    if (code2 === 58) {
      seen = true;
      effects.exit("tableDelimiterFiller");
      effects.enter("tableDelimiterMarker");
      effects.consume(code2);
      effects.exit("tableDelimiterMarker");
      return headDelimiterRightAlignmentAfter;
    }
    effects.exit("tableDelimiterFiller");
    return headDelimiterRightAlignmentAfter(code2);
  }
  function headDelimiterRightAlignmentAfter(code2) {
    if (markdownSpace(code2)) {
      return factorySpace(effects, headDelimiterCellAfter, "whitespace")(code2);
    }
    return headDelimiterCellAfter(code2);
  }
  function headDelimiterCellAfter(code2) {
    if (code2 === 124) {
      return headDelimiterBefore(code2);
    }
    if (code2 === null || markdownLineEnding(code2)) {
      if (!seen || size !== sizeB) {
        return headDelimiterNok(code2);
      }
      effects.exit("tableDelimiterRow");
      effects.exit("tableHead");
      return ok3(code2);
    }
    return headDelimiterNok(code2);
  }
  function headDelimiterNok(code2) {
    return nok(code2);
  }
  function bodyRowStart(code2) {
    effects.enter("tableRow");
    return bodyRowBreak(code2);
  }
  function bodyRowBreak(code2) {
    if (code2 === 124) {
      effects.enter("tableCellDivider");
      effects.consume(code2);
      effects.exit("tableCellDivider");
      return bodyRowBreak;
    }
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("tableRow");
      return ok3(code2);
    }
    if (markdownSpace(code2)) {
      return factorySpace(effects, bodyRowBreak, "whitespace")(code2);
    }
    effects.enter("data");
    return bodyRowData(code2);
  }
  function bodyRowData(code2) {
    if (code2 === null || code2 === 124 || markdownLineEndingOrSpace(code2)) {
      effects.exit("data");
      return bodyRowBreak(code2);
    }
    effects.consume(code2);
    return code2 === 92 ? bodyRowEscape : bodyRowData;
  }
  function bodyRowEscape(code2) {
    if (code2 === 92 || code2 === 124) {
      effects.consume(code2);
      return bodyRowData;
    }
    return bodyRowData(code2);
  }
}
function resolveTable(events, context) {
  let index2 = -1;
  let inFirstCellAwaitingPipe = true;
  let rowKind = 0;
  let lastCell = [0, 0, 0, 0];
  let cell = [0, 0, 0, 0];
  let afterHeadAwaitingFirstBodyRow = false;
  let lastTableEnd = 0;
  let currentTable;
  let currentBody;
  let currentCell;
  const map2 = new EditMap();
  while (++index2 < events.length) {
    const event = events[index2];
    const token = event[1];
    if (event[0] === "enter") {
      if (token.type === "tableHead") {
        afterHeadAwaitingFirstBodyRow = false;
        if (lastTableEnd !== 0) {
          flushTableEnd(map2, context, lastTableEnd, currentTable, currentBody);
          currentBody = void 0;
          lastTableEnd = 0;
        }
        currentTable = {
          type: "table",
          start: Object.assign({}, token.start),
          // Note: correct end is set later.
          end: Object.assign({}, token.end)
        };
        map2.add(index2, 0, [["enter", currentTable, context]]);
      } else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
        inFirstCellAwaitingPipe = true;
        currentCell = void 0;
        lastCell = [0, 0, 0, 0];
        cell = [0, index2 + 1, 0, 0];
        if (afterHeadAwaitingFirstBodyRow) {
          afterHeadAwaitingFirstBodyRow = false;
          currentBody = {
            type: "tableBody",
            start: Object.assign({}, token.start),
            // Note: correct end is set later.
            end: Object.assign({}, token.end)
          };
          map2.add(index2, 0, [["enter", currentBody, context]]);
        }
        rowKind = token.type === "tableDelimiterRow" ? 2 : currentBody ? 3 : 1;
      } else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
        inFirstCellAwaitingPipe = false;
        if (cell[2] === 0) {
          if (lastCell[1] !== 0) {
            cell[0] = cell[1];
            currentCell = flushCell(map2, context, lastCell, rowKind, void 0, currentCell);
            lastCell = [0, 0, 0, 0];
          }
          cell[2] = index2;
        }
      } else if (token.type === "tableCellDivider") {
        if (inFirstCellAwaitingPipe) {
          inFirstCellAwaitingPipe = false;
        } else {
          if (lastCell[1] !== 0) {
            cell[0] = cell[1];
            currentCell = flushCell(map2, context, lastCell, rowKind, void 0, currentCell);
          }
          lastCell = cell;
          cell = [lastCell[1], index2, 0, 0];
        }
      }
    } else if (token.type === "tableHead") {
      afterHeadAwaitingFirstBodyRow = true;
      lastTableEnd = index2;
    } else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
      lastTableEnd = index2;
      if (lastCell[1] !== 0) {
        cell[0] = cell[1];
        currentCell = flushCell(map2, context, lastCell, rowKind, index2, currentCell);
      } else if (cell[1] !== 0) {
        currentCell = flushCell(map2, context, cell, rowKind, index2, currentCell);
      }
      rowKind = 0;
    } else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
      cell[3] = index2;
    }
  }
  if (lastTableEnd !== 0) {
    flushTableEnd(map2, context, lastTableEnd, currentTable, currentBody);
  }
  map2.consume(context.events);
  index2 = -1;
  while (++index2 < context.events.length) {
    const event = context.events[index2];
    if (event[0] === "enter" && event[1].type === "table") {
      event[1]._align = gfmTableAlign(context.events, index2);
    }
  }
  return events;
}
function flushCell(map2, context, range, rowKind, rowEnd, previousCell) {
  const groupName = rowKind === 1 ? "tableHeader" : rowKind === 2 ? "tableDelimiter" : "tableData";
  const valueName = "tableContent";
  if (range[0] !== 0) {
    previousCell.end = Object.assign({}, getPoint(context.events, range[0]));
    map2.add(range[0], 0, [["exit", previousCell, context]]);
  }
  const now = getPoint(context.events, range[1]);
  previousCell = {
    type: groupName,
    start: Object.assign({}, now),
    // Note: correct end is set later.
    end: Object.assign({}, now)
  };
  map2.add(range[1], 0, [["enter", previousCell, context]]);
  if (range[2] !== 0) {
    const relatedStart = getPoint(context.events, range[2]);
    const relatedEnd = getPoint(context.events, range[3]);
    const valueToken = {
      type: valueName,
      start: Object.assign({}, relatedStart),
      end: Object.assign({}, relatedEnd)
    };
    map2.add(range[2], 0, [["enter", valueToken, context]]);
    if (rowKind !== 2) {
      const start = context.events[range[2]];
      const end = context.events[range[3]];
      start[1].end = Object.assign({}, end[1].end);
      start[1].type = "chunkText";
      start[1].contentType = "text";
      if (range[3] > range[2] + 1) {
        const a = range[2] + 1;
        const b = range[3] - range[2] - 1;
        map2.add(a, b, []);
      }
    }
    map2.add(range[3] + 1, 0, [["exit", valueToken, context]]);
  }
  if (rowEnd !== void 0) {
    previousCell.end = Object.assign({}, getPoint(context.events, rowEnd));
    map2.add(rowEnd, 0, [["exit", previousCell, context]]);
    previousCell = void 0;
  }
  return previousCell;
}
function flushTableEnd(map2, context, index2, table, tableBody) {
  const exits = [];
  const related = getPoint(context.events, index2);
  if (tableBody) {
    tableBody.end = Object.assign({}, related);
    exits.push(["exit", tableBody, context]);
  }
  table.end = Object.assign({}, related);
  exits.push(["exit", table, context]);
  map2.add(index2 + 1, 0, exits);
}
function getPoint(events, index2) {
  const event = events[index2];
  const side = event[0] === "enter" ? "start" : "end";
  return event[1][side];
}
var init_syntax4 = __esm({
  "node_modules/micromark-extension-gfm-table/lib/syntax.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    init_edit_map();
    init_infer();
  }
});

// node_modules/micromark-extension-gfm-table/index.js
var init_micromark_extension_gfm_table = __esm({
  "node_modules/micromark-extension-gfm-table/index.js"() {
    init_syntax4();
  }
});

// node_modules/micromark-extension-gfm-task-list-item/lib/syntax.js
function gfmTaskListItem() {
  return {
    text: {
      [91]: tasklistCheck
    }
  };
}
function tokenizeTasklistCheck(effects, ok3, nok) {
  const self = this;
  return open2;
  function open2(code2) {
    if (
      // Exit if there’s stuff before.
      self.previous !== null || // Exit if not in the first content that is the first child of a list
      // item.
      !self._gfmTasklistFirstContentOfListItem
    ) {
      return nok(code2);
    }
    effects.enter("taskListCheck");
    effects.enter("taskListCheckMarker");
    effects.consume(code2);
    effects.exit("taskListCheckMarker");
    return inside;
  }
  function inside(code2) {
    if (markdownLineEndingOrSpace(code2)) {
      effects.enter("taskListCheckValueUnchecked");
      effects.consume(code2);
      effects.exit("taskListCheckValueUnchecked");
      return close;
    }
    if (code2 === 88 || code2 === 120) {
      effects.enter("taskListCheckValueChecked");
      effects.consume(code2);
      effects.exit("taskListCheckValueChecked");
      return close;
    }
    return nok(code2);
  }
  function close(code2) {
    if (code2 === 93) {
      effects.enter("taskListCheckMarker");
      effects.consume(code2);
      effects.exit("taskListCheckMarker");
      effects.exit("taskListCheck");
      return after;
    }
    return nok(code2);
  }
  function after(code2) {
    if (markdownLineEnding(code2)) {
      return ok3(code2);
    }
    if (markdownSpace(code2)) {
      return effects.check({
        tokenize: spaceThenNonSpace
      }, ok3, nok)(code2);
    }
    return nok(code2);
  }
}
function spaceThenNonSpace(effects, ok3, nok) {
  return factorySpace(effects, after, "whitespace");
  function after(code2) {
    return code2 === null ? nok(code2) : ok3(code2);
  }
}
var tasklistCheck;
var init_syntax5 = __esm({
  "node_modules/micromark-extension-gfm-task-list-item/lib/syntax.js"() {
    init_micromark_factory_space();
    init_micromark_util_character();
    tasklistCheck = {
      name: "tasklistCheck",
      tokenize: tokenizeTasklistCheck
    };
  }
});

// node_modules/micromark-extension-gfm-task-list-item/index.js
var init_micromark_extension_gfm_task_list_item = __esm({
  "node_modules/micromark-extension-gfm-task-list-item/index.js"() {
    init_syntax5();
  }
});

// node_modules/micromark-extension-gfm/index.js
function gfm(options) {
  return combineExtensions([
    gfmAutolinkLiteral(),
    gfmFootnote(),
    gfmStrikethrough(options),
    gfmTable(),
    gfmTaskListItem()
  ]);
}
var init_micromark_extension_gfm = __esm({
  "node_modules/micromark-extension-gfm/index.js"() {
    init_micromark_util_combine_extensions();
    init_micromark_extension_gfm_autolink_literal();
    init_micromark_extension_gfm_footnote();
    init_micromark_extension_gfm_strikethrough();
    init_micromark_extension_gfm_table();
    init_micromark_extension_gfm_task_list_item();
  }
});

// node_modules/ccount/index.js
function ccount(value, character) {
  const source = String(value);
  if (typeof character !== "string") {
    throw new TypeError("Expected character");
  }
  let count = 0;
  let index2 = source.indexOf(character);
  while (index2 !== -1) {
    count++;
    index2 = source.indexOf(character, index2 + character.length);
  }
  return count;
}
var init_ccount = __esm({
  "node_modules/ccount/index.js"() {
  }
});

// node_modules/devlop/lib/default.js
function ok() {
}
var init_default = __esm({
  "node_modules/devlop/lib/default.js"() {
  }
});

// node_modules/escape-string-regexp/index.js
function escapeStringRegexp(string3) {
  if (typeof string3 !== "string") {
    throw new TypeError("Expected a string");
  }
  return string3.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
var init_escape_string_regexp = __esm({
  "node_modules/escape-string-regexp/index.js"() {
  }
});

// node_modules/unist-util-is/lib/index.js
function anyFactory(tests) {
  const checks = [];
  let index2 = -1;
  while (++index2 < tests.length) {
    checks[index2] = convert(tests[index2]);
  }
  return castFactory(any);
  function any(...parameters) {
    let index3 = -1;
    while (++index3 < checks.length) {
      if (checks[index3].apply(this, parameters)) return true;
    }
    return false;
  }
}
function propsFactory(check) {
  const checkAsRecord = (
    /** @type {Record<string, unknown>} */
    check
  );
  return castFactory(all2);
  function all2(node2) {
    const nodeAsRecord = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      node2
    );
    let key;
    for (key in check) {
      if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
    }
    return true;
  }
}
function typeFactory(check) {
  return castFactory(type2);
  function type2(node2) {
    return node2 && node2.type === check;
  }
}
function castFactory(testFunction) {
  return check;
  function check(value, index2, parent) {
    return Boolean(
      looksLikeANode(value) && testFunction.call(
        this,
        value,
        typeof index2 === "number" ? index2 : void 0,
        parent || void 0
      )
    );
  }
}
function ok2() {
  return true;
}
function looksLikeANode(value) {
  return value !== null && typeof value === "object" && "type" in value;
}
var convert;
var init_lib4 = __esm({
  "node_modules/unist-util-is/lib/index.js"() {
    convert = // Note: overloads in JSDoc can’t yet use different `@template`s.
    /**
     * @type {(
     *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
     *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
     *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
     *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
     *   ((test?: Test) => Check)
     * )}
     */
    /**
     * @param {Test} [test]
     * @returns {Check}
     */
    function(test) {
      if (test === null || test === void 0) {
        return ok2;
      }
      if (typeof test === "function") {
        return castFactory(test);
      }
      if (typeof test === "object") {
        return Array.isArray(test) ? anyFactory(test) : propsFactory(test);
      }
      if (typeof test === "string") {
        return typeFactory(test);
      }
      throw new Error("Expected function, string, or object as test");
    };
  }
});

// node_modules/unist-util-is/index.js
var init_unist_util_is = __esm({
  "node_modules/unist-util-is/index.js"() {
    init_lib4();
  }
});

// node_modules/unist-util-visit-parents/lib/color.node.js
function color(d) {
  return "\x1B[33m" + d + "\x1B[39m";
}
var init_color_node = __esm({
  "node_modules/unist-util-visit-parents/lib/color.node.js"() {
  }
});

// node_modules/unist-util-visit-parents/lib/index.js
function visitParents(tree, test, visitor, reverse) {
  let check;
  if (typeof test === "function" && typeof visitor !== "function") {
    reverse = visitor;
    visitor = test;
  } else {
    check = test;
  }
  const is2 = convert(check);
  const step = reverse ? -1 : 1;
  factory(tree, void 0, [])();
  function factory(node2, index2, parents) {
    const value = (
      /** @type {Record<string, unknown>} */
      node2 && typeof node2 === "object" ? node2 : {}
    );
    if (typeof value.type === "string") {
      const name = (
        // `hast`
        typeof value.tagName === "string" ? value.tagName : (
          // `xast`
          typeof value.name === "string" ? value.name : void 0
        )
      );
      Object.defineProperty(visit2, "name", {
        value: "node (" + color(node2.type + (name ? "<" + name + ">" : "")) + ")"
      });
    }
    return visit2;
    function visit2() {
      let result = empty;
      let subresult;
      let offset;
      let grandparents;
      if (!test || is2(node2, index2, parents[parents.length - 1] || void 0)) {
        result = toResult(visitor(node2, parents));
        if (result[0] === EXIT) {
          return result;
        }
      }
      if ("children" in node2 && node2.children) {
        const nodeAsParent = (
          /** @type {UnistParent} */
          node2
        );
        if (nodeAsParent.children && result[0] !== SKIP) {
          offset = (reverse ? nodeAsParent.children.length : -1) + step;
          grandparents = parents.concat(nodeAsParent);
          while (offset > -1 && offset < nodeAsParent.children.length) {
            const child = nodeAsParent.children[offset];
            subresult = factory(child, offset, grandparents)();
            if (subresult[0] === EXIT) {
              return subresult;
            }
            offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
          }
        }
      }
      return result;
    }
  }
}
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") {
    return [CONTINUE, value];
  }
  return value === null || value === void 0 ? empty : [value];
}
var empty, CONTINUE, EXIT, SKIP;
var init_lib5 = __esm({
  "node_modules/unist-util-visit-parents/lib/index.js"() {
    init_unist_util_is();
    init_color_node();
    empty = [];
    CONTINUE = true;
    EXIT = false;
    SKIP = "skip";
  }
});

// node_modules/unist-util-visit-parents/index.js
var init_unist_util_visit_parents = __esm({
  "node_modules/unist-util-visit-parents/index.js"() {
    init_lib5();
  }
});

// node_modules/mdast-util-find-and-replace/lib/index.js
function findAndReplace(tree, list2, options) {
  const settings = options || {};
  const ignored = convert(settings.ignore || []);
  const pairs3 = toPairs(list2);
  let pairIndex = -1;
  while (++pairIndex < pairs3.length) {
    visitParents(tree, "text", visitor);
  }
  function visitor(node2, parents) {
    let index2 = -1;
    let grandparent;
    while (++index2 < parents.length) {
      const parent = parents[index2];
      const siblings = grandparent ? grandparent.children : void 0;
      if (ignored(
        parent,
        siblings ? siblings.indexOf(parent) : void 0,
        grandparent
      )) {
        return;
      }
      grandparent = parent;
    }
    if (grandparent) {
      return handler2(node2, parents);
    }
  }
  function handler2(node2, parents) {
    const parent = parents[parents.length - 1];
    const find = pairs3[pairIndex][0];
    const replace2 = pairs3[pairIndex][1];
    let start = 0;
    const siblings = parent.children;
    const index2 = siblings.indexOf(node2);
    let change = false;
    let nodes = [];
    find.lastIndex = 0;
    let match = find.exec(node2.value);
    while (match) {
      const position3 = match.index;
      const matchObject = {
        index: match.index,
        input: match.input,
        stack: [...parents, node2]
      };
      let value = replace2(...match, matchObject);
      if (typeof value === "string") {
        value = value.length > 0 ? { type: "text", value } : void 0;
      }
      if (value === false) {
        find.lastIndex = position3 + 1;
      } else {
        if (start !== position3) {
          nodes.push({
            type: "text",
            value: node2.value.slice(start, position3)
          });
        }
        if (Array.isArray(value)) {
          nodes.push(...value);
        } else if (value) {
          nodes.push(value);
        }
        start = position3 + match[0].length;
        change = true;
      }
      if (!find.global) {
        break;
      }
      match = find.exec(node2.value);
    }
    if (change) {
      if (start < node2.value.length) {
        nodes.push({ type: "text", value: node2.value.slice(start) });
      }
      parent.children.splice(index2, 1, ...nodes);
    } else {
      nodes = [node2];
    }
    return index2 + nodes.length;
  }
}
function toPairs(tupleOrList) {
  const result = [];
  if (!Array.isArray(tupleOrList)) {
    throw new TypeError("Expected find and replace tuple or list of tuples");
  }
  const list2 = !tupleOrList[0] || Array.isArray(tupleOrList[0]) ? tupleOrList : [tupleOrList];
  let index2 = -1;
  while (++index2 < list2.length) {
    const tuple = list2[index2];
    result.push([toExpression(tuple[0]), toFunction(tuple[1])]);
  }
  return result;
}
function toExpression(find) {
  return typeof find === "string" ? new RegExp(escapeStringRegexp(find), "g") : find;
}
function toFunction(replace2) {
  return typeof replace2 === "function" ? replace2 : function() {
    return replace2;
  };
}
var init_lib6 = __esm({
  "node_modules/mdast-util-find-and-replace/lib/index.js"() {
    init_escape_string_regexp();
    init_unist_util_visit_parents();
    init_unist_util_is();
  }
});

// node_modules/mdast-util-find-and-replace/index.js
var init_mdast_util_find_and_replace = __esm({
  "node_modules/mdast-util-find-and-replace/index.js"() {
    init_lib6();
  }
});

// node_modules/mdast-util-gfm-autolink-literal/lib/index.js
function gfmAutolinkLiteralFromMarkdown() {
  return {
    transforms: [transformGfmAutolinkLiterals],
    enter: {
      literalAutolink: enterLiteralAutolink,
      literalAutolinkEmail: enterLiteralAutolinkValue,
      literalAutolinkHttp: enterLiteralAutolinkValue,
      literalAutolinkWww: enterLiteralAutolinkValue
    },
    exit: {
      literalAutolink: exitLiteralAutolink,
      literalAutolinkEmail: exitLiteralAutolinkEmail,
      literalAutolinkHttp: exitLiteralAutolinkHttp,
      literalAutolinkWww: exitLiteralAutolinkWww
    }
  };
}
function enterLiteralAutolink(token) {
  this.enter({ type: "link", title: null, url: "", children: [] }, token);
}
function enterLiteralAutolinkValue(token) {
  this.config.enter.autolinkProtocol.call(this, token);
}
function exitLiteralAutolinkHttp(token) {
  this.config.exit.autolinkProtocol.call(this, token);
}
function exitLiteralAutolinkWww(token) {
  this.config.exit.data.call(this, token);
  const node2 = this.stack[this.stack.length - 1];
  ok(node2.type === "link");
  node2.url = "http://" + this.sliceSerialize(token);
}
function exitLiteralAutolinkEmail(token) {
  this.config.exit.autolinkEmail.call(this, token);
}
function exitLiteralAutolink(token) {
  this.exit(token);
}
function transformGfmAutolinkLiterals(tree) {
  findAndReplace(
    tree,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl],
      [/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu, findEmail]
    ],
    { ignore: ["link", "linkReference"] }
  );
}
function findUrl(_, protocol, domain2, path2, match) {
  let prefix = "";
  if (!previous2(match)) {
    return false;
  }
  if (/^w/i.test(protocol)) {
    domain2 = protocol + domain2;
    protocol = "";
    prefix = "http://";
  }
  if (!isCorrectDomain(domain2)) {
    return false;
  }
  const parts = splitUrl(domain2 + path2);
  if (!parts[0]) return false;
  const result = {
    type: "link",
    title: null,
    url: prefix + protocol + parts[0],
    children: [{ type: "text", value: protocol + parts[0] }]
  };
  if (parts[1]) {
    return [result, { type: "text", value: parts[1] }];
  }
  return result;
}
function findEmail(_, atext, label, match) {
  if (
    // Not an expected previous character.
    !previous2(match, true) || // Label ends in not allowed character.
    /[-\d_]$/.test(label)
  ) {
    return false;
  }
  return {
    type: "link",
    title: null,
    url: "mailto:" + atext + "@" + label,
    children: [{ type: "text", value: atext + "@" + label }]
  };
}
function isCorrectDomain(domain2) {
  const parts = domain2.split(".");
  if (parts.length < 2 || parts[parts.length - 1] && (/_/.test(parts[parts.length - 1]) || !/[a-zA-Z\d]/.test(parts[parts.length - 1])) || parts[parts.length - 2] && (/_/.test(parts[parts.length - 2]) || !/[a-zA-Z\d]/.test(parts[parts.length - 2]))) {
    return false;
  }
  return true;
}
function splitUrl(url) {
  const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);
  if (!trailExec) {
    return [url, void 0];
  }
  url = url.slice(0, trailExec.index);
  let trail2 = trailExec[0];
  let closingParenIndex = trail2.indexOf(")");
  const openingParens = ccount(url, "(");
  let closingParens = ccount(url, ")");
  while (closingParenIndex !== -1 && openingParens > closingParens) {
    url += trail2.slice(0, closingParenIndex + 1);
    trail2 = trail2.slice(closingParenIndex + 1);
    closingParenIndex = trail2.indexOf(")");
    closingParens++;
  }
  return [url, trail2];
}
function previous2(match, email) {
  const code2 = match.input.charCodeAt(match.index - 1);
  return (match.index === 0 || unicodeWhitespace(code2) || unicodePunctuation(code2)) && // If it’s an email, the previous character should not be a slash.
  (!email || code2 !== 47);
}
var init_lib7 = __esm({
  "node_modules/mdast-util-gfm-autolink-literal/lib/index.js"() {
    init_ccount();
    init_default();
    init_micromark_util_character();
    init_mdast_util_find_and_replace();
  }
});

// node_modules/mdast-util-gfm-autolink-literal/index.js
var init_mdast_util_gfm_autolink_literal = __esm({
  "node_modules/mdast-util-gfm-autolink-literal/index.js"() {
    init_lib7();
  }
});

// node_modules/mdast-util-gfm-footnote/lib/index.js
function enterFootnoteCallString() {
  this.buffer();
}
function enterFootnoteCall(token) {
  this.enter({ type: "footnoteReference", identifier: "", label: "" }, token);
}
function enterFootnoteDefinitionLabelString() {
  this.buffer();
}
function enterFootnoteDefinition(token) {
  this.enter(
    { type: "footnoteDefinition", identifier: "", label: "", children: [] },
    token
  );
}
function exitFootnoteCallString(token) {
  const label = this.resume();
  const node2 = this.stack[this.stack.length - 1];
  ok(node2.type === "footnoteReference");
  node2.identifier = normalizeIdentifier(
    this.sliceSerialize(token)
  ).toLowerCase();
  node2.label = label;
}
function exitFootnoteCall(token) {
  this.exit(token);
}
function exitFootnoteDefinitionLabelString(token) {
  const label = this.resume();
  const node2 = this.stack[this.stack.length - 1];
  ok(node2.type === "footnoteDefinition");
  node2.identifier = normalizeIdentifier(
    this.sliceSerialize(token)
  ).toLowerCase();
  node2.label = label;
}
function exitFootnoteDefinition(token) {
  this.exit(token);
}
function footnoteReferencePeek() {
  return "[";
}
function footnoteReference(node2, _, state, info) {
  const tracker = state.createTracker(info);
  let value = tracker.move("[^");
  const exit3 = state.enter("footnoteReference");
  const subexit = state.enter("reference");
  value += tracker.move(
    state.safe(state.associationId(node2), { after: "]", before: value })
  );
  subexit();
  exit3();
  value += tracker.move("]");
  return value;
}
function gfmFootnoteFromMarkdown() {
  return {
    enter: {
      gfmFootnoteCallString: enterFootnoteCallString,
      gfmFootnoteCall: enterFootnoteCall,
      gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,
      gfmFootnoteDefinition: enterFootnoteDefinition
    },
    exit: {
      gfmFootnoteCallString: exitFootnoteCallString,
      gfmFootnoteCall: exitFootnoteCall,
      gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,
      gfmFootnoteDefinition: exitFootnoteDefinition
    }
  };
}
var init_lib8 = __esm({
  "node_modules/mdast-util-gfm-footnote/lib/index.js"() {
    init_default();
    init_micromark_util_normalize_identifier();
    footnoteReference.peek = footnoteReferencePeek;
  }
});

// node_modules/mdast-util-gfm-footnote/index.js
var init_mdast_util_gfm_footnote = __esm({
  "node_modules/mdast-util-gfm-footnote/index.js"() {
    init_lib8();
  }
});

// node_modules/mdast-util-gfm-strikethrough/lib/index.js
function gfmStrikethroughFromMarkdown() {
  return {
    canContainEols: ["delete"],
    enter: { strikethrough: enterStrikethrough },
    exit: { strikethrough: exitStrikethrough }
  };
}
function enterStrikethrough(token) {
  this.enter({ type: "delete", children: [] }, token);
}
function exitStrikethrough(token) {
  this.exit(token);
}
function handleDelete(node2, _, state, info) {
  const tracker = state.createTracker(info);
  const exit3 = state.enter("strikethrough");
  let value = tracker.move("~~");
  value += state.containerPhrasing(node2, {
    ...tracker.current(),
    before: value,
    after: "~"
  });
  value += tracker.move("~~");
  exit3();
  return value;
}
function peekDelete() {
  return "~";
}
var init_lib9 = __esm({
  "node_modules/mdast-util-gfm-strikethrough/lib/index.js"() {
    handleDelete.peek = peekDelete;
  }
});

// node_modules/mdast-util-gfm-strikethrough/index.js
var init_mdast_util_gfm_strikethrough = __esm({
  "node_modules/mdast-util-gfm-strikethrough/index.js"() {
    init_lib9();
  }
});

// node_modules/unist-util-visit/lib/index.js
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
  let reverse;
  let test;
  let visitor;
  if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
    test = void 0;
    visitor = testOrVisitor;
    reverse = visitorOrReverse;
  } else {
    test = testOrVisitor;
    visitor = visitorOrReverse;
    reverse = maybeReverse;
  }
  visitParents(tree, test, overload, reverse);
  function overload(node2, parents) {
    const parent = parents[parents.length - 1];
    const index2 = parent ? parent.children.indexOf(node2) : void 0;
    return visitor(node2, index2, parent);
  }
}
var init_lib10 = __esm({
  "node_modules/unist-util-visit/lib/index.js"() {
    init_unist_util_visit_parents();
    init_unist_util_visit_parents();
  }
});

// node_modules/unist-util-visit/index.js
var init_unist_util_visit = __esm({
  "node_modules/unist-util-visit/index.js"() {
    init_lib10();
  }
});

// node_modules/mdast-util-gfm-table/lib/index.js
function gfmTableFromMarkdown() {
  return {
    enter: {
      table: enterTable,
      tableData: enterCell,
      tableHeader: enterCell,
      tableRow: enterRow
    },
    exit: {
      codeText: exitCodeText,
      table: exitTable,
      tableData: exit2,
      tableHeader: exit2,
      tableRow: exit2
    }
  };
}
function enterTable(token) {
  const align = token._align;
  ok(align, "expected `_align` on table");
  this.enter(
    {
      type: "table",
      align: align.map(function(d) {
        return d === "none" ? null : d;
      }),
      children: []
    },
    token
  );
  this.data.inTable = true;
}
function exitTable(token) {
  this.exit(token);
  this.data.inTable = void 0;
}
function enterRow(token) {
  this.enter({ type: "tableRow", children: [] }, token);
}
function exit2(token) {
  this.exit(token);
}
function enterCell(token) {
  this.enter({ type: "tableCell", children: [] }, token);
}
function exitCodeText(token) {
  let value = this.resume();
  if (this.data.inTable) {
    value = value.replace(/\\([\\|])/g, replace);
  }
  const node2 = this.stack[this.stack.length - 1];
  ok(node2.type === "inlineCode");
  node2.value = value;
  this.exit(token);
}
function replace($0, $1) {
  return $1 === "|" ? $1 : $0;
}
var init_lib11 = __esm({
  "node_modules/mdast-util-gfm-table/lib/index.js"() {
    init_default();
  }
});

// node_modules/mdast-util-gfm-table/index.js
var init_mdast_util_gfm_table = __esm({
  "node_modules/mdast-util-gfm-table/index.js"() {
    init_lib11();
  }
});

// node_modules/mdast-util-gfm-task-list-item/lib/index.js
function gfmTaskListItemFromMarkdown() {
  return {
    exit: {
      taskListCheckValueChecked: exitCheck,
      taskListCheckValueUnchecked: exitCheck,
      paragraph: exitParagraphWithTaskListItem
    }
  };
}
function exitCheck(token) {
  const node2 = this.stack[this.stack.length - 2];
  ok(node2.type === "listItem");
  node2.checked = token.type === "taskListCheckValueChecked";
}
function exitParagraphWithTaskListItem(token) {
  const parent = this.stack[this.stack.length - 2];
  if (parent && parent.type === "listItem" && typeof parent.checked === "boolean") {
    const node2 = this.stack[this.stack.length - 1];
    ok(node2.type === "paragraph");
    const head = node2.children[0];
    if (head && head.type === "text") {
      const siblings = parent.children;
      let index2 = -1;
      let firstParaghraph;
      while (++index2 < siblings.length) {
        const sibling = siblings[index2];
        if (sibling.type === "paragraph") {
          firstParaghraph = sibling;
          break;
        }
      }
      if (firstParaghraph === node2) {
        head.value = head.value.slice(1);
        if (head.value.length === 0) {
          node2.children.shift();
        } else if (node2.position && head.position && typeof head.position.start.offset === "number") {
          head.position.start.column++;
          head.position.start.offset++;
          node2.position.start = Object.assign({}, head.position.start);
        }
      }
    }
  }
  this.exit(token);
}
var init_lib12 = __esm({
  "node_modules/mdast-util-gfm-task-list-item/lib/index.js"() {
    init_default();
  }
});

// node_modules/mdast-util-gfm-task-list-item/index.js
var init_mdast_util_gfm_task_list_item = __esm({
  "node_modules/mdast-util-gfm-task-list-item/index.js"() {
    init_lib12();
  }
});

// node_modules/mdast-util-gfm/lib/index.js
function gfmFromMarkdown() {
  return [
    gfmAutolinkLiteralFromMarkdown(),
    gfmFootnoteFromMarkdown(),
    gfmStrikethroughFromMarkdown(),
    gfmTableFromMarkdown(),
    gfmTaskListItemFromMarkdown()
  ];
}
var init_lib13 = __esm({
  "node_modules/mdast-util-gfm/lib/index.js"() {
    init_mdast_util_gfm_autolink_literal();
    init_mdast_util_gfm_footnote();
    init_mdast_util_gfm_strikethrough();
    init_mdast_util_gfm_table();
    init_mdast_util_gfm_task_list_item();
  }
});

// node_modules/mdast-util-gfm/index.js
var init_mdast_util_gfm = __esm({
  "node_modules/mdast-util-gfm/index.js"() {
    init_lib13();
  }
});

// packages/operators/generate-ast/index.js
var generate_ast_exports = {};
__export(generate_ast_exports, {
  run: () => run
});
function run(ctx, config = {}) {
  const ast = fromMarkdown(ctx.markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()]
  });
  ctx.ast = ast;
  return ctx;
}
var init_generate_ast = __esm({
  "packages/operators/generate-ast/index.js"() {
    init_mdast_util_from_markdown();
    init_micromark_extension_gfm();
    init_mdast_util_gfm();
  }
});

// packages/operators/extract/index.js
var extract_exports = {};
__export(extract_exports, {
  run: () => run2
});
function run2(ctx, cfg = {}) {
  if (!ctx.ast) return pushErr(ctx, "extract operator needs generateAST to run first");
  const { target, scopes } = cfg;
  if (!target) return pushErr(ctx, 'extract operator missing "target"');
  if (!scopes || scopes.length === 0) return pushErr(ctx, 'extract operator missing "scopes"');
  const md = ctx.markdown ?? "";
  const isRegex = target in BUILTIN_RX || /^[./].*[./]$/.test(target);
  const re = isRegex ? toRegExp(target) : null;
  const isExternal = (url) => /^https?:\/\//i.test(url);
  const isInternal = (url) => !isExternal(url);
  if (!isRegex && !["internallink", "externallink"].includes(target)) {
    let found = false;
    visit(ctx.ast, (n) => {
      if (n.type === target) {
        found = true;
        return EXIT;
      }
    });
    if (!found) {
      ctx.diagnostics.push({
        line: 1,
        severity: "warning",
        message: `extract: no \u201C${target}\u201D nodes found. Either this markdown doesn\u2019t contain that node type or \u201C${target}\u201D isn\u2019t a valid mdast node type.`
      });
    }
  }
  const checkLinkFormatting = (markdown) => {
    const RX = {
      missingCloseParen: [/\[[^\]]*\]\([^\)]*$/, "Malformed link: missing closing parenthesis ')'."],
      missingCloseBracket: [/\[[^\]]*$/, "Malformed link: missing closing bracket ']'."],
      missingOpenBracket: [/^[^\[]+\][^\(]*\([^\)]*\)/, "Malformed link: missing opening bracket '['."],
      missingOpenParen: [/\[[^\]]*\][^\(]*[^)]$/, "Malformed link: missing opening parenthesis '('."],
      emptyLinkPattern: [/\[\s*\]\(\s*\)/, "Empty link: both text and URL are missing."]
    };
    const out = [];
    markdown.split("\n").forEach((ln, i) => {
      for (const [_k, [rx, msg]] of Object.entries(RX)) {
        if (rx.test(ln)) {
          out.push({ line: i + 1, content: ln.trim(), message: msg });
          break;
        }
      }
    });
    return out;
  };
  const matchNode = (n) => {
    if (isRegex) return false;
    if (target === "link") {
      if (n.type !== "link") return false;
      const child = n.children?.[0];
      if (n.title == null && child?.type === "text" && n.url === child.value) {
        return false;
      }
      return true;
    }
    if (target === "internallink" || target === "externallink") {
      if (n.type !== "link") return false;
      if (n.title == null && n.children?.length === 1 && n.children[0].type === "text" && n.url === n.children[0].value) {
        return false;
      }
      return target === "internallink" ? isInternal(n.url || "") : isExternal(n.url || "");
    }
    return n.type === target;
  };
  const matchText = (txt) => isRegex ? [...txt.matchAll(re)].map((m) => m[0]).filter((s) => !/^https?:\/\/\S+$/i.test(s)) : [];
  const serializeNode = (n) => {
    if (ctx.markdown && n.position?.start && n.position?.end) {
      const lines = ctx.markdown.split("\n");
      const { start, end } = n.position;
      if (start.line === end.line) {
        return lines[start.line - 1].slice(start.column - 1, end.column - 1);
      }
      const snippet2 = [lines[start.line - 1].slice(start.column - 1)];
      for (let i = start.line; i < end.line - 1; i++) {
        snippet2.push(lines[i]);
      }
      snippet2.push(lines[end.line - 1].slice(0, end.column - 1));
      return snippet2.join("\n");
    }
    if (typeof n.value === "string") return n.value;
    return toString2(n);
  };
  const malformed = checkLinkFormatting(md);
  const result = { document: [], paragraph: [], line: {}, endoffile: [] };
  const handlers = {
    document() {
      if (isRegex) {
        visit(ctx.ast, "text", (n) => {
          const hits = matchText(n.value);
          const ln = n.position?.start?.line;
          for (const h of hits) {
            result.document.push({ content: h, line: ln });
          }
        });
      } else {
        visit(ctx.ast, (n) => {
          if (!matchNode(n)) return;
          if (n.type === "link" && n.title == null && n.children?.length === 1 && n.children[0].type === "text" && n.url === n.children[0].value) return;
          result.document.push({
            ...n,
            line: n.position?.start?.line ?? 1,
            content: serializeNode(n)
          });
        });
        if (target === "internallink" || target === "externallink") {
          malformed.forEach((iss) => {
            if (iss.line === void 0) return;
            const urlMatch = iss.content.match(/\(([^()\s]*)/);
            const url = urlMatch?.[1] ?? "";
            const internal = isInternal(url);
            if (target === "internallink" && internal || target === "externallink" && !internal) {
              result.document.push({ type: "malformedlink", url, ...iss });
            }
          });
        }
      }
    },
    paragraph() {
      visit(ctx.ast, "paragraph", (p) => {
        const decorated = [];
        const matches = isRegex ? matchText(toString2(p)) : collectMatches(p, matchNode);
        if (matches.length) {
          decorated.push(
            ...matches.map(
              (m) => typeof m === "string" ? { content: m } : { ...m, content: serializeNode(m) }
            )
          );
        }
        if (target === "internallink" || target === "externallink") {
          const { line: start } = p.position.start;
          const { line: end } = p.position.end;
          malformed.forEach((iss) => {
            if (iss.line < start || iss.line > end) return;
            const url = (iss.content.match(/\(([^()\s]*)/) || [])[1] ?? "";
            const same = target === "internallink" ? isInternal(url) : isExternal(url);
            if (same) decorated.push({ type: "malformedlink", url, ...iss });
          });
        }
        if (decorated.length) {
          result.paragraph.push({ line: p.position.start.line, matches: decorated });
        }
      });
    },
    line() {
      if (isRegex) {
        visit(ctx.ast, "text", (n) => {
          const hits = matchText(n.value);
          if (hits.length) {
            const ln = n.position?.start?.line;
            (result.line[ln] ??= []).push(
              ...hits.map((h) => ({ content: h }))
            );
          }
        });
      } else {
        visit(ctx.ast, (n) => {
          if (!matchNode(n)) return;
          if (n.type === "link" && n.title == null && n.children?.length === 1 && n.children[0].type === "text" && n.url === n.children[0].value) return;
          const ln = n.position?.start?.line;
          (result.line[ln] ??= []).push({
            ...n,
            content: serializeNode(n)
          });
        });
        if (target === "internallink" || target === "externallink") {
          malformed.forEach((iss) => {
            const urlMatch = iss.content.match(/\(([^()\s]*)/);
            const url = urlMatch?.[1] ?? "";
            const internal = isInternal(url);
            if (target === "internallink" && internal || target === "externallink" && !internal) {
              if (iss.line !== void 0) {
                (result.line[iss.line] ??= []).push({ type: "malformedlink", url, ...iss });
              }
            }
          });
        }
      }
    },
    endoffile() {
      if (isRegex) {
        const endsWithNewline = /\r?\n$/.test(md);
        if (endsWithNewline) {
          const line = md.split("\n").length;
          result.endoffile.push({
            content: "\\n",
            line
          });
        }
      } else {
        const endLine = md.split("\n").length;
        visit(ctx.ast, (n) => {
          if (n.position?.start?.line === endLine && matchNode(n)) {
            result.endoffile.push({
              ...n,
              line: endLine,
              content: serializeNode(n)
            });
          }
        });
        if (target === "internallink" || target === "externallink") {
          malformed.forEach((iss) => {
            if (iss.line !== endLine) return;
            const urlMatch = iss.content.match(/\(([^()\s]*)/);
            const url = urlMatch?.[1] ?? "";
            const internal = isInternal(url);
            if (target === "internallink" && internal || target === "externallink" && !internal) {
              result.endoffile.push({ type: "malformedlink", url, ...iss });
            }
          });
        }
      }
    }
  };
  for (const scope of ["document", "paragraph"]) {
    const seen = /* @__PURE__ */ new Set();
    result[scope] = result[scope].filter((item) => {
      const key = `${item.line}|${item.content}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const lineSeen = /* @__PURE__ */ new Set();
  for (const [ln, entries] of Object.entries(result.line)) {
    result.line[ln] = entries.filter((e) => {
      const key = `${ln}|${e.content}`;
      if (lineSeen.has(key)) return false;
      lineSeen.add(key);
      return true;
    });
  }
  for (const s of scopes) handlers[s]?.();
  ctx.extracted = { target, scopes, data: result };
  return { target, scopes, data: result };
}
function collectMatches(parent, predicate) {
  const out = [];
  visit(parent, (n) => predicate(n) && out.push(n));
  return out;
}
function pushErr(ctx, msg) {
  ctx.diagnostics.push({ line: 1, severity: "error", message: msg });
  return ctx;
}
var EMOJI_REGEX, DATE_REGEX, BUILTIN_RX, escapeRE, toRegExp;
var init_extract = __esm({
  "packages/operators/extract/index.js"() {
    init_unist_util_visit();
    init_mdast_util_to_string();
    EMOJI_REGEX = /:[\w+-]+:|[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;
    DATE_REGEX = /\b(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/g;
    BUILTIN_RX = { emoji: EMOJI_REGEX, newline: /\r?\n/g, date: DATE_REGEX };
    escapeRE = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    toRegExp = (t) => BUILTIN_RX[t] || new RegExp(escapeRE(t), "gi");
  }
});

// packages/operators/count/index.js
var count_exports = {};
__export(count_exports, {
  run: () => run3
});
function run3(ctx, cfg = {}) {
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "count operator needs a previous step (extract/search/etc.)"
    });
    return ctx;
  }
  const { target, scopes, data } = ctx.extracted;
  const summary = {};
  for (const s of scopes) {
    if (s === "line") {
      const totalPerLine = {};
      (ctx.markdown ?? "").split("\n").forEach((_, i) => {
        const ln = i + 1;
        totalPerLine[ln] = data.line?.[ln]?.length ?? 0;
      });
      summary.line = totalPerLine;
    } else if (s === "paragraph") {
      summary.paragraph = (data.paragraph ?? []).map((p) => ({
        line: p.line,
        count: p.matches.length
      }));
    } else {
      summary[s] = Array.isArray(data[s]) ? data[s].length : 0;
    }
  }
  ctx.counted = { target, scopes, data: summary };
  ctx.count ??= {};
  ctx.count[target] = summary;
  ctx.previous = { target, scopes };
  return { target, scopes, data: summary };
}
var init_count = __esm({
  "packages/operators/count/index.js"() {
  }
});

// packages/operators/threshold/index.js
var threshold_exports = {};
__export(threshold_exports, {
  run: () => run4
});
function run4(ctx, cfg = {}) {
  let { target, conditions = {}, level = "warning" } = cfg;
  if (!target) {
    if (ctx.previous?.target) {
      target = ctx.previous.target;
    } else if (ctx.count && Object.keys(ctx.count).length === 1) {
      target = Object.keys(ctx.count)[0];
    }
    if (target) {
      cfg.target = target;
      cfg._inferred = true;
    }
  }
  const allViolations = {};
  if (!target && ctx.previous) {
    target = ctx.previous.target;
  }
  if (!target) {
    pushErr2(ctx, 'threshold operator missing "target"');
    return ctx;
  }
  const counts = ctx.count?.[target];
  if (!counts) {
    pushErr2(
      ctx,
      `No counts found for "${target}". Ensure a prior step (like 'count' or 'length') ran first.`
    );
    return ctx;
  }
  const adapters = {
    document: () => [{ line: 1, actual: counts.document ?? 0 }],
    endoffile: () => [{ line: 1, actual: counts.endoffile ?? 0 }],
    previousstepoutput: () => [{ line: 1, actual: counts.previousstepoutput ?? 0 }],
    line: () => Object.entries(counts.line ?? {}).map(
      ([ln, c]) => ({ line: +ln, actual: c })
    ),
    paragraph: () => (counts.paragraph ?? []).map((p) => ({
      line: p.line,
      actual: p.count ?? p.length ?? 0
    }))
  };
  const prevScopes = ctx.previous?.scopes ?? [];
  for (const [scopeKey, rule] of Object.entries(conditions)) {
    let effectiveScope = scopeKey;
    let rows = adapters[effectiveScope]?.() ?? [];
    const allZero = rows.every((r) => (r.actual ?? 0) === 0);
    if (allZero && prevScopes.length === 1) {
      const altScope = prevScopes[0];
      if (altScope !== effectiveScope && adapters[altScope]) {
        const altRows = adapters[altScope]();
        if (altRows.length > 0) {
          effectiveScope = altScope;
          rows = altRows;
        }
      }
    }
    const { type: type2, value } = rule;
    if (value == null) continue;
    const violations = [];
    for (const { line, actual } of rows) {
      if (!compare(actual, type2, value)) {
        const message = formatMsg(effectiveScope, line, actual, target, type2, value, ctx);
        ctx.diagnostics.push({ line, severity: level, message });
        violations.push({
          line,
          actual,
          scope: effectiveScope,
          expected: { type: type2, value },
          message
        });
      }
    }
    if (violations.length) {
      allViolations[effectiveScope] ??= [];
      allViolations[effectiveScope].push(...violations);
    }
  }
  return { target, data: { violations: allViolations } };
}
function compare(actual, type2, expected) {
  const ops = {
    "<": (a, b) => a < b,
    "<=": (a, b) => a <= b,
    ">": (a, b) => a > b,
    ">=": (a, b) => a >= b,
    "=": (a, b) => a === b,
    "==": (a, b) => a === b
  };
  const alias = {
    lessthan: "<",
    greaterthan: ">",
    lessthanequal: "<=",
    lessthanequalto: "<=",
    greaterthanequal: ">=",
    greaterthanequalto: ">=",
    equalto: "="
  };
  const key = String(type2).toLowerCase().trim();
  const sym = ops[key] || ops[alias[key]];
  return sym ? sym(actual, expected) : true;
}
function formatMsg(scope, line, actual, target, type2, val, ctx) {
  const label = scope === "document" ? "Document" : scope === "endoffile" ? "End of file" : scope === "line" ? `Line ${line}` : `Defined scope`;
  const comparison = {
    "<": "less than",
    "<=": "less than or equal to",
    ">": "greater than",
    ">=": "greater than or equal to",
    "=": "equal to"
  };
  const alias = {
    lessthan: "<",
    lessthanequal: "<=",
    lessthanequalto: "<=",
    greaterthan: ">",
    greaterthanequal: ">=",
    greaterthanequalto: ">=",
    equalto: "="
  };
  const op = comparison[alias[type2] ?? type2] ?? type2;
  const isLength = !!ctx.lengths?.data?.[scope];
  const unit = isLength ? "characters" : target.endsWith("s") ? target : `${target}s`;
  return `${label} has ${actual} ${unit}; must be ${op} ${val}.`;
}
function pushErr2(ctx, msg) {
  ctx.diagnostics.push({ line: 1, severity: "error", message: msg });
}
var init_threshold = __esm({
  "packages/operators/threshold/index.js"() {
  }
});

// packages/operators/isPresent/index.js
var isPresent_exports = {};
__export(isPresent_exports, {
  run: () => run5
});
function run5(ctx, cfg = {}) {
  const target = cfg.target?.trim();
  const level = cfg.level ?? "warning";
  const scope = ctx.extracted?.scopes?.[0] ?? "document";
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "isPresent operator needs a extract step first"
    });
    return ctx;
  }
  if (!target) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: 'isPresent operator missing "target" field name'
    });
    return ctx;
  }
  const data = ctx.extracted.data ?? {};
  const label = ctx.extracted.target ?? "node";
  const push2 = (line, msg) => ctx.diagnostics.push({ line, severity: level, message: msg });
  const hasField = (n) => {
    const val = n?.[target];
    return typeof val === "string" ? val.trim().length > 0 : !!val;
  };
  const getLine2 = (n) => n.line ?? n.position?.start?.line ?? 1;
  if (scope === "document" || scope === "endoffile") {
    for (const n of data[scope] ?? []) {
      if (!hasField(n)) push2(getLine2(n), `Missing "${target}" on ${label} node`);
    }
  } else if (scope === "paragraph") {
    for (const p of data.paragraph ?? []) {
      for (const n of p.matches ?? []) {
        if (!hasField(n)) push2(getLine2(n), `Missing "${target}" on ${label} node`);
      }
    }
  } else if (scope === "line") {
    for (const [ln, arr] of Object.entries(data.line ?? {})) {
      for (const n of arr) {
        if (!hasField(n)) push2(+ln, `Missing "${target}" on ${label} node`);
      }
    }
  }
  return { target, scopes: [scope], data: {} };
}
var init_isPresent = __esm({
  "packages/operators/isPresent/index.js"() {
  }
});

// packages/operators/regexMatch/index.js
var regexMatch_exports = {};
__export(regexMatch_exports, {
  run: () => run6
});
function run6(ctx, cfg = {}) {
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "regexMatch operator needs extract to run first"
    });
    return ctx;
  }
  console.log(ctx.extracted);
  const patterns2 = Array.isArray(cfg.patterns) ? cfg.patterns : cfg.pattern ? [cfg.pattern] : [];
  if (patterns2.length === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: 'regexMatch operator missing "patterns"'
    });
    return ctx;
  }
  const regexes = [];
  for (const p of patterns2) {
    try {
      regexes.push(new RegExp(p, "i"));
    } catch (err) {
      ctx.diagnostics.push({
        line: 1,
        severity: "error",
        message: `Invalid regex "${p}": ${err.message}`
      });
    }
  }
  if (regexes.length === 0) return ctx;
  const strOf = (entry) => {
    if (typeof entry === "string") return entry;
    if (entry?.raw) return entry.raw;
    if (entry?.value) return entry.value;
    if (entry?.content) return entry.content;
    if (entry?.children?.length) {
      return entry.children.map((c) => c.value ?? "").join("");
    }
    return JSON.stringify(entry);
  };
  const { scopes = [], data } = ctx.extracted;
  let failures = 0;
  const test = (entry, line = 1) => {
    const txt = strOf(entry);
    if (!txt) return;
    const ok3 = regexes.some((r) => r.test(txt));
    if (!ok3) {
      failures++;
      ctx.diagnostics.push({
        line,
        severity: "error",
        message: `"${txt}" does not match any of: ${patterns2.join(" , ")}`
      });
    }
  };
  for (const scope of scopes) {
    const entries = data[scope];
    if (!entries) continue;
    if (scope === "document" || scope === "endoffile") {
      entries.forEach((e) => test(e, e.line ?? 1));
    } else if (scope === "paragraph") {
      entries.forEach((p) => p.matches.forEach((e) => test(e, e.line ?? p.line)));
    } else if (scope === "line") {
      Object.entries(entries).forEach(([ln, arr]) => arr.forEach((e) => test(e, Number(ln))));
    }
  }
  if (failures === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: "info",
      message: `All entries match /${patterns2.join(" | ")}/`
    });
  }
  return { scopes, data: {} };
}
var init_regexMatch = __esm({
  "packages/operators/regexMatch/index.js"() {
  }
});

// packages/operators/sage/index.js
var sage_exports = {};
__export(sage_exports, {
  run: () => run7
});
async function run7(ctx, cfg = {}) {
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "sage operator needs a previous extract step"
    });
    return {};
  }
  const { target, scopes = ["document"], data } = ctx.extracted;
  if (target !== "heading") {
    ctx.diagnostics.push({
      line: 1,
      severity: "warning",
      message: "sage should be run after a heading extract"
    });
  }
  const slugify = (txt) => "#" + txt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const result = {
    document: data.document.map((h) => ({
      line: h.line,
      slug: slugify(toString2(h))
    }))
  };
  ctx.slugs = { scopes: ["document"], data: result };
  return { scopes: ["document"], data: result };
}
var init_sage = __esm({
  "packages/operators/sage/index.js"() {
    init_mdast_util_to_string();
  }
});

// packages/operators/compare/index.js
var compare_exports = {};
__export(compare_exports, {
  run: () => run8
});
async function run8(ctx, cfg = {}) {
  const { baseline, against, level = "error" } = cfg;
  const steps = ctx.pipelineResults ?? [];
  if (!steps[baseline - 1] || !steps[against - 1]) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "compare: invalid baseline / against index"
    });
    return {};
  }
  const A = steps[baseline - 1].data.data ?? steps[baseline - 1].data;
  const B = steps[against - 1].data.data ?? steps[against - 1].data;
  const scope = A.document && B.document ? "document" : Object.keys(A)[0] || "document";
  const aVal = A[scope] ?? [];
  const bVal = B[scope] ?? [];
  const keyOf = (x) => {
    if (typeof x === "string") return x.toLowerCase();
    if (x && typeof x === "object") {
      return (x.url || x.slug || x.content || JSON.stringify(x)).toLowerCase();
    }
    return String(x);
  };
  const setA = new Set(aVal.map(keyOf));
  const setB = new Set(bVal.map(keyOf));
  const missing = aVal.filter((x) => !setB.has(keyOf(x)));
  const extra = bVal.filter((x) => !setA.has(keyOf(x)));
  missing.forEach((item) => {
    const line = item && typeof item === "object" && item.line ? item.line : 1;
    const label = item.content ?? item.url ?? item.slug ?? JSON.stringify(item);
    ctx.diagnostics.push({
      line,
      severity: level,
      message: `Compare failed for: ${label}`
    });
  });
  extra.forEach((item) => {
    const line = item && typeof item === "object" && item.line ? item.line : 1;
    const label = item.content ?? item.url ?? item.slug ?? JSON.stringify(item);
    ctx.diagnostics.push({
      line,
      severity: level,
      message: `Compare found extra: ${label}`
    });
  });
  const summary = {
    [scope]: {
      missing: missing.map(pretty),
      extra: extra.map(pretty)
    }
  };
  return { scopes: [scope], data: summary };
  function pretty(x) {
    return typeof x === "string" ? x : x.content ?? x.url ?? x.slug ?? JSON.stringify(x);
  }
}
var init_compare = __esm({
  "packages/operators/compare/index.js"() {
  }
});

// packages/operators/length/index.js
var length_exports = {};
__export(length_exports, {
  run: () => run9
});
function run9(ctx, cfg = {}) {
  if (!ctx.extracted) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "length operator needs any other operator like extract to run first"
    });
    return ctx;
  }
  const { target, scopes, data } = ctx.extracted;
  const summary = { document: 0, endoffile: 0, line: {}, paragraph: [] };
  const textLength = (txt) => txt ? txt.length : 0;
  const calculators = {
    document: () => {
      summary.document = data.document?.map((n) => toString2(n)).reduce((acc, txt) => acc + textLength(txt), 0);
    },
    line: () => {
      for (const [lineNum, matches] of Object.entries(data.line ?? {})) {
        const total = matches.map((n) => toString2(n)).reduce((acc, txt) => acc + textLength(txt), 0);
        summary.line[lineNum] = total;
      }
    },
    paragraph: () => {
      for (const para of data.paragraph ?? []) {
        const total = para.matches.map((n) => toString2(n)).reduce((acc, txt) => acc + textLength(txt), 0);
        summary.paragraph.push({ line: para.line, length: total });
      }
    },
    endoffile: () => {
      summary.endoffile = data.endoffile?.map((n) => toString2(n)).reduce((acc, txt) => acc + textLength(txt), 0);
    }
  };
  for (const s of scopes) calculators[s]?.();
  ctx.lengths = { target, scopes, data: summary };
  ctx.counts ??= {};
  ctx.counts[target] = Object.fromEntries(
    Object.entries(summary).filter(([k]) => scopes.includes(k))
  );
  ctx.count = ctx.counts;
  ctx.previous = { target, scopes };
  return { target, scopes, data: summary };
}
var init_length = __esm({
  "packages/operators/length/index.js"() {
    init_mdast_util_to_string();
  }
});

// packages/operators/search/index.js
var search_exports = {};
__export(search_exports, {
  run: () => run10
});
function run10(ctx, cfg = {}) {
  const rawQuery = (cfg.query ?? "").trim();
  if (!rawQuery) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: 'search operator missing "query" string'
    });
    return ctx;
  }
  const queries = rawQuery.split(",").map((q) => q.trim()).filter((q) => q.length > 0);
  if (queries.length === 0) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "no valid search terms found"
    });
    return ctx;
  }
  const scopeName = cfg.scope === "previousstepoutput" && ctx.extracted ? "previousstepoutput" : "document";
  const result = { [scopeName]: [] };
  const add2 = (line, text4) => result[scopeName].push({ line, content: text4.trim() });
  const matchesQuery = (text4) => queries.some((q) => text4.toLowerCase().includes(q.toLowerCase()));
  if (scopeName === "document") {
    (ctx.markdown ?? "").split("\n").forEach((l, i) => {
      if (matchesQuery(l)) add2(i + 1, l);
    });
  } else {
    const prev = ctx.extracted.data ?? {};
    const walk = (node2) => {
      if (!node2) return;
      if (typeof node2 === "string") return;
      if (Array.isArray(node2)) return node2.forEach(walk);
      if (node2.content && matchesQuery(node2.content)) {
        add2(node2.line ?? node2.position?.start?.line ?? 1, node2.content);
        return;
      }
      const raw = node2.value ?? node2.raw ?? "";
      if (typeof raw === "string" && matchesQuery(raw)) {
        add2(node2.line ?? node2.position?.start?.line ?? 1, raw);
      }
      if (node2.matches) walk(node2.matches);
      if (node2.children) walk(node2.children);
    };
    Object.values(prev).forEach(walk);
  }
  ctx.extracted = {
    target: queries.join(", "),
    scopes: [scopeName],
    data: result
  };
  return { query: queries, scopes: [scopeName], data: result };
}
var init_search = __esm({
  "packages/operators/search/index.js"() {
  }
});

// packages/operators/fixUsingLLM/index.js
var fixUsingLLM_exports = {};
__export(fixUsingLLM_exports, {
  run: () => run11
});
async function run11(ctx, cfg = {}) {
  const {
    prompt = "",
    model = "llama-3.3-70b-versatile"
  } = cfg;
  if (!prompt.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "fixUsingLLM: Prompt is required"
    });
    return ctx;
  }
  const ruleDefinition = {
    name: ctx.name || ctx.rule || "Unnamed Rule",
    description: ctx.description || "",
    pipeline: ctx.pipeline || []
  };
  const ruleYaml = js_yaml_default.dump({
    rule: ruleDefinition.name,
    description: ruleDefinition.description,
    pipeline: ruleDefinition.pipeline
  });
  const operatorOutputs = (ctx.pipelineResults || []).map((step) => ({
    name: step.name,
    output: step.data
  }));
  const diagnosticText = (ctx.diagnostics || []).map((d) => `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`).join("\n");
  const fullPrompt = `
  You are a Markdown linter. Your job is to fix ONLY the issues that violate the specific rule defined below.

  ## Rule Definition (YAML):
  ${ruleYaml}

  ## Operator-Specific Prompt:
  ${prompt}

  ## Diagnostics from Previous Steps:
  ${diagnosticText || "(none)"}

  ## Markdown Document:
  \`\`\`markdown
  ${ctx.markdown}
  \`\`\`

  ## Very Important Instructions:

  - ONLY fix issues that are directly and clearly covered by the rule above.
  - DO NOT make any changes based on grammar, tone, inclusivity, or clarity unless the rule *explicitly* calls for it.
  - DO NOT invent improvements or infer intent not stated in the rule.
  - If the Markdown content does NOT violate the rule, return the **original input exactly as is** \u2014 unchanged.
  - You MUST behave like a deterministic function: same input \u2192 same output.
  - If there is even slight ambiguity in whether something violates the rule, you MUST NOT change it.
  - DO NOT change headings, formatting, phrasing, or terms unless they clearly break the rule.
  - If the original Markdown ends with a blank line, your output must preserve that exact trailing newline.

  ## Output Format:

  - ONLY include the corrected (or unmodified) Markdown **below** the marker.
  - NEVER include explanations, comments, anything after markdown or wrap it in a code block.

  ---FIXED MARKDOWN BELOW---
  `;
  console.log("[fixUsingLLM] Prompt sent to LLM:\n", fullPrompt);
  const llmResult = await callGroqModel(model, fullPrompt);
  console.log("[fixUsingLLM] Raw LLM response:\n", llmResult);
  const marker = "---FIXED MARKDOWN BELOW---";
  let fixedText = ctx.markdown;
  const markerIndex = llmResult.indexOf(marker);
  if (markerIndex !== -1) {
    fixedText = llmResult.slice(markerIndex + marker.length);
  } else {
    ctx.diagnostics.push({
      line: 1,
      severity: "warning",
      message: "fixUsingLLM: Marker not found \u2014 falling back to raw LLM output."
    });
    ctx.rawLLMFallback = llmResult;
    fixedText = llmResult.replace(/```(markdown)?/g, "");
  }
  fixedText = stripCodeFence(fixedText);
  ctx.fixedMarkdown = fixedText;
  ctx.llmResponse = llmResult;
  if (fixedText.trim() !== ctx.markdown.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "Lint failed \u2014 issues detected and corrected by the LLM."
    });
  } else {
    ctx.diagnostics.push({
      line: 1,
      severity: "info",
      message: "Lint successful! No issues found."
    });
  }
  return { prompt, model };
}
function stripCodeFence(text4 = "") {
  text4 = text4.replace(/^\s*```(?:\w+)?\s*\n?/i, "");
  text4 = text4.replace(/\n?```\s*$/i, "");
  return text4;
}
async function callGroqModel(model, prompt) {
  try {
    const response = await fetch("https://lintme-backend.onrender.com/api/groq-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt })
    });
    console.log("Calling backend from render");
    const data = await response.json();
    return data.result || "No valid response.";
  } catch (error) {
    console.error("fixUsingLLM: Error calling Groq API", error);
    return "Error generating suggestions.";
  }
}
var init_fixUsingLLM = __esm({
  "packages/operators/fixUsingLLM/index.js"() {
    init_js_yaml();
  }
});

// node_modules/bail/index.js
function bail(error) {
  if (error) {
    throw error;
  }
}
var init_bail = __esm({
  "node_modules/bail/index.js"() {
  }
});

// node_modules/extend/index.js
var require_extend = __commonJS({
  "node_modules/extend/index.js"(exports, module) {
    "use strict";
    var hasOwn = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;
    var defineProperty = Object.defineProperty;
    var gOPD = Object.getOwnPropertyDescriptor;
    var isArray = function isArray2(arr) {
      if (typeof Array.isArray === "function") {
        return Array.isArray(arr);
      }
      return toStr.call(arr) === "[object Array]";
    };
    var isPlainObject2 = function isPlainObject3(obj) {
      if (!obj || toStr.call(obj) !== "[object Object]") {
        return false;
      }
      var hasOwnConstructor = hasOwn.call(obj, "constructor");
      var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
      if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
        return false;
      }
      var key;
      for (key in obj) {
      }
      return typeof key === "undefined" || hasOwn.call(obj, key);
    };
    var setProperty = function setProperty2(target, options) {
      if (defineProperty && options.name === "__proto__") {
        defineProperty(target, options.name, {
          enumerable: true,
          configurable: true,
          value: options.newValue,
          writable: true
        });
      } else {
        target[options.name] = options.newValue;
      }
    };
    var getProperty = function getProperty2(obj, name) {
      if (name === "__proto__") {
        if (!hasOwn.call(obj, name)) {
          return void 0;
        } else if (gOPD) {
          return gOPD(obj, name).value;
        }
      }
      return obj[name];
    };
    module.exports = function extend4() {
      var options, name, src, copy, copyIsArray, clone;
      var target = arguments[0];
      var i = 1;
      var length = arguments.length;
      var deep = false;
      if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
      }
      if (target == null || typeof target !== "object" && typeof target !== "function") {
        target = {};
      }
      for (; i < length; ++i) {
        options = arguments[i];
        if (options != null) {
          for (name in options) {
            src = getProperty(target, name);
            copy = getProperty(options, name);
            if (target !== copy) {
              if (deep && copy && (isPlainObject2(copy) || (copyIsArray = isArray(copy)))) {
                if (copyIsArray) {
                  copyIsArray = false;
                  clone = src && isArray(src) ? src : [];
                } else {
                  clone = src && isPlainObject2(src) ? src : {};
                }
                setProperty(target, { name, newValue: extend4(deep, clone, copy) });
              } else if (typeof copy !== "undefined") {
                setProperty(target, { name, newValue: copy });
              }
            }
          }
        }
      }
      return target;
    };
  }
});

// node_modules/is-plain-obj/index.js
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
var init_is_plain_obj = __esm({
  "node_modules/is-plain-obj/index.js"() {
  }
});

// node_modules/trough/lib/index.js
function trough() {
  const fns = [];
  const pipeline = { run: run13, use };
  return pipeline;
  function run13(...values) {
    let middlewareIndex = -1;
    const callback = values.pop();
    if (typeof callback !== "function") {
      throw new TypeError("Expected function as last argument, not " + callback);
    }
    next(null, ...values);
    function next(error, ...output) {
      const fn = fns[++middlewareIndex];
      let index2 = -1;
      if (error) {
        callback(error);
        return;
      }
      while (++index2 < values.length) {
        if (output[index2] === null || output[index2] === void 0) {
          output[index2] = values[index2];
        }
      }
      values = output;
      if (fn) {
        wrap(fn, next)(...output);
      } else {
        callback(null, ...output);
      }
    }
  }
  function use(middelware) {
    if (typeof middelware !== "function") {
      throw new TypeError(
        "Expected `middelware` to be a function, not " + middelware
      );
    }
    fns.push(middelware);
    return pipeline;
  }
}
function wrap(middleware, callback) {
  let called;
  return wrapped;
  function wrapped(...parameters) {
    const fnExpectsCallback = middleware.length > parameters.length;
    let result;
    if (fnExpectsCallback) {
      parameters.push(done);
    }
    try {
      result = middleware.apply(this, parameters);
    } catch (error) {
      const exception2 = (
        /** @type {Error} */
        error
      );
      if (fnExpectsCallback && called) {
        throw exception2;
      }
      return done(exception2);
    }
    if (!fnExpectsCallback) {
      if (result && result.then && typeof result.then === "function") {
        result.then(then, done);
      } else if (result instanceof Error) {
        done(result);
      } else {
        then(result);
      }
    }
  }
  function done(error, ...output) {
    if (!called) {
      called = true;
      callback(error, ...output);
    }
  }
  function then(value) {
    done(null, value);
  }
}
var init_lib14 = __esm({
  "node_modules/trough/lib/index.js"() {
  }
});

// node_modules/trough/index.js
var init_trough = __esm({
  "node_modules/trough/index.js"() {
    init_lib14();
  }
});

// node_modules/vfile-message/lib/index.js
var VFileMessage;
var init_lib15 = __esm({
  "node_modules/vfile-message/lib/index.js"() {
    init_unist_util_stringify_position();
    VFileMessage = class extends Error {
      /**
       * Create a message for `reason`.
       *
       * > 🪦 **Note**: also has obsolete signatures.
       *
       * @overload
       * @param {string} reason
       * @param {Options | null | undefined} [options]
       * @returns
       *
       * @overload
       * @param {string} reason
       * @param {Node | NodeLike | null | undefined} parent
       * @param {string | null | undefined} [origin]
       * @returns
       *
       * @overload
       * @param {string} reason
       * @param {Point | Position | null | undefined} place
       * @param {string | null | undefined} [origin]
       * @returns
       *
       * @overload
       * @param {string} reason
       * @param {string | null | undefined} [origin]
       * @returns
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {Node | NodeLike | null | undefined} parent
       * @param {string | null | undefined} [origin]
       * @returns
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {Point | Position | null | undefined} place
       * @param {string | null | undefined} [origin]
       * @returns
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {string | null | undefined} [origin]
       * @returns
       *
       * @param {Error | VFileMessage | string} causeOrReason
       *   Reason for message, should use markdown.
       * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
       *   Configuration (optional).
       * @param {string | null | undefined} [origin]
       *   Place in code where the message originates (example:
       *   `'my-package:my-rule'` or `'my-rule'`).
       * @returns
       *   Instance of `VFileMessage`.
       */
      // eslint-disable-next-line complexity
      constructor(causeOrReason, optionsOrParentOrPlace, origin) {
        super();
        if (typeof optionsOrParentOrPlace === "string") {
          origin = optionsOrParentOrPlace;
          optionsOrParentOrPlace = void 0;
        }
        let reason = "";
        let options = {};
        let legacyCause = false;
        if (optionsOrParentOrPlace) {
          if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) {
            options = { place: optionsOrParentOrPlace };
          } else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) {
            options = { place: optionsOrParentOrPlace };
          } else if ("type" in optionsOrParentOrPlace) {
            options = {
              ancestors: [optionsOrParentOrPlace],
              place: optionsOrParentOrPlace.position
            };
          } else {
            options = { ...optionsOrParentOrPlace };
          }
        }
        if (typeof causeOrReason === "string") {
          reason = causeOrReason;
        } else if (!options.cause && causeOrReason) {
          legacyCause = true;
          reason = causeOrReason.message;
          options.cause = causeOrReason;
        }
        if (!options.ruleId && !options.source && typeof origin === "string") {
          const index2 = origin.indexOf(":");
          if (index2 === -1) {
            options.ruleId = origin;
          } else {
            options.source = origin.slice(0, index2);
            options.ruleId = origin.slice(index2 + 1);
          }
        }
        if (!options.place && options.ancestors && options.ancestors) {
          const parent = options.ancestors[options.ancestors.length - 1];
          if (parent) {
            options.place = parent.position;
          }
        }
        const start = options.place && "start" in options.place ? options.place.start : options.place;
        this.ancestors = options.ancestors || void 0;
        this.cause = options.cause || void 0;
        this.column = start ? start.column : void 0;
        this.fatal = void 0;
        this.file;
        this.message = reason;
        this.line = start ? start.line : void 0;
        this.name = stringifyPosition(options.place) || "1:1";
        this.place = options.place || void 0;
        this.reason = this.message;
        this.ruleId = options.ruleId || void 0;
        this.source = options.source || void 0;
        this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
        this.actual;
        this.expected;
        this.note;
        this.url;
      }
    };
    VFileMessage.prototype.file = "";
    VFileMessage.prototype.name = "";
    VFileMessage.prototype.reason = "";
    VFileMessage.prototype.message = "";
    VFileMessage.prototype.stack = "";
    VFileMessage.prototype.column = void 0;
    VFileMessage.prototype.line = void 0;
    VFileMessage.prototype.ancestors = void 0;
    VFileMessage.prototype.cause = void 0;
    VFileMessage.prototype.fatal = void 0;
    VFileMessage.prototype.place = void 0;
    VFileMessage.prototype.ruleId = void 0;
    VFileMessage.prototype.source = void 0;
  }
});

// node_modules/vfile-message/index.js
var init_vfile_message = __esm({
  "node_modules/vfile-message/index.js"() {
    init_lib15();
  }
});

// node_modules/vfile/lib/minpath.js
import { default as default2 } from "node:path";
var init_minpath = __esm({
  "node_modules/vfile/lib/minpath.js"() {
  }
});

// node_modules/vfile/lib/minproc.js
import { default as default3 } from "node:process";
var init_minproc = __esm({
  "node_modules/vfile/lib/minproc.js"() {
  }
});

// node_modules/vfile/lib/minurl.shared.js
function isUrl(fileUrlOrPath) {
  return Boolean(
    fileUrlOrPath !== null && typeof fileUrlOrPath === "object" && "href" in fileUrlOrPath && fileUrlOrPath.href && "protocol" in fileUrlOrPath && fileUrlOrPath.protocol && // @ts-expect-error: indexing is fine.
    fileUrlOrPath.auth === void 0
  );
}
var init_minurl_shared = __esm({
  "node_modules/vfile/lib/minurl.shared.js"() {
  }
});

// node_modules/vfile/lib/minurl.js
import { fileURLToPath } from "node:url";
var init_minurl = __esm({
  "node_modules/vfile/lib/minurl.js"() {
    init_minurl_shared();
  }
});

// node_modules/vfile/lib/index.js
function assertPart(part, name) {
  if (part && part.includes(default2.sep)) {
    throw new Error(
      "`" + name + "` cannot be a path: did not expect `" + default2.sep + "`"
    );
  }
}
function assertNonEmpty(part, name) {
  if (!part) {
    throw new Error("`" + name + "` cannot be empty");
  }
}
function assertPath(path2, name) {
  if (!path2) {
    throw new Error("Setting `" + name + "` requires `path` to be set too");
  }
}
function isUint8Array(value) {
  return Boolean(
    value && typeof value === "object" && "byteLength" in value && "byteOffset" in value
  );
}
var order, VFile;
var init_lib16 = __esm({
  "node_modules/vfile/lib/index.js"() {
    init_vfile_message();
    init_minpath();
    init_minproc();
    init_minurl();
    order = /** @type {const} */
    [
      "history",
      "path",
      "basename",
      "stem",
      "extname",
      "dirname"
    ];
    VFile = class {
      /**
       * Create a new virtual file.
       *
       * `options` is treated as:
       *
       * *   `string` or `Uint8Array` — `{value: options}`
       * *   `URL` — `{path: options}`
       * *   `VFile` — shallow copies its data over to the new file
       * *   `object` — all fields are shallow copied over to the new file
       *
       * Path related fields are set in the following order (least specific to
       * most specific): `history`, `path`, `basename`, `stem`, `extname`,
       * `dirname`.
       *
       * You cannot set `dirname` or `extname` without setting either `history`,
       * `path`, `basename`, or `stem` too.
       *
       * @param {Compatible | null | undefined} [value]
       *   File value.
       * @returns
       *   New instance.
       */
      constructor(value) {
        let options;
        if (!value) {
          options = {};
        } else if (isUrl(value)) {
          options = { path: value };
        } else if (typeof value === "string" || isUint8Array(value)) {
          options = { value };
        } else {
          options = value;
        }
        this.cwd = "cwd" in options ? "" : default3.cwd();
        this.data = {};
        this.history = [];
        this.messages = [];
        this.value;
        this.map;
        this.result;
        this.stored;
        let index2 = -1;
        while (++index2 < order.length) {
          const field2 = order[index2];
          if (field2 in options && options[field2] !== void 0 && options[field2] !== null) {
            this[field2] = field2 === "history" ? [...options[field2]] : options[field2];
          }
        }
        let field;
        for (field in options) {
          if (!order.includes(field)) {
            this[field] = options[field];
          }
        }
      }
      /**
       * Get the basename (including extname) (example: `'index.min.js'`).
       *
       * @returns {string | undefined}
       *   Basename.
       */
      get basename() {
        return typeof this.path === "string" ? default2.basename(this.path) : void 0;
      }
      /**
       * Set basename (including extname) (`'index.min.js'`).
       *
       * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
       * on windows).
       * Cannot be nullified (use `file.path = file.dirname` instead).
       *
       * @param {string} basename
       *   Basename.
       * @returns {undefined}
       *   Nothing.
       */
      set basename(basename) {
        assertNonEmpty(basename, "basename");
        assertPart(basename, "basename");
        this.path = default2.join(this.dirname || "", basename);
      }
      /**
       * Get the parent path (example: `'~'`).
       *
       * @returns {string | undefined}
       *   Dirname.
       */
      get dirname() {
        return typeof this.path === "string" ? default2.dirname(this.path) : void 0;
      }
      /**
       * Set the parent path (example: `'~'`).
       *
       * Cannot be set if there’s no `path` yet.
       *
       * @param {string | undefined} dirname
       *   Dirname.
       * @returns {undefined}
       *   Nothing.
       */
      set dirname(dirname) {
        assertPath(this.basename, "dirname");
        this.path = default2.join(dirname || "", this.basename);
      }
      /**
       * Get the extname (including dot) (example: `'.js'`).
       *
       * @returns {string | undefined}
       *   Extname.
       */
      get extname() {
        return typeof this.path === "string" ? default2.extname(this.path) : void 0;
      }
      /**
       * Set the extname (including dot) (example: `'.js'`).
       *
       * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
       * on windows).
       * Cannot be set if there’s no `path` yet.
       *
       * @param {string | undefined} extname
       *   Extname.
       * @returns {undefined}
       *   Nothing.
       */
      set extname(extname) {
        assertPart(extname, "extname");
        assertPath(this.dirname, "extname");
        if (extname) {
          if (extname.codePointAt(0) !== 46) {
            throw new Error("`extname` must start with `.`");
          }
          if (extname.includes(".", 1)) {
            throw new Error("`extname` cannot contain multiple dots");
          }
        }
        this.path = default2.join(this.dirname, this.stem + (extname || ""));
      }
      /**
       * Get the full path (example: `'~/index.min.js'`).
       *
       * @returns {string}
       *   Path.
       */
      get path() {
        return this.history[this.history.length - 1];
      }
      /**
       * Set the full path (example: `'~/index.min.js'`).
       *
       * Cannot be nullified.
       * You can set a file URL (a `URL` object with a `file:` protocol) which will
       * be turned into a path with `url.fileURLToPath`.
       *
       * @param {URL | string} path
       *   Path.
       * @returns {undefined}
       *   Nothing.
       */
      set path(path2) {
        if (isUrl(path2)) {
          path2 = fileURLToPath(path2);
        }
        assertNonEmpty(path2, "path");
        if (this.path !== path2) {
          this.history.push(path2);
        }
      }
      /**
       * Get the stem (basename w/o extname) (example: `'index.min'`).
       *
       * @returns {string | undefined}
       *   Stem.
       */
      get stem() {
        return typeof this.path === "string" ? default2.basename(this.path, this.extname) : void 0;
      }
      /**
       * Set the stem (basename w/o extname) (example: `'index.min'`).
       *
       * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
       * on windows).
       * Cannot be nullified (use `file.path = file.dirname` instead).
       *
       * @param {string} stem
       *   Stem.
       * @returns {undefined}
       *   Nothing.
       */
      set stem(stem) {
        assertNonEmpty(stem, "stem");
        assertPart(stem, "stem");
        this.path = default2.join(this.dirname || "", stem + (this.extname || ""));
      }
      // Normal prototypal methods.
      /**
       * Create a fatal message for `reason` associated with the file.
       *
       * The `fatal` field of the message is set to `true` (error; file not usable)
       * and the `file` field is set to the current file path.
       * The message is added to the `messages` field on `file`.
       *
       * > 🪦 **Note**: also has obsolete signatures.
       *
       * @overload
       * @param {string} reason
       * @param {MessageOptions | null | undefined} [options]
       * @returns {never}
       *
       * @overload
       * @param {string} reason
       * @param {Node | NodeLike | null | undefined} parent
       * @param {string | null | undefined} [origin]
       * @returns {never}
       *
       * @overload
       * @param {string} reason
       * @param {Point | Position | null | undefined} place
       * @param {string | null | undefined} [origin]
       * @returns {never}
       *
       * @overload
       * @param {string} reason
       * @param {string | null | undefined} [origin]
       * @returns {never}
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {Node | NodeLike | null | undefined} parent
       * @param {string | null | undefined} [origin]
       * @returns {never}
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {Point | Position | null | undefined} place
       * @param {string | null | undefined} [origin]
       * @returns {never}
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {string | null | undefined} [origin]
       * @returns {never}
       *
       * @param {Error | VFileMessage | string} causeOrReason
       *   Reason for message, should use markdown.
       * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
       *   Configuration (optional).
       * @param {string | null | undefined} [origin]
       *   Place in code where the message originates (example:
       *   `'my-package:my-rule'` or `'my-rule'`).
       * @returns {never}
       *   Never.
       * @throws {VFileMessage}
       *   Message.
       */
      fail(causeOrReason, optionsOrParentOrPlace, origin) {
        const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
        message.fatal = true;
        throw message;
      }
      /**
       * Create an info message for `reason` associated with the file.
       *
       * The `fatal` field of the message is set to `undefined` (info; change
       * likely not needed) and the `file` field is set to the current file path.
       * The message is added to the `messages` field on `file`.
       *
       * > 🪦 **Note**: also has obsolete signatures.
       *
       * @overload
       * @param {string} reason
       * @param {MessageOptions | null | undefined} [options]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {string} reason
       * @param {Node | NodeLike | null | undefined} parent
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {string} reason
       * @param {Point | Position | null | undefined} place
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {string} reason
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {Node | NodeLike | null | undefined} parent
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {Point | Position | null | undefined} place
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @param {Error | VFileMessage | string} causeOrReason
       *   Reason for message, should use markdown.
       * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
       *   Configuration (optional).
       * @param {string | null | undefined} [origin]
       *   Place in code where the message originates (example:
       *   `'my-package:my-rule'` or `'my-rule'`).
       * @returns {VFileMessage}
       *   Message.
       */
      info(causeOrReason, optionsOrParentOrPlace, origin) {
        const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
        message.fatal = void 0;
        return message;
      }
      /**
       * Create a message for `reason` associated with the file.
       *
       * The `fatal` field of the message is set to `false` (warning; change may be
       * needed) and the `file` field is set to the current file path.
       * The message is added to the `messages` field on `file`.
       *
       * > 🪦 **Note**: also has obsolete signatures.
       *
       * @overload
       * @param {string} reason
       * @param {MessageOptions | null | undefined} [options]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {string} reason
       * @param {Node | NodeLike | null | undefined} parent
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {string} reason
       * @param {Point | Position | null | undefined} place
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {string} reason
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {Node | NodeLike | null | undefined} parent
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {Point | Position | null | undefined} place
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @overload
       * @param {Error | VFileMessage} cause
       * @param {string | null | undefined} [origin]
       * @returns {VFileMessage}
       *
       * @param {Error | VFileMessage | string} causeOrReason
       *   Reason for message, should use markdown.
       * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
       *   Configuration (optional).
       * @param {string | null | undefined} [origin]
       *   Place in code where the message originates (example:
       *   `'my-package:my-rule'` or `'my-rule'`).
       * @returns {VFileMessage}
       *   Message.
       */
      message(causeOrReason, optionsOrParentOrPlace, origin) {
        const message = new VFileMessage(
          // @ts-expect-error: the overloads are fine.
          causeOrReason,
          optionsOrParentOrPlace,
          origin
        );
        if (this.path) {
          message.name = this.path + ":" + message.name;
          message.file = this.path;
        }
        message.fatal = false;
        this.messages.push(message);
        return message;
      }
      /**
       * Serialize the file.
       *
       * > **Note**: which encodings are supported depends on the engine.
       * > For info on Node.js, see:
       * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
       *
       * @param {string | null | undefined} [encoding='utf8']
       *   Character encoding to understand `value` as when it’s a `Uint8Array`
       *   (default: `'utf-8'`).
       * @returns {string}
       *   Serialized file.
       */
      toString(encoding) {
        if (this.value === void 0) {
          return "";
        }
        if (typeof this.value === "string") {
          return this.value;
        }
        const decoder = new TextDecoder(encoding || void 0);
        return decoder.decode(this.value);
      }
    };
  }
});

// node_modules/vfile/index.js
var init_vfile = __esm({
  "node_modules/vfile/index.js"() {
    init_lib16();
  }
});

// node_modules/unified/lib/callable-instance.js
var CallableInstance;
var init_callable_instance = __esm({
  "node_modules/unified/lib/callable-instance.js"() {
    CallableInstance = /**
     * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
     */
    /** @type {unknown} */
    /**
     * @this {Function}
     * @param {string | symbol} property
     * @returns {(...parameters: Array<unknown>) => unknown}
     */
    function(property) {
      const self = this;
      const constr = self.constructor;
      const proto = (
        /** @type {Record<string | symbol, Function>} */
        // Prototypes do exist.
        // type-coverage:ignore-next-line
        constr.prototype
      );
      const value = proto[property];
      const apply = function() {
        return value.apply(apply, arguments);
      };
      Object.setPrototypeOf(apply, proto);
      return apply;
    };
  }
});

// node_modules/unified/lib/index.js
function assertParser(name, value) {
  if (typeof value !== "function") {
    throw new TypeError("Cannot `" + name + "` without `parser`");
  }
}
function assertCompiler(name, value) {
  if (typeof value !== "function") {
    throw new TypeError("Cannot `" + name + "` without `compiler`");
  }
}
function assertUnfrozen(name, frozen) {
  if (frozen) {
    throw new Error(
      "Cannot call `" + name + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
  }
}
function assertNode(node2) {
  if (!isPlainObject(node2) || typeof node2.type !== "string") {
    throw new TypeError("Expected node, got `" + node2 + "`");
  }
}
function assertDone(name, asyncName, complete) {
  if (!complete) {
    throw new Error(
      "`" + name + "` finished async. Use `" + asyncName + "` instead"
    );
  }
}
function vfile(value) {
  return looksLikeAVFile(value) ? value : new VFile(value);
}
function looksLikeAVFile(value) {
  return Boolean(
    value && typeof value === "object" && "message" in value && "messages" in value
  );
}
function looksLikeAValue(value) {
  return typeof value === "string" || isUint8Array2(value);
}
function isUint8Array2(value) {
  return Boolean(
    value && typeof value === "object" && "byteLength" in value && "byteOffset" in value
  );
}
var import_extend, own3, Processor, unified;
var init_lib17 = __esm({
  "node_modules/unified/lib/index.js"() {
    init_bail();
    import_extend = __toESM(require_extend(), 1);
    init_default();
    init_is_plain_obj();
    init_trough();
    init_vfile();
    init_callable_instance();
    own3 = {}.hasOwnProperty;
    Processor = class _Processor extends CallableInstance {
      /**
       * Create a processor.
       */
      constructor() {
        super("copy");
        this.Compiler = void 0;
        this.Parser = void 0;
        this.attachers = [];
        this.compiler = void 0;
        this.freezeIndex = -1;
        this.frozen = void 0;
        this.namespace = {};
        this.parser = void 0;
        this.transformers = trough();
      }
      /**
       * Copy a processor.
       *
       * @deprecated
       *   This is a private internal method and should not be used.
       * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
       *   New *unfrozen* processor ({@linkcode Processor}) that is
       *   configured to work the same as its ancestor.
       *   When the descendant processor is configured in the future it does not
       *   affect the ancestral processor.
       */
      copy() {
        const destination = (
          /** @type {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>} */
          new _Processor()
        );
        let index2 = -1;
        while (++index2 < this.attachers.length) {
          const attacher = this.attachers[index2];
          destination.use(...attacher);
        }
        destination.data((0, import_extend.default)(true, {}, this.namespace));
        return destination;
      }
      /**
       * Configure the processor with info available to all plugins.
       * Information is stored in an object.
       *
       * Typically, options can be given to a specific plugin, but sometimes it
       * makes sense to have information shared with several plugins.
       * For example, a list of HTML elements that are self-closing, which is
       * needed during all phases.
       *
       * > **Note**: setting information cannot occur on *frozen* processors.
       * > Call the processor first to create a new unfrozen processor.
       *
       * > **Note**: to register custom data in TypeScript, augment the
       * > {@linkcode Data} interface.
       *
       * @example
       *   This example show how to get and set info:
       *
       *   ```js
       *   import {unified} from 'unified'
       *
       *   const processor = unified().data('alpha', 'bravo')
       *
       *   processor.data('alpha') // => 'bravo'
       *
       *   processor.data() // => {alpha: 'bravo'}
       *
       *   processor.data({charlie: 'delta'})
       *
       *   processor.data() // => {charlie: 'delta'}
       *   ```
       *
       * @template {keyof Data} Key
       *
       * @overload
       * @returns {Data}
       *
       * @overload
       * @param {Data} dataset
       * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
       *
       * @overload
       * @param {Key} key
       * @returns {Data[Key]}
       *
       * @overload
       * @param {Key} key
       * @param {Data[Key]} value
       * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
       *
       * @param {Data | Key} [key]
       *   Key to get or set, or entire dataset to set, or nothing to get the
       *   entire dataset (optional).
       * @param {Data[Key]} [value]
       *   Value to set (optional).
       * @returns {unknown}
       *   The current processor when setting, the value at `key` when getting, or
       *   the entire dataset when getting without key.
       */
      data(key, value) {
        if (typeof key === "string") {
          if (arguments.length === 2) {
            assertUnfrozen("data", this.frozen);
            this.namespace[key] = value;
            return this;
          }
          return own3.call(this.namespace, key) && this.namespace[key] || void 0;
        }
        if (key) {
          assertUnfrozen("data", this.frozen);
          this.namespace = key;
          return this;
        }
        return this.namespace;
      }
      /**
       * Freeze a processor.
       *
       * Frozen processors are meant to be extended and not to be configured
       * directly.
       *
       * When a processor is frozen it cannot be unfrozen.
       * New processors working the same way can be created by calling the
       * processor.
       *
       * It’s possible to freeze processors explicitly by calling `.freeze()`.
       * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
       * `.stringify()`, `.process()`, or `.processSync()` are called.
       *
       * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
       *   The current processor.
       */
      freeze() {
        if (this.frozen) {
          return this;
        }
        const self = (
          /** @type {Processor} */
          /** @type {unknown} */
          this
        );
        while (++this.freezeIndex < this.attachers.length) {
          const [attacher, ...options] = this.attachers[this.freezeIndex];
          if (options[0] === false) {
            continue;
          }
          if (options[0] === true) {
            options[0] = void 0;
          }
          const transformer = attacher.call(self, ...options);
          if (typeof transformer === "function") {
            this.transformers.use(transformer);
          }
        }
        this.frozen = true;
        this.freezeIndex = Number.POSITIVE_INFINITY;
        return this;
      }
      /**
       * Parse text to a syntax tree.
       *
       * > **Note**: `parse` freezes the processor if not already *frozen*.
       *
       * > **Note**: `parse` performs the parse phase, not the run phase or other
       * > phases.
       *
       * @param {Compatible | undefined} [file]
       *   file to parse (optional); typically `string` or `VFile`; any value
       *   accepted as `x` in `new VFile(x)`.
       * @returns {ParseTree extends undefined ? Node : ParseTree}
       *   Syntax tree representing `file`.
       */
      parse(file) {
        this.freeze();
        const realFile = vfile(file);
        const parser = this.parser || this.Parser;
        assertParser("parse", parser);
        return parser(String(realFile), realFile);
      }
      /**
       * Process the given file as configured on the processor.
       *
       * > **Note**: `process` freezes the processor if not already *frozen*.
       *
       * > **Note**: `process` performs the parse, run, and stringify phases.
       *
       * @overload
       * @param {Compatible | undefined} file
       * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
       * @returns {undefined}
       *
       * @overload
       * @param {Compatible | undefined} [file]
       * @returns {Promise<VFileWithOutput<CompileResult>>}
       *
       * @param {Compatible | undefined} [file]
       *   File (optional); typically `string` or `VFile`]; any value accepted as
       *   `x` in `new VFile(x)`.
       * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
       *   Callback (optional).
       * @returns {Promise<VFile> | undefined}
       *   Nothing if `done` is given.
       *   Otherwise a promise, rejected with a fatal error or resolved with the
       *   processed file.
       *
       *   The parsed, transformed, and compiled value is available at
       *   `file.value` (see note).
       *
       *   > **Note**: unified typically compiles by serializing: most
       *   > compilers return `string` (or `Uint8Array`).
       *   > Some compilers, such as the one configured with
       *   > [`rehype-react`][rehype-react], return other values (in this case, a
       *   > React tree).
       *   > If you’re using a compiler that doesn’t serialize, expect different
       *   > result values.
       *   >
       *   > To register custom results in TypeScript, add them to
       *   > {@linkcode CompileResultMap}.
       *
       *   [rehype-react]: https://github.com/rehypejs/rehype-react
       */
      process(file, done) {
        const self = this;
        this.freeze();
        assertParser("process", this.parser || this.Parser);
        assertCompiler("process", this.compiler || this.Compiler);
        return done ? executor(void 0, done) : new Promise(executor);
        function executor(resolve, reject) {
          const realFile = vfile(file);
          const parseTree = (
            /** @type {HeadTree extends undefined ? Node : HeadTree} */
            /** @type {unknown} */
            self.parse(realFile)
          );
          self.run(parseTree, realFile, function(error, tree, file2) {
            if (error || !tree || !file2) {
              return realDone(error);
            }
            const compileTree = (
              /** @type {CompileTree extends undefined ? Node : CompileTree} */
              /** @type {unknown} */
              tree
            );
            const compileResult = self.stringify(compileTree, file2);
            if (looksLikeAValue(compileResult)) {
              file2.value = compileResult;
            } else {
              file2.result = compileResult;
            }
            realDone(
              error,
              /** @type {VFileWithOutput<CompileResult>} */
              file2
            );
          });
          function realDone(error, file2) {
            if (error || !file2) {
              reject(error);
            } else if (resolve) {
              resolve(file2);
            } else {
              ok(done, "`done` is defined if `resolve` is not");
              done(void 0, file2);
            }
          }
        }
      }
      /**
       * Process the given file as configured on the processor.
       *
       * An error is thrown if asynchronous transforms are configured.
       *
       * > **Note**: `processSync` freezes the processor if not already *frozen*.
       *
       * > **Note**: `processSync` performs the parse, run, and stringify phases.
       *
       * @param {Compatible | undefined} [file]
       *   File (optional); typically `string` or `VFile`; any value accepted as
       *   `x` in `new VFile(x)`.
       * @returns {VFileWithOutput<CompileResult>}
       *   The processed file.
       *
       *   The parsed, transformed, and compiled value is available at
       *   `file.value` (see note).
       *
       *   > **Note**: unified typically compiles by serializing: most
       *   > compilers return `string` (or `Uint8Array`).
       *   > Some compilers, such as the one configured with
       *   > [`rehype-react`][rehype-react], return other values (in this case, a
       *   > React tree).
       *   > If you’re using a compiler that doesn’t serialize, expect different
       *   > result values.
       *   >
       *   > To register custom results in TypeScript, add them to
       *   > {@linkcode CompileResultMap}.
       *
       *   [rehype-react]: https://github.com/rehypejs/rehype-react
       */
      processSync(file) {
        let complete = false;
        let result;
        this.freeze();
        assertParser("processSync", this.parser || this.Parser);
        assertCompiler("processSync", this.compiler || this.Compiler);
        this.process(file, realDone);
        assertDone("processSync", "process", complete);
        ok(result, "we either bailed on an error or have a tree");
        return result;
        function realDone(error, file2) {
          complete = true;
          bail(error);
          result = file2;
        }
      }
      /**
       * Run *transformers* on a syntax tree.
       *
       * > **Note**: `run` freezes the processor if not already *frozen*.
       *
       * > **Note**: `run` performs the run phase, not other phases.
       *
       * @overload
       * @param {HeadTree extends undefined ? Node : HeadTree} tree
       * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
       * @returns {undefined}
       *
       * @overload
       * @param {HeadTree extends undefined ? Node : HeadTree} tree
       * @param {Compatible | undefined} file
       * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
       * @returns {undefined}
       *
       * @overload
       * @param {HeadTree extends undefined ? Node : HeadTree} tree
       * @param {Compatible | undefined} [file]
       * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
       *
       * @param {HeadTree extends undefined ? Node : HeadTree} tree
       *   Tree to transform and inspect.
       * @param {(
       *   RunCallback<TailTree extends undefined ? Node : TailTree> |
       *   Compatible
       * )} [file]
       *   File associated with `node` (optional); any value accepted as `x` in
       *   `new VFile(x)`.
       * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
       *   Callback (optional).
       * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
       *   Nothing if `done` is given.
       *   Otherwise, a promise rejected with a fatal error or resolved with the
       *   transformed tree.
       */
      run(tree, file, done) {
        assertNode(tree);
        this.freeze();
        const transformers = this.transformers;
        if (!done && typeof file === "function") {
          done = file;
          file = void 0;
        }
        return done ? executor(void 0, done) : new Promise(executor);
        function executor(resolve, reject) {
          ok(
            typeof file !== "function",
            "`file` can\u2019t be a `done` anymore, we checked"
          );
          const realFile = vfile(file);
          transformers.run(tree, realFile, realDone);
          function realDone(error, outputTree, file2) {
            const resultingTree = (
              /** @type {TailTree extends undefined ? Node : TailTree} */
              outputTree || tree
            );
            if (error) {
              reject(error);
            } else if (resolve) {
              resolve(resultingTree);
            } else {
              ok(done, "`done` is defined if `resolve` is not");
              done(void 0, resultingTree, file2);
            }
          }
        }
      }
      /**
       * Run *transformers* on a syntax tree.
       *
       * An error is thrown if asynchronous transforms are configured.
       *
       * > **Note**: `runSync` freezes the processor if not already *frozen*.
       *
       * > **Note**: `runSync` performs the run phase, not other phases.
       *
       * @param {HeadTree extends undefined ? Node : HeadTree} tree
       *   Tree to transform and inspect.
       * @param {Compatible | undefined} [file]
       *   File associated with `node` (optional); any value accepted as `x` in
       *   `new VFile(x)`.
       * @returns {TailTree extends undefined ? Node : TailTree}
       *   Transformed tree.
       */
      runSync(tree, file) {
        let complete = false;
        let result;
        this.run(tree, file, realDone);
        assertDone("runSync", "run", complete);
        ok(result, "we either bailed on an error or have a tree");
        return result;
        function realDone(error, tree2) {
          bail(error);
          result = tree2;
          complete = true;
        }
      }
      /**
       * Compile a syntax tree.
       *
       * > **Note**: `stringify` freezes the processor if not already *frozen*.
       *
       * > **Note**: `stringify` performs the stringify phase, not the run phase
       * > or other phases.
       *
       * @param {CompileTree extends undefined ? Node : CompileTree} tree
       *   Tree to compile.
       * @param {Compatible | undefined} [file]
       *   File associated with `node` (optional); any value accepted as `x` in
       *   `new VFile(x)`.
       * @returns {CompileResult extends undefined ? Value : CompileResult}
       *   Textual representation of the tree (see note).
       *
       *   > **Note**: unified typically compiles by serializing: most compilers
       *   > return `string` (or `Uint8Array`).
       *   > Some compilers, such as the one configured with
       *   > [`rehype-react`][rehype-react], return other values (in this case, a
       *   > React tree).
       *   > If you’re using a compiler that doesn’t serialize, expect different
       *   > result values.
       *   >
       *   > To register custom results in TypeScript, add them to
       *   > {@linkcode CompileResultMap}.
       *
       *   [rehype-react]: https://github.com/rehypejs/rehype-react
       */
      stringify(tree, file) {
        this.freeze();
        const realFile = vfile(file);
        const compiler3 = this.compiler || this.Compiler;
        assertCompiler("stringify", compiler3);
        assertNode(tree);
        return compiler3(tree, realFile);
      }
      /**
       * Configure the processor to use a plugin, a list of usable values, or a
       * preset.
       *
       * If the processor is already using a plugin, the previous plugin
       * configuration is changed based on the options that are passed in.
       * In other words, the plugin is not added a second time.
       *
       * > **Note**: `use` cannot be called on *frozen* processors.
       * > Call the processor first to create a new unfrozen processor.
       *
       * @example
       *   There are many ways to pass plugins to `.use()`.
       *   This example gives an overview:
       *
       *   ```js
       *   import {unified} from 'unified'
       *
       *   unified()
       *     // Plugin with options:
       *     .use(pluginA, {x: true, y: true})
       *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
       *     .use(pluginA, {y: false, z: true})
       *     // Plugins:
       *     .use([pluginB, pluginC])
       *     // Two plugins, the second with options:
       *     .use([pluginD, [pluginE, {}]])
       *     // Preset with plugins and settings:
       *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
       *     // Settings only:
       *     .use({settings: {position: false}})
       *   ```
       *
       * @template {Array<unknown>} [Parameters=[]]
       * @template {Node | string | undefined} [Input=undefined]
       * @template [Output=Input]
       *
       * @overload
       * @param {Preset | null | undefined} [preset]
       * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
       *
       * @overload
       * @param {PluggableList} list
       * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
       *
       * @overload
       * @param {Plugin<Parameters, Input, Output>} plugin
       * @param {...(Parameters | [boolean])} parameters
       * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
       *
       * @param {PluggableList | Plugin | Preset | null | undefined} value
       *   Usable value.
       * @param {...unknown} parameters
       *   Parameters, when a plugin is given as a usable value.
       * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
       *   Current processor.
       */
      use(value, ...parameters) {
        const attachers = this.attachers;
        const namespace = this.namespace;
        assertUnfrozen("use", this.frozen);
        if (value === null || value === void 0) {
        } else if (typeof value === "function") {
          addPlugin(value, parameters);
        } else if (typeof value === "object") {
          if (Array.isArray(value)) {
            addList(value);
          } else {
            addPreset(value);
          }
        } else {
          throw new TypeError("Expected usable value, not `" + value + "`");
        }
        return this;
        function add2(value2) {
          if (typeof value2 === "function") {
            addPlugin(value2, []);
          } else if (typeof value2 === "object") {
            if (Array.isArray(value2)) {
              const [plugin, ...parameters2] = (
                /** @type {PluginTuple<Array<unknown>>} */
                value2
              );
              addPlugin(plugin, parameters2);
            } else {
              addPreset(value2);
            }
          } else {
            throw new TypeError("Expected usable value, not `" + value2 + "`");
          }
        }
        function addPreset(result) {
          if (!("plugins" in result) && !("settings" in result)) {
            throw new Error(
              "Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither"
            );
          }
          addList(result.plugins);
          if (result.settings) {
            namespace.settings = (0, import_extend.default)(true, namespace.settings, result.settings);
          }
        }
        function addList(plugins) {
          let index2 = -1;
          if (plugins === null || plugins === void 0) {
          } else if (Array.isArray(plugins)) {
            while (++index2 < plugins.length) {
              const thing = plugins[index2];
              add2(thing);
            }
          } else {
            throw new TypeError("Expected a list of plugins, not `" + plugins + "`");
          }
        }
        function addPlugin(plugin, parameters2) {
          let index2 = -1;
          let entryIndex = -1;
          while (++index2 < attachers.length) {
            if (attachers[index2][0] === plugin) {
              entryIndex = index2;
              break;
            }
          }
          if (entryIndex === -1) {
            attachers.push([plugin, ...parameters2]);
          } else if (parameters2.length > 0) {
            let [primary, ...rest] = parameters2;
            const currentPrimary = attachers[entryIndex][1];
            if (isPlainObject(currentPrimary) && isPlainObject(primary)) {
              primary = (0, import_extend.default)(true, currentPrimary, primary);
            }
            attachers[entryIndex] = [plugin, primary, ...rest];
          }
        }
      }
    };
    unified = new Processor().freeze();
  }
});

// node_modules/unified/index.js
var init_unified = __esm({
  "node_modules/unified/index.js"() {
    init_lib17();
  }
});

// node_modules/nlcst-to-string/lib/index.js
function toString3(value) {
  let index2 = -1;
  if (!value || !Array.isArray(value) && !value.type) {
    throw new Error("Expected node, not `" + value + "`");
  }
  if ("value" in value) return value.value;
  const children = (Array.isArray(value) ? value : value.children) || emptyNodes;
  const values = [];
  while (++index2 < children.length) {
    values[index2] = toString3(children[index2]);
  }
  return values.join("");
}
var emptyNodes;
var init_lib18 = __esm({
  "node_modules/nlcst-to-string/lib/index.js"() {
    emptyNodes = [];
  }
});

// node_modules/nlcst-to-string/index.js
var init_nlcst_to_string = __esm({
  "node_modules/nlcst-to-string/index.js"() {
    init_lib18();
  }
});

// node_modules/array-iterate/lib/index.js
function arrayIterate(values, callbackFn, thisArg) {
  let index2 = -1;
  if (!values) {
    throw new Error("Iterate requires that |this| not be " + values);
  }
  if (!own4.call(values, "length")) {
    throw new Error("Iterate requires that |this| has a `length`");
  }
  if (typeof callbackFn !== "function") {
    throw new TypeError("`callback` must be a function");
  }
  while (++index2 < values.length) {
    if (!(index2 in values)) {
      continue;
    }
    const result = callbackFn.call(thisArg, values[index2], index2, values);
    if (typeof result === "number") {
      if (result < 0) {
        index2 = 0;
      }
      index2 = result - 1;
    }
  }
}
var own4;
var init_lib19 = __esm({
  "node_modules/array-iterate/lib/index.js"() {
    own4 = {}.hasOwnProperty;
  }
});

// node_modules/array-iterate/index.js
var init_array_iterate = __esm({
  "node_modules/array-iterate/index.js"() {
    init_lib19();
  }
});

// node_modules/unist-util-modify-children/lib/index.js
function modifyChildren(modifier) {
  return modify;
  function modify(parent) {
    if (!parent || !parent.children) {
      throw new Error("Missing children in `parent` for `modifier`");
    }
    arrayIterate(parent.children, iteratee, parent);
  }
  function iteratee(node2, index2) {
    return modifier(node2, index2, this);
  }
}
var init_lib20 = __esm({
  "node_modules/unist-util-modify-children/lib/index.js"() {
    init_array_iterate();
  }
});

// node_modules/unist-util-modify-children/index.js
var init_unist_util_modify_children = __esm({
  "node_modules/unist-util-modify-children/index.js"() {
    init_lib20();
  }
});

// node_modules/parse-latin/lib/plugin/merge-affix-exceptions.js
var mergeAffixExceptions;
var init_merge_affix_exceptions = __esm({
  "node_modules/parse-latin/lib/plugin/merge-affix-exceptions.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    mergeAffixExceptions = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Paragraph>}
       */
      function(child, index2, parent) {
        const previous3 = parent.children[index2 - 1];
        if (previous3 && "children" in previous3 && "children" in child && child.children.length > 0) {
          let position3 = -1;
          while (child.children[++position3]) {
            const node2 = child.children[position3];
            if (node2.type === "WordNode") {
              return;
            }
            if (node2.type === "SymbolNode" || node2.type === "PunctuationNode") {
              const value = toString3(node2);
              if (value !== "," && value !== ";") {
                return;
              }
              previous3.children.push(...child.children);
              if (previous3.position && child.position) {
                previous3.position.end = child.position.end;
              }
              parent.children.splice(index2, 1);
              return index2;
            }
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/expressions.js
var affixSymbol, newLine, terminalMarker, wordSymbolInner, numerical, digitStart, lowerInitial, surrogates, punctuation, word, whiteSpace;
var init_expressions = __esm({
  "node_modules/parse-latin/lib/expressions.js"() {
    affixSymbol = /^([!"').?\u0F3B\u0F3D\u169C\u2019\u201D\u2026\u203A\u203D\u2046\u207E\u208E\u2309\u230B\u232A\u2769\u276B\u276D\u276F\u2771\u2773\u2775\u27C6\u27E7\u27E9\u27EB\u27ED\u27EF\u2984\u2986\u2988\u298A\u298C\u298E\u2990\u2992\u2994\u2996\u2998\u29D9\u29DB\u29FD\u2E03\u2E05\u2E0A\u2E0D\u2E1D\u2E21\u2E23\u2E25\u2E27\u2E29\u2E56\u2E58\u2E5A\u2E5C\u3009\u300B\u300D\u300F\u3011\u3015\u3017\u3019\u301B\u301E\u301F\uFD3E\uFE18\uFE36\uFE38\uFE3A\uFE3C\uFE3E\uFE40\uFE42\uFE44\uFE48\uFE5A\uFE5C\uFE5E\uFF09\uFF3D\uFF5D\uFF60\uFF63\u00BB\]}])\1*$/;
    newLine = /^[ \t]*((\r?\n|\r)[\t ]*)+$/;
    terminalMarker = /^([!.?\u2026\u203D]+)$/;
    wordSymbolInner = /^([&'\-.:=?@\u00AD\u00B7\u2010\u2011\u2019\u2027]|_+)$/;
    numerical = /^(?:[\d\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D58-\u0D5E\u0D66-\u0D78\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]|\uD800[\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDEE1-\uDEFB\uDF20-\uDF23\uDF41\uDF4A\uDFD1-\uDFD5]|\uD801[\uDCA0-\uDCA9]|\uD802[\uDC58-\uDC5F\uDC79-\uDC7F\uDCA7-\uDCAF\uDCFB-\uDCFF\uDD16-\uDD1B\uDDBC\uDDBD\uDDC0-\uDDCF\uDDD2-\uDDFF\uDE40-\uDE48\uDE7D\uDE7E\uDE9D-\uDE9F\uDEEB-\uDEEF\uDF58-\uDF5F\uDF78-\uDF7F\uDFA9-\uDFAF]|\uD803[\uDCFA-\uDCFF\uDD30-\uDD39\uDE60-\uDE7E\uDF1D-\uDF26\uDF51-\uDF54\uDFC5-\uDFCB]|\uD804[\uDC52-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDDE1-\uDDF4\uDEF0-\uDEF9]|\uD805[\uDC50-\uDC59\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF3B]|\uD806[\uDCE0-\uDCF2\uDD50-\uDD59]|\uD807[\uDC50-\uDC6C\uDD50-\uDD59\uDDA0-\uDDA9\uDF50-\uDF59\uDFC0-\uDFD4]|\uD809[\uDC00-\uDC6E]|\uD81A[\uDE60-\uDE69\uDEC0-\uDEC9\uDF50-\uDF59\uDF5B-\uDF61]|\uD81B[\uDE80-\uDE96]|\uD834[\uDEC0-\uDED3\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDFCE-\uDFFF]|\uD838[\uDD40-\uDD49\uDEF0-\uDEF9]|\uD839[\uDCF0-\uDCF9]|\uD83A[\uDCC7-\uDCCF\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9])+$/;
    digitStart = /^\d/;
    lowerInitial = /^(?:[a-z\u00B5\u00DF-\u00F6\u00F8-\u00FF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5F\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7BB\uA7BD\uA7BF\uA7C1\uA7C3\uA7C8\uA7CA\uA7D1\uA7D3\uA7D5\uA7D7\uA7D9\uA7F6\uA7FA\uAB30-\uAB5A\uAB60-\uAB68\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]|\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD837[\uDF00-\uDF09\uDF0B-\uDF1E\uDF25-\uDF2A]|\uD83A[\uDD22-\uDD43])/;
    surrogates = /[\uD800-\uDFFF]/;
    punctuation = /[!"'-),-/:;?[-\]_{}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u201F\u2022-\u2027\u2032-\u203A\u203C-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;
    word = /[\dA-Za-z\u00AA\u00B2\u00B3\u00B5\u00B9\u00BA\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u052F\u0531-\u0556\u0559\u0560-\u0588\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05EF-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u07FD\u0800-\u082D\u0840-\u085B\u0860-\u086A\u0870-\u0887\u0889-\u088E\u0898-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09F4-\u09F9\u09FC\u09FE\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71-\u0B77\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BF2\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3C-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C5D\u0C60-\u0C63\u0C66-\u0C6F\u0C78-\u0C7E\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDD\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1-\u0CF3\u0D00-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D63\u0D66-\u0D78\u0D7A-\u0D7F\u0D81-\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECE\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F33\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1715\u171F-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u17F0-\u17F9\u180B-\u180D\u180F-\u1819\u1820-\u1878\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ACE\u1B00-\u1B4C\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CD0-\u1CD2\u1CD4-\u1CFA\u1D00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u20D0-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2CE4\u2CEB-\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA672\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA827\uA82C\uA830-\uA835\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE38-\uDE3A\uDE3F-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE6\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD27\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEAB\uDEAC\uDEB0\uDEB1\uDEFD-\uDF27\uDF30-\uDF54\uDF70-\uDF85\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC00-\uDC46\uDC52-\uDC75\uDC7F-\uDCBA\uDCC2\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD44-\uDD47\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDC9-\uDDCC\uDDCE-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE37\uDE3E-\uDE41\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3B-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC5E-\uDC61\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF1D-\uDF2B\uDF30-\uDF3B\uDF40-\uDF46]|\uD806[\uDC00-\uDC3A\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD35\uDD37\uDD38\uDD3B-\uDD43\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDE1\uDDE3\uDDE4\uDE00-\uDE3E\uDE47\uDE50-\uDE99\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF6\uDF00-\uDF10\uDF12-\uDF3A\uDF3E-\uDF42\uDF50-\uDF59\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC40-\uDC55]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE70-\uDEBE\uDEC0-\uDEC9\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F\uDFE0\uDFE1\uDFE3\uDFE4\uDFF0\uDFF1]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD833[\uDF00-\uDF2D\uDF30-\uDF46]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44\uDEC0-\uDED3\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDC30-\uDC6D\uDC8F\uDD00-\uDD2C\uDD30-\uDD3D\uDD40-\uDD49\uDD4E\uDE90-\uDEAE\uDEC0-\uDEF9]|\uD839[\uDCD0-\uDCF9\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCD6\uDD00-\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF]|\uDB40[\uDD00-\uDDEF]/;
    whiteSpace = /[\t-\r \u0085\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
  }
});

// node_modules/parse-latin/lib/plugin/merge-affix-symbol.js
var mergeAffixSymbol;
var init_merge_affix_symbol = __esm({
  "node_modules/parse-latin/lib/plugin/merge-affix-symbol.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    init_expressions();
    mergeAffixSymbol = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Paragraph>}
       */
      function(child, index2, parent) {
        if ("children" in child && child.children.length > 0 && index2 > 0) {
          const previous3 = parent.children[index2 - 1];
          const first = child.children[0];
          const second = child.children[1];
          if (previous3 && previous3.type === "SentenceNode" && (first.type === "SymbolNode" || first.type === "PunctuationNode") && affixSymbol.test(toString3(first))) {
            child.children.shift();
            previous3.children.push(first);
            if (first.position && previous3.position) {
              previous3.position.end = first.position.end;
            }
            if (second && second.position && child.position) {
              child.position.start = second.position.start;
            }
            return index2 - 1;
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/break-implicit-sentences.js
var breakImplicitSentences;
var init_break_implicit_sentences = __esm({
  "node_modules/parse-latin/lib/plugin/break-implicit-sentences.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    breakImplicitSentences = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Paragraph>}
       */
      function(child, index2, parent) {
        if (child.type !== "SentenceNode") {
          return;
        }
        const children = child.children;
        let position3 = 0;
        while (++position3 < children.length - 1) {
          const node2 = children[position3];
          if (node2.type !== "WhiteSpaceNode" || toString3(node2).split(/\r\n|\r|\n/).length < 3) {
            continue;
          }
          child.children = children.slice(0, position3);
          const insertion = {
            type: "SentenceNode",
            children: children.slice(position3 + 1)
          };
          const tail = children[position3 - 1];
          const head = children[position3 + 1];
          parent.children.splice(index2 + 1, 0, node2, insertion);
          if (child.position && tail.position && head.position) {
            const end = child.position.end;
            child.position.end = tail.position.end;
            insertion.position = { start: head.position.start, end };
          }
          return index2 + 1;
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/make-final-white-space-siblings.js
var makeFinalWhiteSpaceSiblings;
var init_make_final_white_space_siblings = __esm({
  "node_modules/parse-latin/lib/plugin/make-final-white-space-siblings.js"() {
    init_unist_util_modify_children();
    makeFinalWhiteSpaceSiblings = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Paragraph | Root>}
       */
      function(child, index2, parent) {
        if ("children" in child) {
          const tail = child.children[child.children.length - 1];
          if (tail && tail.type === "WhiteSpaceNode") {
            child.children.pop();
            parent.children.splice(index2 + 1, 0, tail);
            const previous3 = child.children[child.children.length - 1];
            if (previous3 && previous3.position && child.position) {
              child.position.end = previous3.position.end;
            }
            return index2;
          }
        }
      }
    );
  }
});

// node_modules/unist-util-visit-children/lib/index.js
function visitChildren(visitor) {
  return visit2;
  function visit2(parent) {
    const children = parent && parent.children;
    let index2 = -1;
    if (!children) {
      throw new Error("Missing children in `parent` for `visit`");
    }
    while (++index2 in children) {
      visitor(children[index2], index2, parent);
    }
  }
}
var init_lib21 = __esm({
  "node_modules/unist-util-visit-children/lib/index.js"() {
  }
});

// node_modules/unist-util-visit-children/index.js
var init_unist_util_visit_children = __esm({
  "node_modules/unist-util-visit-children/index.js"() {
    init_lib21();
  }
});

// node_modules/parse-latin/lib/plugin/make-initial-white-space-siblings.js
var makeInitialWhiteSpaceSiblings;
var init_make_initial_white_space_siblings = __esm({
  "node_modules/parse-latin/lib/plugin/make-initial-white-space-siblings.js"() {
    init_unist_util_visit_children();
    makeInitialWhiteSpaceSiblings = visitChildren(
      /**
       * @type {import('unist-util-visit-children').Visitor<Paragraph | Root>}
       */
      function(child, index2, parent) {
        if ("children" in child && child.children) {
          const head = child.children[0];
          if (head && head.type === "WhiteSpaceNode") {
            child.children.shift();
            parent.children.splice(index2, 0, head);
            const next = child.children[0];
            if (next && next.position && child.position) {
              child.position.start = next.position.start;
            }
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/merge-final-word-symbol.js
var mergeFinalWordSymbol;
var init_merge_final_word_symbol = __esm({
  "node_modules/parse-latin/lib/plugin/merge-final-word-symbol.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    mergeFinalWordSymbol = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Sentence>}
       */
      function(child, index2, parent) {
        if (index2 > 0 && (child.type === "SymbolNode" || child.type === "PunctuationNode") && toString3(child) === "-") {
          const children = parent.children;
          const previous3 = children[index2 - 1];
          const next = children[index2 + 1];
          if ((!next || next.type !== "WordNode") && previous3 && previous3.type === "WordNode") {
            children.splice(index2, 1);
            previous3.children.push(child);
            if (previous3.position && child.position) {
              previous3.position.end = child.position.end;
            }
            return index2;
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/merge-initial-digit-sentences.js
var mergeInitialDigitSentences;
var init_merge_initial_digit_sentences = __esm({
  "node_modules/parse-latin/lib/plugin/merge-initial-digit-sentences.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    init_expressions();
    mergeInitialDigitSentences = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Paragraph>}
       */
      function(child, index2, parent) {
        const previous3 = parent.children[index2 - 1];
        if (previous3 && previous3.type === "SentenceNode" && child.type === "SentenceNode") {
          const head = child.children[0];
          if (head && head.type === "WordNode" && digitStart.test(toString3(head))) {
            previous3.children.push(...child.children);
            parent.children.splice(index2, 1);
            if (previous3.position && child.position) {
              previous3.position.end = child.position.end;
            }
            return index2;
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/merge-initial-lower-case-letter-sentences.js
var mergeInitialLowerCaseLetterSentences;
var init_merge_initial_lower_case_letter_sentences = __esm({
  "node_modules/parse-latin/lib/plugin/merge-initial-lower-case-letter-sentences.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    init_expressions();
    mergeInitialLowerCaseLetterSentences = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Paragraph>}
       */
      function(child, index2, parent) {
        if (child.type === "SentenceNode" && index2 > 0) {
          const previous3 = parent.children[index2 - 1];
          const children = child.children;
          if (children.length > 0 && previous3.type === "SentenceNode") {
            let position3 = -1;
            while (children[++position3]) {
              const node2 = children[position3];
              if (node2.type === "WordNode") {
                if (!lowerInitial.test(toString3(node2))) {
                  return;
                }
                previous3.children.push(...children);
                parent.children.splice(index2, 1);
                if (previous3.position && child.position) {
                  previous3.position.end = child.position.end;
                }
                return index2;
              }
              if (node2.type === "SymbolNode" || node2.type === "PunctuationNode") {
                return;
              }
            }
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/merge-initial-word-symbol.js
var mergeInitialWordSymbol;
var init_merge_initial_word_symbol = __esm({
  "node_modules/parse-latin/lib/plugin/merge-initial-word-symbol.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    mergeInitialWordSymbol = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Sentence>}
       */
      function(child, index2, parent) {
        if (child.type !== "SymbolNode" && child.type !== "PunctuationNode" || toString3(child) !== "&") {
          return;
        }
        const children = parent.children;
        const next = children[index2 + 1];
        if (index2 > 0 && children[index2 - 1].type === "WordNode" || !(next && next.type === "WordNode")) {
          return;
        }
        children.splice(index2, 1);
        next.children.unshift(child);
        if (next.position && child.position) {
          next.position.start = child.position.start;
        }
        return index2 - 1;
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/merge-initialisms.js
var mergeInitialisms;
var init_merge_initialisms = __esm({
  "node_modules/parse-latin/lib/plugin/merge-initialisms.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    init_expressions();
    mergeInitialisms = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Sentence>}
       */
      function(child, index2, parent) {
        if (index2 > 0 && child.type === "PunctuationNode" && toString3(child) === ".") {
          const previous3 = parent.children[index2 - 1];
          if (previous3.type === "WordNode" && previous3.children && previous3.children.length !== 1 && previous3.children.length % 2 !== 0) {
            let position3 = previous3.children.length;
            let isAllDigits = true;
            while (previous3.children[--position3]) {
              const otherChild = previous3.children[position3];
              const value = toString3(otherChild);
              if (position3 % 2 === 0) {
                if (value.length > 1) {
                  return;
                }
                if (!numerical.test(value)) {
                  isAllDigits = false;
                }
              } else if (value !== ".") {
                if (position3 < previous3.children.length - 2) {
                  break;
                } else {
                  return;
                }
              }
            }
            if (!isAllDigits) {
              parent.children.splice(index2, 1);
              previous3.children.push(child);
              if (previous3.position && child.position) {
                previous3.position.end = child.position.end;
              }
              return index2;
            }
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/merge-inner-word-symbol.js
var mergeInnerWordSymbol;
var init_merge_inner_word_symbol = __esm({
  "node_modules/parse-latin/lib/plugin/merge-inner-word-symbol.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    init_expressions();
    mergeInnerWordSymbol = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Sentence>}
       */
      function(child, index2, parent) {
        if (index2 > 0 && (child.type === "SymbolNode" || child.type === "PunctuationNode")) {
          const siblings = parent.children;
          const previous3 = siblings[index2 - 1];
          if (previous3 && previous3.type === "WordNode") {
            let position3 = index2 - 1;
            const tokens = [];
            let queue = [];
            while (siblings[++position3]) {
              const sibling = siblings[position3];
              if (sibling.type === "WordNode") {
                tokens.push(...queue, ...sibling.children);
                queue = [];
              } else if ((sibling.type === "SymbolNode" || sibling.type === "PunctuationNode") && wordSymbolInner.test(toString3(sibling))) {
                queue.push(sibling);
              } else {
                break;
              }
            }
            if (tokens.length > 0) {
              if (queue.length > 0) {
                position3 -= queue.length;
              }
              siblings.splice(index2, position3 - index2);
              previous3.children.push(...tokens);
              const last = tokens[tokens.length - 1];
              if (previous3.position && last.position) {
                previous3.position.end = last.position.end;
              }
              return index2;
            }
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/merge-inner-word-slash.js
var mergeInnerWordSlash;
var init_merge_inner_word_slash = __esm({
  "node_modules/parse-latin/lib/plugin/merge-inner-word-slash.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    mergeInnerWordSlash = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Sentence>}
       */
      function(child, index2, parent) {
        const siblings = parent.children;
        const previous3 = siblings[index2 - 1];
        if (previous3 && previous3.type === "WordNode" && (child.type === "SymbolNode" || child.type === "PunctuationNode") && toString3(child) === "/") {
          const previousValue = toString3(previous3);
          let tail = child;
          const queue = [child];
          let count = 1;
          let nextValue = "";
          const next = siblings[index2 + 1];
          if (next && next.type === "WordNode") {
            nextValue = toString3(next);
            tail = next;
            queue.push(...next.children);
            count++;
          }
          if (previousValue.length < 3 && (!nextValue || nextValue.length < 3)) {
            previous3.children.push(...queue);
            siblings.splice(index2, count);
            if (previous3.position && tail.position) {
              previous3.position.end = tail.position.end;
            }
            return index2;
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/merge-non-word-sentences.js
var mergeNonWordSentences;
var init_merge_non_word_sentences = __esm({
  "node_modules/parse-latin/lib/plugin/merge-non-word-sentences.js"() {
    init_unist_util_modify_children();
    mergeNonWordSentences = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Paragraph>}
       */
      function(child, index2, parent) {
        if ("children" in child) {
          let position3 = -1;
          while (child.children[++position3]) {
            if (child.children[position3].type === "WordNode") {
              return;
            }
          }
          const previous3 = parent.children[index2 - 1];
          if (previous3 && "children" in previous3) {
            previous3.children.push(...child.children);
            parent.children.splice(index2, 1);
            if (previous3.position && child.position) {
              previous3.position.end = child.position.end;
            }
            return index2;
          }
          const next = parent.children[index2 + 1];
          if (next && "children" in next) {
            next.children.unshift(...child.children);
            if (next.position && child.position) {
              next.position.start = child.position.start;
            }
            parent.children.splice(index2, 1);
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/merge-prefix-exceptions.js
var abbreviationPrefix, mergePrefixExceptions;
var init_merge_prefix_exceptions = __esm({
  "node_modules/parse-latin/lib/plugin/merge-prefix-exceptions.js"() {
    init_nlcst_to_string();
    init_unist_util_modify_children();
    abbreviationPrefix = new RegExp(
      "^([0-9]{1,3}|[a-z]|al|ca|cap|cca|cent|cf|cit|con|cp|cwt|ead|etc|ff|fl|ibid|id|nem|op|pro|seq|sic|stat|tem|viz)$"
    );
    mergePrefixExceptions = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Paragraph>}
       */
      function(child, index2, parent) {
        if ("children" in child && child.children.length > 1) {
          const period = child.children[child.children.length - 1];
          if (period && (period.type === "PunctuationNode" || period.type === "SymbolNode") && toString3(period) === ".") {
            const node2 = child.children[child.children.length - 2];
            if (node2 && node2.type === "WordNode" && abbreviationPrefix.test(toString3(node2).toLowerCase())) {
              node2.children.push(period);
              child.children.pop();
              if (period.position && node2.position) {
                node2.position.end = period.position.end;
              }
              const next = parent.children[index2 + 1];
              if (next && next.type === "SentenceNode") {
                child.children.push(...next.children);
                parent.children.splice(index2 + 1, 1);
                if (next.position && child.position) {
                  child.position.end = next.position.end;
                }
                return index2 - 1;
              }
            }
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/merge-remaining-full-stops.js
var mergeRemainingFullStops;
var init_merge_remaining_full_stops = __esm({
  "node_modules/parse-latin/lib/plugin/merge-remaining-full-stops.js"() {
    init_nlcst_to_string();
    init_unist_util_visit_children();
    init_expressions();
    mergeRemainingFullStops = visitChildren(
      /**
       * @type {import('unist-util-visit-children').Visitor<Paragraph>}
       */
      // eslint-disable-next-line complexity
      function(child, _, _parent) {
        if ("children" in child) {
          let position3 = child.children.length;
          let hasFoundDelimiter = false;
          while (child.children[--position3]) {
            const grandchild = child.children[position3];
            if (grandchild.type !== "SymbolNode" && grandchild.type !== "PunctuationNode") {
              if (grandchild.type === "WordNode") {
                hasFoundDelimiter = true;
              }
              continue;
            }
            if (!terminalMarker.test(toString3(grandchild))) {
              continue;
            }
            if (!hasFoundDelimiter) {
              hasFoundDelimiter = true;
              continue;
            }
            if (toString3(grandchild) !== ".") {
              continue;
            }
            const previous3 = child.children[position3 - 1];
            const next = child.children[position3 + 1];
            if (previous3 && previous3.type === "WordNode") {
              const nextNext = child.children[position3 + 2];
              if (next && nextNext && next.type === "WhiteSpaceNode" && toString3(nextNext) === ".") {
                continue;
              }
              child.children.splice(position3, 1);
              previous3.children.push(grandchild);
              if (grandchild.position && previous3.position) {
                previous3.position.end = grandchild.position.end;
              }
              position3--;
            } else if (next && next.type === "WordNode") {
              child.children.splice(position3, 1);
              next.children.unshift(grandchild);
              if (grandchild.position && next.position) {
                next.position.start = grandchild.position.start;
              }
            }
          }
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/remove-empty-nodes.js
var removeEmptyNodes;
var init_remove_empty_nodes = __esm({
  "node_modules/parse-latin/lib/plugin/remove-empty-nodes.js"() {
    init_unist_util_modify_children();
    removeEmptyNodes = modifyChildren(
      /**
       * @type {import('unist-util-modify-children').Modifier<Paragraph | Root>}
       */
      function(child, index2, parent) {
        if ("children" in child && child.children.length === 0) {
          parent.children.splice(index2, 1);
          return index2;
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/plugin/patch-position.js
function patch(node2) {
  if (!node2.position) {
    node2.position = {};
  }
}
var patchPosition;
var init_patch_position = __esm({
  "node_modules/parse-latin/lib/plugin/patch-position.js"() {
    init_unist_util_visit_children();
    patchPosition = visitChildren(
      /**
       * @type {import('unist-util-visit-children').Visitor<Paragraph | Root | Sentence>}
       */
      function(child, index2, node2) {
        const siblings = node2.children;
        if (child.position && index2 < 1 && /* c8 ignore next */
        (!node2.position || !node2.position.start)) {
          patch(node2);
          node2.position.start = child.position.start;
        }
        if (child.position && index2 === siblings.length - 1 && (!node2.position || !node2.position.end)) {
          patch(node2);
          node2.position.end = child.position.end;
        }
      }
    );
  }
});

// node_modules/parse-latin/lib/index.js
function splitNode(node2, childType, expression) {
  const result = [];
  let index2 = -1;
  let start = 0;
  while (++index2 < node2.children.length) {
    const token = node2.children[index2];
    if (index2 === node2.children.length - 1 || token.type === childType && expression.test(toString3(token))) {
      const parent = {
        type: node2.type,
        children: node2.children.slice(start, index2 + 1)
      };
      const first = node2.children[start];
      const last = token;
      if (first.position && last.position) {
        parent.position = {
          start: first.position.start,
          end: last.position.end
        };
      }
      result.push(parent);
      start = index2 + 1;
    }
  }
  return result;
}
var ParseLatin;
var init_lib22 = __esm({
  "node_modules/parse-latin/lib/index.js"() {
    init_nlcst_to_string();
    init_merge_affix_exceptions();
    init_merge_affix_symbol();
    init_break_implicit_sentences();
    init_make_final_white_space_siblings();
    init_make_initial_white_space_siblings();
    init_merge_final_word_symbol();
    init_merge_initial_digit_sentences();
    init_merge_initial_lower_case_letter_sentences();
    init_merge_initial_word_symbol();
    init_merge_initialisms();
    init_merge_inner_word_symbol();
    init_merge_inner_word_slash();
    init_merge_non_word_sentences();
    init_merge_prefix_exceptions();
    init_merge_remaining_full_stops();
    init_remove_empty_nodes();
    init_patch_position();
    init_expressions();
    ParseLatin = class {
      /**
       * Create a new parser.
       *
       * This additionally supports `retext`-like call: where an instance is
       * created for each file, and the file is given on construction.
       *
       * @param {string | null | undefined} [doc]
       *   Value to parse (optional).
       * @param {VFile | null | undefined} [file]
       *   Corresponding file (optional).
       */
      constructor(doc, file) {
        const value = file || doc;
        this.doc = value ? String(value) : void 0;
        this.tokenizeRootPlugins = [...this.tokenizeRootPlugins];
        this.tokenizeParagraphPlugins = [...this.tokenizeParagraphPlugins];
        this.tokenizeSentencePlugins = [...this.tokenizeSentencePlugins];
      }
      /**
       * Turn natural language into a syntax tree.
       *
       * @param {string | null | undefined} [value]
       *   Value to parse (optional).
       * @returns {Root}
       *   Tree.
       */
      parse(value) {
        return this.tokenizeRoot(value || this.doc);
      }
      /**
       * Parse as a root.
       *
       * @param {string | null | undefined} [value]
       *   Value to parse (optional).
       * @returns {Root}
       *   Built tree.
       */
      tokenizeRoot(value) {
        const paragraph = this.tokenizeParagraph(value);
        const result = {
          type: "RootNode",
          children: splitNode(paragraph, "WhiteSpaceNode", newLine)
        };
        let index2 = -1;
        while (this.tokenizeRootPlugins[++index2]) {
          this.tokenizeRootPlugins[index2](result);
        }
        return result;
      }
      /**
       * Parse as a paragraph.
       *
       * @param {string | null | undefined} [value]
       *   Value to parse (optional).
       * @returns {Paragraph}
       *   Built tree.
       */
      tokenizeParagraph(value) {
        const sentence = this.tokenizeSentence(value);
        const result = {
          type: "ParagraphNode",
          children: splitNode(sentence, "PunctuationNode", terminalMarker)
        };
        let index2 = -1;
        while (this.tokenizeParagraphPlugins[++index2]) {
          this.tokenizeParagraphPlugins[index2](result);
        }
        return result;
      }
      /**
       * Parse as a sentence.
       *
       * @param {string | null | undefined} [value]
       *   Value to parse (optional).
       * @returns {Sentence}
       *   Built tree.
       */
      tokenizeSentence(value) {
        const children = this.tokenize(value);
        const result = { type: "SentenceNode", children };
        let index2 = -1;
        while (this.tokenizeSentencePlugins[++index2]) {
          this.tokenizeSentencePlugins[index2](result);
        }
        return result;
      }
      /**
       *  Transform a `value` into a list of nlcsts.
       *
       * @param {string | null | undefined} [value]
       *   Value to parse (optional).
       * @returns {Array<SentenceContent>}
       *   Built sentence content.
       */
      tokenize(value) {
        const children = [];
        if (!value) {
          return children;
        }
        const currentPoint = { line: 1, column: 1, offset: 0 };
        let from = 0;
        let index2 = 0;
        let start = { ...currentPoint };
        let previousType;
        let previous3;
        while (index2 < value.length) {
          const current = value.charAt(index2);
          const currentType = whiteSpace.test(current) ? "WhiteSpaceNode" : punctuation.test(current) ? "PunctuationNode" : word.test(current) ? "WordNode" : "SymbolNode";
          if (from < index2 && previousType && currentType && !(previousType === currentType && // Words or white space continue.
          (previousType === "WordNode" || previousType === "WhiteSpaceNode" || // Same character of punctuation or symbol also continues.
          current === previous3 || // Surrogates of  punctuation or symbol also continue.
          surrogates.test(current)))) {
            children.push(createNode(previousType, value.slice(from, index2)));
            from = index2;
            start = { ...currentPoint };
          }
          if (current === "\r" || current === "\n" && previous3 !== "\r") {
            currentPoint.line++;
            currentPoint.column = 1;
          } else if (current !== "\n") {
            currentPoint.column++;
          }
          currentPoint.offset++;
          previousType = currentType;
          previous3 = current;
          index2++;
        }
        if (previousType && from < index2) {
          children.push(createNode(previousType, value.slice(from, index2)));
        }
        return children;
        function createNode(type2, value2) {
          return type2 === "WordNode" ? {
            type: "WordNode",
            children: [
              {
                type: "TextNode",
                value: value2,
                position: { start, end: { ...currentPoint } }
              }
            ],
            position: { start, end: { ...currentPoint } }
          } : { type: type2, value: value2, position: { start, end: { ...currentPoint } } };
        }
      }
    };
    ParseLatin.prototype.tokenizeSentencePlugins = [
      mergeInitialWordSymbol,
      mergeFinalWordSymbol,
      mergeInnerWordSymbol,
      mergeInnerWordSlash,
      mergeInitialisms,
      patchPosition
    ];
    ParseLatin.prototype.tokenizeParagraphPlugins = [
      mergeNonWordSentences,
      mergeAffixSymbol,
      mergeInitialLowerCaseLetterSentences,
      mergeInitialDigitSentences,
      mergePrefixExceptions,
      mergeAffixExceptions,
      mergeRemainingFullStops,
      makeInitialWhiteSpaceSiblings,
      makeFinalWhiteSpaceSiblings,
      breakImplicitSentences,
      removeEmptyNodes,
      patchPosition
    ];
    ParseLatin.prototype.tokenizeRootPlugins = [
      makeInitialWhiteSpaceSiblings,
      makeFinalWhiteSpaceSiblings,
      removeEmptyNodes,
      patchPosition
    ];
  }
});

// node_modules/parse-latin/index.js
var init_parse_latin = __esm({
  "node_modules/parse-latin/index.js"() {
    init_lib22();
  }
});

// node_modules/retext-latin/lib/index.js
function retextLatin() {
  const self = (
    /** @type {import('unified').Processor<Root>} */
    this
  );
  self.parser = parser;
  function parser(value) {
    const parser2 = new ParseLatin();
    add(parser2.tokenizeParagraphPlugins, self.data("nlcstParagraphExtensions"));
    add(parser2.tokenizeRootPlugins, self.data("nlcstRootExtensions"));
    add(parser2.tokenizeSentencePlugins, self.data("nlcstSentenceExtensions"));
    return parser2.parse(value);
  }
}
function add(list2, values) {
  if (values) list2.unshift(...values);
}
var init_lib23 = __esm({
  "node_modules/retext-latin/lib/index.js"() {
    init_parse_latin();
  }
});

// node_modules/retext-latin/index.js
var init_retext_latin = __esm({
  "node_modules/retext-latin/index.js"() {
    init_lib23();
  }
});

// node_modules/retext-stringify/lib/index.js
function retextStringify() {
  const self = (
    /** @type {import('unified').Processor<undefined, undefined, undefined, Root, string>} */
    // @ts-expect-error -- TS in JSDoc doesn’t understand `this`.
    this
  );
  self.compiler = compiler2;
}
function compiler2(tree) {
  return toString3(tree);
}
var init_lib24 = __esm({
  "node_modules/retext-stringify/lib/index.js"() {
    init_nlcst_to_string();
  }
});

// node_modules/retext-stringify/index.js
var init_retext_stringify = __esm({
  "node_modules/retext-stringify/index.js"() {
    init_lib24();
  }
});

// node_modules/retext/index.js
var retext;
var init_retext = __esm({
  "node_modules/retext/index.js"() {
    init_unified();
    init_retext_latin();
    init_retext_stringify();
    retext = unified().use(retextLatin).use(retextStringify).freeze();
  }
});

// node_modules/nlcst-normalize/lib/index.js
function normalize(value, options) {
  let result = (typeof value === "string" ? value : toString3(value)).toLowerCase().replace(/’/g, "'");
  if (!options || !options.allowDashes) {
    result = result.replace(/-/g, "");
  }
  if (!options || !options.allowApostrophes) {
    result = result.replace(/'/g, "");
  }
  return result;
}
var init_lib25 = __esm({
  "node_modules/nlcst-normalize/lib/index.js"() {
    init_nlcst_to_string();
  }
});

// node_modules/nlcst-normalize/index.js
var init_nlcst_normalize = __esm({
  "node_modules/nlcst-normalize/index.js"() {
    init_lib25();
  }
});

// node_modules/nlcst-is-literal/lib/index.js
function isLiteral(parent, index2) {
  if (!(parent && parent.children)) {
    throw new Error("Parent must be a node");
  }
  const siblings = parent.children;
  if (index2 !== null && typeof index2 === "object" && "type" in index2) {
    index2 = siblings.indexOf(index2);
    if (index2 === -1) {
      throw new Error("Node must be a child of `parent`");
    }
  }
  if (typeof index2 !== "number" || Number.isNaN(index2)) {
    throw new TypeError("Index must be a number");
  }
  return Boolean(
    !containsWord(parent, -1, index2) && siblingDelimiter(parent, index2, 1, single) || !containsWord(parent, index2, siblings.length) && siblingDelimiter(parent, index2, -1, single) || isWrapped(parent, index2)
  );
}
function isWrapped(parent, position3) {
  const previous3 = siblingDelimiter(parent, position3, -1, open);
  if (previous3) {
    return siblingDelimiter(parent, position3, 1, pairs2[toString3(previous3)]) !== void 0;
  }
  return false;
}
function siblingDelimiter(parent, position3, step, delimiters) {
  let index2 = position3 + step;
  while (index2 > -1 && index2 < parent.children.length) {
    const sibling = parent.children[index2];
    if (sibling.type === "WordNode" || sibling.type === "SourceNode") {
      break;
    }
    if (sibling.type !== "WhiteSpaceNode") {
      return delimiters.includes(toString3(sibling)) ? sibling : void 0;
    }
    index2 += step;
  }
}
function containsWord(parent, start, end) {
  while (++start < end) {
    if (parent.children[start].type === "WordNode") {
      return true;
    }
  }
  return false;
}
var single, pairs2, open;
var init_lib26 = __esm({
  "node_modules/nlcst-is-literal/lib/index.js"() {
    init_nlcst_to_string();
    single = [
      "-",
      // Hyphen-minus
      "\u2013",
      // En dash
      "\u2014",
      // Em dash
      ":",
      // Colon
      ";"
      // Semi-colon
    ];
    pairs2 = {
      ",": [","],
      "-": ["-"],
      "\u2013": ["\u2013"],
      "\u2014": ["\u2014"],
      '"': ['"'],
      "'": ["'"],
      "\u2018": ["\u2019"],
      "\u201A": ["\u2019"],
      "\u2019": ["\u2019", "\u201A"],
      "\u201C": ["\u201D"],
      "\u201D": ["\u201D"],
      "\u201E": ["\u201D", "\u201C"],
      "\xAB": ["\xBB"],
      "\xBB": ["\xAB"],
      "\u2039": ["\u203A"],
      "\u203A": ["\u2039"],
      "(": [")"],
      "[": ["]"],
      "{": ["}"],
      "\u27E8": ["\u27E9"],
      "\u300C": ["\u300D"]
    };
    open = Object.keys(pairs2);
  }
});

// node_modules/nlcst-is-literal/index.js
var init_nlcst_is_literal = __esm({
  "node_modules/nlcst-is-literal/index.js"() {
    init_lib26();
  }
});

// node_modules/nlcst-search/lib/index.js
function search2(tree, phrases, handler2, options) {
  const config = options || {};
  if (!tree || !tree.type) {
    throw new Error("Expected node");
  }
  if (typeof phrases !== "object") {
    throw new TypeError("Expected object for phrases");
  }
  const byWord = { "*": [] };
  let index2 = -1;
  while (++index2 < phrases.length) {
    const phrase = phrases[index2];
    const firstWord = normalize(phrase.split(" ", 1)[0], config);
    if (own5.call(byWord, firstWord)) {
      byWord[firstWord].push(phrase);
    } else {
      byWord[firstWord] = [phrase];
    }
  }
  visit(tree, "WordNode", (node2, position3, parent) => {
    if (!parent || position3 === void 0 || !config.allowLiterals && isLiteral(parent, position3)) {
      return;
    }
    const word2 = normalize(node2, config);
    const phrases2 = own5.call(byWord, word2) ? [...byWord["*"], ...byWord[word2]] : byWord["*"];
    let index3 = -1;
    while (++index3 < phrases2.length) {
      const result = test(phrases2[index3], position3, parent);
      if (result) {
        handler2(result, position3, parent, phrases2[index3]);
      }
    }
  });
  function test(phrase, position3, parent) {
    const siblings = parent.children;
    const start = position3;
    const expressions = phrase.split(" ").slice(1);
    let index3 = -1;
    position3++;
    while (++index3 < expressions.length) {
      while (position3 < siblings.length) {
        if (siblings[position3].type !== "WhiteSpaceNode") break;
        position3++;
      }
      if (!siblings[position3] || siblings[position3].type !== "WordNode" || expressions[index3] !== "*" && normalize(expressions[index3], config) !== normalize(siblings[position3], config)) {
        return;
      }
      position3++;
    }
    return siblings.slice(start, position3);
  }
}
var own5;
var init_lib27 = __esm({
  "node_modules/nlcst-search/lib/index.js"() {
    init_unist_util_visit();
    init_nlcst_normalize();
    init_nlcst_is_literal();
    own5 = {}.hasOwnProperty;
  }
});

// node_modules/nlcst-search/index.js
var init_nlcst_search = __esm({
  "node_modules/nlcst-search/index.js"() {
    init_lib27();
  }
});

// node_modules/quotation/index.js
var quotation;
var init_quotation = __esm({
  "node_modules/quotation/index.js"() {
    quotation = /**
     * @type {{
     *   (value: string, open?: string | null | undefined, close?: string | null | undefined): string
     *   (value: ReadonlyArray<string>, open?: string | null | undefined, close?: string | null | undefined): string[]
     * }}
     */
    /**
     * @param {ReadonlyArray<string> | string} value
     * @param {string | null | undefined} open
     * @param {string | null | undefined} close
     * @returns {Array<string> | string}
     */
    function(value, open2, close) {
      const start = open2 || '"';
      const end = close || start;
      let index2 = -1;
      if (Array.isArray(value)) {
        const list2 = (
          /** @type {ReadonlyArray<string>} */
          value
        );
        const result = [];
        while (++index2 < list2.length) {
          result[index2] = start + list2[index2] + end;
        }
        return result;
      }
      if (typeof value === "string") {
        return start + value + end;
      }
      throw new TypeError("Expected string or array of strings");
    };
  }
});

// node_modules/unist-util-position/lib/index.js
function point3(type2) {
  return point4;
  function point4(node2) {
    const point5 = node2 && node2.position && node2.position[type2] || {};
    if (typeof point5.line === "number" && point5.line > 0 && typeof point5.column === "number" && point5.column > 0) {
      return {
        line: point5.line,
        column: point5.column,
        offset: typeof point5.offset === "number" && point5.offset > -1 ? point5.offset : void 0
      };
    }
  }
}
var pointEnd, pointStart;
var init_lib28 = __esm({
  "node_modules/unist-util-position/lib/index.js"() {
    pointEnd = point3("end");
    pointStart = point3("start");
  }
});

// node_modules/unist-util-position/index.js
var init_unist_util_position = __esm({
  "node_modules/unist-util-position/index.js"() {
    init_lib28();
  }
});

// node_modules/retext-equality/lib/create-plugin.js
function createPlugin(patterns2, lang) {
  const source = "retext-equality" + (lang === "en" ? "" : "-" + lang);
  const handlers = { basic, or };
  const byId = /* @__PURE__ */ new Map();
  const byPhrase = /* @__PURE__ */ new Map();
  const apostrophes = /* @__PURE__ */ new Set();
  unpack();
  return function(options) {
    const settings = options || emptyOptions2;
    const ignore = settings.ignore || emptyList;
    const binary2 = settings.binary || false;
    const noNormalize = [];
    const normalize2 = [];
    for (const item of byPhrase.keys()) {
      if (ignore.includes(item)) {
        continue;
      }
      if (apostrophes.has(item)) {
        noNormalize.push(item);
      } else {
        normalize2.push(item);
      }
    }
    return function(tree, file) {
      visit(tree, "ParagraphNode", function(node2) {
        const matchesById = /* @__PURE__ */ new Map();
        search2(node2, normalize2, handle);
        search2(node2, noNormalize, handle, { allowApostrophes: true });
        for (const [id, matches] of matchesById.entries()) {
          const pattern = byId.get(id);
          ok(pattern);
          const kind = !binary2 && pattern.type === "or" ? "basic" : pattern.type;
          handlers[kind](matches, pattern, file);
        }
        return SKIP;
        function handle(match, position3, parent, phrase) {
          const id = byPhrase.get(phrase);
          ok(id);
          if (phrase !== phrase.toLowerCase() && toString3(match) !== phrase) {
            return;
          }
          const pattern = byId.get(id);
          ok(pattern);
          let matches = matchesById.get(id);
          if (!matches) {
            matches = [];
            matchesById.set(id, matches);
          }
          matches.push({
            end: position3 + match.length - 1,
            nodes: match,
            parent,
            start: position3,
            type: pattern.inconsiderate[phrase]
          });
        }
      });
    };
  };
  function unpack() {
    let index2 = -1;
    while (++index2 < patterns2.length) {
      const pattern = patterns2[index2];
      byId.set(pattern.id, pattern);
      let phrase;
      for (phrase in pattern.inconsiderate) {
        if (Object.hasOwn(pattern.inconsiderate, phrase)) {
          byPhrase.set(phrase, pattern.id);
          if (pattern.apostrophe) apostrophes.add(phrase);
        }
      }
    }
  }
  function basic(matches, pattern, file) {
    let index2 = -1;
    while (++index2 < matches.length) {
      warn(file, matches[index2], pattern);
    }
  }
  function or(matches, pattern, file) {
    let index2 = -1;
    while (++index2 < matches.length) {
      const match = matches[index2];
      const siblings = match.parent.children;
      const next = matches[index2 + 1];
      if (next && next.parent === match.parent && next.type !== match.type) {
        let start = match.end;
        while (++start < next.start) {
          const sibling = siblings[start];
          if (sibling.type === "WhiteSpaceNode" || sibling.type === "WordNode" && /(and|or)/.test(normalize(sibling)) || sibling.type === "PunctuationNode" && normalize(sibling) === "/") {
            continue;
          }
          break;
        }
        if (start === next.start) {
          index2++;
          continue;
        }
      }
      warn(file, match, pattern);
    }
  }
  function warn(file, match, pattern) {
    const actual = toString3(match.nodes);
    let expected;
    if (pattern.considerate) {
      expected = Object.keys(pattern.considerate);
      if (actual.charAt(0).toUpperCase() === actual.charAt(0)) {
        let index2 = -1;
        while (++index2 < expected.length) {
          expected[index2] = expected[index2].charAt(0).toUpperCase() + expected[index2].slice(1);
        }
      }
    }
    const end = pointEnd(match.nodes[match.nodes.length - 1]);
    const start = pointStart(match.nodes[0]);
    const message = file.message(
      "Unexpected potentially insensitive use of " + quotation(actual, "`") + (pattern.condition ? ", " + pattern.condition : "") + ", " + (expected ? "in somes cases " + quotation(expected, "`").join(", ") + " may be better" : "try not to use it"),
      {
        ancestors: [match.parent],
        /* c8 ignore next -- verbose to test. */
        place: end && start ? { start, end } : void 0,
        ruleId: pattern.id,
        source
      }
    );
    message.actual = actual;
    message.expected = expected;
    message.note = pattern.note;
    message.url = "https://github.com/retextjs/retext-equality#readme";
  }
}
var emptyOptions2, emptyList;
var init_create_plugin = __esm({
  "node_modules/retext-equality/lib/create-plugin.js"() {
    init_default();
    init_nlcst_normalize();
    init_nlcst_search();
    init_nlcst_to_string();
    init_quotation();
    init_unist_util_position();
    init_unist_util_visit();
    emptyOptions2 = {};
    emptyList = [];
  }
});

// node_modules/retext-equality/lib/patterns-en.js
var patterns;
var init_patterns_en = __esm({
  "node_modules/retext-equality/lib/patterns-en.js"() {
    patterns = [
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "non-disabled": "a"
        },
        "id": "ablebodied",
        "inconsiderate": {
          "ablebodied": "a"
        },
        "note": "Can imply that people with disabilities lack the ability to use their bodies well. Sometimes `typical` can be used. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "performer": "a",
          "star": "a",
          "artist": "a",
          "entertainer": "a"
        },
        "id": "actor-actress",
        "inconsiderate": {
          "actress": "female",
          "actor": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "performers": "a",
          "stars": "a",
          "artists": "a",
          "entertainers": "a"
        },
        "id": "actors-actresses",
        "inconsiderate": {
          "actresses": "female",
          "actors": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "disorganized": "a",
          "distracted": "a",
          "energetic": "a",
          "hyperactive": "a",
          "impetuous": "a",
          "impulsive": "a",
          "inattentive": "a",
          "restless": "a",
          "unfocused": "a"
        },
        "id": "add",
        "inconsiderate": {
          "ADD": "a",
          "adhd": "a",
          "a.d.d.": "a",
          "a.d.h.d.": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with a drug addiction": "a",
          "person recovering from a drug addiction": "a"
        },
        "id": "addict",
        "inconsiderate": {
          "addict": "a",
          "junkie": "a"
        },
        "note": "Addiction is a neurobiological disease. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "people with a drug addiction": "a",
          "people recovering from a drug addiction": "a"
        },
        "id": "addicts",
        "inconsiderate": {
          "addicts": "a",
          "junkies": "a"
        },
        "note": "Addiction is a neurobiological disease. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with AIDS": "a"
        },
        "id": "aids-victim",
        "inconsiderate": {
          "suffering from aids": "a",
          "suffer from aids": "a",
          "suffers from aids": "a",
          "afflicted with aids": "a",
          "victim of aids": "a",
          "aids victim": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "pilot": "a",
          "aviator": "a",
          "airstaff": "a"
        },
        "id": "aircrewwoman-airman",
        "inconsiderate": {
          "aircrewwoman": "female",
          "aircrew woman": "female",
          "aircrewman": "male",
          "airman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "pilots": "a",
          "aviators": "a",
          "airstaff": "a"
        },
        "id": "aircrewwomen-airmen",
        "inconsiderate": {
          "aircrewwomen": "female",
          "aircrew women": "female",
          "aircrewmen": "male",
          "airmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "someone with an alcohol problem": "a"
        },
        "id": "alcoholic",
        "inconsiderate": {
          "alcoholic": "a",
          "alcohol abuser": "a"
        },
        "note": "Alcoholism is a neurobiological disease. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "cabinet member": "a"
        },
        "id": "alderman-alderwoman",
        "inconsiderate": {
          "alderwoman": "female",
          "alderman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "cabinet": "a",
          "cabinet members": "a",
          "alderperson": "a"
        },
        "id": "aldermen-alderwomen",
        "inconsiderate": {
          "alderwomen": "female",
          "aldermen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "graduate": "a"
        },
        "id": "alumna-alumnus",
        "inconsiderate": {
          "alumna": "female",
          "alumnus": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "graduates": "a"
        },
        "id": "alumnae-alumni",
        "inconsiderate": {
          "alumnae": "female",
          "alumni": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with an amputation": "a"
        },
        "id": "amputee",
        "inconsiderate": {
          "amputee": "a"
        },
        "note": "Refer to the person, rather than the condition, first. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "ancient civilization": "a",
          "ancient people": "a"
        },
        "id": "ancient-man",
        "inconsiderate": {
          "ancient man": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "assembly person": "a",
          "assembly worker": "a"
        },
        "id": "assemblyman-assemblywoman",
        "inconsiderate": {
          "assemblywoman": "female",
          "assemblyman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "psychiatric hospital": "a",
          "mental health hospital": "a"
        },
        "id": "asylum",
        "inconsiderate": {
          "asylum": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "relative": "a"
        },
        "id": "aunt-uncle",
        "inconsiderate": {
          "kinswoman": "female",
          "aunt": "female",
          "kinsman": "male",
          "uncle": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "relatives": "a"
        },
        "id": "aunts-uncles",
        "inconsiderate": {
          "kinswomen": "female",
          "aunts": "female",
          "kinsmen": "male",
          "uncles": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "author": "a",
          "writer": "a"
        },
        "id": "authoress",
        "inconsiderate": {
          "authoress": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "average consumer": "a",
          "average household": "a",
          "average homemaker": "a"
        },
        "id": "average-housewife",
        "inconsiderate": {
          "average housewife": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "average person": "a"
        },
        "id": "average-man",
        "inconsiderate": {
          "average man": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "average wage earner": "a",
          "average taxpayer": "a"
        },
        "id": "average-working-man",
        "inconsiderate": {
          "average working man": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "aviator": "a"
        },
        "id": "aviatrix",
        "inconsiderate": {
          "aviatrix": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "empty": "a",
          "sterile": "a",
          "infertile": "a"
        },
        "id": "barren",
        "inconsiderate": {
          "barren": "a"
        },
        "note": "Source: https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "id": "basically",
        "inconsiderate": {
          "basically": "a"
        },
        "note": "It\u2019s probably not that basic. If you\u2019re going to explain a confusing previous sentence with a clearer next sentence, why not drop the former and only use the latter? (source: https://css-tricks.com/words-avoid-educational-writing/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "non-discrimination law": "a",
          "non-discrimination ordinance": "a"
        },
        "id": "bathroom-bill",
        "inconsiderate": {
          "bathroom bill": "a"
        },
        "note": "A term created and used by far-right extremists to oppose nondiscrimination laws that protect transgender people (source: https://www.glaad.org/reference/transgender)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "chaos": "a",
          "hectic": "a",
          "pandemonium": "a"
        },
        "id": "bedlam",
        "inconsiderate": {
          "bedlam": "a",
          "madhouse": "a",
          "loony bin": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "bisexual": "a"
        },
        "id": "bi",
        "inconsiderate": {
          "bi": "a"
        },
        "note": "Avoid using slang shorthand (source: https://www.glaad.org/reference/style)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "enthusiastic": "a",
          "spree": "a"
        },
        "id": "binge",
        "inconsiderate": {
          "binge": "a"
        },
        "note": "Binge might be insensitive towards folks with eating or drinking disorders (source: https://github.com/retextjs/retext-equality/issues/110)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "fluctuating": "a",
          "person with bipolar disorder": "a"
        },
        "id": "bipolar",
        "inconsiderate": {
          "bipolar": "a"
        },
        "note": "Only use terms describing mental illness when referring to a professionally diagnosed medical condition. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "has a disability": "a",
          "person with a disability": "a",
          "people with disabilities": "a"
        },
        "id": "birth-defect",
        "inconsiderate": {
          "birth defect": "a"
        },
        "note": "Assumes/implies that a person with a disability is deficient or inferior to others. When possible, specify the functional ability or its restriction. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "unethical hacker": "a",
          "malicious actor": "a"
        },
        "id": "blackhat",
        "inconsiderate": {
          "blackhat": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "blocklist": "a",
          "wronglist": "a",
          "banlist": "a",
          "deny list": "a"
        },
        "id": "blacklist",
        "inconsiderate": {
          "blacklist": "a",
          "black list": "a"
        },
        "note": "Replace racially-charged language with more accurate and inclusive words",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "blocklisted": "a",
          "wronglisted": "a",
          "banlisted": "a",
          "deny-listed": "a"
        },
        "id": "blacklisted",
        "inconsiderate": {
          "blacklisted": "a"
        },
        "note": "Replace racially-charged language with more accurate and inclusive words",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "blocklisting": "a",
          "wronglisting": "a",
          "banlisting": "a",
          "deny-listing": "a"
        },
        "id": "blacklisting",
        "inconsiderate": {
          "blacklisting": "a"
        },
        "note": "Replace racially-charged language with more accurate and inclusive words",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "bogeymonster": "a"
        },
        "id": "bogeyman-bogeywoman",
        "inconsiderate": {
          "bogeywoman": "female",
          "bogeyman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "bogeymonster": "a"
        },
        "id": "bogieman-bogiewoman",
        "inconsiderate": {
          "bogiewoman": "female",
          "bogieman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "bogeymonsters": "a"
        },
        "id": "bogiemen-bogiewomen",
        "inconsiderate": {
          "bogiewomen": "female",
          "bogiemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "bonder": "a"
        },
        "id": "bondsman-bondswoman",
        "inconsiderate": {
          "bondswoman": "female",
          "bondsman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "bonders": "a"
        },
        "id": "bondsmen-bondswomen",
        "inconsiderate": {
          "bondswomen": "female",
          "bondsmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "thin": "a",
          "slim": "a"
        },
        "id": "bony",
        "inconsiderate": {
          "anorexic": "a",
          "bony": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "boogeymonster": "a"
        },
        "id": "boogeyman-boogeywoman",
        "inconsiderate": {
          "boogeywoman": "female",
          "boogeyman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "boogeymonster": "a"
        },
        "id": "boogieman-boogiewoman",
        "inconsiderate": {
          "boogiewoman": "female",
          "boogieman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "boogeymonsters": "a"
        },
        "id": "boogiemen-boogiewomen",
        "inconsiderate": {
          "boogiewomen": "female",
          "boogiemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "assigned male at birth": "a",
          "designated male at birth": "a"
        },
        "id": "born-a-man",
        "inconsiderate": {
          "biologically male": "a",
          "born a man": "a",
          "genetically male": "a"
        },
        "note": "Assigned birth gender is complicated; gender identity is more than what your parents decided you were at birth",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "assigned female at birth": "a",
          "designated female at birth": "a"
        },
        "id": "born-a-woman",
        "inconsiderate": {
          "biologically female": "a",
          "born a woman": "a",
          "genetically female": "a"
        },
        "note": "Assigned birth gender is complicated; gender identity is more than what your parents decided you were at birth",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "condition": "when referring to a person",
        "considerate": {
          "kid": "a",
          "child": "a",
          "youth": "a"
        },
        "id": "boy-girl",
        "inconsiderate": {
          "girl": "female",
          "boy": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "partner": "a",
          "friend": "a",
          "significant other": "a"
        },
        "id": "boyfriend-girlfriend",
        "inconsiderate": {
          "girlfriend": "female",
          "boyfriend": "male"
        },
        "note": "Source: https://www.bustle.com/articles/108321-6-reasons-to-refer-to-your-significant-other-as-your-partner",
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "partners": "a",
          "friends": "a",
          "significant others": "a"
        },
        "id": "boyfriends-girlfriends",
        "inconsiderate": {
          "girlfriends": "female",
          "boyfriends": "male"
        },
        "note": "Source: https://www.bustle.com/articles/108321-6-reasons-to-refer-to-your-significant-other-as-your-partner",
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "childhood": "a"
        },
        "id": "boyhood-girlhood",
        "inconsiderate": {
          "girlhood": "female",
          "boyhood": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "childish": "a"
        },
        "id": "boyish-girly",
        "inconsiderate": {
          "girly": "female",
          "girlish": "female",
          "boyish": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "spouse": "a",
          "newlywed": "a"
        },
        "id": "bride-groom",
        "inconsiderate": {
          "bride": "female",
          "groom": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "sibling": "a"
        },
        "id": "brother-sister",
        "inconsiderate": {
          "sister": "female",
          "brother": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "the human family": "a"
        },
        "id": "brotherhood-of-man",
        "inconsiderate": {
          "brotherhood of man": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "kinship": "a",
          "community": "a"
        },
        "id": "brotherhood-sisterhood",
        "inconsiderate": {
          "sisterhood": "female",
          "brotherhood": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "siblings": "a"
        },
        "id": "brothers-sisters",
        "inconsiderate": {
          "sisters": "female",
          "brothers": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with prominent teeth": "a",
          "prominent teeth": "a"
        },
        "id": "buckteeth",
        "inconsiderate": {
          "bucktoothed": "a",
          "buckteeth": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "bug report": "a",
          "snapshot": "a"
        },
        "id": "bugreport",
        "inconsiderate": {
          "bugreport": "a"
        },
        "note": "Avoid using `bugreport`, as the word `bugre` is a slur in Brazilian Portuguese",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "model": "a"
        },
        "id": "calendar-girl",
        "inconsiderate": {
          "calendar girl": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "escort": "a",
          "prostitute": "a",
          "sex worker": "a"
        },
        "id": "call-girl",
        "inconsiderate": {
          "call girl": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "camera operator": "a",
          "camera person": "a"
        },
        "id": "cameraman-camerawoman",
        "inconsiderate": {
          "camerawoman": "female",
          "cameraman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "camera operators": "a"
        },
        "id": "cameramen-camerawomen",
        "inconsiderate": {
          "camerawomen": "female",
          "cameramen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "cattle rancher": "a"
        },
        "id": "cattleman-cattlewoman",
        "inconsiderate": {
          "cattlewoman": "female",
          "cattleman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "cattle ranchers": "a"
        },
        "id": "cattlemen-cattlewomen",
        "inconsiderate": {
          "cattlewomen": "female",
          "cattlemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "troglodyte": "a",
          "hominidae": "a"
        },
        "id": "caveman-cavewoman",
        "inconsiderate": {
          "cavewoman": "female",
          "caveman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "troglodytae": "a",
          "troglodyti": "a",
          "troglodytes": "a",
          "hominids": "a"
        },
        "id": "cavemen-cavewomen",
        "inconsiderate": {
          "cavewomen": "female",
          "cavemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "chair": "a",
          "head": "a",
          "chairperson": "a",
          "coordinator": "a",
          "committee head": "a",
          "moderator": "a",
          "presiding officer": "a"
        },
        "id": "chairman-chairwoman",
        "inconsiderate": {
          "chairwoman": "female",
          "chairman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "chairs": "a",
          "chairpersons": "a",
          "coordinators": "a"
        },
        "id": "chairmen-chairwomen",
        "inconsiderate": {
          "chairwomen": "female",
          "chairmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "officer": "a",
          "police officer": "a"
        },
        "id": "chick-cop-policeman",
        "inconsiderate": {
          "policewoman": "female",
          "policeman": "male",
          "chick cop": "female"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "cleric": "a",
          "practicing Christian": "a",
          "pillar of the Church": "a"
        },
        "id": "churchman",
        "inconsiderate": {
          "churchman": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "id": "clearly",
        "inconsiderate": {
          "clearly": "a"
        },
        "note": "If it\u2019s self-evident then maybe you don\u2019t need to describe it. If it isn\u2019t, don\u2019t say it. (source: https://css-tricks.com/words-avoid-educational-writing/)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "clergyperson": "a",
          "clergy": "a",
          "cleric": "a"
        },
        "id": "clergyman-clergywoman",
        "inconsiderate": {
          "clergywoman": "female",
          "clergyman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "clergies": "a",
          "clerics": "a"
        },
        "id": "clergymen-clergywomen",
        "inconsiderate": {
          "clergywomen": "female",
          "clergymen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "die by suicide": "a"
        },
        "id": "commit-suicide",
        "inconsiderate": {
          "commit suicide": "a",
          "complete suicide": "a",
          "successful suicide": "a"
        },
        "note": "Committing suicide is not successful/unsuccessful, that sends the wrong message (source: https://www.afsp.org/news-events/for-the-media/reporting-on-suicide, https://www.speakingofsuicide.com/2013/04/13/language/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "died by suicide": "a"
        },
        "id": "committed-suicide",
        "inconsiderate": {
          "committed suicide": "a",
          "completed suicide": "a"
        },
        "note": "Source: https://www.afsp.org/news-events/for-the-media/reporting-on-suicide, https://www.speakingofsuicide.com/2013/04/13/language/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "committee member": "a"
        },
        "id": "committee-man-committee-woman",
        "inconsiderate": {
          "committee woman": "female",
          "committee man": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "common person": "a",
          "average person": "a"
        },
        "id": "common-girl-common-man",
        "inconsiderate": {
          "common girl": "female",
          "common man": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "member of congress": "a",
          "congress person": "a",
          "legislator": "a",
          "representative": "a"
        },
        "id": "congressman-congresswoman",
        "inconsiderate": {
          "congresswoman": "female",
          "congressman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "members of congress": "a",
          "congress persons": "a",
          "legislators": "a",
          "representatives": "a"
        },
        "id": "congressmen-congresswomen",
        "inconsiderate": {
          "congresswomen": "female",
          "congressmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "council member": "a"
        },
        "id": "councilman-councilwoman",
        "inconsiderate": {
          "councilwoman": "female",
          "councilman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "council members": "a"
        },
        "id": "councilmen-councilwomen",
        "inconsiderate": {
          "councilwomen": "female",
          "councilmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "country person": "a"
        },
        "id": "countryman-countrywoman",
        "inconsiderate": {
          "countrywoman": "female",
          "countryman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "country folk": "a"
        },
        "id": "countrymen-countrywomen",
        "inconsiderate": {
          "countrywomen": "female",
          "countrymen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "cowhand": "a"
        },
        "id": "cowboy-cowgirl",
        "inconsiderate": {
          "cowgirl": "female",
          "cowboy": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "cowhands": "a"
        },
        "id": "cowboys-cowgirls",
        "inconsiderate": {
          "cowgirls": "female",
          "cowboys": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "creep": "a",
          "fool": "a"
        },
        "id": "cretin",
        "inconsiderate": {
          "cretin": "a"
        },
        "note": "Source: https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "parent": "a"
        },
        "id": "dad-mom",
        "inconsiderate": {
          "mama": "female",
          "mother": "female",
          "mom": "female",
          "mum": "female",
          "momma": "female",
          "mommy": "female",
          "papa": "male",
          "father": "male",
          "dad": "male",
          "pop": "male",
          "daddy": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "parents": "a"
        },
        "id": "dads-moms",
        "inconsiderate": {
          "mamas": "female",
          "mothers": "female",
          "moms": "female",
          "mums": "female",
          "mommas": "female",
          "mommies": "female",
          "papas": "male",
          "fathers": "male",
          "dads": "male",
          "daddies": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "absurd": "a",
          "foolish": "a"
        },
        "id": "daft",
        "inconsiderate": {
          "daft": "a"
        },
        "note": "Source: https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "official": "a",
          "owner": "a",
          "expert": "a",
          "superior": "a",
          "chief": "a",
          "ruler": "a"
        },
        "id": "dame-lord",
        "inconsiderate": {
          "dame": "female",
          "lord": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "officials": "a",
          "chiefs": "a",
          "rulers": "a"
        },
        "id": "dames-lords",
        "inconsiderate": {
          "dames": "female",
          "lords": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "child": "a"
        },
        "id": "daughter-son",
        "inconsiderate": {
          "daughter": "female",
          "son": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "children": "a"
        },
        "id": "daughters-sons",
        "inconsiderate": {
          "daughters": "female",
          "sons": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "careless": "a",
          "heartless": "a",
          "indifferent": "a",
          "insensitive": "a"
        },
        "id": "deaf-to",
        "inconsiderate": {
          "blind to": "a",
          "blind eye to": "a",
          "blinded by": "a",
          "deaf to": "a",
          "deaf ear to": "a",
          "deafened by": "a"
        },
        "note": "Source: https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "deaf": "a"
        },
        "id": "deafmute",
        "inconsiderate": {
          "deaf and dumb": "a",
          "deafmute": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "courier": "a",
          "messenger": "a"
        },
        "id": "delivery-boy-delivery-girl",
        "inconsiderate": {
          "delivery girl": "female",
          "delivery boy": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "sad": "a",
          "blue": "a",
          "bummed out": "a",
          "person with seasonal affective disorder": "a",
          "person with psychotic depression": "a",
          "person with postpartum depression": "a"
        },
        "id": "depressed",
        "inconsiderate": {
          "depressed": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "concierge": "a"
        },
        "id": "doorman-doorwoman",
        "inconsiderate": {
          "doorwoman": "female",
          "doorman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "concierges": "a"
        },
        "id": "doormen-doorwomen",
        "inconsiderate": {
          "doorwomen": "female",
          "doormen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Down Syndrome": "a"
        },
        "id": "downs-syndrome",
        "inconsiderate": {
          "downs syndrome": "a"
        },
        "note": "Source: https://media.specialolympics.org/soi/files/press-kit/2014_FactSheet_Final.pdf",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "foolish": "a",
          "ludicrous": "a",
          "speechless": "a",
          "silent": "a"
        },
        "id": "dumb",
        "inconsiderate": {
          "dumb": "a"
        },
        "note": "Dumb here is used in 2 different contexts , the inability to talk or as a curse word. (source: https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "test double": "a",
          "placeholder": "a",
          "fake": "a",
          "stub": "a"
        },
        "id": "dummy",
        "inconsiderate": {
          "dummyvariable": "a",
          "dummyvalue": "a",
          "dummyobject": "a",
          "dummy": "a"
        },
        "note": "Dummy can refer to the inability to talk or be used as a derogatory word meaning stupid. In computer programming it is used where a value or behavior is unimportant. There are better alternatives for other use cases also.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with dwarfism": "a",
          "little person": "a",
          "little people": "a",
          "LP": "a",
          "person of short stature": "a"
        },
        "id": "dwarf",
        "inconsiderate": {
          "vertically challenged": "a",
          "midget": "a",
          "small person": "a",
          "dwarf": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/,https://www.lpaonline.org/faq-#Midget",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with dyslexia": "a"
        },
        "id": "dyslexic",
        "inconsiderate": {
          "dyslexic": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "id": "easy",
        "inconsiderate": {
          "easy": "a",
          "easily": "a"
        },
        "note": "It\u2019s probably not that easy. Even if it is, you probably don\u2019t need to specifically say it. (source: https://css-tricks.com/words-avoid-educational-writing/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "english coordinator": "a",
          "senior teacher of english": "a"
        },
        "id": "english-master",
        "inconsiderate": {
          "english master": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "the english": "a"
        },
        "id": "englishmen",
        "inconsiderate": {
          "englishmen": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with epilepsy": "a"
        },
        "id": "epileptic",
        "inconsiderate": {
          "epileptic": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Inuit": "a"
        },
        "id": "eskimo",
        "inconsiderate": {
          "eskimo": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Inuits": "a"
        },
        "id": "eskimos",
        "inconsiderate": {
          "eskimos": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "id": "everyone-knows",
        "inconsiderate": {
          "everyone knows": "a"
        },
        "note": "If it\u2019s self-evident then maybe you don\u2019t need to describe it. If it isn\u2019t, don\u2019t say it. (source: https://css-tricks.com/words-avoid-educational-writing/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "executor": "a"
        },
        "id": "executrix",
        "inconsiderate": {
          "executrix": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "gay": "a"
        },
        "id": "fag",
        "inconsiderate": {
          "fag": "a",
          "faggot": "a",
          "dyke": "a",
          "homo": "a",
          "sodomite": "a"
        },
        "note": "Derogatory terms for LGBTQ+ people are offensive (source: https://www.glaad.org/reference/offensive)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "suicide attempt": "a",
          "attempted suicide": "a"
        },
        "id": "failed-suicide",
        "inconsiderate": {
          "failed suicide": "a",
          "failed attempt": "a",
          "suicide failure": "a"
        },
        "note": "Attempted suicide should not be depicted as a failure (source: https://www.speakingofsuicide.com/2013/04/13/language, https://www.afsp.org/news-events/for-the-media/reporting-on-suicide)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "with family support needs": "a"
        },
        "id": "family-burden",
        "inconsiderate": {
          "family burden": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "founder of": "a"
        },
        "id": "father-of-*",
        "inconsiderate": {
          "father of *": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "native tongue": "a",
          "native language": "a"
        },
        "id": "father-tongue-mother-tongue",
        "inconsiderate": {
          "mother tongue": "female",
          "father tongue": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "native land": "a",
          "homeland": "a"
        },
        "id": "fatherland-motherland",
        "inconsiderate": {
          "motherland": "female",
          "fatherland": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "camaraderie": "a",
          "community": "a",
          "organization": "a"
        },
        "id": "fellowship",
        "inconsiderate": {
          "fellowship": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "humans": "a"
        },
        "id": "females-males",
        "inconsiderate": {
          "females": "female",
          "males": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "humanly": "a",
          "mature": "a"
        },
        "id": "feminin-manly",
        "inconsiderate": {
          "feminin": "female",
          "dudely": "male",
          "manly": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "humanity": "a"
        },
        "id": "femininity-manliness",
        "inconsiderate": {
          "femininity": "female",
          "manliness": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "fire fighter": "a",
          "fire officer": "a"
        },
        "id": "fireman-firewoman",
        "inconsiderate": {
          "firewoman": "female",
          "fireman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "fire fighters": "a"
        },
        "id": "firemen-firewomen",
        "inconsiderate": {
          "firewomen": "female",
          "firemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "fisher": "a",
          "crew member": "a",
          "fisherfolk": "a",
          "angler": "a"
        },
        "id": "fisherman-fisherwoman",
        "inconsiderate": {
          "fisherwoman": "female",
          "fisherman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "fishers": "a"
        },
        "id": "fishermen-fisherwomen",
        "inconsiderate": {
          "fisherwomen": "female",
          "fishermen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "ancestor": "a"
        },
        "id": "forefather-foremother",
        "inconsiderate": {
          "foremother": "female",
          "forefather": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "ancestors": "a"
        },
        "id": "forefathers-foremothers",
        "inconsiderate": {
          "foremothers": "female",
          "forefathers": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "supervisor": "a",
          "shift boss": "a"
        },
        "id": "foreman-forewoman",
        "inconsiderate": {
          "forewoman": "female",
          "foreman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "supervisors": "a",
          "shift bosses": "a"
        },
        "id": "foremen-forewomen",
        "inconsiderate": {
          "forewomen": "female",
          "foremen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "the founders": "a",
          "founding leaders": "a",
          "forebears": "a"
        },
        "id": "founding-father",
        "inconsiderate": {
          "founding father": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "french": "a",
          "the french": "a"
        },
        "id": "frenchmen",
        "inconsiderate": {
          "frenchmen": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "first-year student": "a",
          "fresher": "a"
        },
        "id": "freshman",
        "inconsiderate": {
          "freshman": "male",
          "freshwoman": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "first-year students": "a",
          "freshers": "a"
        },
        "id": "freshmen-freshwomen",
        "inconsiderate": {
          "freshwomen": "female",
          "freshmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "figureheads": "a"
        },
        "id": "front-men,-frontmen-front-women,-frontwomen",
        "inconsiderate": {
          "front women, frontwomen": "female",
          "front men, frontmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "lead": "a",
          "front": "a",
          "figurehead": "a"
        },
        "id": "frontman,-front-man-frontwoman,-front-woman",
        "inconsiderate": {
          "frontwoman, front woman": "female",
          "frontman, front man": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "person": "a",
          "friend": "a",
          "pal": "a",
          "folk": "a",
          "individual": "a"
        },
        "id": "gal-guy",
        "inconsiderate": {
          "woman": "female",
          "gal": "female",
          "lady": "female",
          "babe": "female",
          "bimbo": "female",
          "chick": "female",
          "guy": "male",
          "lad": "male",
          "fellow": "male",
          "dude": "male",
          "bro": "male",
          "gentleman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "people": "a",
          "persons": "a",
          "folks": "a"
        },
        "id": "gals-man",
        "inconsiderate": {
          "women": "female",
          "girls": "female",
          "gals": "female",
          "ladies": "female",
          "man": "male",
          "boys": "male",
          "men": "male",
          "guys": "male",
          "dudes": "male",
          "gents": "male",
          "gentlemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "garbage collector": "a",
          "waste collector": "a",
          "trash collector": "a"
        },
        "id": "garbageman-garbagewoman",
        "inconsiderate": {
          "garbagewoman": "female",
          "garbageman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "garbage collectors": "a",
          "waste collectors": "a",
          "trash collectors": "a"
        },
        "id": "garbagemen-garbagewomen",
        "inconsiderate": {
          "garbagewomen": "female",
          "garbagemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "gay issues": "a"
        },
        "id": "gay-agenda",
        "inconsiderate": {
          "gay agenda": "a",
          "homosexual agenda": "a"
        },
        "note": "Used by anti-LGBTQ+ extremists to create a climate of fear around LGBTQ+ issues (source: https://www.glaad.org/reference/offensive)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "gay lives": "a",
          "gay/lesbian lives": "a"
        },
        "id": "gay-lifestyle",
        "inconsiderate": {
          "gay lifestyle": "a",
          "homosexual lifestyle": "a"
        },
        "note": "Implies that being LGBTQ+ is a choice (source: https://www.glaad.org/reference/offensive)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "equal rights": "a",
          "civil rights for gay people": "a"
        },
        "id": "gay-rights",
        "inconsiderate": {
          "special rights": "a",
          "gay rights": "a"
        },
        "note": "LGBTQ+ rights are human rights (source: https://www.glaad.org/reference/style)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "pronoun": "a",
          "pronouns": "a"
        },
        "id": "gender-pronoun",
        "inconsiderate": {
          "preferred pronoun": "a",
          "preferred pronouns": "a",
          "gender pronoun": "a",
          "gender pronouns": "a"
        },
        "note": "Preferred pronoun sounds like it is optional to use someone's correct pronoun (source: https://www.selfdefined.app/definitions/pronouns/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "projects": "a",
          "urban": "a"
        },
        "id": "ghetto",
        "inconsiderate": {
          "ghetto": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with a limp": "a"
        },
        "id": "gimp",
        "inconsiderate": {
          "cripple": "a",
          "crippled": "a",
          "gimp": "a"
        },
        "note": "Refer to the specific disability.",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "godparent": "a",
          "elder": "a",
          "patron": "a"
        },
        "id": "godfather-godmother",
        "inconsiderate": {
          "godmother": "female",
          "patroness": "female",
          "godfather": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "a person who is not Jewish": "a",
          "not Jewish": "a"
        },
        "id": "goy",
        "inconsiderate": {
          "goyim": "a",
          "goyum": "a",
          "goy": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "grandparent": "a",
          "ancestor": "a"
        },
        "id": "gramps-granny",
        "inconsiderate": {
          "granny": "female",
          "grandma": "female",
          "grandmother": "female",
          "grandpappy": "male",
          "granddaddy": "male",
          "gramps": "male",
          "grandpa": "male",
          "grandfather": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "grandchild": "a"
        },
        "id": "granddaughter-grandson",
        "inconsiderate": {
          "granddaughter": "female",
          "grandson": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "grandchildren": "a"
        },
        "id": "granddaughters-grandsons",
        "inconsiderate": {
          "granddaughters": "female",
          "grandsons": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "legacy policy": "a",
          "legacy clause": "a",
          "deprecation policy": "a"
        },
        "id": "grandfather-clause",
        "inconsiderate": {
          "grandfather clause": "a",
          "grandfather policy": "a"
        },
        "note": "Avoid using phrases referring to racist United States \u201CJim Crow\u201D laws. (source: https://en.wikipedia.org/wiki/Grandfather_clause#Origin)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "deprecated": "a",
          "legacy": "a"
        },
        "id": "grandfathered",
        "inconsiderate": {
          "grandfathered": "a"
        },
        "note": "Avoid using phrases referring to racist United States \u201CJim Crow\u201D laws. (source: https://en.wikipedia.org/wiki/Grandfather_clause#Origin)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "deprecate": "a"
        },
        "id": "grandfathering",
        "inconsiderate": {
          "grandfathering": "a"
        },
        "note": "Avoid using phrases referring to racist United States \u201CJim Crow\u201D laws. (source: https://en.wikipedia.org/wiki/Grandfather_clause#Origin)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "grandparents": "a",
          "ancestors": "a"
        },
        "id": "grandfathers-grandmothers",
        "inconsiderate": {
          "grandmothers": "female",
          "grandfathers": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Nomad": "a",
          "Traveler": "a",
          "Roma": "a",
          "Romani": "a"
        },
        "id": "gyp",
        "inconsiderate": {
          "gyppo": "a",
          "gypsy": "a",
          "Gipsy": "a",
          "gyp": "a"
        },
        "note": "Gypsy is insensitive, use Roma or Romani. They\u2019re not Egyptian as the name suggests. (source: en.wikipedia.org/wiki/Romani_people#cite_ref-80)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with a handicap": "a",
          "accessible": "a"
        },
        "id": "handicapped",
        "inconsiderate": {
          "handicapped": "a"
        },
        "note": "Refer to the person, rather than the disability, first. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "accessible parking": "a"
        },
        "id": "handicapped-parking",
        "inconsiderate": {
          "handicapped parking": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "artisan": "a",
          "craftsperson": "a",
          "skilled worker": "a"
        },
        "id": "handyman-handywoman",
        "inconsiderate": {
          "handywoman": "female",
          "craftswoman": "female",
          "handyman": "male",
          "craftsman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "artisans": "a",
          "craftspersons": "a",
          "skilled workers": "a"
        },
        "id": "handymen-handywomen",
        "inconsiderate": {
          "handywomen": "female",
          "craftswomen": "female",
          "handymen": "male",
          "craftsmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "the app froze": "a",
          "the app stopped responding": "a",
          "the app stopped responding to events": "a",
          "the app became unresponsive": "a"
        },
        "id": "hang",
        "inconsiderate": {
          "hang": "a",
          "hanged": "a"
        },
        "note": "When describing the behavior of computer software, using the word \u201Changed\u201D needlessly invokes the topic of death by self-harm or lynching.  Consider using the word \u201Cfroze\u201D or the phrase \u201Cstopped responding to events\u201D or \u201Cbecame unresponsive\u201D instead.",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "guillotine": "a"
        },
        "id": "hangman-hangwoman",
        "inconsiderate": {
          "hangwoman": "female",
          "hangman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "guillotines": "a"
        },
        "id": "hangmen-hangwomen",
        "inconsiderate": {
          "hangwomen": "female",
          "hangmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "cleft-lip and palate": "a"
        },
        "id": "harelip",
        "inconsiderate": {
          "harelip": "a",
          "hare lip": "a"
        },
        "note": "Source: https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with a cleft-lip and palate": "a"
        },
        "id": "harelipped",
        "inconsiderate": {
          "harelipped": "a",
          "cleftlipped": "a"
        },
        "note": "Sometimes it's cleft lip or palate, not both. Specify when possible. (source: https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html)",
        "type": "basic"
      },
      {
        "apostrophe": true,
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "they": "a",
          "it": "a"
        },
        "id": "he-she",
        "inconsiderate": {
          "she": "female",
          "he": "male",
          "she'd": "female",
          "he'd": "male",
          "she'll": "female",
          "he'll": "male",
          "she's": "female",
          "he's": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "hard of hearing": "a",
          "partially deaf": "a",
          "partial hearing loss": "a",
          "deaf": "a"
        },
        "id": "hearing-impaired",
        "inconsiderate": {
          "hearing impaired": "a",
          "hearing impairment": "a"
        },
        "note": "When possible, ask the person what they prefer. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "sidekick": "a"
        },
        "id": "henchman-henchwoman",
        "inconsiderate": {
          "henchwoman": "female",
          "henchman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "sidekicks": "a"
        },
        "id": "henchmen-henchwomen",
        "inconsiderate": {
          "henchwomen": "female",
          "henchmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "condition": "when referring to a person",
        "considerate": {
          "their": "a",
          "theirs": "a",
          "them": "a"
        },
        "id": "her-him",
        "inconsiderate": {
          "her": "female",
          "hers": "female",
          "him": "male",
          "his": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person who is intersex": "a",
          "person": "a",
          "intersex person": "a"
        },
        "id": "hermaphrodite",
        "inconsiderate": {
          "hermaphrodite": "a",
          "pseudohermaphrodite": "a",
          "pseudo hermaphrodite": "a"
        },
        "note": "These terms are stigmatizing to patients and their families because intersex status is more complicated than the mere presence or absence of certain gonadal tissues (source: http://www.isna.org/node/979)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "intersex": "a"
        },
        "id": "hermaphroditic",
        "inconsiderate": {
          "hermaphroditic": "a",
          "pseudohermaphroditic": "a",
          "pseudo hermaphroditic": "a"
        },
        "note": "These terms are stigmatizing to patients and their families because intersex status is more complicated than the mere presence or absence of certain gonadal tissues (source: http://www.isna.org/node/979)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "role-model": "a",
          "mentor": "a"
        },
        "id": "hero-heroine",
        "inconsiderate": {
          "heroine": "female",
          "hero": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "role-models": "a",
          "mentor": "a"
        },
        "id": "heroes-heroines",
        "inconsiderate": {
          "heroines": "female",
          "heroes": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "themselves": "a",
          "theirself": "a",
          "self": "a"
        },
        "id": "herself-himself",
        "inconsiderate": {
          "herself": "female",
          "himself": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "transgender person": "a",
          "person": "a"
        },
        "id": "heshe",
        "inconsiderate": {
          "shemale": "a",
          "she male": "a",
          "heshe": "a",
          "shehe": "a"
        },
        "note": "This word dehumanizes transgender people (source: https://www.reddit.com/r/asktransgender/comments/23wbq1/is_the_term_shemale_seen_as_offensive/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "gay": "a",
          "gay man": "a",
          "lesbian": "a",
          "gay person/people": "a"
        },
        "id": "homosexual",
        "inconsiderate": {
          "homosexual": "a"
        },
        "note": "This term has a clinical history and is used to imply LGBTQ+ people are diseased or psychologically/emotionally disordered (source: https://www.glaad.org/reference/offensive)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "couple": "a"
        },
        "id": "homosexual-couple",
        "inconsiderate": {
          "homosexual couple": "a"
        },
        "note": "Avoid labeling something as LGBTQ+ unless you would call the same thing \u201Cstraight\u201D (source: https://www.glaad.org/reference/offensive)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "gay marriage": "a",
          "same-sex marriage": "a"
        },
        "id": "homosexual-marriage",
        "inconsiderate": {
          "homosexual marriage": "a"
        },
        "note": "Homosexual has a clinical history and is used to imply LGBTQ+ people are diseased or psychologically/emotionally disordered (source: https://www.glaad.org/reference/style)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "relationship": "a"
        },
        "id": "homosexual-relations",
        "inconsiderate": {
          "homosexual relations": "a",
          "homosexual relationship": "a"
        },
        "note": "Avoid labeling something as LGBTQ+ unless you would call the same thing \u201Cstraight\u201D (source: https://www.glaad.org/reference/offensive)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "presenter": "a",
          "entertainer": "a",
          "emcee": "a"
        },
        "id": "host-hostess",
        "inconsiderate": {
          "hostess": "female",
          "host": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "presenters": "a",
          "entertainers": "a",
          "emcees": "a"
        },
        "id": "hostesses-hosts",
        "inconsiderate": {
          "hostesses": "female",
          "hosts": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "house worker": "a",
          "domestic help": "a"
        },
        "id": "housemaid",
        "inconsiderate": {
          "housemaid": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female"
        ],
        "considerate": {
          "homemaker": "a",
          "homeworker": "a"
        },
        "id": "housewife",
        "inconsiderate": {
          "housewife": "female"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female"
        ],
        "considerate": {
          "homemakers": "a",
          "homeworkers": "a"
        },
        "id": "housewives",
        "inconsiderate": {
          "housewives": "female"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "partner": "a",
          "significant other": "a",
          "spouse": "a"
        },
        "id": "husband-wife",
        "inconsiderate": {
          "wife": "female",
          "husband": "male"
        },
        "note": "Source: https://www.bustle.com/articles/108321-6-reasons-to-refer-to-your-significant-other-as-your-partner",
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "partners": "a",
          "significant others": "a",
          "spouses": "a"
        },
        "id": "husbands-wives",
        "inconsiderate": {
          "wives": "female",
          "husbands": "male"
        },
        "note": "Source: https://www.bustle.com/articles/108321-6-reasons-to-refer-to-your-significant-other-as-your-partner",
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Jewish person": "a"
        },
        "id": "hymie",
        "inconsiderate": {
          "shlomo": "a",
          "shyster": "a",
          "hymie": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "foolish": "a",
          "ludicrous": "a",
          "silly": "a"
        },
        "id": "idiot",
        "inconsiderate": {
          "feebleminded": "a",
          "feeble minded": "a",
          "idiot": "a",
          "imbecile": "a"
        },
        "note": "Source: https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "enemy territory": "a"
        },
        "id": "indian-country",
        "inconsiderate": {
          "Indian country": "a"
        },
        "note": "Avoid using phrases referring to the genocidal United States \u201CIndian Removal\u201D laws. (source: https://newsmaven.io/indiancountrytoday/archive/off-the-reservation-a-teachable-moment-nW1d7U0JRkOszhtg8N1V1A/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "go back on one\u2019s offer": "a"
        },
        "id": "indian-give",
        "inconsiderate": {
          "indian give": "a",
          "indian giver": "a"
        },
        "note": "Avoid using phrases referring to colonial stereotypes regarding Native Americans.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "industrial civilization": "a",
          "industrial people": "a"
        },
        "id": "industrial-man",
        "inconsiderate": {
          "industrial man": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "incredibly": "a"
        },
        "id": "insanely",
        "inconsiderate": {
          "insanely": "a"
        },
        "note": "Describe the behavior or illness without derogatory words.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "restlessness": "a",
          "sleeplessness": "a"
        },
        "id": "insomnia",
        "inconsiderate": {
          "insomnia": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person who has insomnia": "a"
        },
        "id": "insomniac",
        "inconsiderate": {
          "insomniac": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "people who have insomnia": "a"
        },
        "id": "insomniacs",
        "inconsiderate": {
          "insomniacs": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "insurance agent": "a"
        },
        "id": "insurance-man-insurance-woman",
        "inconsiderate": {
          "insurance woman": "female",
          "insurance man": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "insurance agents": "a"
        },
        "id": "insurance-men-insurance-women",
        "inconsiderate": {
          "insurance women": "female",
          "insurance men": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with an intellectual disability": "a"
        },
        "id": "intellectually-disabled",
        "inconsiderate": {
          "intellectually disabled": "a",
          "has intellectual issues": "a",
          "suffers from intellectual disabilities": "a",
          "suffering from intellectual disabilities": "a",
          "suffering from an intellectual disability": "a",
          "afflicted with intellectual disabilities": "a",
          "afflicted with a intellectual disability": "a"
        },
        "note": "Assumes that a person with an intellectual disability has a reduced quality of life. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "people with intellectual disabilities": "a"
        },
        "id": "intellectually-disabled-people",
        "inconsiderate": {
          "intellectually disabled people": "a"
        },
        "note": "Refer to the person, rather than the disability, first. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "turned off": "a",
          "has a disability": "a",
          "person with a disability": "a",
          "people with disabilities": "a"
        },
        "id": "invalid",
        "inconsiderate": {
          "disabled": "a",
          "invalid": "a"
        },
        "note": "Refer to the person, rather than the disability, first.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "muslim": "a",
          "person of Islamic faith": "a",
          "fanatic": "a",
          "zealot": "a",
          "follower of islam": "a",
          "follower of the islamic faith": "a"
        },
        "id": "islamist",
        "inconsiderate": {
          "islamist": "a"
        },
        "note": "Source: https://www.usnews.com/news/newsgram/articles/2013/04/04/the-associated-press-revises-islamist-another-politically-charged-term",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "muslims": "a",
          "people of Islamic faith": "a",
          "fanatics": "a",
          "zealots": "a"
        },
        "id": "islamists",
        "inconsiderate": {
          "islamists": "a"
        },
        "note": "Source: https://www.usnews.com/news/newsgram/articles/2013/04/04/the-associated-press-revises-islamist-another-politically-charged-term",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "cleaner": "a"
        },
        "id": "janitor-janitress",
        "inconsiderate": {
          "cleaning lady": "female",
          "cleaning girl": "female",
          "cleaning woman": "female",
          "janitress": "female",
          "cleaning man": "male",
          "cleaning boy": "male",
          "janitor": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "cleaners": "a",
          "housekeeping": "a"
        },
        "id": "janitors-janitresses",
        "inconsiderate": {
          "cleaning ladies": "female",
          "cleaning girls": "female",
          "janitresses": "female",
          "cleaning men": "male",
          "janitors": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Japanese person": "a",
          "Japanese people": "a"
        },
        "id": "japs",
        "inconsiderate": {
          "japs": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "journeyperson": "a"
        },
        "id": "journeyman-journeywoman",
        "inconsiderate": {
          "journeywoman": "female",
          "journeyman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "journeypersons": "a"
        },
        "id": "journeymen-journeywomen",
        "inconsiderate": {
          "journeywomen": "female",
          "journeymen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "id": "just",
        "inconsiderate": {
          "just": "a"
        },
        "note": "Not everything is as easy as you might think. And if it isn\u2019t easy for the reader, it can hurt. (source: https://css-tricks.com/words-avoid-educational-writing/)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "ruler": "a"
        },
        "id": "king-queen",
        "inconsiderate": {
          "empress": "female",
          "queen": "female",
          "emperor": "male",
          "king": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "power behind the throne": "a"
        },
        "id": "kingmaker-queenmaker",
        "inconsiderate": {
          "queenmaker": "female",
          "kingmaker": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "rulers": "a"
        },
        "id": "kings-queens",
        "inconsiderate": {
          "empresses": "female",
          "queens": "female",
          "emperors": "male",
          "kings": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "jumbo": "a",
          "gigantic": "a"
        },
        "id": "kingsize-queensize",
        "inconsiderate": {
          "queensize": "female",
          "kingsize": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "doctor": "a"
        },
        "id": "lady-doctor",
        "inconsiderate": {
          "lady doctor": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female"
        ],
        "considerate": {
          "courteous": "a",
          "cultured": "a"
        },
        "id": "ladylike",
        "inconsiderate": {
          "ladylike": "female"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "boring": "a",
          "dull": "a"
        },
        "id": "lame",
        "inconsiderate": {
          "lame": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "proprietors": "a",
          "building managers": "a"
        },
        "id": "landladies-landlords",
        "inconsiderate": {
          "landladies": "female",
          "landlords": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "proprietor": "a",
          "building manager": "a"
        },
        "id": "landlady-landlord",
        "inconsiderate": {
          "landlady": "female",
          "landlord": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Latinx": "a"
        },
        "id": "latino",
        "inconsiderate": {
          "latino": "a",
          "latina": "a"
        },
        "note": "Whenever possible, try to be gender inclusive.",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "civilian": "a"
        },
        "id": "layman-laywoman",
        "inconsiderate": {
          "laywoman": "female",
          "layman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "civilians": "a"
        },
        "id": "laymen-laywomen",
        "inconsiderate": {
          "laywomen": "female",
          "laymen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "lead": "a"
        },
        "id": "leading-lady",
        "inconsiderate": {
          "leading lady": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with learning disabilities": "a"
        },
        "id": "learning-disabled",
        "inconsiderate": {
          "learning disabled": "a"
        },
        "note": "Refer to the person, rather than the disability, first.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "disagreeable": "a",
          "uneducated": "a",
          "ignorant": "a",
          "naive": "a",
          "inconsiderate": "a"
        },
        "id": "libtard",
        "inconsiderate": {
          "fucktard": "a",
          "libtard": "a",
          "contard": "a"
        },
        "note": "Source: https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "resolutely": "a",
          "bravely": "a"
        },
        "id": "like-a-man",
        "inconsiderate": {
          "like a man": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "I haven\u2019t seen you in a long time": "a",
          "it\u2019s been a long time": "a"
        },
        "id": "long-time-no-see",
        "inconsiderate": {
          "long time no hear": "a",
          "long time no see": "a"
        },
        "note": "Avoid using phrases that implicitly mock people with limited knowledge of the English language. (source: https://www.npr.org/sections/codeswitch/2014/03/09/288300303/who-first-said-long-time-no-see-and-in-which-language)",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "fanatic": "a",
          "zealot": "a",
          "enthusiast": "a"
        },
        "id": "madman",
        "inconsiderate": {
          "madman": "male",
          "mad man": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "fanatics": "a",
          "zealots": "a",
          "enthusiasts": "a"
        },
        "id": "madmen",
        "inconsiderate": {
          "madmen": "male",
          "mad men": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "virgin": "a"
        },
        "id": "maiden",
        "inconsiderate": {
          "maiden": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female"
        ],
        "considerate": {
          "first flight": "a"
        },
        "id": "maiden-flight",
        "inconsiderate": {
          "maiden flight": "female"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female"
        ],
        "considerate": {
          "birth name": "a"
        },
        "id": "maiden-name",
        "inconsiderate": {
          "maiden name": "female"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "first race": "a"
        },
        "id": "maiden-race",
        "inconsiderate": {
          "maiden race": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "first speech": "a"
        },
        "id": "maiden-speech",
        "inconsiderate": {
          "maiden speech": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female"
        ],
        "considerate": {
          "first voyage": "a"
        },
        "id": "maiden-voyage",
        "inconsiderate": {
          "maiden voyage": "female"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "improve": "a"
        },
        "id": "make-*-great-again",
        "inconsiderate": {
          "make * great again": "a",
          "make * * great again": "a",
          "make * * * great again": "a",
          "make * * * * great again": "a",
          "make * * * * * great again": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "staff a desk": "a"
        },
        "id": "man-a-desk",
        "inconsiderate": {
          "man a desk": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "strong enough": "a"
        },
        "id": "man-enough",
        "inconsiderate": {
          "man enough": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "ordinary citizen": "a",
          "typical person": "a",
          "average person": "a"
        },
        "id": "man-in-the-street",
        "inconsiderate": {
          "man in the street": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "dynamo": "a"
        },
        "id": "man-of-action",
        "inconsiderate": {
          "man of action": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "scholar": "a",
          "writer": "a",
          "literary figure": "a"
        },
        "id": "man-of-letters",
        "inconsiderate": {
          "man of letters": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "farmer": "a",
          "rural worker": "a",
          "grazier": "a",
          "landowner": "a",
          "rural community": "a",
          "country people": "a",
          "country folk": "a"
        },
        "id": "man-of-the-land",
        "inconsiderate": {
          "man of the land": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "sophisticate": "a"
        },
        "id": "man-of-the-world",
        "inconsiderate": {
          "man of the world": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "staff the booth": "a"
        },
        "id": "man-the-booth",
        "inconsiderate": {
          "man the booth": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "keep an eye on things": "a",
          "keep shop": "a",
          "provide coverage": "a",
          "cover things": "a",
          "take charge": "a"
        },
        "id": "man-the-fort",
        "inconsiderate": {
          "man the fort": "a"
        },
        "note": "Avoid using terms that implies colonialism/genocide against Indigenous peoples",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "answer the phones": "a"
        },
        "id": "man-the-phones",
        "inconsiderate": {
          "man the phones": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "adulthood": "a",
          "personhood": "a",
          "maturity": "a"
        },
        "id": "manhood-womanhood",
        "inconsiderate": {
          "womanhood": "female",
          "masculinity": "male",
          "manhood": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "staff hour": "a",
          "hour of work": "a"
        },
        "id": "manhour",
        "inconsiderate": {
          "manhour": "male",
          "man hour": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "staff hours": "a",
          "hours of work": "a",
          "hours of labor": "a",
          "hours": "a"
        },
        "id": "manhours",
        "inconsiderate": {
          "manhours": "male",
          "man hours": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "fanatic": "a",
          "zealot": "a",
          "enthusiast": "a"
        },
        "id": "maniac",
        "inconsiderate": {
          "maniac": "a"
        },
        "note": "Source: https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with schizophrenia": "a"
        },
        "id": "manic",
        "inconsiderate": {
          "suffers from schizophrenia": "a",
          "suffering from schizophrenia": "a",
          "afflicted with schizophrenia": "a",
          "manic": "a"
        },
        "note": "Assumes a person with schizophrenia experiences a reduced quality of life. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "humankind": "a"
        },
        "id": "mankind",
        "inconsiderate": {
          "mankind": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "manufactured": "a",
          "artificial": "a",
          "synthetic": "a",
          "machine-made": "a",
          "constructed": "a"
        },
        "id": "manmade",
        "inconsiderate": {
          "manmade": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "staffed": "a",
          "crewed": "a",
          "piloted": "a"
        },
        "id": "manned",
        "inconsiderate": {
          "manned": "a"
        },
        "note": "Using gender neutral language means users will help to break up gender stereotypes.",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "human resources": "a",
          "workforce": "a",
          "personnel": "a",
          "staff": "a",
          "labor": "a",
          "labor force": "a",
          "staffing": "a",
          "combat personnel": "a"
        },
        "id": "manpower",
        "inconsiderate": {
          "manpower": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "a faithful dog": "a"
        },
        "id": "mans-best-friend",
        "inconsiderate": {
          "mans best friend": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "a demanding task": "a",
          "a big job": "a"
        },
        "id": "mansized-task",
        "inconsiderate": {
          "mansized task": "a",
          "man sized task": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "shooter": "a"
        },
        "id": "marksman-markswoman",
        "inconsiderate": {
          "markswoman": "female",
          "marksman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "shooters": "a"
        },
        "id": "marksmen-markswomen",
        "inconsiderate": {
          "markswomen": "female",
          "marksmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "primary": "a",
          "lead": "a",
          "hub": "a",
          "reference": "a"
        },
        "id": "master",
        "inconsiderate": {
          "master": "a"
        },
        "note": "Avoid using the term `master`; these suggestions are for the computer term, but there are better alternatives for other cases too",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "pass key": "a",
          "original": "a"
        },
        "id": "master-key",
        "inconsiderate": {
          "master key": "a",
          "master copy": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "emcee": "a",
          "moderator": "a",
          "convenor": "a"
        },
        "id": "master-of-ceremonies",
        "inconsiderate": {
          "master of ceremonies": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "grand scheme": "a",
          "guiding principles": "a"
        },
        "id": "master-plan",
        "inconsiderate": {
          "master plan": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "become skilled": "a"
        },
        "id": "master-the-art",
        "inconsiderate": {
          "master the art": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "skilled": "a",
          "authoritative": "a",
          "commanding": "a"
        },
        "id": "masterful",
        "inconsiderate": {
          "masterful": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "genius": "a",
          "creator": "a",
          "instigator": "a",
          "oversee": "a",
          "launch": "a",
          "originate": "a"
        },
        "id": "mastermind",
        "inconsiderate": {
          "mastermind": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "work of genius": "a",
          "chef d\u2019oeuvre": "a"
        },
        "id": "masterpiece",
        "inconsiderate": {
          "masterpiece": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "vision": "a",
          "comprehensive plan": "a"
        },
        "id": "masterplan",
        "inconsiderate": {
          "masterplan": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "primaries": "a",
          "hubs": "a",
          "references": "a"
        },
        "id": "masters",
        "inconsiderate": {
          "masters": "a"
        },
        "note": "Avoid using the term `master`; these suggestions are for the computer term, but there are better alternatives for other cases too",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "trump card": "a",
          "stroke of genius": "a"
        },
        "id": "masterstroke",
        "inconsiderate": {
          "masterstroke": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "parental": "a",
          "warm": "a",
          "intimate": "a"
        },
        "id": "maternal-paternal",
        "inconsiderate": {
          "maternal": "female",
          "paternal": "male",
          "fraternal": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "parental": "a"
        },
        "id": "maternity-paternity",
        "inconsiderate": {
          "maternity": "female",
          "paternity": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "scientists": "a"
        },
        "id": "men-of-science",
        "inconsiderate": {
          "men of science": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "intermediary": "a",
          "go-between": "a"
        },
        "id": "middleman-middlewoman",
        "inconsiderate": {
          "middlewoman": "female",
          "middleman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "intermediaries": "a",
          "go-betweens": "a"
        },
        "id": "middlemen-middlewomen",
        "inconsiderate": {
          "middlewomen": "female",
          "middlemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "birthing nurse": "a"
        },
        "id": "midwife",
        "inconsiderate": {
          "midwife": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "milk person": "a"
        },
        "id": "milkman-milkwoman",
        "inconsiderate": {
          "milkwoman": "female",
          "milkman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "milk people": "a"
        },
        "id": "milkmen-milkwomen",
        "inconsiderate": {
          "milkwomen": "female",
          "milkmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "whine": "a",
          "complain": "a",
          "cry": "a"
        },
        "id": "moan",
        "inconsiderate": {
          "bitch": "a",
          "moan": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "whining": "a",
          "complaining": "a",
          "crying": "a"
        },
        "id": "moaning",
        "inconsiderate": {
          "bitching": "a",
          "moaning": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "modern civilization": "a",
          "modern people": "a"
        },
        "id": "modern-man",
        "inconsiderate": {
          "modern man": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with Down Syndrome": "a"
        },
        "id": "mongoloid",
        "inconsiderate": {
          "mongoloid": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female"
        ],
        "considerate": {
          "loving": "a",
          "warm": "a",
          "nurturing": "a"
        },
        "id": "motherly",
        "inconsiderate": {
          "motherly": "female"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female"
        ],
        "considerate": {
          "ms.": "a"
        },
        "id": "mrs-",
        "inconsiderate": {
          "miss.": "female",
          "mrs.": "female"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person who has multiple sclerosis": "a"
        },
        "id": "multiple-sclerosis-victim",
        "inconsiderate": {
          "suffers from multiple sclerosis": "a",
          "suffering from multiple sclerosis": "a",
          "victim of multiple sclerosis": "a",
          "multiple sclerosis victim": "a",
          "afflicted with multiple sclerosis": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "dissatisfied": "a",
          "frustrated": "a"
        },
        "id": "natives-are-restless",
        "inconsiderate": {
          "natives are restless": "a",
          "natives are becoming restless": "a",
          "natives are getting restless": "a",
          "natives are growing restless": "a"
        },
        "note": "Avoid using phrases referring to colonial stereotypes regarding indigenous peoples. (source: https://tvtropes.org/pmwiki/pmwiki.php/Main/TheNativesAreRestless)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "nibling": "a",
          "sibling\u2019s child": "a"
        },
        "id": "nephew-niece",
        "inconsiderate": {
          "niece": "female",
          "nephew": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "niblings": "a",
          "sibling\u2019s children": "a"
        },
        "id": "nephews-nieces",
        "inconsiderate": {
          "nieces": "female",
          "nephews": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "anchor": "a",
          "journalist": "a"
        },
        "id": "newsman-newswoman",
        "inconsiderate": {
          "newswoman": "female",
          "newspaperwoman": "female",
          "anchorwoman": "female",
          "newsman": "male",
          "newspaperman": "male",
          "anchorman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "anchors": "a",
          "journalists": "a"
        },
        "id": "newsmen-newswomen",
        "inconsiderate": {
          "newswomen": "female",
          "newspaperwomen": "female",
          "anchorwomen": "female",
          "newsmen": "male",
          "newspapermen": "male",
          "anchormen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "unoccupied territory": "a",
          "wasteland": "a",
          "deathtrap": "a"
        },
        "id": "no-mans-land",
        "inconsiderate": {
          "no mans land": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "noble": "a"
        },
        "id": "nobleman-noblewoman",
        "inconsiderate": {
          "noblewoman": "female",
          "nobleman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "nobles": "a"
        },
        "id": "noblemen-noblewomen",
        "inconsiderate": {
          "noblewomen": "female",
          "noblemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person of color": "a",
          "people of color": "a"
        },
        "id": "nonwhite",
        "inconsiderate": {
          "nonwhite": "a",
          "non white": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "rude": "a",
          "malicious": "a",
          "mean": "a",
          "disgusting": "a",
          "incredible": "a",
          "vile": "a",
          "person with symptoms of mental illness": "a",
          "person with mental illness": "a",
          "person with symptoms of a mental disorder": "a",
          "person with a mental disorder": "a"
        },
        "id": "nuts",
        "inconsiderate": {
          "batshit": "a",
          "psycho": "a",
          "crazy": "a",
          "delirious": "a",
          "insane": "a",
          "insanity": "a",
          "loony": "a",
          "lunacy": "a",
          "lunatic": "a",
          "mentally ill": "a",
          "psychopathology": "a",
          "mental defective": "a",
          "moron": "a",
          "moronic": "a",
          "nuts": "a",
          "mental case": "a",
          "mental": "a"
        },
        "note": "Describe the behavior or illness without derogatory words. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "id": "obvious",
        "inconsiderate": {
          "obvious": "a",
          "obviously": "a"
        },
        "note": "Not everything is as obvious as you might think. And if it isn\u2019t obvious to the reader, it can hurt. (source: https://css-tricks.com/words-avoid-educational-writing/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "has an anxiety disorder": "a",
          "obsessive": "a",
          "pedantic": "a",
          "niggly": "a",
          "picky": "a"
        },
        "id": "ocd",
        "inconsiderate": {
          "neurotic": "a",
          "ocd": "a",
          "o.c.d": "a",
          "o.c.d.": "a"
        },
        "note": "Only use terms describing mental illness when referring to a professionally diagnosed medical condition. (source: https://english.stackexchange.com/questions/247550/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "id": "of-course",
        "inconsiderate": {
          "of course": "a"
        },
        "note": "If it\u2019s self-evident then maybe you don\u2019t need to describe it. If it isn\u2019t, don\u2019t say it. (source: https://css-tricks.com/words-avoid-educational-writing/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "disobey": "a",
          "endure": "a",
          "object to": "a",
          "oppose": "a",
          "resist": "a"
        },
        "id": "off-reserve",
        "inconsiderate": {
          "jump the reservation": "a",
          "off reserve": "a",
          "off the reservation": "a"
        },
        "note": "Avoid using phrases referring to the genocidal United States \u201CIndian Removal\u201D laws. (source: http://blog.nativepartnership.org/off-the-reservation/,https://www.wsj.com/articles/off-the-reservation-is-a-phrase-with-a-dark-past-1462552837,https://www.npr.org/sections/codeswitch/2014/06/29/326690947/should-saying-someone-is-off-the-reservation-be-off-limits,https://nowtoronto.com/news/native-references-and-terms-that-are-offensive-to-indigenous-people/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "administrative staff": "a"
        },
        "id": "office-girls",
        "inconsiderate": {
          "office girls": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "notary": "a",
          "consumer advocate": "a",
          "trouble shooter": "a",
          "omsbudperson": "a",
          "mediator": "a"
        },
        "id": "ombudsman-ombudswoman",
        "inconsiderate": {
          "ombudswoman": "female",
          "ombudsman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "notaries": "a",
          "omsbudpersons": "a",
          "omsbudpeople": "a",
          "mediators": "a"
        },
        "id": "ombudsmen-ombudswomen",
        "inconsiderate": {
          "ombudswomen": "female",
          "ombudsmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "defend": "a"
        },
        "id": "on-the-warpath",
        "inconsiderate": {
          "circle the wagons": "a",
          "on the warpath": "a"
        },
        "note": "Avoid using phrases referring to colonial stereotypes regarding Native Americans. (source: https://idioms.thefreedictionary.com/circle+the+wagons,https://idioms.thefreedictionary.com/go+on+the+warpath)",
        "type": "basic"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "upstaging": "a",
          "competitiveness": "a"
        },
        "id": "oneupmanship",
        "inconsiderate": {
          "oneupmanship": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Asian person": "a"
        },
        "id": "oriental",
        "inconsiderate": {
          "oriental": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Asian people": "a"
        },
        "id": "orientals",
        "inconsiderate": {
          "orientals": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "own person": "a"
        },
        "id": "own-man-own-woman",
        "inconsiderate": {
          "own woman": "female",
          "own man": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "fit of terror": "a",
          "scare": "a"
        },
        "id": "panic-attack",
        "inconsiderate": {
          "panic attack": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with paraplegia": "a"
        },
        "id": "paraplegic",
        "inconsiderate": {
          "paraplegic": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Filipinos": "a",
          "Filipino people": "a"
        },
        "id": "pinoys",
        "inconsiderate": {
          "pinoys": "a",
          "pinays": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "poet": "a"
        },
        "id": "poetess",
        "inconsiderate": {
          "poetess": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "officers": "a",
          "police officers": "a"
        },
        "id": "policemen-policewomen",
        "inconsiderate": {
          "policewomen": "female",
          "policemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "mail carrier": "a",
          "letter carrier": "a",
          "postal worker": "a"
        },
        "id": "postman-postwoman",
        "inconsiderate": {
          "postwoman": "female",
          "mailwoman": "female",
          "postman": "male",
          "mailman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "mail carriers": "a",
          "letter carriers": "a",
          "postal workers": "a"
        },
        "id": "postmen-postwomen",
        "inconsiderate": {
          "postwomen": "female",
          "mailwomen": "female",
          "postmen": "male",
          "mailmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "conference": "a",
          "gathering": "a",
          "meeting": "a"
        },
        "id": "powwow",
        "inconsiderate": {
          "pow wow": "a",
          "powwow": "a"
        },
        "note": "Avoid casually using this term, which refers to traditional indigenous celebration ceremonies that were banned by genocidal laws in the United States and Canada \u2014 Native people died fighting for this right. (source: https://twitter.com/chadloder/status/1203507070772793345,http://nativeappropriations.com/2012/09/paul-frank-offends-every-native-person-on-the-planet-with-fashion-night-out-dream-catchin-pow-wow.html,https://www.britannica.com/topic/powwow,https://nowtoronto.com/news/native-references-and-terms-that-are-offensive-to-indigenous-people/)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "heir": "a"
        },
        "id": "prince-princess",
        "inconsiderate": {
          "princess": "female",
          "prince": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "heirs": "a"
        },
        "id": "princes-princesses",
        "inconsiderate": {
          "princesses": "female",
          "princes": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with a psychotic condition": "a",
          "person with psychosis": "a"
        },
        "id": "psychotic",
        "inconsiderate": {
          "psychotic": "a",
          "suffers from psychosis": "a",
          "suffering from psychosis": "a",
          "afflicted with psychosis": "a",
          "victim of psychosis": "a"
        },
        "note": "Only use terms describing mental illness when referring to a professionally diagnosed medical condition.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "go for it": "a",
          "take a chance": "a",
          "make a move": "a",
          "take action": "a"
        },
        "id": "pull-the-trigger",
        "inconsiderate": {
          "pull the trigger": "a"
        },
        "note": "Avoid using terms that relate to gun violence.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with quadriplegia": "a"
        },
        "id": "quadriplegic",
        "inconsiderate": {
          "quadriplegic": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "railway worker": "a"
        },
        "id": "railwayman",
        "inconsiderate": {
          "railwayman": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Native American": "a"
        },
        "id": "redskin",
        "inconsiderate": {
          "red indian": "a",
          "pocahontas": "a",
          "redskin": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Native American People": "a"
        },
        "id": "redskins",
        "inconsiderate": {
          "red indians": "a",
          "redskins": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "treatment": "a"
        },
        "id": "rehab",
        "inconsiderate": {
          "rehab": "a",
          "detox": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "treatment center": "a"
        },
        "id": "rehab-center",
        "inconsiderate": {
          "rehab center": "a",
          "detox center": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "repairer": "a",
          "technician": "a"
        },
        "id": "repairman-repairwoman",
        "inconsiderate": {
          "repairwoman": "female",
          "repairman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "technicians": "a"
        },
        "id": "repairmen-repairwomen",
        "inconsiderate": {
          "repairwomen": "female",
          "repairmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "silly": "a",
          "dullard": "a",
          "person with Down Syndrome": "a",
          "person with developmental disabilities": "a",
          "delay": "a",
          "hold back": "a"
        },
        "id": "retard",
        "inconsiderate": {
          "retard": "a",
          "retarded": "a",
          "short bus": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "sillies": "a",
          "dullards": "a",
          "people with developmental disabilities": "a",
          "people with Down\u2019s Syndrome": "a",
          "delays": "a",
          "holds back": "a"
        },
        "id": "retards",
        "inconsiderate": {
          "retards": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "business executive": "a",
          "entrepreneur": "a",
          "business person": "a",
          "professional": "a"
        },
        "id": "salaryman-salarywoman",
        "inconsiderate": {
          "businesswoman": "female",
          "salarywoman": "female",
          "businessman": "male",
          "salaryman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "business executives": "a",
          "entrepreneurs": "a"
        },
        "id": "salarymen-salarywomen",
        "inconsiderate": {
          "businesswomen": "female",
          "salarywomen": "female",
          "career girl": "female",
          "career woman": "female",
          "businessmen": "male",
          "salarymen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "salesperson": "a",
          "sales clerk": "a",
          "sales rep": "a",
          "sales agent": "a",
          "sales attendant": "a",
          "seller": "a",
          "shop assistant": "a"
        },
        "id": "saleslady-salesman",
        "inconsiderate": {
          "saleswoman": "female",
          "sales woman": "female",
          "saleslady": "female",
          "salesman": "male",
          "sales man": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "sales clerks": "a",
          "sales reps": "a",
          "sales agents": "a",
          "sellers": "a"
        },
        "id": "salesmen-saleswomen",
        "inconsiderate": {
          "saleswomen": "female",
          "sales women": "female",
          "salesladies": "female",
          "salesmen": "male",
          "sales men": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "fairy": "a"
        },
        "id": "sandman-sandwoman",
        "inconsiderate": {
          "sandwoman": "female",
          "sandman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "fairies": "a"
        },
        "id": "sandmen-sandwomen",
        "inconsiderate": {
          "sandwomen": "female",
          "sandmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "correct": "a",
          "adequate": "a",
          "sufficient": "a",
          "consistent": "a",
          "valid": "a",
          "coherent": "a",
          "sensible": "a",
          "reasonable": "a"
        },
        "id": "sane",
        "inconsiderate": {
          "sane": "a"
        },
        "note": "When describing a mathematical or programmatic value, using the word \u201Csane\u201D needlessly invokes the topic of mental health.  Consider using a domain-specific or neutral term instead.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "check": "a",
          "assertion": "a",
          "validation": "a",
          "smoke test": "a"
        },
        "id": "sanity-check",
        "inconsiderate": {
          "sanity check": "a"
        },
        "note": "When describing a mathematical or programmatic value, using the phrase \u201Csanity check\u201D needlessly invokes the topic of mental health.  Consider using simply \u201Ccheck\u201D, or a domain-specific or neutral term, instead.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "simple": "a",
          "indigenous": "a",
          "hunter-gatherer": "a"
        },
        "id": "savage",
        "inconsiderate": {
          "primitive": "a",
          "savage": "a",
          "stone age": "a"
        },
        "note": "Avoid using terms that imply a group has not changed over time and that they are inferior",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with schizophrenia": "a"
        },
        "id": "schizo",
        "inconsiderate": {
          "schizophrenic": "a",
          "schizo": "a"
        },
        "note": "Only use terms describing mental illness when referring to a professionally diagnosed medical condition. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with dementia": "a"
        },
        "id": "senile",
        "inconsiderate": {
          "demented": "a",
          "senile": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "soldier": "a",
          "service representative": "a"
        },
        "id": "serviceman-servicewoman",
        "inconsiderate": {
          "servicewoman": "female",
          "serviceman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "soldiers": "a",
          "service representatives": "a"
        },
        "id": "servicemen-servicewomen",
        "inconsiderate": {
          "servicewomen": "female",
          "servicemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "sex reassignment surgery": "a",
          "gender confirmation surgery": "a"
        },
        "id": "sex-change-operation",
        "inconsiderate": {
          "sex change operation": "a"
        },
        "note": "Shift focus away from the assigned sex and towards the identified gender (source: https://www.glaad.org/reference/transgender)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "transition": "a",
          "gender confirmation surgery": "a"
        },
        "id": "sexchange",
        "inconsiderate": {
          "sexchange": "a",
          "sex change": "a"
        },
        "note": "Avoid overemphasizing surgery when discussing transgender people or the process of transition - it\u2019s not a necessary component (source: https://www.glaad.org/reference/transgender)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "sexual orientation": "a",
          "orientation": "a"
        },
        "id": "sexual-preference",
        "inconsiderate": {
          "sexual preference": "a"
        },
        "note": "Implies that being LGBTQ+ is a choice (source: https://www.glaad.org/reference/offensive)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "promoter": "a"
        },
        "id": "showman-showwoman",
        "inconsiderate": {
          "showwoman": "female",
          "showman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "promoters": "a"
        },
        "id": "showmen-showwomen",
        "inconsiderate": {
          "showwomen": "female",
          "show women": "female",
          "showmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "id": "simple",
        "inconsiderate": {
          "simple": "a",
          "simply": "a"
        },
        "note": "It\u2019s probably not that simple. Even if it is, you probably don\u2019t need to specifically say it. (source: https://css-tricks.com/words-avoid-educational-writing/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "secondary": "a",
          "worker": "a",
          "replica": "a",
          "node": "a"
        },
        "id": "slave",
        "inconsiderate": {
          "slave": "a"
        },
        "note": "Avoid using the term `slave`; these suggestions are for the computer term, but there are better alternatives for other cases too",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "secondaries": "a",
          "workers": "a",
          "replicas": "a",
          "nodes": "a"
        },
        "id": "slaves",
        "inconsiderate": {
          "slaves": "a"
        },
        "note": "Avoid using the term `slave`; these suggestions are for the computer term, but there are better alternatives for other cases too",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with a personality disorder": "a",
          "person with psychopathic personality": "a"
        },
        "id": "sociopath",
        "inconsiderate": {
          "sociopath": "a"
        },
        "note": "Only use terms describing mental illness when referring to a professionally diagnosed medical condition. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "people with psychopathic personalities": "a",
          "people with a personality disorder": "a"
        },
        "id": "sociopaths",
        "inconsiderate": {
          "sociopaths": "a"
        },
        "note": "Only use terms describing mental illness when referring to a professionally diagnosed medical condition. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "complex culture": "a"
        },
        "id": "sophisticated-culture",
        "inconsiderate": {
          "sophisticated culture": "a"
        },
        "note": "Avoid using terms that make some groups sound inferior. Replace \u201Csophisticated\u201D with a neutral term such as \u201Ccomplex\u201D",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "complex technology": "a"
        },
        "id": "sophisticated-technology",
        "inconsiderate": {
          "sophisticated technology": "a"
        },
        "note": "Avoid using terms that make some groups sound inferior. Replace \u201Csophisticated\u201D with a neutral term such as \u201Ccomplex\u201D",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "astronaut": "a"
        },
        "id": "spaceman-spacewoman",
        "inconsiderate": {
          "spacewoman": "female",
          "spaceman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "astronauts": "a"
        },
        "id": "spacemen-spacewomen",
        "inconsiderate": {
          "spacewomen": "female",
          "spacemen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "a Black person": "a"
        },
        "id": "spade",
        "inconsiderate": {
          "spade": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with cerebral palsy": "a",
          "twitch": "a",
          "flinch": "a"
        },
        "id": "spastic",
        "inconsiderate": {
          "spastic": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person with cerebral palsy": "a",
          "twitch": "a",
          "flinch": "a",
          "hectic": "a"
        },
        "id": "spaz",
        "inconsiderate": {
          "spaz": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "has a disability": "a",
          "person with a disability": "a",
          "people with disabilities": "a"
        },
        "id": "special",
        "inconsiderate": {
          "challenged": "a",
          "diffability": "a",
          "differently abled": "a",
          "handicapable": "a",
          "special": "a",
          "special needs": "a",
          "specially abled": "a"
        },
        "note": "Euphemisms for disabilities can be infantilizing. (source: http://cdrnys.org/blog/disability-dialogue/the-disability-dialogue-4-disability-euphemisms-that-need-to-bite-the-dust/,https://www.autistichoya.com/p/ableist-words-and-terms-to-avoid.html)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "athletes": "a",
          "Special Olympics athletes": "a"
        },
        "id": "special-olympians",
        "inconsiderate": {
          "special olympians": "a",
          "special olympic athletes": "a"
        },
        "note": "When possible, use the exact discipline of sport. (source: https://media.specialolympics.org/soi/files/press-kit/2014_FactSheet_Final.pdf)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "speaker": "a",
          "spokesperson": "a",
          "representative": "a"
        },
        "id": "spokesman-spokeswoman",
        "inconsiderate": {
          "spokeswoman": "female",
          "spokesman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "speakers": "a",
          "spokespersons": "a"
        },
        "id": "spokesmen-spokeswomen",
        "inconsiderate": {
          "spokeswomen": "female",
          "spokesmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "athlete": "a",
          "sports person": "a"
        },
        "id": "sportsman-sportswoman",
        "inconsiderate": {
          "sportswoman": "female",
          "sportsman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "fair": "a",
          "sporting": "a"
        },
        "id": "sportsmanlike",
        "inconsiderate": {
          "sportsmanlike": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "fairness": "a",
          "good humor": "a",
          "sense of fair play": "a"
        },
        "id": "sportsmanship",
        "inconsiderate": {
          "sportsmanship": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "athletes": "a",
          "sports persons": "a"
        },
        "id": "sportsmen-sportswomen",
        "inconsiderate": {
          "sportswomen": "female",
          "sportsmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "stuttering": "a",
          "disfluency of speech": "a"
        },
        "id": "stammering",
        "inconsiderate": {
          "stammering": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "senator": "a"
        },
        "id": "statesman-stateswoman",
        "inconsiderate": {
          "stateswoman": "female",
          "statesman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "diplomatic": "a"
        },
        "id": "statesmanlike",
        "inconsiderate": {
          "statesmanlike": "a",
          "statesman like": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "step-sibling": "a"
        },
        "id": "stepbrother-stepsister",
        "inconsiderate": {
          "stepsister": "female",
          "stepbrother": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "step-siblings": "a"
        },
        "id": "stepbrothers-stepsisters",
        "inconsiderate": {
          "stepsisters": "female",
          "stepbrothers": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "step-parent": "a"
        },
        "id": "stepdad-stepmom",
        "inconsiderate": {
          "stepmom": "female",
          "stepmother": "female",
          "stepdad": "male",
          "stepfather": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "step-parents": "a"
        },
        "id": "stepfathers-stepmothers",
        "inconsiderate": {
          "stepmothers": "female",
          "stepfathers": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "flight attendant": "a"
        },
        "id": "steward-stewardess",
        "inconsiderate": {
          "stewardess": "female",
          "steward": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "flight attendants": "a"
        },
        "id": "stewardesses-stewards",
        "inconsiderate": {
          "stewardesses": "female",
          "stewards": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "cattle worker": "a",
          "farmhand": "a",
          "drover": "a"
        },
        "id": "stockman",
        "inconsiderate": {
          "stockman": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "id": "straightforward",
        "inconsiderate": {
          "straight forward": "a",
          "straightforward": "a",
          "straight forwardly": "a",
          "straightforwardly": "a"
        },
        "note": "It\u2019s probably not that straight forward. Even if it is, you probably don\u2019t need to specifically say it.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "individual who has had a stroke": "a"
        },
        "id": "stroke-victim",
        "inconsiderate": {
          "stroke victim": "a",
          "suffering from a stroke": "a",
          "victim of a stroke": "a"
        },
        "note": "Refer to the person, rather than the condition, first.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person who stutters": "a"
        },
        "id": "stutterer",
        "inconsiderate": {
          "stutterer": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "has a disability": "a",
          "person with a disability": "a",
          "people with disabilities": "a"
        },
        "id": "suffers-from-disabilities",
        "inconsiderate": {
          "suffers from disabilities": "a",
          "suffering from disabilities": "a",
          "suffering from a disability": "a",
          "afflicted with disabilities": "a",
          "afflicted with a disability": "a"
        },
        "note": "Assumes that a person with a disability has a reduced quality of life. (source: https://ncdj.org/style-guide/)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "person who has muscular dystrophy": "a"
        },
        "id": "suffers-from-md",
        "inconsiderate": {
          "suffers from muscular dystrophy": "a",
          "afflicted with muscular dystrophy": "a",
          "suffers from MD": "a",
          "afflicted with MD": "a"
        },
        "note": "Refer to a person's condition as a state, not as an affliction. (source: https://ncdj.org/style-guide)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "a note from the deceased": "a"
        },
        "id": "suicide-note",
        "inconsiderate": {
          "suicide note": "a"
        },
        "note": "Source: https://www.afsp.org/news-events/for-the-media/reporting-on-suicide",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "rise in suicides": "a"
        },
        "id": "suicide-pact",
        "inconsiderate": {
          "suicide epidemic": "a",
          "epidemic of suicides": "a",
          "suicide pact": "a"
        },
        "note": "Using sensational words can cause copycat suicides or contagion (source: https://www.afsp.org/news-events/for-the-media/reporting-on-suicide)",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "titan": "a"
        },
        "id": "superman-superwoman",
        "inconsiderate": {
          "superwoman": "female",
          "superman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "titans": "a"
        },
        "id": "supermen-superwomen",
        "inconsiderate": {
          "superwomen": "female",
          "supermen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "tax commissioner": "a",
          "tax office": "a",
          "tax collector": "a"
        },
        "id": "tax-man",
        "inconsiderate": {
          "tax man": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "too many chefs in the kitchen": "a",
          "too many cooks spoil the broth": "a"
        },
        "id": "too-many-chiefs",
        "inconsiderate": {
          "too many chiefs": "a"
        },
        "note": "Avoid using phrases referring to colonial stereotypes regarding Native Americans. (source: https://idioms.thefreedictionary.com/too+many+chiefs+and+not+enough+Indians)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "favorite": "a",
          "inspiration": "a",
          "personal interest": "a",
          "personality type": "a"
        },
        "id": "totem",
        "inconsiderate": {
          "animal spirit": "a",
          "dream catcher": "a",
          "spirit animal": "a",
          "totem": "a"
        },
        "note": "Avoid using terms that oversimplify the complex and varied beliefs of indigenous religions. (source: https://www.worldreligionnews.com/opinion/spirit-animal-not-joke-oppression,https://www.spiralnature.com/spirituality/spirit-animal-cultural-appropriation)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Tourette syndrome": "a"
        },
        "id": "tourettes-syndrome",
        "inconsiderate": {
          "tourettes syndrome": "a",
          "tourettes disorder": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "Arabs": "a",
          "Middle Eastern People": "a"
        },
        "id": "towel-heads",
        "inconsiderate": {
          "towel heads": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "service entrance": "a"
        },
        "id": "tradesmans-entrance",
        "inconsiderate": {
          "tradesmans entrance": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "transgender": "a"
        },
        "id": "tranny",
        "inconsiderate": {
          "tranny": "a"
        },
        "note": "Derogatory terms for LGBTQ+ people are offensive (source: https://www.glaad.org/reference/style)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "transgender": "a"
        },
        "id": "transgendered",
        "inconsiderate": {
          "transgendered": "a"
        },
        "note": "Transgender is already an adjective (source: https://www.glaad.org/reference/transgender)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "being transgender": "a",
          "the movement for transgender equality": "a"
        },
        "id": "transgenderism",
        "inconsiderate": {
          "transgenderism": "a"
        },
        "note": "This is a term used by anti-transgender activists to dehumanize transgender people and reduce who they are to a condition (source: https://www.glaad.org/reference/transgender)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "transgender people": "a"
        },
        "id": "transgenders",
        "inconsiderate": {
          "transgenders": "a"
        },
        "note": "Transgender should be used as an adjective, not as a noun (source: https://www.glaad.org/reference/transgender)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "cross-dresser": "a"
        },
        "id": "transvestite",
        "inconsiderate": {
          "transvestite": "a"
        },
        "note": "Avoid using outdated / offensive terms (source: https://www.glaad.org/reference/transgender)",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "society": "a",
          "community": "a"
        },
        "id": "tribe",
        "inconsiderate": {
          "tribe": "a"
        },
        "note": "Avoid using terms that make some groups sound inferior",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "inhumane": "a"
        },
        "id": "unmanly-unwomanly",
        "inconsiderate": {
          "unwomanly": "female",
          "unwomenly": "female",
          "unmanly": "male",
          "unmenly": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "robotic": "a",
          "automated": "a"
        },
        "id": "unmanned",
        "inconsiderate": {
          "unmanned": "a"
        },
        "note": "Using gender neutral language means users will help to break up gender stereotypes.",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "usher": "a"
        },
        "id": "usherette",
        "inconsiderate": {
          "usherette": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "sustain an injury": "a",
          "receive an injury": "a"
        },
        "id": "victim-of-an-injury",
        "inconsiderate": {
          "suffer from an injury": "a",
          "suffers from an injury": "a",
          "suffering from an injury": "a",
          "afflicted with an injury": "a",
          "victim of an injury": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "sustain injuries": "a",
          "receive injuries": "a"
        },
        "id": "victim-of-injuries",
        "inconsiderate": {
          "suffer from injuries": "a",
          "suffers from injuries": "a",
          "suffering from injuries": "a",
          "afflicted with injuries": "a",
          "victim of injuries": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "polio": "a",
          "person who had polio": "a"
        },
        "id": "victim-of-polio",
        "inconsiderate": {
          "infantile paralysis": "a",
          "suffers from polio": "a",
          "suffering from polio": "a",
          "suffering from a polio": "a",
          "afflicted with polio": "a",
          "afflicted with a polio": "a",
          "victim of polio": "a"
        },
        "note": "Source: https://ncdj.org/style-guide/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "foolish": "a",
          "ludicrous": "a",
          "unintelligent": "a"
        },
        "id": "wacko",
        "inconsiderate": {
          "simpleton": "a",
          "stupid": "a",
          "wacko": "a",
          "whacko": "a",
          "low iq": "a"
        },
        "note": "Source: http://www.mmonjejr.com/2014/02/deconstructing-stupid.html",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "server": "a"
        },
        "id": "waiter-waitress",
        "inconsiderate": {
          "waitress": "female",
          "waiter": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "servers": "a"
        },
        "id": "waiters-waitresses",
        "inconsiderate": {
          "waitresses": "female",
          "waiters": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "watcher": "a"
        },
        "id": "watchman-watchwoman",
        "inconsiderate": {
          "watchwoman": "female",
          "watchman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "watchers": "a"
        },
        "id": "watchmen-watchwomen",
        "inconsiderate": {
          "watchwomen": "female",
          "watchmen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "weather forecaster": "a",
          "meteorologist": "a"
        },
        "id": "weatherman-weatherwoman",
        "inconsiderate": {
          "weatherwoman": "female",
          "weatherman": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "weather forecasters": "a",
          "meteorologists": "a"
        },
        "id": "weathermen-weatherwomen",
        "inconsiderate": {
          "weatherwomen": "female",
          "weathermen": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "uses a wheelchair": "a"
        },
        "id": "wheelchair-bound",
        "inconsiderate": {
          "confined to a wheelchair": "a",
          "bound to a wheelchair": "a",
          "restricted to a wheelchair": "a",
          "wheelchair bound": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "ethical hacker": "a",
          "security researcher": "a"
        },
        "id": "whitehat",
        "inconsiderate": {
          "whitehat": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "passlist": "a",
          "alrightlist": "a",
          "safelist": "a",
          "allow list": "a"
        },
        "id": "whitelist",
        "inconsiderate": {
          "whitelist": "a",
          "white list": "a"
        },
        "note": "Replace racially-charged language with more accurate and inclusive words",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "passlisted": "a",
          "alrightlisted": "a",
          "safelisted": "a",
          "allow-listed": "a"
        },
        "id": "whitelisted",
        "inconsiderate": {
          "whitelisted": "a"
        },
        "note": "Replace racially-charged language with more accurate and inclusive words",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "passlisting": "a",
          "alrightlisting": "a",
          "safelisting": "a",
          "allow-listing": "a"
        },
        "id": "whitelisting",
        "inconsiderate": {
          "whitelisting": "a"
        },
        "note": "Replace racially-charged language with more accurate and inclusive words",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "bereaved": "a"
        },
        "id": "widow-widower",
        "inconsiderate": {
          "widow": "female",
          "widows": "female",
          "widower": "male",
          "widowers": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "tank top": "a",
          "sleeveless undershirt": "a"
        },
        "id": "wifebeater",
        "inconsiderate": {
          "wife beater": "a",
          "wifebeater": "a"
        },
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "lawyer": "a"
        },
        "id": "woman-lawyer",
        "inconsiderate": {
          "woman lawyer": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "painter": "a"
        },
        "id": "woman-painter",
        "inconsiderate": {
          "woman painter": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "a"
        ],
        "considerate": {
          "wage or salary earning woman": "a",
          "two-income family": "a"
        },
        "id": "working-wife",
        "inconsiderate": {
          "working mother": "a",
          "working wife": "a"
        },
        "note": "Source: https://radyananda.wordpress.com/2009/06/06/nonsexist-alternative-language-handbook-for-conscious-writers/",
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "worker": "a",
          "wage earner": "a",
          "taxpayer": "a"
        },
        "id": "workman-workwoman",
        "inconsiderate": {
          "workwoman": "female",
          "working woman": "female",
          "workman": "male",
          "working man": "male"
        },
        "type": "or"
      },
      {
        "categories": [
          "male"
        ],
        "considerate": {
          "quality construction": "a",
          "expertise": "a"
        },
        "id": "workmanship",
        "inconsiderate": {
          "workmanship": "male"
        },
        "type": "basic"
      },
      {
        "categories": [
          "female",
          "male"
        ],
        "considerate": {
          "workers": "a"
        },
        "id": "workmen-workwomen",
        "inconsiderate": {
          "workwomen": "female",
          "workmen": "male"
        },
        "type": "or"
      }
    ];
  }
});

// node_modules/retext-equality/lib/en.js
var retextEquality, en_default;
var init_en = __esm({
  "node_modules/retext-equality/lib/en.js"() {
    init_create_plugin();
    init_patterns_en();
    retextEquality = createPlugin(patterns, "en");
    en_default = retextEquality;
  }
});

// node_modules/cuss/index.js
var cuss;
var init_cuss = __esm({
  "node_modules/cuss/index.js"() {
    cuss = {
      abbo: 1,
      abeed: 2,
      abid: 1,
      abo: 1,
      abortion: 1,
      abuse: 1,
      addict: 1,
      addicts: 1,
      adult: 0,
      africa: 0,
      african: 0,
      africoon: 2,
      alla: 1,
      allah: 0,
      "alligator bait": 2,
      alligatorbait: 2,
      amateur: 0,
      american: 0,
      anal: 1,
      analannie: 2,
      analsex: 1,
      angie: 0,
      angry: 0,
      anus: 1,
      arab: 0,
      arabs: 0,
      arabush: 2,
      arabushs: 2,
      areola: 1,
      argie: 2,
      armo: 2,
      armos: 2,
      aroused: 0,
      arse: 2,
      "arse bandit": 2,
      arsehole: 2,
      asian: 0,
      ass: 2,
      assassin: 0,
      assassinate: 0,
      assassination: 0,
      assault: 0,
      assbagger: 2,
      assblaster: 2,
      assclown: 2,
      asscowboy: 2,
      asses: 2,
      assfuck: 2,
      assfucker: 2,
      asshat: 2,
      asshole: 2,
      assholes: 2,
      asshore: 2,
      assjockey: 2,
      asskiss: 2,
      asskisser: 2,
      assklown: 2,
      asslick: 2,
      asslicker: 2,
      asslover: 2,
      assman: 2,
      assmonkey: 2,
      assmunch: 2,
      assmuncher: 2,
      asspacker: 2,
      asspirate: 2,
      asspuppies: 2,
      assranger: 2,
      asswhore: 2,
      asswipe: 2,
      athletesfoot: 1,
      attack: 0,
      australian: 0,
      babe: 1,
      babies: 0,
      backdoor: 0,
      backdoorman: 2,
      backseat: 0,
      badfuck: 2,
      balllicker: 2,
      balls: 1,
      ballsack: 1,
      banana: 0,
      bananas: 0,
      banging: 1,
      baptist: 0,
      barelylegal: 2,
      barf: 2,
      barface: 2,
      barfface: 2,
      bast: 0,
      bastard: 1,
      "batty boy": 2,
      bazongas: 2,
      bazooms: 2,
      beanbag: 2,
      beanbags: 2,
      beaner: 2,
      beaners: 2,
      beaney: 2,
      beaneys: 2,
      beast: 0,
      beastality: 1,
      beastial: 1,
      beastiality: 1,
      beatoff: 2,
      beatyourmeat: 2,
      beaver: 0,
      bender: 0,
      bent: 0,
      bestial: 1,
      bestiality: 1,
      bi: 0,
      biatch: 2,
      bible: 0,
      bicurious: 1,
      bigass: 2,
      bigbastard: 2,
      bigbutt: 2,
      bigger: 0,
      bisexual: 0,
      bitch: 1,
      bitcher: 2,
      bitches: 1,
      bitchez: 2,
      bitchin: 2,
      bitching: 2,
      bitchslap: 2,
      bitchy: 2,
      biteme: 2,
      black: 0,
      blackman: 1,
      blackout: 0,
      blacks: 1,
      blind: 0,
      blow: 0,
      blowjob: 2,
      bluegum: 2,
      bluegums: 2,
      boang: 2,
      boche: 2,
      boches: 2,
      bogan: 2,
      bohunk: 2,
      bollick: 2,
      bollock: 2,
      bollocks: 2,
      bomb: 0,
      bombers: 0,
      bombing: 0,
      bombs: 0,
      bomd: 0,
      bondage: 1,
      boner: 2,
      bong: 2,
      boob: 1,
      boobies: 2,
      boobs: 1,
      booby: 2,
      boody: 2,
      boom: 0,
      boong: 2,
      boonga: 2,
      boongas: 2,
      boongs: 2,
      boonie: 2,
      boonies: 2,
      bootlip: 2,
      bootlips: 2,
      booty: 2,
      bootycall: 2,
      bosch: 0,
      bosche: 2,
      bosches: 2,
      boschs: 2,
      "bounty bar": 1,
      "bounty bars": 1,
      bountybar: 1,
      bra: 0,
      brea5t: 2,
      breast: 0,
      breastjob: 2,
      breastlover: 2,
      breastman: 2,
      brothel: 1,
      brownie: 0,
      brownies: 0,
      buddhahead: 2,
      buddhaheads: 2,
      buffies: 2,
      buffy: 0,
      bufter: 2,
      bufty: 2,
      bugger: 2,
      buggered: 2,
      buggery: 2,
      bule: 2,
      bules: 2,
      bullcrap: 2,
      bulldike: 2,
      bulldyke: 2,
      bullshit: 2,
      "bum boy": 2,
      "bum chum": 2,
      "bum robber": 2,
      bumblefuck: 2,
      bumfuck: 2,
      bung: 2,
      bunga: 2,
      bungas: 2,
      bunghole: 2,
      buried: 0,
      burn: 0,
      "burr head": 2,
      "burr heads": 2,
      burrhead: 2,
      burrheads: 2,
      butchbabes: 2,
      butchdike: 2,
      butchdyke: 2,
      butt: 0,
      buttbang: 2,
      buttface: 2,
      buttfuck: 2,
      buttfucker: 2,
      buttfuckers: 2,
      butthead: 2,
      buttman: 2,
      buttmunch: 2,
      buttmuncher: 2,
      buttpirate: 2,
      buttplug: 1,
      buttstain: 2,
      byatch: 2,
      cacker: 2,
      "camel jockey": 2,
      "camel jockeys": 2,
      cameljockey: 2,
      cameltoe: 2,
      canadian: 0,
      cancer: 0,
      carpetmuncher: 2,
      carruth: 2,
      catholic: 0,
      catholics: 0,
      cemetery: 0,
      chav: 2,
      "cheese eating surrender monkey": 2,
      "cheese eating surrender monkies": 2,
      "cheeseeating surrender monkey": 2,
      "cheeseeating surrender monkies": 2,
      cheesehead: 2,
      cheeseheads: 2,
      cherrypopper: 2,
      "chi chi man": 2,
      chickslick: 2,
      childrens: 0,
      chin: 0,
      "china swede": 2,
      "china swedes": 2,
      chinaman: 2,
      chinamen: 2,
      chinaswede: 2,
      chinaswedes: 2,
      chinese: 0,
      "ching chong": 2,
      "ching chongs": 2,
      chingchong: 2,
      chingchongs: 2,
      chink: 2,
      chinks: 2,
      chinky: 2,
      choad: 2,
      chode: 2,
      chonkies: 2,
      chonky: 2,
      chonkys: 2,
      christ: 0,
      "christ killer": 2,
      "christ killers": 2,
      christian: 0,
      chug: 2,
      chugs: 2,
      chunger: 2,
      chungers: 2,
      chunkies: 2,
      chunky: 2,
      chunkys: 2,
      church: 0,
      cigarette: 0,
      cigs: 0,
      clamdigger: 2,
      clamdiver: 2,
      clansman: 2,
      clansmen: 2,
      clanswoman: 2,
      clanswomen: 2,
      clit: 1,
      clitoris: 1,
      clogwog: 2,
      cocaine: 1,
      cock: 1,
      cockblock: 2,
      cockblocker: 2,
      cockcowboy: 2,
      cockfight: 2,
      cockhead: 2,
      cockknob: 2,
      cocklicker: 2,
      cocklover: 2,
      cocknob: 2,
      cockqueen: 2,
      cockrider: 2,
      cocksman: 2,
      cocksmith: 2,
      cocksmoker: 2,
      cocksucer: 2,
      cocksuck: 2,
      cocksucked: 2,
      cocksucker: 2,
      cocksucking: 2,
      cocktail: 0,
      cocktease: 2,
      cocky: 2,
      coconut: 0,
      coconuts: 0,
      cohee: 2,
      coitus: 1,
      color: 0,
      colored: 0,
      coloured: 0,
      commie: 2,
      communist: 0,
      condom: 1,
      conservative: 0,
      conspiracy: 0,
      coolie: 2,
      coolies: 2,
      cooly: 2,
      coon: 2,
      "coon ass": 2,
      "coon asses": 2,
      coonass: 2,
      coonasses: 2,
      coondog: 2,
      coons: 2,
      copulate: 1,
      cornhole: 2,
      corruption: 0,
      cra5h: 1,
      crabs: 0,
      crack: 1,
      cracka: 2,
      cracker: 1,
      crackpipe: 1,
      crackwhore: 2,
      crap: 2,
      crapola: 2,
      crapper: 2,
      crappy: 2,
      crash: 0,
      creamy: 0,
      crime: 0,
      crimes: 0,
      criminal: 0,
      criminals: 0,
      crotch: 1,
      crotchjockey: 2,
      crotchmonkey: 2,
      crotchrot: 2,
      cum: 2,
      cumbubble: 2,
      cumfest: 2,
      cumjockey: 2,
      cumm: 2,
      cummer: 2,
      cumming: 2,
      cummings: 1,
      cumquat: 2,
      cumqueen: 2,
      cumshot: 2,
      cunilingus: 1,
      cunillingus: 1,
      cunn: 2,
      cunnilingus: 1,
      cunntt: 2,
      cunt: 2,
      cunteyed: 2,
      cuntfuck: 2,
      cuntfucker: 2,
      cuntlick: 2,
      cuntlicker: 2,
      cuntlicking: 2,
      cuntsucker: 2,
      "curry muncher": 2,
      "curry munchers": 2,
      currymuncher: 2,
      currymunchers: 2,
      cushi: 2,
      cushis: 2,
      cybersex: 1,
      cyberslimer: 2,
      dago: 2,
      dagos: 2,
      dahmer: 2,
      dammit: 2,
      damn: 1,
      damnation: 1,
      damnit: 2,
      darkey: 2,
      darkeys: 2,
      darkie: 2,
      darkies: 2,
      darky: 2,
      datnigga: 2,
      dead: 0,
      deapthroat: 2,
      death: 0,
      deepthroat: 2,
      defecate: 1,
      dego: 2,
      degos: 2,
      demon: 1,
      deposit: 0,
      desire: 0,
      destroy: 0,
      deth: 0,
      devil: 1,
      devilworshipper: 1,
      "diaper head": 2,
      "diaper heads": 2,
      diaperhead: 2,
      diaperheads: 2,
      dick: 1,
      dickbrain: 2,
      dickforbrains: 2,
      dickhead: 2,
      dickless: 2,
      dicklick: 2,
      dicklicker: 2,
      dickman: 2,
      dickwad: 2,
      dickweed: 2,
      diddle: 2,
      die: 0,
      died: 0,
      dies: 0,
      dike: 1,
      dildo: 1,
      dingleberry: 2,
      dink: 2,
      dinks: 2,
      dipshit: 2,
      dipstick: 2,
      dirty: 0,
      disease: 0,
      diseases: 0,
      disturbed: 0,
      dive: 0,
      dix: 2,
      dixiedike: 2,
      dixiedyke: 2,
      doggiestyle: 2,
      doggystyle: 2,
      dong: 2,
      doodoo: 2,
      doom: 0,
      dope: 2,
      "dot head": 2,
      "dot heads": 2,
      dothead: 2,
      dotheads: 2,
      dragqueen: 2,
      dragqween: 2,
      dripdick: 2,
      drug: 1,
      drunk: 1,
      drunken: 1,
      dumb: 2,
      dumbass: 2,
      dumbbitch: 2,
      dumbfuck: 2,
      "dune coon": 2,
      "dune coons": 2,
      dyefly: 2,
      dyke: 1,
      easyslut: 2,
      eatballs: 2,
      eatme: 2,
      eatpussy: 2,
      ecstacy: 0,
      "eight ball": 2,
      "eight balls": 2,
      ejaculate: 1,
      ejaculated: 1,
      ejaculating: 1,
      ejaculation: 1,
      enema: 1,
      enemy: 0,
      erect: 0,
      erection: 1,
      ero: 2,
      escort: 0,
      esqua: 2,
      ethiopian: 0,
      ethnic: 0,
      european: 0,
      evl: 2,
      excrement: 1,
      execute: 0,
      executed: 0,
      execution: 0,
      executioner: 0,
      exkwew: 2,
      explosion: 0,
      facefucker: 2,
      faeces: 2,
      fag: 1,
      fagging: 2,
      faggot: 2,
      fagot: 2,
      failed: 0,
      failure: 0,
      fairies: 0,
      fairy: 0,
      faith: 0,
      fannyfucker: 2,
      fart: 1,
      farted: 1,
      farting: 1,
      farty: 2,
      fastfuck: 2,
      fat: 0,
      fatah: 2,
      fatass: 2,
      fatfuck: 2,
      fatfucker: 2,
      fatso: 2,
      fckcum: 2,
      fear: 0,
      feces: 1,
      felatio: 1,
      felch: 2,
      felcher: 2,
      felching: 2,
      fellatio: 2,
      feltch: 2,
      feltcher: 2,
      feltching: 2,
      fetish: 1,
      fight: 0,
      filipina: 0,
      filipino: 0,
      fingerfood: 1,
      fingerfuck: 2,
      fingerfucked: 2,
      fingerfucker: 2,
      fingerfuckers: 2,
      fingerfucking: 2,
      fire: 0,
      firing: 0,
      fister: 2,
      fistfuck: 2,
      fistfucked: 2,
      fistfucker: 2,
      fistfucking: 2,
      fisting: 2,
      flamer: 1,
      flange: 2,
      flasher: 1,
      flatulence: 1,
      floo: 2,
      flydie: 2,
      flydye: 2,
      fok: 2,
      fondle: 1,
      footaction: 1,
      footfuck: 2,
      footfucker: 2,
      footlicker: 2,
      footstar: 2,
      fore: 0,
      foreskin: 1,
      forni: 2,
      fornicate: 1,
      foursome: 1,
      fourtwenty: 1,
      fraud: 0,
      freakfuck: 2,
      freakyfucker: 2,
      freefuck: 2,
      fruit: 0,
      fruitcake: 1,
      fu: 2,
      fubar: 2,
      fuc: 2,
      fucck: 2,
      fuck: 2,
      fucka: 2,
      fuckable: 2,
      fuckbag: 2,
      fuckbook: 2,
      fuckbuddy: 2,
      fucked: 2,
      fuckedup: 2,
      fucker: 2,
      fuckers: 2,
      fuckface: 2,
      fuckfest: 2,
      fuckfreak: 2,
      fuckfriend: 2,
      fuckhead: 2,
      fuckher: 2,
      fuckin: 2,
      fuckina: 2,
      fucking: 2,
      fuckingbitch: 2,
      fuckinnuts: 2,
      fuckinright: 2,
      fuckit: 2,
      fuckknob: 2,
      fuckme: 2,
      fuckmehard: 2,
      fuckmonkey: 2,
      fuckoff: 2,
      fuckpig: 2,
      fucks: 2,
      fucktard: 2,
      fuckwhore: 2,
      fuckyou: 2,
      "fudge packer": 2,
      fudgepacker: 2,
      fugly: 2,
      fuk: 2,
      fuks: 2,
      funeral: 0,
      funfuck: 2,
      fungus: 0,
      fuuck: 2,
      gable: 1,
      gables: 2,
      gangbang: 2,
      gangbanged: 2,
      gangbanger: 2,
      gangsta: 2,
      "gator bait": 2,
      gatorbait: 2,
      gay: 0,
      gaymuthafuckinwhore: 2,
      gaysex: 2,
      geez: 2,
      geezer: 2,
      geni: 2,
      genital: 1,
      german: 0,
      getiton: 2,
      gin: 0,
      ginzo: 2,
      ginzos: 2,
      gipp: 2,
      gippo: 2,
      gippos: 2,
      gipps: 2,
      girls: 0,
      givehead: 2,
      glazeddonut: 2,
      gob: 1,
      god: 1,
      godammit: 2,
      goddamit: 2,
      goddammit: 2,
      goddamn: 2,
      goddamned: 2,
      goddamnes: 2,
      goddamnit: 2,
      goddamnmuthafucker: 2,
      goldenshower: 2,
      golliwog: 2,
      golliwogs: 2,
      gonorrehea: 2,
      gonzagas: 1,
      gook: 2,
      "gook eye": 2,
      "gook eyes": 2,
      gookeye: 2,
      gookeyes: 2,
      gookies: 2,
      gooks: 2,
      gooky: 2,
      gora: 2,
      goras: 2,
      gotohell: 2,
      goy: 1,
      goyim: 1,
      greaseball: 2,
      greaseballs: 2,
      greaser: 2,
      greasers: 2,
      gringo: 2,
      gringos: 2,
      groe: 1,
      groid: 2,
      groids: 2,
      gross: 1,
      grostulation: 1,
      gub: 1,
      gubba: 2,
      gubbas: 2,
      gubs: 2,
      guinea: 1,
      guineas: 1,
      guizi: 1,
      gummer: 2,
      gun: 0,
      gwailo: 2,
      gwailos: 2,
      gweilo: 2,
      gweilos: 2,
      gyopo: 2,
      gyopos: 2,
      gyp: 2,
      gyped: 2,
      gypo: 2,
      gypos: 2,
      gypp: 2,
      gypped: 2,
      gyppie: 2,
      gyppies: 2,
      gyppo: 2,
      gyppos: 2,
      gyppy: 2,
      gyppys: 2,
      gypsies: 2,
      gypsy: 2,
      gypsys: 2,
      hadji: 2,
      hadjis: 2,
      hairyback: 2,
      hairybacks: 2,
      haji: 2,
      hajis: 2,
      hajji: 2,
      hajjis: 2,
      "half breed": 2,
      "half caste": 2,
      halfbreed: 2,
      halfcaste: 2,
      hamas: 1,
      handjob: 2,
      haole: 2,
      haoles: 2,
      hapa: 2,
      harder: 0,
      hardon: 2,
      harem: 0,
      headfuck: 2,
      headlights: 0,
      hebe: 2,
      hebephila: 1,
      hebephile: 1,
      hebephiles: 1,
      hebephilia: 1,
      hebephilic: 1,
      hebes: 2,
      heeb: 2,
      heebs: 2,
      hell: 0,
      henhouse: 0,
      heroin: 1,
      herpes: 1,
      heterosexual: 0,
      hijack: 0,
      hijacker: 0,
      hijacking: 0,
      hillbillies: 2,
      hillbilly: 2,
      hindoo: 2,
      hiscock: 2,
      hitler: 1,
      hitlerism: 2,
      hitlerist: 2,
      hiv: 1,
      ho: 2,
      hobo: 2,
      hodgie: 2,
      hoes: 2,
      hole: 0,
      holestuffer: 2,
      homicide: 1,
      homo: 2,
      homobangers: 2,
      homosexual: 1,
      honger: 2,
      honk: 0,
      honkers: 2,
      honkey: 2,
      honkeys: 2,
      honkie: 2,
      honkies: 2,
      honky: 2,
      hook: 0,
      hooker: 2,
      hookers: 2,
      hooters: 2,
      hore: 2,
      hori: 2,
      horis: 2,
      hork: 2,
      horn: 0,
      horney: 2,
      horniest: 2,
      horny: 1,
      horseshit: 2,
      hosejob: 2,
      hoser: 2,
      hostage: 0,
      hotdamn: 2,
      hotpussy: 2,
      hottotrot: 2,
      hummer: 0,
      hun: 0,
      huns: 0,
      husky: 0,
      hussy: 2,
      hustler: 0,
      hymen: 1,
      hymie: 2,
      hymies: 2,
      iblowu: 2,
      idiot: 2,
      ike: 1,
      ikes: 1,
      ikey: 1,
      ikeymo: 2,
      ikeymos: 2,
      ikwe: 2,
      illegal: 0,
      illegals: 1,
      incest: 1,
      indon: 2,
      indons: 2,
      injun: 2,
      injuns: 2,
      insest: 2,
      intercourse: 1,
      interracial: 1,
      intheass: 2,
      inthebuff: 2,
      israel: 0,
      israeli: 0,
      israels: 0,
      italiano: 1,
      itch: 0,
      jackass: 2,
      jackoff: 2,
      jackshit: 2,
      jacktheripper: 2,
      jade: 0,
      jap: 2,
      japanese: 0,
      japcrap: 2,
      japie: 2,
      japies: 2,
      japs: 2,
      jebus: 2,
      jeez: 2,
      jerkoff: 2,
      jerries: 1,
      jerry: 0,
      jesus: 1,
      jesuschrist: 1,
      jew: 0,
      jewboy: 2,
      jewed: 2,
      jewess: 2,
      jewish: 0,
      jig: 2,
      jiga: 2,
      jigaboo: 2,
      jigaboos: 2,
      jigarooni: 2,
      jigaroonis: 2,
      jigg: 2,
      jigga: 2,
      jiggabo: 2,
      jiggabos: 2,
      jiggas: 2,
      jigger: 2,
      jiggers: 2,
      jiggs: 2,
      jiggy: 2,
      jigs: 2,
      jihad: 1,
      jijjiboo: 2,
      jijjiboos: 2,
      jimfish: 2,
      jism: 2,
      jiz: 2,
      jizim: 2,
      jizjuice: 2,
      jizm: 2,
      jizz: 2,
      jizzim: 2,
      jizzum: 2,
      joint: 0,
      juggalo: 2,
      jugs: 0,
      "jungle bunnies": 2,
      "jungle bunny": 2,
      junglebunny: 2,
      kacap: 2,
      kacapas: 2,
      kacaps: 2,
      kaffer: 2,
      kaffir: 2,
      kaffre: 2,
      kafir: 2,
      kanake: 2,
      katsap: 2,
      katsaps: 2,
      khokhol: 2,
      khokhols: 2,
      kid: 0,
      kigger: 2,
      kike: 2,
      kikes: 2,
      kill: 0,
      killed: 0,
      killer: 0,
      killing: 0,
      kills: 0,
      kimchi: 0,
      kimchis: 2,
      kink: 1,
      kinky: 1,
      kissass: 2,
      kkk: 2,
      klansman: 2,
      klansmen: 2,
      klanswoman: 2,
      klanswomen: 2,
      knife: 0,
      knockers: 1,
      kock: 1,
      kondum: 2,
      koon: 2,
      kotex: 1,
      krap: 2,
      krappy: 2,
      kraut: 1,
      krauts: 2,
      kuffar: 2,
      kum: 2,
      kumbubble: 2,
      kumbullbe: 2,
      kummer: 2,
      kumming: 2,
      kumquat: 2,
      kums: 2,
      kunilingus: 2,
      kunnilingus: 2,
      kunt: 2,
      kushi: 2,
      kushis: 2,
      kwa: 2,
      "kwai lo": 2,
      "kwai los": 2,
      ky: 1,
      kyke: 2,
      kykes: 2,
      kyopo: 2,
      kyopos: 2,
      lactate: 1,
      laid: 0,
      lapdance: 1,
      latin: 0,
      lebo: 2,
      lebos: 2,
      lesbain: 2,
      lesbayn: 2,
      lesbian: 0,
      lesbin: 2,
      lesbo: 2,
      lez: 2,
      lezbe: 2,
      lezbefriends: 2,
      lezbo: 2,
      lezz: 2,
      lezzo: 2,
      liberal: 0,
      libido: 1,
      licker: 1,
      lickme: 2,
      lies: 0,
      limey: 2,
      limpdick: 2,
      limy: 2,
      lingerie: 0,
      liquor: 1,
      livesex: 2,
      loadedgun: 2,
      lolita: 1,
      looser: 2,
      loser: 2,
      lotion: 0,
      lovebone: 2,
      lovegoo: 2,
      lovegun: 2,
      lovejuice: 2,
      lovemuscle: 2,
      lovepistol: 2,
      loverocket: 2,
      lowlife: 2,
      lsd: 1,
      lubejob: 2,
      lubra: 2,
      lucifer: 0,
      luckycammeltoe: 2,
      lugan: 2,
      lugans: 2,
      lynch: 1,
      mabuno: 2,
      mabunos: 2,
      macaca: 2,
      macacas: 2,
      mad: 0,
      mafia: 1,
      magicwand: 2,
      mahbuno: 2,
      mahbunos: 2,
      mams: 2,
      manhater: 2,
      manpaste: 2,
      marijuana: 1,
      mastabate: 2,
      mastabater: 2,
      masterbate: 2,
      masterblaster: 2,
      mastrabator: 2,
      masturbate: 2,
      masturbating: 2,
      mattressprincess: 2,
      "mau mau": 2,
      "mau maus": 2,
      maumau: 2,
      maumaus: 2,
      meatbeatter: 2,
      meatrack: 2,
      meth: 1,
      mexican: 0,
      mgger: 2,
      mggor: 2,
      mick: 1,
      mickeyfinn: 2,
      mideast: 0,
      milf: 2,
      minority: 0,
      mockey: 2,
      mockie: 2,
      mocky: 2,
      mofo: 2,
      moky: 2,
      moles: 0,
      molest: 1,
      molestation: 1,
      molester: 1,
      molestor: 1,
      moneyshot: 2,
      "moon cricket": 2,
      "moon crickets": 2,
      mooncricket: 2,
      mooncrickets: 2,
      mormon: 0,
      moron: 2,
      moskal: 2,
      moskals: 2,
      moslem: 2,
      mosshead: 2,
      mothafuck: 2,
      mothafucka: 2,
      mothafuckaz: 2,
      mothafucked: 2,
      mothafucker: 2,
      mothafuckin: 2,
      mothafucking: 2,
      mothafuckings: 2,
      motherfuck: 2,
      motherfucked: 2,
      motherfucker: 2,
      motherfuckin: 2,
      motherfucking: 2,
      motherfuckings: 2,
      motherlovebone: 2,
      muff: 2,
      muffdive: 2,
      muffdiver: 2,
      muffindiver: 2,
      mufflikcer: 2,
      mulatto: 2,
      muncher: 2,
      munt: 2,
      murder: 1,
      murderer: 1,
      muslim: 0,
      mzungu: 2,
      mzungus: 2,
      naked: 0,
      nancy: 0,
      narcotic: 1,
      nasty: 0,
      nastybitch: 2,
      nastyho: 2,
      nastyslut: 2,
      nastywhore: 2,
      nazi: 1,
      necro: 1,
      negres: 2,
      negress: 2,
      negro: 2,
      negroes: 2,
      negroid: 2,
      negros: 2,
      nig: 2,
      nigar: 2,
      nigars: 2,
      niger: 0,
      nigerian: 1,
      nigerians: 1,
      nigers: 2,
      nigette: 2,
      nigettes: 2,
      nigg: 2,
      nigga: 2,
      niggah: 2,
      niggahs: 2,
      niggar: 2,
      niggaracci: 2,
      niggard: 2,
      niggarded: 2,
      niggarding: 2,
      niggardliness: 2,
      niggardlinesss: 2,
      niggardly: 0,
      niggards: 2,
      niggars: 2,
      niggas: 2,
      niggaz: 2,
      nigger: 2,
      niggerhead: 2,
      niggerhole: 2,
      niggers: 2,
      niggle: 2,
      niggled: 2,
      niggles: 2,
      niggling: 2,
      nigglings: 2,
      niggor: 2,
      niggress: 2,
      niggresses: 2,
      nigguh: 2,
      nigguhs: 2,
      niggur: 2,
      niggurs: 2,
      niglet: 2,
      nignog: 2,
      nigor: 2,
      nigors: 2,
      nigr: 2,
      nigra: 2,
      nigras: 2,
      nigre: 2,
      nigres: 2,
      nigress: 2,
      nigs: 2,
      nip: 2,
      nipple: 1,
      nipplering: 1,
      nittit: 2,
      nlgger: 2,
      nlggor: 2,
      nofuckingway: 2,
      nook: 1,
      nookey: 2,
      nookie: 2,
      noonan: 2,
      nooner: 1,
      nude: 1,
      nudger: 2,
      nuke: 1,
      nutfucker: 2,
      nymph: 1,
      ontherag: 2,
      oral: 1,
      oreo: 0,
      oreos: 0,
      orga: 2,
      orgasim: 2,
      orgasm: 1,
      orgies: 1,
      orgy: 1,
      osama: 0,
      paddy: 1,
      paederastic: 1,
      paederasts: 1,
      paederasty: 1,
      paki: 2,
      pakis: 2,
      palesimian: 2,
      palestinian: 0,
      "pancake face": 2,
      "pancake faces": 2,
      pansies: 2,
      pansy: 2,
      panti: 2,
      panties: 0,
      payo: 2,
      pearlnecklace: 1,
      peck: 1,
      pecker: 1,
      peckerwood: 2,
      pederastic: 1,
      pederasts: 1,
      pederasty: 1,
      pedo: 2,
      pedophile: 1,
      pedophiles: 1,
      pedophilia: 1,
      pedophilic: 1,
      pee: 1,
      peehole: 2,
      peepee: 2,
      peepshow: 1,
      peepshpw: 2,
      pendy: 1,
      penetration: 1,
      peni5: 2,
      penile: 1,
      penis: 1,
      penises: 1,
      penthouse: 0,
      period: 0,
      perv: 2,
      phonesex: 1,
      phuk: 2,
      phuked: 2,
      phuking: 2,
      phukked: 2,
      phukking: 2,
      phungky: 2,
      phuq: 2,
      pi55: 2,
      picaninny: 2,
      piccaninny: 2,
      pickaninnies: 2,
      pickaninny: 2,
      piefke: 2,
      piefkes: 2,
      piker: 2,
      pikey: 2,
      piky: 2,
      "pillow biter": 2,
      pimp: 2,
      pimped: 2,
      pimper: 2,
      pimpjuic: 2,
      pimpjuice: 2,
      pimpsimp: 2,
      pindick: 2,
      piss: 2,
      pissed: 2,
      pisser: 2,
      pisses: 2,
      pisshead: 2,
      pissin: 2,
      pissing: 2,
      pissoff: 2,
      pistol: 1,
      pixie: 1,
      pixy: 1,
      playboy: 1,
      playgirl: 1,
      pocha: 2,
      pochas: 2,
      pocho: 2,
      pochos: 2,
      pocketpool: 2,
      pohm: 2,
      pohms: 2,
      polack: 2,
      polacks: 2,
      pollock: 2,
      pollocks: 2,
      pom: 2,
      pommie: 2,
      "pommie grant": 2,
      "pommie grants": 2,
      pommies: 2,
      pommy: 2,
      poms: 2,
      poo: 2,
      poof: 2,
      poofta: 2,
      poofter: 2,
      poon: 2,
      poontang: 2,
      poop: 2,
      pooper: 2,
      pooperscooper: 2,
      pooping: 2,
      poorwhitetrash: 2,
      popimp: 2,
      "porch monkey": 2,
      "porch monkies": 2,
      porchmonkey: 2,
      porn: 1,
      pornflick: 1,
      pornking: 2,
      porno: 1,
      pornography: 1,
      pornprincess: 2,
      pot: 0,
      poverty: 0,
      "prairie nigger": 2,
      "prairie niggers": 2,
      premature: 0,
      pric: 2,
      prick: 2,
      prickhead: 2,
      primetime: 0,
      propaganda: 0,
      pros: 0,
      prostitute: 1,
      protestant: 1,
      pu55i: 2,
      pu55y: 2,
      pube: 1,
      pubic: 1,
      pubiclice: 2,
      pud: 2,
      pudboy: 2,
      pudd: 2,
      puddboy: 2,
      puke: 2,
      puntang: 2,
      purinapricness: 2,
      puss: 2,
      pussie: 2,
      pussies: 2,
      pussy: 1,
      pussycat: 1,
      pussyeater: 2,
      pussyfucker: 2,
      pussylicker: 2,
      pussylips: 2,
      pussylover: 2,
      pussypounder: 2,
      pusy: 2,
      quashie: 2,
      que: 0,
      queef: 2,
      queer: 1,
      quickie: 2,
      quim: 2,
      ra8s: 2,
      rabbi: 0,
      racial: 0,
      racist: 1,
      radical: 1,
      radicals: 1,
      raghead: 2,
      ragheads: 2,
      randy: 1,
      rape: 1,
      raped: 1,
      raper: 2,
      rapist: 1,
      rearend: 2,
      rearentry: 2,
      rectum: 1,
      redleg: 2,
      redlegs: 2,
      redlight: 0,
      redneck: 2,
      rednecks: 2,
      redskin: 2,
      redskins: 2,
      reefer: 2,
      reestie: 2,
      refugee: 0,
      reject: 0,
      remains: 0,
      rentafuck: 2,
      republican: 0,
      rere: 2,
      retard: 2,
      retarded: 2,
      ribbed: 1,
      rigger: 2,
      rimjob: 2,
      rimming: 2,
      roach: 0,
      robber: 0,
      "round eyes": 2,
      roundeye: 2,
      rump: 0,
      russki: 2,
      russkie: 2,
      sadis: 2,
      sadom: 2,
      sambo: 2,
      sambos: 2,
      samckdaddy: 2,
      "sand nigger": 2,
      "sand niggers": 2,
      sandm: 2,
      sandnigger: 2,
      satan: 1,
      scag: 1,
      scallywag: 2,
      scat: 1,
      schlong: 2,
      schvartse: 2,
      schvartsen: 2,
      schwartze: 2,
      schwartzen: 2,
      screw: 1,
      screwyou: 2,
      scrotum: 1,
      scum: 1,
      semen: 1,
      seppo: 2,
      seppos: 2,
      septic: 1,
      septics: 1,
      servant: 0,
      sex: 1,
      sexed: 2,
      sexfarm: 2,
      sexhound: 2,
      sexhouse: 1,
      sexing: 2,
      sexkitten: 2,
      sexpot: 2,
      sexslave: 2,
      sextogo: 2,
      sextoy: 1,
      sextoys: 1,
      sexual: 1,
      sexually: 1,
      sexwhore: 2,
      sexy: 1,
      sexymoma: 2,
      sexyslim: 2,
      shag: 1,
      shaggin: 2,
      shagging: 2,
      shat: 2,
      shav: 2,
      shawtypimp: 2,
      sheeney: 2,
      shhit: 2,
      shiksa: 2,
      shinola: 1,
      shit: 1,
      shitcan: 2,
      shitdick: 2,
      shite: 2,
      shiteater: 2,
      shited: 2,
      shitface: 2,
      shitfaced: 2,
      shitfit: 2,
      shitforbrains: 2,
      shitfuck: 2,
      shitfucker: 2,
      shitfull: 2,
      shithapens: 2,
      shithappens: 2,
      shithead: 2,
      shithouse: 2,
      shiting: 2,
      shitlist: 2,
      shitola: 2,
      shitoutofluck: 2,
      shits: 2,
      shitstain: 2,
      shitted: 2,
      shitter: 2,
      shitting: 2,
      shitty: 2,
      shoot: 0,
      shooting: 0,
      shortfuck: 2,
      showtime: 0,
      shylock: 2,
      shylocks: 2,
      sick: 0,
      sissy: 2,
      sixsixsix: 2,
      sixtynine: 2,
      sixtyniner: 2,
      skank: 2,
      skankbitch: 2,
      skankfuck: 2,
      skankwhore: 2,
      skanky: 2,
      skankybitch: 2,
      skankywhore: 2,
      skinflute: 2,
      skum: 2,
      skumbag: 2,
      skwa: 2,
      skwe: 2,
      slant: 0,
      slanteye: 2,
      slanty: 2,
      slapper: 2,
      slaughter: 1,
      slav: 0,
      slave: 2,
      slavedriver: 2,
      sleezebag: 2,
      sleezeball: 2,
      slideitin: 2,
      slime: 0,
      slimeball: 2,
      slimebucket: 2,
      slope: 0,
      slopehead: 2,
      slopeheads: 2,
      sloper: 2,
      slopers: 2,
      slopes: 0,
      slopey: 2,
      slopeys: 2,
      slopies: 2,
      slopy: 2,
      slut: 2,
      sluts: 2,
      slutt: 2,
      slutting: 2,
      slutty: 2,
      slutwear: 2,
      slutwhore: 2,
      smack: 1,
      smackthemonkey: 2,
      smut: 2,
      snatch: 1,
      snatchpatch: 2,
      snigger: 0,
      sniggered: 0,
      sniggering: 0,
      sniggers: 1,
      sniper: 0,
      snot: 0,
      snowback: 2,
      snownigger: 2,
      sob: 0,
      sod: 0,
      sodom: 1,
      sodomise: 2,
      sodomite: 1,
      sodomize: 2,
      sodomy: 2,
      sonofabitch: 2,
      sonofbitch: 2,
      sooties: 2,
      sooty: 2,
      sos: 0,
      soviet: 0,
      spa: 0,
      spade: 1,
      spades: 1,
      spaghettibender: 2,
      spaghettinigger: 2,
      spank: 1,
      spankthemonkey: 2,
      spearchucker: 2,
      spearchuckers: 2,
      sperm: 1,
      spermacide: 2,
      spermbag: 2,
      spermhearder: 2,
      spermherder: 2,
      spic: 2,
      spick: 2,
      spicks: 2,
      spics: 2,
      spig: 2,
      spigotty: 2,
      spik: 2,
      spit: 2,
      spitter: 2,
      splittail: 2,
      spooge: 2,
      spreadeagle: 2,
      spunk: 2,
      spunky: 2,
      sqeh: 2,
      squa: 2,
      squarehead: 2,
      squareheads: 2,
      squaw: 2,
      squinty: 2,
      stagg: 1,
      stiffy: 1,
      strapon: 1,
      stringer: 2,
      stripclub: 2,
      stroke: 0,
      stroking: 1,
      stuinties: 2,
      stupid: 2,
      stupidfuck: 2,
      stupidfucker: 2,
      suck: 1,
      suckdick: 2,
      sucker: 2,
      suckme: 2,
      suckmyass: 2,
      suckmydick: 2,
      suckmytit: 2,
      suckoff: 2,
      suicide: 1,
      swallow: 1,
      swallower: 2,
      swalow: 2,
      "swamp guinea": 2,
      "swamp guineas": 2,
      swastika: 1,
      sweetness: 0,
      syphilis: 1,
      taboo: 0,
      tacohead: 2,
      tacoheads: 2,
      taff: 2,
      tampon: 0,
      tang: 2,
      tantra: 1,
      "tar babies": 2,
      "tar baby": 2,
      tarbaby: 2,
      tard: 2,
      teat: 1,
      terror: 0,
      terrorist: 1,
      teste: 2,
      testicle: 1,
      testicles: 1,
      thicklip: 2,
      thicklips: 2,
      thirdeye: 2,
      thirdleg: 2,
      threesome: 1,
      threeway: 2,
      "timber nigger": 2,
      "timber niggers": 2,
      timbernigger: 2,
      tinker: 2,
      tinkers: 2,
      tinkle: 1,
      tit: 1,
      titbitnipply: 2,
      titfuck: 2,
      titfucker: 2,
      titfuckin: 2,
      titjob: 2,
      titlicker: 2,
      titlover: 2,
      tits: 1,
      tittie: 2,
      titties: 2,
      titty: 2,
      tnt: 1,
      toilet: 0,
      tongethruster: 2,
      tongue: 0,
      tonguethrust: 2,
      tonguetramp: 2,
      tortur: 2,
      torture: 1,
      tosser: 2,
      "towel head": 2,
      "towel heads": 2,
      towelhead: 2,
      trailertrash: 2,
      tramp: 1,
      trannie: 2,
      tranny: 2,
      transexual: 0,
      transsexual: 0,
      transvestite: 2,
      trap: 1,
      triplex: 2,
      trisexual: 1,
      trojan: 0,
      trots: 1,
      tuckahoe: 2,
      tunneloflove: 2,
      turd: 1,
      turnon: 2,
      twat: 2,
      twink: 2,
      twinkie: 2,
      twobitwhore: 2,
      uck: 2,
      uk: 0,
      ukrop: 2,
      "uncle tom": 2,
      unfuckable: 2,
      upskirt: 2,
      uptheass: 2,
      upthebutt: 2,
      urinary: 0,
      urinate: 0,
      urine: 0,
      usama: 2,
      uterus: 1,
      vagina: 1,
      vaginal: 1,
      vatican: 0,
      vibr: 2,
      vibrater: 2,
      vibrator: 1,
      vietcong: 0,
      violence: 0,
      virgin: 0,
      virginbreaker: 2,
      vomit: 2,
      vulva: 1,
      wab: 2,
      wank: 2,
      wanker: 2,
      wanking: 2,
      waysted: 2,
      weapon: 0,
      weenie: 2,
      weewee: 2,
      welcher: 2,
      welfare: 2,
      wetb: 2,
      wetback: 2,
      wetbacks: 2,
      wetspot: 2,
      whacker: 2,
      whash: 2,
      whigger: 2,
      whiggers: 2,
      whiskey: 0,
      whiskeydick: 2,
      whiskydick: 2,
      whit: 1,
      "white trash": 2,
      whitenigger: 2,
      whites: 1,
      whitetrash: 2,
      whitey: 2,
      whiteys: 2,
      whities: 2,
      whiz: 2,
      whop: 2,
      whore: 2,
      whorefucker: 2,
      whorehouse: 2,
      wigga: 2,
      wiggas: 2,
      wigger: 2,
      wiggers: 2,
      willie: 2,
      williewanker: 2,
      willy: 1,
      wn: 2,
      wog: 2,
      wogs: 2,
      womens: 0,
      wop: 2,
      wtf: 2,
      wuss: 2,
      wuzzie: 2,
      xkwe: 2,
      xtc: 1,
      xxx: 1,
      yank: 2,
      yankee: 1,
      yankees: 1,
      yanks: 2,
      yarpie: 2,
      yarpies: 2,
      yellowman: 2,
      yid: 2,
      yids: 2,
      zigabo: 2,
      zigabos: 2,
      zipperhead: 2,
      zipperheads: 2
    };
  }
});

// node_modules/pluralize/pluralize.js
var require_pluralize = __commonJS({
  "node_modules/pluralize/pluralize.js"(exports, module) {
    (function(root, pluralize2) {
      if (typeof __require === "function" && typeof exports === "object" && typeof module === "object") {
        module.exports = pluralize2();
      } else if (typeof define === "function" && define.amd) {
        define(function() {
          return pluralize2();
        });
      } else {
        root.pluralize = pluralize2();
      }
    })(exports, function() {
      var pluralRules = [];
      var singularRules = [];
      var uncountables = {};
      var irregularPlurals = {};
      var irregularSingles = {};
      function sanitizeRule(rule) {
        if (typeof rule === "string") {
          return new RegExp("^" + rule + "$", "i");
        }
        return rule;
      }
      function restoreCase(word2, token) {
        if (word2 === token) return token;
        if (word2 === word2.toLowerCase()) return token.toLowerCase();
        if (word2 === word2.toUpperCase()) return token.toUpperCase();
        if (word2[0] === word2[0].toUpperCase()) {
          return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
        }
        return token.toLowerCase();
      }
      function interpolate(str2, args) {
        return str2.replace(/\$(\d{1,2})/g, function(match, index2) {
          return args[index2] || "";
        });
      }
      function replace2(word2, rule) {
        return word2.replace(rule[0], function(match, index2) {
          var result = interpolate(rule[1], arguments);
          if (match === "") {
            return restoreCase(word2[index2 - 1], result);
          }
          return restoreCase(match, result);
        });
      }
      function sanitizeWord(token, word2, rules) {
        if (!token.length || uncountables.hasOwnProperty(token)) {
          return word2;
        }
        var len = rules.length;
        while (len--) {
          var rule = rules[len];
          if (rule[0].test(word2)) return replace2(word2, rule);
        }
        return word2;
      }
      function replaceWord(replaceMap, keepMap, rules) {
        return function(word2) {
          var token = word2.toLowerCase();
          if (keepMap.hasOwnProperty(token)) {
            return restoreCase(word2, token);
          }
          if (replaceMap.hasOwnProperty(token)) {
            return restoreCase(word2, replaceMap[token]);
          }
          return sanitizeWord(token, word2, rules);
        };
      }
      function checkWord(replaceMap, keepMap, rules, bool2) {
        return function(word2) {
          var token = word2.toLowerCase();
          if (keepMap.hasOwnProperty(token)) return true;
          if (replaceMap.hasOwnProperty(token)) return false;
          return sanitizeWord(token, token, rules) === token;
        };
      }
      function pluralize2(word2, count, inclusive) {
        var pluralized = count === 1 ? pluralize2.singular(word2) : pluralize2.plural(word2);
        return (inclusive ? count + " " : "") + pluralized;
      }
      pluralize2.plural = replaceWord(
        irregularSingles,
        irregularPlurals,
        pluralRules
      );
      pluralize2.isPlural = checkWord(
        irregularSingles,
        irregularPlurals,
        pluralRules
      );
      pluralize2.singular = replaceWord(
        irregularPlurals,
        irregularSingles,
        singularRules
      );
      pluralize2.isSingular = checkWord(
        irregularPlurals,
        irregularSingles,
        singularRules
      );
      pluralize2.addPluralRule = function(rule, replacement) {
        pluralRules.push([sanitizeRule(rule), replacement]);
      };
      pluralize2.addSingularRule = function(rule, replacement) {
        singularRules.push([sanitizeRule(rule), replacement]);
      };
      pluralize2.addUncountableRule = function(word2) {
        if (typeof word2 === "string") {
          uncountables[word2.toLowerCase()] = true;
          return;
        }
        pluralize2.addPluralRule(word2, "$0");
        pluralize2.addSingularRule(word2, "$0");
      };
      pluralize2.addIrregularRule = function(single2, plural) {
        plural = plural.toLowerCase();
        single2 = single2.toLowerCase();
        irregularSingles[single2] = plural;
        irregularPlurals[plural] = single2;
      };
      [
        // Pronouns.
        ["I", "we"],
        ["me", "us"],
        ["he", "they"],
        ["she", "they"],
        ["them", "them"],
        ["myself", "ourselves"],
        ["yourself", "yourselves"],
        ["itself", "themselves"],
        ["herself", "themselves"],
        ["himself", "themselves"],
        ["themself", "themselves"],
        ["is", "are"],
        ["was", "were"],
        ["has", "have"],
        ["this", "these"],
        ["that", "those"],
        // Words ending in with a consonant and `o`.
        ["echo", "echoes"],
        ["dingo", "dingoes"],
        ["volcano", "volcanoes"],
        ["tornado", "tornadoes"],
        ["torpedo", "torpedoes"],
        // Ends with `us`.
        ["genus", "genera"],
        ["viscus", "viscera"],
        // Ends with `ma`.
        ["stigma", "stigmata"],
        ["stoma", "stomata"],
        ["dogma", "dogmata"],
        ["lemma", "lemmata"],
        ["schema", "schemata"],
        ["anathema", "anathemata"],
        // Other irregular rules.
        ["ox", "oxen"],
        ["axe", "axes"],
        ["die", "dice"],
        ["yes", "yeses"],
        ["foot", "feet"],
        ["eave", "eaves"],
        ["goose", "geese"],
        ["tooth", "teeth"],
        ["quiz", "quizzes"],
        ["human", "humans"],
        ["proof", "proofs"],
        ["carve", "carves"],
        ["valve", "valves"],
        ["looey", "looies"],
        ["thief", "thieves"],
        ["groove", "grooves"],
        ["pickaxe", "pickaxes"],
        ["passerby", "passersby"]
      ].forEach(function(rule) {
        return pluralize2.addIrregularRule(rule[0], rule[1]);
      });
      [
        [/s?$/i, "s"],
        [/[^\u0000-\u007F]$/i, "$0"],
        [/([^aeiou]ese)$/i, "$1"],
        [/(ax|test)is$/i, "$1es"],
        [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, "$1es"],
        [/(e[mn]u)s?$/i, "$1s"],
        [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, "$1"],
        [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1i"],
        [/(alumn|alg|vertebr)(?:a|ae)$/i, "$1ae"],
        [/(seraph|cherub)(?:im)?$/i, "$1im"],
        [/(her|at|gr)o$/i, "$1oes"],
        [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, "$1a"],
        [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, "$1a"],
        [/sis$/i, "ses"],
        [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, "$1$2ves"],
        [/([^aeiouy]|qu)y$/i, "$1ies"],
        [/([^ch][ieo][ln])ey$/i, "$1ies"],
        [/(x|ch|ss|sh|zz)$/i, "$1es"],
        [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, "$1ices"],
        [/\b((?:tit)?m|l)(?:ice|ouse)$/i, "$1ice"],
        [/(pe)(?:rson|ople)$/i, "$1ople"],
        [/(child)(?:ren)?$/i, "$1ren"],
        [/eaux$/i, "$0"],
        [/m[ae]n$/i, "men"],
        ["thou", "you"]
      ].forEach(function(rule) {
        return pluralize2.addPluralRule(rule[0], rule[1]);
      });
      [
        [/s$/i, ""],
        [/(ss)$/i, "$1"],
        [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, "$1fe"],
        [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"],
        [/ies$/i, "y"],
        [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, "$1ie"],
        [/\b(mon|smil)ies$/i, "$1ey"],
        [/\b((?:tit)?m|l)ice$/i, "$1ouse"],
        [/(seraph|cherub)im$/i, "$1"],
        [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, "$1"],
        [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, "$1sis"],
        [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"],
        [/(test)(?:is|es)$/i, "$1is"],
        [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1us"],
        [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, "$1um"],
        [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, "$1on"],
        [/(alumn|alg|vertebr)ae$/i, "$1a"],
        [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"],
        [/(matr|append)ices$/i, "$1ix"],
        [/(pe)(rson|ople)$/i, "$1rson"],
        [/(child)ren$/i, "$1"],
        [/(eau)x?$/i, "$1"],
        [/men$/i, "man"]
      ].forEach(function(rule) {
        return pluralize2.addSingularRule(rule[0], rule[1]);
      });
      [
        // Singular words with no plurals.
        "adulthood",
        "advice",
        "agenda",
        "aid",
        "aircraft",
        "alcohol",
        "ammo",
        "analytics",
        "anime",
        "athletics",
        "audio",
        "bison",
        "blood",
        "bream",
        "buffalo",
        "butter",
        "carp",
        "cash",
        "chassis",
        "chess",
        "clothing",
        "cod",
        "commerce",
        "cooperation",
        "corps",
        "debris",
        "diabetes",
        "digestion",
        "elk",
        "energy",
        "equipment",
        "excretion",
        "expertise",
        "firmware",
        "flounder",
        "fun",
        "gallows",
        "garbage",
        "graffiti",
        "hardware",
        "headquarters",
        "health",
        "herpes",
        "highjinks",
        "homework",
        "housework",
        "information",
        "jeans",
        "justice",
        "kudos",
        "labour",
        "literature",
        "machinery",
        "mackerel",
        "mail",
        "media",
        "mews",
        "moose",
        "music",
        "mud",
        "manga",
        "news",
        "only",
        "personnel",
        "pike",
        "plankton",
        "pliers",
        "police",
        "pollution",
        "premises",
        "rain",
        "research",
        "rice",
        "salmon",
        "scissors",
        "series",
        "sewage",
        "shambles",
        "shrimp",
        "software",
        "species",
        "staff",
        "swine",
        "tennis",
        "traffic",
        "transportation",
        "trout",
        "tuna",
        "wealth",
        "welfare",
        "whiting",
        "wildebeest",
        "wildlife",
        "you",
        /pok[eé]mon$/i,
        // Regexes.
        /[^aeiou]ese$/i,
        // "chinese", "japanese"
        /deer$/i,
        // "deer", "reindeer"
        /fish$/i,
        // "fish", "blowfish", "angelfish"
        /measles$/i,
        /o[iu]s$/i,
        // "carnivorous"
        /pox$/i,
        // "chickpox", "smallpox"
        /sheep$/i
      ].forEach(pluralize2.addUncountableRule);
      return pluralize2;
    });
  }
});

// node_modules/retext-profanities/lib/create-plugin.js
function createPlugin2(config) {
  const regular = config.regular || emptyList2;
  const words = unpack();
  const source = "retext-profanities" + (config.lang === "en" ? "" : "-" + config.lang);
  return function(options) {
    const settings = options || emptyOptions3;
    const ignore = settings.ignore || emptyList2;
    const sureness = settings.sureness || 0;
    const phrases = Object.keys(words).filter(function(d) {
      return !ignore.includes(d);
    });
    const normals = regular.length > 0 ? phrases.filter(function(d) {
      return !regular.includes(d);
    }) : phrases;
    const literals = regular.filter(function(d) {
      return phrases.includes(d);
    });
    return function(tree, file) {
      search2(tree, normals, handle);
      search2(tree, literals, handle, { allowApostrophes: true });
      function handle(match, _, parent, phrase) {
        const profanitySeverity = words[phrase];
        const actual = toString3(match);
        if (profanitySeverity < sureness) {
          return;
        }
        const start = pointStart(match[0]);
        const end = pointEnd(match[match.length - 1]);
        const message = file.message(
          [
            profanitySeverity === 0 ? "Be careful with" : profanitySeverity === 1 ? "Reconsider using" : "Don\u2019t use",
            quotation(actual, "`") + ",",
            profanitySeverity === 0 ? "it\u2019s profane in some cases" : profanitySeverity === 1 ? "it may be profane" : "it\u2019s profane"
          ].join(" "),
          {
            /* c8 ignore next -- verbose to test */
            place: start && end ? { start, end } : void 0,
            ruleId: phrase.replace(/\W+/g, "-"),
            source
          }
        );
        message.actual = actual;
        message.expected = [];
        message.profanitySeverity = profanitySeverity;
        message.url = "https://github.com/retextjs/retext-profanities#readme";
      }
    };
  };
  function unpack() {
    const result = {};
    let key;
    for (key in config.cuss) {
      if (Object.hasOwn(config.cuss, key)) {
        add2(key, config.cuss[key]);
        if (config.pluralize) {
          add2(config.pluralize.singular(key), config.cuss[key]);
          add2(config.pluralize.plural(key), config.cuss[key]);
        }
      }
    }
    function add2(key2, value) {
      if (!config.ignorePluralize || !config.ignorePluralize.includes(key2)) {
        result[key2] = value;
      }
    }
    return result;
  }
}
var emptyOptions3, emptyList2;
var init_create_plugin2 = __esm({
  "node_modules/retext-profanities/lib/create-plugin.js"() {
    init_nlcst_search();
    init_nlcst_to_string();
    init_quotation();
    init_unist_util_position();
    emptyOptions3 = {};
    emptyList2 = [];
  }
});

// node_modules/retext-profanities/lib/en.js
var import_pluralize, retextProfanitiesEn, en_default2;
var init_en2 = __esm({
  "node_modules/retext-profanities/lib/en.js"() {
    init_cuss();
    import_pluralize = __toESM(require_pluralize(), 1);
    init_create_plugin2();
    retextProfanitiesEn = createPlugin2({
      cuss,
      // Misclassified singulars and plurals.
      ignorePluralize: [
        "children",
        "dy",
        // Singular of `dies`.
        "pro",
        // Singular of `pros`.
        "remain",
        // Singular of `remains`
        "so",
        // Singular of `sos`.
        "dice",
        // Plural of `die`.
        "fus"
        // Plural of `fu`.
      ],
      lang: "en",
      pluralize: import_pluralize.default,
      // List of values not to normalize.
      regular: ["hell", "whore"]
    });
    en_default2 = retextProfanitiesEn;
  }
});

// packages/operators/detectHateSpeech/index.js
var detectHateSpeech_exports = {};
__export(detectHateSpeech_exports, {
  run: () => run12
});
async function run12(ctx, cfg = {}) {
  const markdown = ctx.markdown ?? "";
  if (!markdown.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: "error",
      message: "No markdown input found for hate-speech detection"
    });
    return ctx;
  }
  const scope = cfg.scope === "previousstepoutput" && ctx.extracted ? "previousstepoutput" : "document";
  const file = await retext().use(en_default).use(en_default2).process(markdown);
  const lines = markdown.split("\n");
  const results = [];
  const seen = /* @__PURE__ */ new Set();
  const level = "warning";
  function findLineForWord(word2) {
    const normalized = word2.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(normalized)) {
        return i + 1;
      }
    }
    return 1;
  }
  for (const msg of file.messages) {
    const word2 = (msg.actual || msg.source || "unknown").toLowerCase();
    const suggestion = msg.expected?.[0] || msg.note || null;
    const line = msg?.position?.start?.line || findLineForWord(word2);
    const key = `${line}-${word2}`;
    if (seen.has(key)) continue;
    seen.add(key);
    ctx.diagnostics.push({
      line,
      severity: level,
      message: msg.message
    });
    results.push({
      line,
      word: word2,
      message: msg.message,
      suggestion
    });
  }
  const data = { [scope]: results };
  ctx.extracted = {
    target: "hate_speech",
    scopes: [scope],
    data
  };
  return {
    target: "hate_speech",
    scopes: [scope],
    data
  };
}
var init_detectHateSpeech = __esm({
  "packages/operators/detectHateSpeech/index.js"() {
    init_retext();
    init_en();
    init_en2();
  }
});

// packages/pipeline-runner/utils/parseRules.js
init_js_yaml();
function parseRules(yamlText) {
  try {
    return js_yaml_default.load(yamlText);
  } catch {
    return { error: "Invalid YAML format. Check syntax." };
  }
}

// packages/pipeline-runner/operator-registry.js
var OPERATORS = {
  "generateAST": () => Promise.resolve().then(() => (init_generate_ast(), generate_ast_exports)).then((m) => m.run),
  "extract": () => Promise.resolve().then(() => (init_extract(), extract_exports)).then((m) => m.run),
  "count": () => Promise.resolve().then(() => (init_count(), count_exports)).then((m) => m.run),
  "threshold": () => Promise.resolve().then(() => (init_threshold(), threshold_exports)).then((m) => m.run),
  "isPresent": () => Promise.resolve().then(() => (init_isPresent(), isPresent_exports)).then((m) => m.run),
  "regexMatch": () => Promise.resolve().then(() => (init_regexMatch(), regexMatch_exports)).then((m) => m.run),
  "sage": () => Promise.resolve().then(() => (init_sage(), sage_exports)).then((m) => m.run),
  "compare": () => Promise.resolve().then(() => (init_compare(), compare_exports)).then((m) => m.run),
  "length": () => Promise.resolve().then(() => (init_length(), length_exports)).then((m) => m.run),
  "search": () => Promise.resolve().then(() => (init_search(), search_exports)).then((m) => m.run),
  "fixUsingLLM": () => Promise.resolve().then(() => (init_fixUsingLLM(), fixUsingLLM_exports)).then((m) => m.run),
  "detectHateSpeech": () => Promise.resolve().then(() => (init_detectHateSpeech(), detectHateSpeech_exports)).then((m) => m.run)
};

// packages/pipeline-runner/index.js
async function runPipeline(yamlText, markdown) {
  const parsed = parseRules(yamlText);
  if (parsed.error) throw new Error(parsed.error);
  const { pipeline = [] } = parsed;
  const ctx = {
    markdown,
    diagnostics: [],
    rule: parsed.rule || "Unnamed Rule",
    description: parsed.description || "",
    pipeline,
    ruleYaml: yamlText
  };
  const generateAST = await OPERATORS["generateAST"]();
  await generateAST(ctx);
  for (const step of pipeline) {
    const opName = step.operator;
    const loader2 = OPERATORS[opName];
    if (!loader2) {
      ctx.diagnostics.push({
        severity: "error",
        message: `Unknown operator "${opName}"`
      });
      continue;
    }
    const run13 = await loader2();
    const opOutput = await run13(ctx, step);
    if (opOutput && typeof opOutput === "object" && opOutput !== ctx) {
      ctx.pipelineResults ??= [];
      ctx.pipelineResults.push({ name: opName, data: opOutput });
    }
  }
  return ctx;
}

// netlify/functions-src/runPipeline.js
async function handler(event) {
  try {
    const { yamlText, markdown } = JSON.parse(event.body);
    const ctx = await runPipeline(yamlText, markdown);
    let lastOperator = null;
    const parsed = parseRules(yamlText);
    if (!parsed.error) {
      const steps = parsed?.pipeline ?? [];
      lastOperator = steps[steps.length - 1]?.operator;
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ ...ctx, lastOperator })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
export {
  handler
};
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT *)
*/
