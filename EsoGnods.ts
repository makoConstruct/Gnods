
//links are not directed in this library, they're sort of thought of of running in lexicographic order from smallest to largest. If you want direction, it has to be relative to the smallest -> largest. There are convenience methods for dealing with this

export var gnodLinks = new Map<string, [number, number, any]>() // like "<id1>::<id2>" -> [index of smaller node in larger node's linkages, and the other one]
var newestGnodID:number = 0
export class Gnod{
	dat:any;
	graphNodeID:string;
	links: Gnod[] = [];
	constructor(graphNodeID){
		if(graphNodeID !== undefined){
			this.graphNodeID = ''+graphNodeID
			if(graphNodeID.indexOf(':') >= 0) throw 'forbidden character in node id (\':\')'
			if(graphNodeID.construcor == Number){
				newestGnodID = Math.max(graphNodeID, newestGnodID)
			}
		}else{
			this.graphNodeID = ''+(newestGnodID++)
		}
	}
}

function compositeIDForNodes(smaller:Gnod, larger:Gnod):string {
	return smaller.graphNodeID+'::'+larger.graphNodeID
}

function orderSmallerLarger<T>(na:Gnod, nb:Gnod, f:(smaller:Gnod, larger:Gnod)=>T):T {
	if(na.graphNodeID <= nb.graphNodeID){
		return f(na,nb)
	}else{
		return f(nb,na)
	}
}

function linkCertainlyNonLinked(smaller:Gnod, larger:Gnod, linkDat, compid:string){
	var nsi = larger.links.length
	var nli = smaller.links.length
	gnodLinks.set(compid, [nsi, nli, linkDat])
	smaller.links.push(larger)
	larger.links.push(smaller)
}

export function link(na:Gnod, nb:Gnod, linkDat:any = null){
	orderSmallerLarger(na,nb, (smaller, larger)=>{
		var compid = compositeIDForNodes(smaller,larger)
		var prel = gnodLinks.get(compid)
		if(prel){
			prel[2] = linkDat
		}else{
			linkCertainlyNonLinked(smaller, larger, linkDat, compid)
		}
	})
}

export function polarLink(na:Gnod, nb:Gnod, linkDat:any, flipDataPolarity:(any)=> any){
	orderSmallerLarger(na,nb, (smaller, larger)=>{
		var compid = compositeIDForNodes(smaller,larger)
		var prel = gnodLinks.get(compid)
		var dat = (smaller == na) ? linkDat : flipDataPolarity(linkDat)
		if(prel){
			prel[2] = dat
		}else{
			linkCertainlyNonLinked(smaller, larger, dat, compid)
		}
	})
}


function unlinkFor(an:Gnod, indexOfRemoved:number){ //this is a part of the following function, and should be understood in context of that
	if(indexOfRemoved < an.links.length-1){
		//opn is the node that gets displaced
		var opn = an.links[an.links.length-1]
		//adjust opn's position listing
		var anSmaller = an.graphNodeID < opn.graphNodeID
		var compid:string
		var opnpospot:number
		if(anSmaller){
			compid = compositeIDForNodes(an,opn)
			opnpospot = 1
		}else{
			compid = compositeIDForNodes(opn,an)
			opnpospot = 0
		}
		gnodLinks.get(compid)[opnpospot] = indexOfRemoved
		//move opn
		an.links[indexOfRemoved] = opn
	}
	an.links.pop()
}

export function unlink(na:Gnod, nb:Gnod):any{
	return orderSmallerLarger(na,nb, (smaller, larger)=>{
		var compid = compositeIDForNodes(smaller,larger)
		var positions = gnodLinks.get(compid)//... you'll need to have the position of the smaller of the two be stored in the gnodLinks, and using that you'll be able to find the larger
		if(positions){
			gnodLinks.delete(compid)
			unlinkFor(larger, positions[0])
			unlinkFor(smaller, positions[1])
			return positions[2]
		}else{
			return null
		}
	})
}


function unidirectionalUnlink(na:Gnod, nb:Gnod):any{//leaves na's node list in tact, it's for cases where na is being destroyed.
	return orderSmallerLarger(na,nb, (smaller, larger)=>{
		var compid = compositeIDForNodes(smaller, larger)
		var positions = gnodLinks.get(compid) //... you'll need to have the position of the smaller of the two be stored in the gnodLinks, and using that you'll be able to find the larger
		if(positions){
			gnodLinks.delete(compid)
			if(smaller == na){
				unlinkFor(larger, positions[0])
			}else{
				unlinkFor(smaller, positions[1])
			}
			return positions[2]
		}else{
			return null
		}
	})
}

export function severAllLinks(n:Gnod){
	for(var tn of n.links){
		unidirectionalUnlink(n, tn)
	}
	n.links.clear()
}

export function examineEdgeBetween<T>(
	na:Gnod, nb:Gnod,
	f:(smaller:Gnod, larger:Gnod, dat:any)=>T,
):T { //dat will be undefined if no connection, null if no data (unless the user set it to undefined, but wow, don't do that
	return orderSmallerLarger(na,nb, (smaller, larger)=>{
		var compid = compositeIDForNodes(smaller,larger)
		var positions = gnodLinks.get(compid)
		var poss = (!positions)? undefined : positions[2]
		return f(smaller, larger, poss)
	})
}

export function getPolarizedEdgeData(
	na:Gnod, nb:Gnod,
	flipDataPolarity:(any)=> any
):any { //dat will be undefined if no connection, null if no data (unless the user set it to undefined, but wow, don't do that
	return orderSmallerLarger(na,nb, (smaller, larger)=>{
		var compid = compositeIDForNodes(smaller,larger)
		var positions = gnodLinks.get(compid)
		var positivePolarity = (smaller == na)
		if(!positions){
			return undefined
		}else{
			var poss = positions[2]
			return positivePolarity? poss : flipDataPolarity(poss)
		}
	})
}


export function setPolarizedEdgeData(
	na:Gnod, nb:Gnod,
	v:any,
	flipDataPolarity:(any)=> any
){ //dat will be undefined if no connection, null if no data (unless the user set it to undefined, but wow, don't do that
	orderSmallerLarger(na,nb, (smaller, larger)=>{
		var compid = compositeIDForNodes(smaller,larger)
		var positions = gnodLinks.get(compid)
		var positivePolarity = (smaller == na)
		var flippedV = positivePolarity? v : flipDataPolarity(v)
		if(!positions){
			linkCertainlyNonLinked(smaller, larger, flippedV, compid)
		}else{
			positions[2] = flippedV
		}
	})
}






