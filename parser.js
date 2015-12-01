var Document = function(chars, output){
  output = output || []
  if(chars[0]=='<'){
    var nextOutput = output.slice()
    nextOutput.push([])
    return Triple(chars, nextOutput)
  } else if(!chars[0]){
    return output
  }
  else {
    return Document(chars.slice(1), output)
  }
}
var Triple = function(chars, output){
  var curr = last(output)
  console.log('[triple]', output, curr)
  if(curr.length===0) return Subject(chars, output)
  if(curr.length==1) return Predicate(chars, output)
  if(curr.length==2){
    var nextLiteralOpener = chars.indexOf('"')
      , nextResourceOpener = chars.indexOf('<')
    return (nextLiteralOpener > nextResourceOpener)? 
      ObjectLiteral(chars, output  ) :
      ObjectResource(chars, output )
  }
  else return Document(chars, output)
}
const alphaLower = 'abcdefghijklmnopqrstuvwxyz'
const alphaUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const numbers = '0123456789'
const uriExtra = '/:-_#.;%?'
var uriChars = alphaLower+alphaUpper+numbers+uriExtra

var Subject = Term('<','>', uriChars, 0)
var Predicate = Term('<','>', uriChars, 1)
var ObjectResource = Term('<','>', uriChars, 2)
var ObjectLiteral = Term('"','"', null, 2)

function Term(open,close, allowedChars, position){
  return function(chars, output){
    output = output.slice()//copy the array
    var CurrentTerm = Term(open,close, allowedChars, position)
    if(chars[0]==open) return CurrentTerm(chars.slice(1), output)
    if(chars[0]==close) return Triple(chars.slice(1), output)
    else if(chars.length===0) return output
    else {
      if(!allowedChars || allowedChars.indexOf(chars[0])!=-1){
        var nextOutput = addToLast(chars[0], position, output)
      } else {
        //parsing error?
        var nextOutput = output
      }
      return CurrentTerm(chars.slice(1), nextOutput)
    }
  }
}

function addToLast(character, pos, output){
  output = output.slice()
  var last_triple = last(output)
  last_triple[pos] = last_triple[pos] || ''
  last_triple[pos]+=character
  return output
}

function last(arr){
  return arr[arr.length-1]
}

export function parser(txt){
  var chars = txt.split('')
  return Document(chars)
}
