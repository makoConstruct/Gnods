
import {link, unlink, severAllLinks, Gnod, forEachPolarLink, getPolarLinkData, setPolarLinkData, getOrCreateNode, nodesByID} from './Gnods'

var negate = (i)=> -i

//mutate some signed edge weightings
`a b 2
b a 1
a c 9
d c 10
l c 5`.split('\n').map( line => {
	var linels = line.split(' ')
	
	var na = getOrCreateNode(linels[0])
	var nb = getOrCreateNode(linels[1])
	var cv = getPolarLinkData(na, nb, negate) || 0
	setPolarLinkData(na, nb, cv + parseFloat(linels[2]), negate)
})

printDataOf('a b c d l')

var na = getOrCreateNode('a')
var nc = getOrCreateNode('c')
unlink(nc,na)

severAllLinks(nc)

printDataOf('a b c d l')

function printDataOf(data){
	data.split(' ').map(getOrCreateNode).forEach((gn)=>{
		console.log('outgoing links from '+gn.id+':')
		forEachPolarLink(gn, "", negate, (n, on)=>{
			console.log('  '+n+' towards '+on.id)
		})
	})
}


console.log(nodesByID)