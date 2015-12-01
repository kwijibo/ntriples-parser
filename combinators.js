import S from 'sanctuary'
import R from 'ramda'
const {pipeK} = R 
  , Success = S.Right
  , Failure = S.Left

//---------parser

const satisfy = (predicate, label) => input => {
  if(!input) return Failure(label + 'No more input')
  const result = predicate(input[0])
  return (result)? 
    Success([[input[0]], input.slice(1)])
  : Failure([label, input[0] ])
}

const pchar = charToMatch => satisfy(x=> x==charToMatch, charToMatch)

const setHead = R.set(R.lensIndex(0))

const relabel = label => parser => input => S.either(setHead(label), R.identity, parser(input))


//-----combinators

const pairCombiner = func => ([a,b]) => {
  return func(b).chain(([a2, b2]) => Success([a.concat(a2), b2]))
}

const andThen = (p1,p2) => input => {
  const result = p1(input)
  if(result.toBoolean()){
    return result.chain(pairCombiner(p2))
  } else {
    return result
  }
}

const orElse = (p1,p2) => input => {
  const result = p1(input)
  if(result.toBoolean()){
    return result
  } else {
    return p2(input)
  }
}


// choice:: [p1,p2,p3] -> pCombined
const choice = list => R.reduce(orElse, R.head(list), R.tail(list))

// anyOf:: label -> charList -> parser
const anyOf = (label, charList) => R.pipe(R.map(pchar), choice, relabel(label))(charList)

// sequence
const sequence = list => R.reduce(andThen, R.head(list), R.tail(list))

// charSeq :: charList -> parser
const charSeq = R.pipe(R.map(pchar), sequence)

const parseNothing = input => () => Success([[],input])

// zeroOrMore :: parser -> input -> Either
const zeroOrMore =  parser => input => {
  const result = parser(input)
  return S.either(parseNothing(input), pairCombiner(zeroOrMore(parser)), result)
}


///-------- run------->
var parseA = pchar('A')
console.log(parseA('ABCDEFG'))
console.log(parseA('BCDEFG'))

var parseAB =  andThen(pchar('A'), pchar('B'))
console.log(parseAB('ABCD'))
console.log(parseAB('AABCD'))

console.log('---A or B ----')
var parseA_or_B = orElse(pchar('A'), pchar('B'))
console.log("A", parseA_or_B('AGHJGH'))
console.log("B", parseA_or_B('BGHJGH'))
console.log("Neither", parseA_or_B('LGHJGH'))
console.log('-----anyOf--------')
var parseNums = anyOf('Positive Numbers', [1,2,3,4,5,6,7,8,9,0])
console.log(parseNums('330761'))
console.log(parseNums('ABCDEFG'))

console.log('------sequence--------')
var p = pchar
var parseABC = andThen(p('A'), andThen(p('B'), p('C'))) 
var parser = charSeq(['A','B','C','1','2','3'])
console.log(parser('ABC123'))
console.log(parser('123ABC'))

console.log('-----zeroOrMore--------')
var parser = zeroOrMore(pchar('A'))
console.log(parser('AAAAAAAAAAA'))
console.log(parser('BBBBB'))

triple = sequence(
  [ uri
  , whitespace
  , uri
  , whitespace
  , choice([
    uri
  , literal
  , longliteral
  , optional(choice([
      datatype
    , language
    ]))
  ])
  , whitespace
  , fullstop
  , whitespace
])
